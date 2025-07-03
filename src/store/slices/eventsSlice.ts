import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { LocalEvent, SearchParams } from "../../types/api";
import { CacheService, CACHE_CONFIG } from "../../services/cacheService";

// État initial
interface EventsState {
  events: LocalEvent[];
  loading: boolean;
  error: string | null;
  searchParams: SearchParams;
  hasMore: boolean;
  page: number;
  isFromCache: boolean;
  lastCacheUpdate: number | null;
  isOfflineMode: boolean;
}

const initialState: EventsState = {
  events: [],
  loading: false,
  error: null,
  searchParams: {
    city: "Paris",
    size: 20,
    page: 0,
  },
  hasMore: true,
  page: 0,
  isFromCache: false,
  lastCacheUpdate: null,
  isOfflineMode: false,
};

// Charger les événements depuis le cache
export const loadEventsFromCache = createAsyncThunk(
  "events/loadEventsFromCache",
  async (params: SearchParams, { rejectWithValue }) => {
    try {
      const cachedEvents = await CacheService.getCachedEvents(params);
      if (cachedEvents) {
        return { events: cachedEvents, searchParams: params };
      }
      return rejectWithValue("Aucun cache disponible");
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Erreur lors du chargement du cache",
      );
    }
  },
);

// Actions asynchrones avec intégration API et cache
export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (
    params: SearchParams & { forceRefresh?: boolean },
    { rejectWithValue, dispatch: _dispatch },
  ) => {
    try {
      // Si ce n'est pas un refresh forcé, essayer d'abord le cache
      if (!params.forceRefresh) {
        const cachedEvents = await CacheService.getCachedEvents(params);
        if (cachedEvents) {
          console.log("📦 Événements chargés depuis le cache");
          return {
            events: cachedEvents,
            searchParams: params,
            fromCache: true,
          };
        }
      }

      // Charger depuis l'API
      const { EventsService } = await import("../../services");
      const events = await EventsService.getEventsByCity(params);

      // Sauvegarder en cache
      const ttl = params.keyword
        ? CACHE_CONFIG.SEARCH_TTL
        : CACHE_CONFIG.DEFAULT_TTL;
      await CacheService.cacheEvents(events, params, ttl);

      console.log("🌐 Événements chargés depuis l'API et mis en cache");
      return {
        events,
        searchParams: params,
        fromCache: false,
      };
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Erreur lors du chargement des événements",
      );
    }
  },
);

export const searchEvents = createAsyncThunk(
  "events/searchEvents",
  async (
    params: SearchParams & { forceRefresh?: boolean },
    { rejectWithValue },
  ) => {
    try {
      // Si ce n'est pas un refresh forcé, essayer d'abord le cache
      if (!params.forceRefresh) {
        const cachedEvents = await CacheService.getCachedEvents(params);
        if (cachedEvents) {
          console.log("📦 Recherche chargée depuis le cache");
          return {
            events: cachedEvents,
            searchParams: params,
            fromCache: true,
          };
        }
      }

      // Rechercher depuis l'API
      const { EventsService } = await import("../../services");
      const events = await EventsService.searchEvents(params);

      // Sauvegarder en cache avec TTL plus court pour les recherches
      await CacheService.cacheEvents(events, params, CACHE_CONFIG.SEARCH_TTL);

      console.log("🌐 Recherche depuis l'API et mise en cache");
      return {
        events,
        searchParams: params,
        fromCache: false,
      };
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Erreur lors de la recherche",
      );
    }
  },
);

// Action pour nettoyer le cache
export const cleanupCache = createAsyncThunk(
  "events/cleanupCache",
  async () => {
    await CacheService.cleanupCache();
    return true;
  },
);

// Action pour vider tout le cache
export const clearAllCache = createAsyncThunk(
  "events/clearAllCache",
  async () => {
    await CacheService.clearAllCache();
    return true;
  },
);

// Slice
export const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    setSearchParams: (state, action: PayloadAction<Partial<SearchParams>>) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    clearEvents: (state) => {
      state.events = [];
      state.page = 0;
      state.hasMore = true;
      state.isFromCache = false;
      state.lastCacheUpdate = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setOfflineMode: (state, action: PayloadAction<boolean>) => {
      state.isOfflineMode = action.payload;
    },
    markAsFromCache: (state, action: PayloadAction<boolean>) => {
      state.isFromCache = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadEventsFromCache
      .addCase(loadEventsFromCache.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadEventsFromCache.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.events;
        state.isFromCache = true;
        state.lastCacheUpdate = Date.now();
        state.page = 0;
        state.hasMore = false; // Le cache ne gère pas la pagination
      })
      .addCase(loadEventsFromCache.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isFromCache = false;
      })
      // fetchEvents
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        const { events, fromCache } = action.payload;

        if (action.meta.arg.page === 0) {
          state.events = events;
        } else {
          state.events.push(...events);
        }

        state.page = action.meta.arg.page || 0;
        state.hasMore = events.length === (action.meta.arg.size || 20);
        state.isFromCache = fromCache;
        state.lastCacheUpdate = fromCache ? null : Date.now();
        state.isOfflineMode = false;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Erreur lors du chargement des événements";

        // En cas d'erreur, marquer comme mode offline potentiel
        state.isOfflineMode = true;
      })
      // searchEvents
      .addCase(searchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchEvents.fulfilled, (state, action) => {
        state.loading = false;
        const { events, fromCache } = action.payload;

        state.events = events;
        state.page = 0;
        state.hasMore = events.length === (action.meta.arg.size || 20);
        state.isFromCache = fromCache;
        state.lastCacheUpdate = fromCache ? null : Date.now();
        state.isOfflineMode = false;
      })
      .addCase(searchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Erreur lors de la recherche";

        // En cas d'erreur, marquer comme mode offline potentiel
        state.isOfflineMode = true;
      });
  },
});

export const {
  setSearchParams,
  clearEvents,
  clearError,
  setOfflineMode,
  markAsFromCache,
} = eventsSlice.actions;
