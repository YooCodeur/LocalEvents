import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { LocalEvent, SearchParams } from "../../types/api";

// État initial
interface EventsState {
  events: LocalEvent[];
  loading: boolean;
  error: string | null;
  searchParams: SearchParams;
  hasMore: boolean;
  page: number;
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
};

// Actions asynchrones avec intégration API
export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (params: SearchParams, { rejectWithValue }) => {
    try {
      const { EventsService } = await import("../../services");
      return await EventsService.getEventsByCity(params);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Erreur lors du chargement des événements",
      );
    }
  },
);

export const searchEvents = createAsyncThunk(
  "events/searchEvents",
  async (params: SearchParams, { rejectWithValue }) => {
    try {
      const { EventsService } = await import("../../services");
      return await EventsService.searchEvents(params);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Erreur lors de la recherche",
      );
    }
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
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchEvents
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        if (action.meta.arg.page === 0) {
          state.events = action.payload;
        } else {
          state.events.push(...action.payload);
        }
        state.page = action.meta.arg.page || 0;
        state.hasMore = action.payload.length === (action.meta.arg.size || 20);
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Erreur lors du chargement des événements";
      })
      // searchEvents
      .addCase(searchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
        state.page = 0;
        state.hasMore = action.payload.length === (action.meta.arg.size || 20);
      })
      .addCase(searchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Erreur lors de la recherche";
      });
  },
});

export const { setSearchParams, clearEvents, clearError } = eventsSlice.actions;
