import { ticketmasterApi, handleApiError } from "./api";
import {
  TicketmasterResponse,
  TicketmasterEvent,
  LocalEvent,
  SearchParams,
} from "../types/api";

// Fonction pour transformer un événement Ticketmaster en LocalEvent
export const transformTicketmasterEvent = (
  event: TicketmasterEvent,
): LocalEvent => {
  // Extraire la meilleure image
  const getBestImage = () => {
    if (!event.images || event.images.length === 0) {
      return "https://via.placeholder.com/300x200?text=Pas+d%27image";
    }

    // Préférer les images larges et de bonne qualité
    const sortedImages = event.images
      .filter((img) => img.width >= 300)
      .sort((a, b) => b.width * b.height - a.width * a.height);

    return sortedImages[0]?.url || event.images[0].url;
  };

  // Extraire la date
  const getEventDate = () => {
    const startDate = event.dates?.start;
    if (!startDate) return "Date à confirmer";

    if (startDate.localDate) {
      const date = new Date(startDate.localDate);
      return date.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    return "Date à confirmer";
  };

  // Extraire le lieu et la ville
  const getVenueInfo = () => {
    const venue = event._embedded?.venues?.[0];
    if (!venue) return { venue: "Lieu à confirmer", city: "Ville inconnue" };

    return {
      venue: venue.name,
      city: venue.city?.name || "Ville inconnue",
    };
  };

  // Extraire la gamme de prix
  const getPriceRange = () => {
    if (!event.priceRanges || event.priceRanges.length === 0) {
      return undefined;
    }

    const price = event.priceRanges[0];
    if (price.min && price.max) {
      return `${price.min}€ - ${price.max}€`;
    } else if (price.min) {
      return `À partir de ${price.min}€`;
    }

    return undefined;
  };

  const venueInfo = getVenueInfo();

  return {
    id: event.id,
    name: event.name,
    date: getEventDate(),
    venue: venueInfo.venue,
    city: venueInfo.city,
    imageUrl: getBestImage(),
    description: event.info || event.pleaseNote,
    priceRange: getPriceRange(),
    url: event.url,
    isFavorite: false, // Par défaut, on déterminera cela côté Redux
  };
};

// Service pour récupérer les événements
export class EventsService {
  // Récupérer les événements par ville
  static async getEventsByCity(params: SearchParams): Promise<LocalEvent[]> {
    try {
      const requestParams: Record<string, string | number> = {
        size: params.size || 20,
        page: params.page || 0,
        sort: "date,asc",
      };

      // Ajouter la ville si spécifiée
      if (params.city) {
        requestParams.city = params.city;
      }

      // Ajouter les filtres de dates
      if (params.startDateTime) {
        requestParams.startDateTime = params.startDateTime;
      }
      if (params.endDateTime) {
        requestParams.endDateTime = params.endDateTime;
      }

      // Ajouter le mot-clé de recherche
      if (params.keyword) {
        requestParams.keyword = params.keyword;
      }

      const response = await ticketmasterApi.get<TicketmasterResponse>(
        "/events.json",
        {
          params: requestParams,
        },
      );

      const events = response.data._embedded?.events || [];
      return events.map(transformTicketmasterEvent);
    } catch (error) {
      throw handleApiError(error as Error);
    }
  }

  // Rechercher des événements avec mots-clés
  static async searchEvents(params: SearchParams): Promise<LocalEvent[]> {
    return this.getEventsByCity(params);
  }

  // Récupérer les détails d'un événement spécifique
  static async getEventById(eventId: string): Promise<LocalEvent | null> {
    try {
      const response = await ticketmasterApi.get<TicketmasterEvent>(
        `/events/${eventId}.json`,
      );
      return transformTicketmasterEvent(response.data);
    } catch (error) {
      const apiError = handleApiError(error as Error);
      if (apiError.status === 404) {
        return null;
      }
      throw apiError;
    }
  }

  // Suggérer des villes basées sur la géolocalisation (bonus)
  static async getSuggestedCities(query: string): Promise<string[]> {
    // Pour l'instant, retourner quelques villes françaises populaires
    const popularCities = [
      "Paris",
      "Lyon",
      "Marseille",
      "Toulouse",
      "Nice",
      "Nantes",
      "Montpellier",
      "Strasbourg",
      "Bordeaux",
      "Lille",
    ];

    if (!query) return popularCities.slice(0, 5);

    return popularCities
      .filter((city) => city.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }
}
