import { useState, useCallback } from "react";
import { useAppDispatch } from "./useRedux";
import { searchEvents, setSearchParams } from "../store/slices/eventsSlice";
import type { SearchParams } from "../types/api";

export const useSearch = () => {
  const dispatch = useAppDispatch();

  // États locaux pour les filtres de recherche
  const [filters, setFilters] = useState<Partial<SearchParams>>({});

  // Mettre à jour un filtre spécifique
  const updateFilter = useCallback(
    <K extends keyof SearchParams>(key: K, value: SearchParams[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Réinitialiser tous les filtres
  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Lancer la recherche avec les filtres actuels
  const performSearch = useCallback(
    (additionalParams?: Partial<SearchParams>) => {
      const searchParams: SearchParams = {
        city: "Paris",
        size: 20,
        page: 0,
        ...filters,
        ...additionalParams,
      };

      // Mettre à jour les paramètres dans Redux
      dispatch(setSearchParams(searchParams));

      // Lancer la recherche
      dispatch(searchEvents(searchParams));
    },
    [dispatch, filters],
  );

  // Formater une date pour l'API (ISO 8601)
  const formatDateForAPI = useCallback(
    (date: Date, isEndDate: boolean = false): string => {
      const isoString = date.toISOString();
      const dateOnly = isoString.split("T")[0];
      const timeString = isEndDate ? "23:59:59Z" : "00:00:00Z";
      return `${dateOnly}T${timeString}`;
    },
    [],
  );

  // Formater une date pour l'affichage
  const formatDateForDisplay = useCallback((date: Date): string => {
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  return {
    // État
    filters,

    // Actions
    updateFilter,
    resetFilters,
    performSearch,

    // Utilitaires
    formatDateForAPI,
    formatDateForDisplay,
  };
};
