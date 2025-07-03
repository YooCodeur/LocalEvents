import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./useRedux";
import {
  fetchEvents,
  clearError,
  clearEvents,
} from "../store/slices/eventsSlice";
import type { SearchParams } from "../types/api";

export const useEvents = () => {
  const dispatch = useAppDispatch();
  const { events, loading, error, searchParams, hasMore } = useAppSelector(
    (state) => state.events,
  );

  // Charger les événements avec des paramètres optionnels
  const loadEvents = useCallback(
    (params?: Partial<SearchParams>) => {
      const finalParams = { ...searchParams, ...params };
      dispatch(fetchEvents(finalParams));
    },
    [dispatch, searchParams],
  );

  // Actualiser les événements (pull-to-refresh)
  const refreshEvents = useCallback(() => {
    dispatch(clearError());
    dispatch(fetchEvents({ ...searchParams, page: 0 }));
  }, [dispatch, searchParams]);

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
    if (!loading && hasMore) {
      const nextPage = (searchParams.page || 0) + 1;
      loadEvents({ page: nextPage });
    }
  }, [loading, hasMore, loadEvents, searchParams.page]);

  return {
    // État
    events,
    loading,
    error,
    hasMore,
    searchParams,

    // Actions
    loadEvents,
    refreshEvents,
    resetEvents,
    clearEventsError,
    loadMore,
  };
};
