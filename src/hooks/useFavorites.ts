import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./useRedux";
import {
  toggleFavoriteAsync,
  addFavoriteAsync,
  removeFavoriteAsync,
  clearError,
} from "../store/slices/favoritesSlice";
import type { LocalEvent } from "../types/api";

export const useFavorites = () => {
  const dispatch = useAppDispatch();
  const { favorites, loading, error } = useAppSelector(
    (state) => state.favorites,
  );

  // Vérifier si un événement est en favoris
  const isFavorite = useCallback(
    (eventId: string): boolean => {
      return favorites.some((fav) => fav.id === eventId);
    },
    [favorites],
  );

  // Basculer le statut favori d'un événement
  const toggleFavorite = useCallback(
    (event: LocalEvent) => {
      dispatch(toggleFavoriteAsync(event));
    },
    [dispatch],
  );

  // Ajouter aux favoris
  const addToFavorites = useCallback(
    (event: LocalEvent) => {
      if (!isFavorite(event.id)) {
        dispatch(addFavoriteAsync(event));
      }
    },
    [dispatch, isFavorite],
  );

  // Retirer des favoris
  const removeFromFavorites = useCallback(
    (eventId: string) => {
      dispatch(removeFavoriteAsync(eventId));
    },
    [dispatch],
  );

  // Effacer les erreurs
  const clearFavoritesError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // État
    favorites,
    loading,
    error,

    // Méthodes utilitaires
    isFavorite,

    // Actions
    toggleFavorite,
    addToFavorites,
    removeFromFavorites,
    clearFavoritesError,
  };
};
