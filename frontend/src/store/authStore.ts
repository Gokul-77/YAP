import { create } from 'zustand';
import api from '../lib/api';

interface User {
    id: number;
    username: string;
    email: string;
    role: 'ADMIN' | 'STAFF' | 'PAID' | 'FREE';
    is_approved: boolean;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,

    login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/users/token/', { username, password });
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);

            // Fetch user profile
            const userResponse = await api.get('/users/profile/');
            set({ user: userResponse.data, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
            set({ isLoading: false });
            throw new Error(error.response?.data?.detail || 'Login failed');
        }
    },

    register: async (username: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
            await api.post('/users/register/', { username, email, password });
            set({ isLoading: false });
        } catch (error: any) {
            set({ isLoading: false });
            throw new Error(error.response?.data?.detail || 'Registration failed');
        }
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false });
    },

    fetchUser: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        set({ isLoading: true });
        try {
            const response = await api.get('/users/profile/');
            set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
    },
}));
