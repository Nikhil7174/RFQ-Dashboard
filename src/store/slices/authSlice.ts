import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from '@/lib/types';
import { storage } from '@/lib/storage';

const initialState: AuthState = {
  user: storage.getUser(),
  token: storage.getToken(),
  isAuthenticated: !!storage.getToken(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      storage.setUser(action.payload.user);
      storage.setToken(action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      storage.removeUser();
      storage.removeToken();
    },
    updateUserRole: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      storage.setUser(action.payload);
    },
  },
});

export const { loginSuccess, logout, updateUserRole } = authSlice.actions;
export default authSlice.reducer;
