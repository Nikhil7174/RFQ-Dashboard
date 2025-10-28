import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import quotationsReducer from './slices/quotationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    quotations: quotationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
