import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  mfaToken: string | null;
  isAuthChecked: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  mfaToken: null,
  isAuthChecked: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        user?: User;
        mfaToken?: string;
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user || state.user;
      state.mfaToken = action.payload.mfaToken || null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setMfaToken: (state, action: PayloadAction<string>) => {
      state.mfaToken = action.payload;
    },
    clearMfaToken: (state) => {
      state.mfaToken = null;
    },
    setAuthChecked: (state, action: PayloadAction<boolean>) => {
      state.isAuthChecked = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.mfaToken = null;
      state.isAuthChecked = true;
    },
  },
});

export const {
  setCredentials,
  setUser,
  setMfaToken,
  clearMfaToken,
  setAuthChecked,
  logout,
} = authSlice.actions;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectCurrentToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectMfaToken = (state: { auth: AuthState }) => state.auth.mfaToken;
export const selectIsAuthChecked = (state: { auth: AuthState }) => state.auth.isAuthChecked;

export default authSlice.reducer;
