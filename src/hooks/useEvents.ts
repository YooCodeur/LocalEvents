import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./useRedux";
import {
  fetchEvents,
  loadEventsFromCache,
  clearError,
  clearEvents,
  cleanupCache,
  clearAllCache,
  setOfflineMode,
} from "../store/slices/eventsSlice";
import { useHasInternetAccess, useIsOffline } from "./useNetworkStatus";
import type { SearchParams } from "../types/api";

export const useEvents = () => {
  const dispatch = useAppDispatch();
  const {
    events,
    loading,
    error,
    searchParams,
    hasMore,
    isFromCache,
    lastCacheUpdate,
    isOfflineMode,
  } = useAppSelector((state) => state.events);

  const hasInternetAccess = useHasInternetAccess();
  const isOffline = useIsOffline();

  // Mettre à jour le mode offline dans le store
  useEffect(() => {
    dispatch(setOfflineMode(isOffline));
  }, [dispatch, isOffline]);

  // Charger les événements avec des paramètres optionnels
  const loadEvents = useCallback(
    (params?: Partial<SearchParams> & { forceRefresh?: boolean }) => {
      const finalParams = { ...searchParams, ...params };

      // Si on est offline, essayer de charger depuis le cache
      if (isOffline && !params?.forceRefresh) {
        dispatch(loadEventsFromCache(finalParams));
      } else {
        dispatch(fetchEvents(finalParams));
      }
    },
    [dispatch, searchParams, isOffline],
  );

  // Actualiser les événements (pull-to-refresh)
  const refreshEvents = useCallback(() => {
    dispatch(clearError());

    // Si on est offline, charger depuis le cache
    if (isOffline) {
      dispatch(loadEventsFromCache({ ...searchParams, page: 0 }));
    } else {
      // Force refresh depuis l'API
      dispatch(fetchEvents({ ...searchParams, page: 0, forceRefresh: true }));
    }
  }, [dispatch, searchParams, isOffline]);

  // Réinitialiser la liste
  const resetEvents = useCallback(() => {
    dispatch(clearEvents());
  }, [dispatch]);

  // Effacer les erreurs
  const clearEventsError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Charger plus d'événements (pagination)
  const loadMore = useCallback(() => {
    if (!loading && hasMore && !isOffline) {
      const nextPage = (searchParams.page || 0) + 1;
      loadEvents({ page: nextPage });
    }
  }, [loading, hasMore, loadEvents, searchParams.page, isOffline]);

  // Charger depuis le cache explicitement
  const loadFromCache = useCallback(
    (params?: Partial<SearchParams>) => {
      const finalParams = { ...searchParams, ...params };
      dispatch(loadEventsFromCache(finalParams));
    },
    [dispatch, searchParams],
  );

  // Nettoyer le cache
  const cleanCache = useCallback(() => {
    dispatch(cleanupCache());
  }, [dispatch]);

  // Vider tout le cache
  const clearCache = useCallback(() => {
    dispatch(clearAllCache());
  }, [dispatch]);

  // Vérifier si les données sont fraîches
  const isDataFresh = useCallback(() => {
    if (!lastCacheUpdate) return false;
    const now = Date.now();
    const hoursDiff = (now - lastCacheUpdate) / (1000 * 60 * 60);
    return hoursDiff < 6; // Données considérées fraîches pendant 6h
  }, [lastCacheUpdate]);

  return {
    // État
    events,
    loading,
    error,
    hasMore,
    searchParams,
    isFromCache,
    lastCacheUpdate,
    isOfflineMode,
    hasInternetAccess,
    isOffline,

    // Actions
    loadEvents,
    refreshEvents,
    resetEvents,
    clearEventsError,
    loadMore,
    loadFromCache,
    cleanCache,
    clearCache,

    // Utilitaires
    isDataFresh,
  };
};
