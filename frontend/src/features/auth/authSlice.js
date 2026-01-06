import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';

const token = localStorage.getItem('token');
const userStr = localStorage.getItem('user');
const user = userStr && userStr !== 'undefined' && userStr !== 'null' ? JSON.parse(userStr) : null;

const initialState = {
    user: user,
    token: token && token !== 'null' && token !== 'undefined' ? token : null,
    isAuthenticated: !!(token && token !== 'null' && token !== 'undefined'),
    loading: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, access } = action.payload;
            state.user = user;
            state.token = access;
            state.isAuthenticated = true;
            localStorage.setItem('token', access);
            localStorage.setItem('user', JSON.stringify(user));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
