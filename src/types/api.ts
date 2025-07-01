// Types pour l'API Ticketmaster Discovery
export interface TicketmasterEvent {
  id: string;
  name: string;
  url?: string;
  locale?: string;
  images?: Image[];
  dates?: EventDates;
  classifications?: Classification[];
  info?: string;
  pleaseNote?: string;
  priceRanges?: PriceRange[];
  _embedded?: {
    venues?: Venue[];
    attractions?: Attraction[];
  };
}

export interface Image {
  ratio?: string;
  url: string;
  width: number;
  height: number;
  fallback?: boolean;
}

export interface EventDates {
  start?: {
    localDate?: string;
    localTime?: string;
    dateTime?: string;
    dateTBD?: boolean;
    dateTBA?: boolean;
    timeTBA?: boolean;
    noSpecificTime?: boolean;
  };
  timezone?: string;
  status?: {
    code: string;
  };
}

export interface Classification {
  primary?: boolean;
  segment?: {
    id: string;
    name: string;
  };
  genre?: {
    id: string;
    name: string;
  };
  subGenre?: {
    id: string;
    name: string;
  };
}

export interface PriceRange {
  type?: string;
  currency?: string;
  min?: number;
  max?: number;
}

export interface Venue {
  id: string;
  name: string;
  type?: string;
  locale?: string;
  postalCode?: string;
  timezone?: string;
  city?: {
    name: string;
  };
  country?: {
    name: string;
    countryCode: string;
  };
  address?: {
    line1?: string;
    line2?: string;
  };
  location?: {
    longitude: string;
    latitude: string;
  };
}

export interface Attraction {
  id: string;
  name: string;
  type?: string;
  locale?: string;
  images?: Image[];
  classifications?: Classification[];
}

// Réponse de l'API Ticketmaster
export interface TicketmasterResponse {
  _embedded?: {
    events: TicketmasterEvent[];
  };
  _links?: {
    self?: { href: string };
    next?: { href: string };
    prev?: { href: string };
  };
  page?: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

// Types pour l'app
export interface LocalEvent {
  id: string;
  name: string;
  date: string;
  venue: string;
  city: string;
  imageUrl: string;
  description?: string;
  priceRange?: string;
  url?: string;
  isFavorite: boolean;
}

// Paramètres de recherche
export interface SearchParams {
  city?: string;
  keyword?: string;
  startDateTime?: string;
  endDateTime?: string;
  size?: number;
  page?: number;
} 