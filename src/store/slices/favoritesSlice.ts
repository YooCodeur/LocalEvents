import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LocalEvent } from "../../types/api";

// Clé de stockage pour les favoris
const FAVORITES_STORAGE_KEY = "@LocalEvents:favorites";

// État initial
interface FavoritesState {
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
      return storedFavorites ? JSON.parse(storedFavorites) : [];
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

      return newEvent;
    }
    return null;
  },
);

export const removeFavoriteAsync = createAsyncThunk(
  "favorites/removeFavoriteAsync",
  async (eventId: string, { getState }) => {
    const state = getState() as { favorites: FavoritesState };
    const updatedFavorites = state.favorites.favorites.filter(
      (fav) => fav.id !== eventId,
    );

    // Sauvegarder dans AsyncStorage
    await AsyncStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(updatedFavorites),
    );

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
        event.isFavorite = true;
        state.favorites.push(event);
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
        // Ajouter aux favoris
        event.isFavorite = true;
        state.favorites.push(event);
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
        state.favorites = action.payload.map((fav: LocalEvent) => ({
          ...fav,
          isFavorite: true,
        }));
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
          state.favorites.push(action.payload);
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
          const newEvent = { ...event, isFavorite: true };
          state.favorites.push(newEvent);
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
