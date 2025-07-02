import axios from 'axios';

// Configuration depuis les variables d'environnement
const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY ;
const TICKETMASTER_BASE_URL = process.env.TICKETMASTER_BASE_URL || 'https://app.ticketmaster.com/discovery/v2';

// Validation simple
if (TICKETMASTER_API_KEY && TICKETMASTER_API_KEY.length > 10) {
  console.log('✅ API Ticketmaster configurée');
} else {
  console.warn('⚠️ Clé API Ticketmaster manquante ou invalide');
}

// Instance Axios configurée
export const ticketmasterApi = axios.create({
  baseURL: TICKETMASTER_BASE_URL,
  timeout: 10000,
  params: {
    apikey: TICKETMASTER_API_KEY,
    locale: '*',
  },
});

// Intercepteur pour les erreurs avec retry
ticketmasterApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    
    // Retry logic (maximum 3 tentatives)
    if (!config._retry) config._retry = 0;
    
    if (config._retry < 2 && error.response?.status >= 500) {
      config._retry += 1;
      console.log(`Retry tentative ${config._retry} pour ${config.url}`);
      
      // Attendre avant de réessayer (backoff exponentiel)
      await new Promise(resolve => setTimeout(resolve, 1000 * config._retry));
      
      return ticketmasterApi(config);
    }
    
    return Promise.reject(error);
  }
);

// Types d'erreurs personnalisées
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper pour gérer les erreurs API
export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    // Erreur de réponse du serveur
    const status = error.response.status;
    const message = error.response.data?.fault?.faultstring || 
                   error.response.data?.message || 
                   `Erreur HTTP ${status}`;
    
    switch (status) {
      case 401:
        return new ApiError('Clé API invalide ou expirée', status, 'UNAUTHORIZED');
      case 403:
        return new ApiError('Accès interdit à cette ressource', status, 'FORBIDDEN');
      case 404:
        return new ApiError('Aucun événement trouvé', status, 'NOT_FOUND');
      case 429:
        return new ApiError('Trop de requêtes, veuillez patienter', status, 'RATE_LIMIT');
      case 500:
        return new ApiError('Erreur interne du serveur', status, 'SERVER_ERROR');
      default:
        return new ApiError(message, status, 'UNKNOWN');
    }
  } else if (error.request) {
    // Erreur de réseau
    return new ApiError('Problème de connexion réseau', 0, 'NETWORK_ERROR');
  } else {
    // Autre erreur
    return new ApiError(error.message || 'Erreur inconnue', 0, 'UNKNOWN');
  }
}; 