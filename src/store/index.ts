import { configureStore } from '@reduxjs/toolkit';
import { eventsSlice } from './slices/eventsSlice';
import { favoritesSlice } from './slices/favoritesSlice';

export const store = configureStore({
  reducer: {
    events: eventsSlice.reducer,
    favorites: favoritesSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 