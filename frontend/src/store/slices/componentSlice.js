import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchComponents = createAsyncThunk(
  'components/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/components', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load components');
    }
  }
);

export const fetchCategories = createAsyncThunk('components/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/components/categories');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load categories');
  }
});

export const createComponent = createAsyncThunk('components/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/components', payload);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create component');
  }
});

export const updateComponent = createAsyncThunk('components/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/components/${id}`, payload);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update component');
  }
});

export const deleteComponent = createAsyncThunk('components/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/components/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete component');
  }
});

const componentSlice = createSlice({
  name: 'components',
  initialState: {
    list: [],
    categories: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComponents.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchComponents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchComponents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(createComponent.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateComponent.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteComponent.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c._id === action.payload);
        if (idx !== -1) state.list[idx].isActive = false;
      });
  },
});

export default componentSlice.reducer;
