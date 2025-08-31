import { createSlice } from '@reduxjs/toolkit';
import { mockCurrentUser } from '../../mock';

const initialState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
};

const savedLoginState = localStorage.getItem('isLoggedIn');
if (savedLoginState === 'true') {
  initialState.isAuthenticated = true;
  initialState.user = mockCurrentUser;
  initialState.isLoading = false;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload || mockCurrentUser;
      state.isLoading = false;
      localStorage.setItem('isLoggedIn', 'true');
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.isLoading = false;
      localStorage.removeItem('isLoggedIn');
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { loginSuccess, logout, setLoading, updateUser } = authSlice.actions;
export default authSlice.reducer;