import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LocalEvent } from "../../types/api";
import { ImageCacheService } from "../../services/imageCacheService";

// Clé de stockage pour les favoris
const FAVORITES_STORAGE_KEY = "@LocalEvents:favorites";

// Fonction utilitaire pour déduplication des favoris
const deduplicateFavorites = (favorites: LocalEvent[]): LocalEvent[] => {
  const seen = new Set<string>();
  return favorites.filter((event) => {
    if (seen.has(event.id)) {
      return false;
    }
    seen.add(event.id);
    return true;
  });
};

// État initial
export interface FavoritesState {
  favorites: LocalEvent[];
  loading: boolean;
  error: string | null;
}

const initialState: FavoritesState = {
  favorites: [],
  loading: false,
  error: null,
};

// Actions asynchrones pour la persistance
export const loadFavorites = createAsyncThunk(
  "favorites/loadFavorites",
  async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];

      // Mettre en cache les images des favoris en arrière-plan
      if (favorites.length > 0) {
        ImageCacheService.cacheFavoriteImages(favorites).catch((error) => {
          console.warn(
            "⚠️ Impossible de mettre en cache les images des favoris:",
            error,
          );
        });
      }

      return favorites;
    } catch {
      throw new Error("Erreur lors du chargement des favoris");
    }
  },
);

export const saveFavorites = createAsyncThunk(
  "favorites/saveFavorites",
  async (favorites: LocalEvent[]) => {
    try {
      await AsyncStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(favorites),
      );
      return favorites;
    } catch {
      throw new Error("Erreur lors de la sauvegarde des favoris");
    }
  },
);

// Actions asynchrones combinées qui mettent à jour le state ET sauvegardent
export const addFavoriteAsync = createAsyncThunk(
  "favorites/addFavoriteAsync",
  async (event: LocalEvent, { getState }) => {
    const state = getState() as { favorites: FavoritesState };
    const existingIndex = state.favorites.favorites.findIndex(
      (fav) => fav.id === event.id,
    );

    if (existingIndex === -1) {
      const newEvent = { ...event, isFavorite: true };
      const updatedFavorites = [...state.favorites.favorites, newEvent];

      // Sauvegarder dans AsyncStorage
      await AsyncStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(updatedFavorites),
      );

      // Mettre en cache l'image du favori
      try {
        await ImageCacheService.markImageAsFavorite(event.imageUrl, event.id);
      } catch (error) {
        console.warn(
          "⚠️ Impossible de mettre en cache l'image du favori:",
          error,
        );
      }

      return newEvent;
    }
    return null;
  },
);

export const removeFavoriteAsync = createAsyncThunk(
  "favorites/removeFavoriteAsync",
  async (eventId: string, { getState }) => {
    const state = getState() as { favorites: FavoritesState };
    const eventToRemove = state.favorites.favorites.find(
      (fav) => fav.id === eventId,
    );
    const updatedFavorites = state.favorites.favorites.filter(
      (fav) => fav.id !== eventId,
    );

    // Sauvegarder dans AsyncStorage
    await AsyncStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(updatedFavorites),
    );

    // Retirer le marquage favori de l'image
    if (eventToRemove) {
      try {
        await ImageCacheService.unmarkImageAsFavorite(eventToRemove.imageUrl);
      } catch (error) {
        console.warn(
          "⚠️ Impossible de retirer le marquage favori de l'image:",
          error,
        );
      }
    }

    return eventId;
  },
);

export const toggleFavoriteAsync = createAsyncThunk(
  "favorites/toggleFavoriteAsync",
  async (event: LocalEvent, { getState }) => {
    const state = getState() as { favorites: FavoritesState };
    const existingIndex = state.favorites.favorites.findIndex(
      (fav) => fav.id === event.id,
    );

    let updatedFavorites: LocalEvent[];
    let action: "add" | "remove";

    if (existingIndex !== -1) {
      // Retirer des favoris
      updatedFavorites = state.favorites.favorites.filter(
        (fav) => fav.id !== event.id,
      );
      action = "remove";
    } else {
      // Ajouter aux favoris
      const newEvent = { ...event, isFavorite: true };
      updatedFavorites = [...state.favorites.favorites, newEvent];
      action = "add";
    }

    // Sauvegarder dans AsyncStorage
    await AsyncStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(updatedFavorites),
    );

    // Gérer le cache de l'image selon l'action
    try {
      if (action === "add") {
        await ImageCacheService.markImageAsFavorite(event.imageUrl, event.id);
      } else {
        await ImageCacheService.unmarkImageAsFavorite(event.imageUrl);
      }
    } catch (error) {
      console.warn(
        `⚠️ Impossible de ${action === "add" ? "mettre en cache" : "retirer le marquage"} de l'image:`,
        error,
      );
    }

    return { event, action };
  },
);

// Slice
export const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    addFavorite: (state, action: PayloadAction<LocalEvent>) => {
      const event = action.payload;
      const existingIndex = state.favorites.findIndex(
        (fav) => fav.id === event.id,
      );

      if (existingIndex === -1) {
        const newEvent = { ...event, isFavorite: true };
        state.favorites.push(newEvent);
      }
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      state.favorites = state.favorites.filter((fav) => fav.id !== eventId);
    },
    toggleFavorite: (state, action: PayloadAction<LocalEvent>) => {
      const event = action.payload;
      const existingIndex = state.favorites.findIndex(
        (fav) => fav.id === event.id,
      );

      if (existingIndex !== -1) {
        // Retirer des favoris
        state.favorites.splice(existingIndex, 1);
      } else {
        // Ajouter aux favoris uniquement s'il n'existe pas déjà
        const alreadyExists = state.favorites.some(
          (fav) => fav.id === event.id,
        );
        if (!alreadyExists) {
          const newEvent = { ...event, isFavorite: true };
          state.favorites.push(newEvent);
        }
      }
    },
    clearFavorites: (state) => {
      state.favorites = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadFavorites
      .addCase(loadFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFavorites.fulfilled, (state, action) => {
        state.loading = false;
        // Déduplication des favoris avant de les assigner
        const favoritesWithFlag = action.payload.map((fav: LocalEvent) => ({
          ...fav,
          isFavorite: true,
        }));
        state.favorites = deduplicateFavorites(favoritesWithFlag);
      })
      .addCase(loadFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Erreur lors du chargement des favoris";
      })
      // saveFavorites
      .addCase(saveFavorites.pending, (_state) => {
        // Pas de loading pour la sauvegarde
      })
      .addCase(saveFavorites.fulfilled, (_state, _action) => {
        // Favoris sauvegardés avec succès
      })
      .addCase(saveFavorites.rejected, (state, action) => {
        state.error = action.error.message || "Erreur lors de la sauvegarde";
      })
      // addFavoriteAsync
      .addCase(addFavoriteAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFavoriteAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          // Vérifier si l'événement n'existe pas déjà avant de l'ajouter
          const existingIndex = state.favorites.findIndex(
            (fav) => fav.id === action.payload!.id,
          );
          if (existingIndex === -1) {
            state.favorites.push(action.payload);
          }
        }
      })
      .addCase(addFavoriteAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Erreur lors de l'ajout aux favoris";
      })
      // removeFavoriteAsync
      .addCase(removeFavoriteAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFavoriteAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = state.favorites.filter(
          (fav) => fav.id !== action.payload,
        );
      })
      .addCase(removeFavoriteAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Erreur lors de la suppression du favori";
      })
      // toggleFavoriteAsync
      .addCase(toggleFavoriteAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleFavoriteAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { event, action: toggleAction } = action.payload;

        if (toggleAction === "add") {
          // Vérifier si l'événement n'existe pas déjà avant de l'ajouter
          const existingIndex = state.favorites.findIndex(
            (fav) => fav.id === event.id,
          );
          if (existingIndex === -1) {
            const newEvent = { ...event, isFavorite: true };
            state.favorites.push(newEvent);
          }
        } else {
          state.favorites = state.favorites.filter(
            (fav) => fav.id !== event.id,
          );
        }
      })
      .addCase(toggleFavoriteAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Erreur lors de la modification du favori";
      });
  },
});

export const {
  addFavorite,
  removeFavorite,
  toggleFavorite,
  clearFavorites,
  clearError,
} = favoritesSlice.actions;
