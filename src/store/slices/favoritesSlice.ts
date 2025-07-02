import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocalEvent } from '../../types/api';

// Clé de stockage pour les favoris
const FAVORITES_STORAGE_KEY = '@LocalEvents:favorites';

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
  'favorites/loadFavorites',
  async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      return storedFavorites ? JSON.parse(storedFavorites) : [];
    } catch (error) {
      throw new Error('Erreur lors du chargement des favoris');
    }
  }
);

export const saveFavorites = createAsyncThunk(
  'favorites/saveFavorites',
  async (favorites: LocalEvent[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      return favorites;
    } catch (error) {
      throw new Error('Erreur lors de la sauvegarde des favoris');
    }
  }
);

// Slice
export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addFavorite: (state, action: PayloadAction<LocalEvent>) => {
      const event = action.payload;
      const existingIndex = state.favorites.findIndex(fav => fav.id === event.id);
      
      if (existingIndex === -1) {
        event.isFavorite = true;
        state.favorites.push(event);
        // Sauvegarder automatiquement
        saveFavorites(state.favorites);
      }
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      state.favorites = state.favorites.filter(fav => fav.id !== eventId);
      // Sauvegarder automatiquement
      saveFavorites(state.favorites);
    },
    toggleFavorite: (state, action: PayloadAction<LocalEvent>) => {
      const event = action.payload;
      const existingIndex = state.favorites.findIndex(fav => fav.id === event.id);
      
      if (existingIndex !== -1) {
        // Retirer des favoris
        state.favorites.splice(existingIndex, 1);
      } else {
        // Ajouter aux favoris
        event.isFavorite = true;
        state.favorites.push(event);
      }
      // Sauvegarder automatiquement
      saveFavorites(state.favorites);
    },
    clearFavorites: (state) => {
      state.favorites = [];
      saveFavorites([]);
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
        state.error = action.error.message || 'Erreur lors du chargement des favoris';
      })
      // saveFavorites
      .addCase(saveFavorites.pending, (state) => {
        // Pas de loading pour la sauvegarde
      })
      .addCase(saveFavorites.fulfilled, (state, action) => {
        // Favoris sauvegardés avec succès
      })
      .addCase(saveFavorites.rejected, (state, action) => {
        state.error = action.error.message || 'Erreur lors de la sauvegarde';
      });
  },
});

export const { addFavorite, removeFavorite, toggleFavorite, clearFavorites, clearError } = favoritesSlice.actions; 