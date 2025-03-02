import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import { User, LoginCredentials, RegisterCredentials } from '../types/auth';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    error: string | null;
    login: (Credential: LoginCredentials) => Promise<void>;
    register: (Credential: RegisterCredentials) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
};

const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isLoggedIn: false,
            isLoading: false,
            error: null,

            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/auth/login', credentials);
                    const { user, token } = response.data;
                    set({ user, token, isLoading: false, isLoggedIn: true })
                } catch (error: any) {
                    const message = error.response?.data?.message || 'Login failed';
                    set({ error: message, isLoading: false });
                    throw error
                }
            },

            register: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    await api.post('/auth/register', credentials);
                    set({ isLoading: false });
                } catch (error: any) {
                    const message = error.response?.data?.message || 'Registration failed';
                    set({ error: message, isLoading: false });
                    throw error;
                }
            },

            logout: async () => {   
                set({ isLoading: true, error: null });
                try {
                    await api.post('/auth/logout');
                } catch (error: any) {
                    console.error('Logout API failed:', error);
                } finally {
                    // Clear state regardless of API success
                    set({ user: null, token: null, isLoggedIn: false, isLoading: false });
                    localStorage.removeItem('token'); // Still clear, but api.ts handles it too
                }
            },

            clearError: () => set({ error: null }),

        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isLoggedIn: state.isLoggedIn,
            }),
        }
    )
);


export default useAuthStore;