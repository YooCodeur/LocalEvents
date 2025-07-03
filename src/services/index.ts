// Export des services API
export { ticketmasterApi, ApiError, handleApiError } from "./api";
export { EventsService, transformTicketmasterEvent } from "./eventsService";
export { CacheService, CACHE_CONFIG } from "./cacheService";
export * from "./imageCacheService";

// Configuration API - constantes utiles
export const API_CONFIG = {
  RETRY_ATTEMPTS: 3,
  TIMEOUT: 10000,
  DEFAULT_PAGE_SIZE: 20,
} as const;
