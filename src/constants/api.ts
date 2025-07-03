export const API_CONFIG = {
  // Endpoints
  endpoints: {
    events: "/events.json",
    eventById: (id: string) => `/events/${id}.json`,
  },

  // Paramètres par défaut
  defaults: {
    pageSize: 20,
    page: 0,
    city: "Paris",
    sort: "date,asc",
    locale: "*",
  },

  // Limites
  limits: {
    maxRetries: 3,
    timeout: 10000,
    maxImageSize: 5000000, // 5MB
  },

  // Messages d'erreur
  errorMessages: {
    network: "Problème de connexion réseau",
    timeout: "La requête a pris trop de temps",
    unauthorized: "Clé API invalide ou expirée",
    forbidden: "Accès interdit à cette ressource",
    notFound: "Aucun événement trouvé",
    rateLimit: "Trop de requêtes, veuillez patienter",
    serverError: "Erreur interne du serveur",
    unknown: "Erreur inconnue",
  },

  // Status codes
  statusCodes: {
    success: 200,
    created: 201,
    noContent: 204,
    badRequest: 400,
    unauthorized: 401,
    forbidden: 403,
    notFound: 404,
    tooManyRequests: 429,
    internalServerError: 500,
  },
} as const;
