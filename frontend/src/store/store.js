import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import componentReducer from './slices/componentSlice';
import configReducer from './slices/configSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    components: componentReducer,
    configurations: configReducer,
  },
});
