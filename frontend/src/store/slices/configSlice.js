import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchConfigurations = createAsyncThunk(
  'configurations/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/configurations', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load configurations');
    }
  }
);

export const fetchConfigurationById = createAsyncThunk(
  'configurations/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/configurations/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load configuration');
    }
  }
);

export const createConfiguration = createAsyncThunk(
  'configurations/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/configurations', payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to save configuration');
    }
  }
);

export const deleteConfiguration = createAsyncThunk(
  'configurations/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/configurations/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete configuration');
    }
  }
);

export const fetchPricePreview = createAsyncThunk(
  'configurations/pricePreview',
  async (componentIds, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/configurations/price-preview', { componentIds });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to compute price preview');
    }
  }
);

const configSlice = createSlice({
  name: 'configurations',
  initialState: {
    list: [],
    pagination: { total: 0, page: 1, limit: 10, pages: 1 },
    current: null,
    preview: { items: [], totalPrice: 0 },
    status: 'idle',
    error: null,
  },
  reducers: {
    clearCurrentConfiguration(state) {
      state.current = null;
    },
    clearPreview(state) {
      state.preview = { items: [], totalPrice: 0 };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfigurations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchConfigurations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchConfigurations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchConfigurationById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(createConfiguration.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.current = action.payload;
      })
      .addCase(deleteConfiguration.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c._id !== action.payload);
      })
      .addCase(fetchPricePreview.fulfilled, (state, action) => {
        state.preview = action.payload;
      });
  },
});

export const { clearCurrentConfiguration, clearPreview } = configSlice.actions;
export default configSlice.reducer;
