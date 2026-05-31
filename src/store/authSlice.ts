import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  id: string;
  phoneNumber: string;
  name: string;
  avatarUrl?: string;
  groupIds: string[];
  createdAt: string;
}

interface AuthState {
  user: UserState | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: UserState }>
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, setLoading } = authSlice.actions;

export default authSlice.reducer;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
