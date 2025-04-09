import {create} from 'zustand';
import {persist} from 'zustand/middleware';

import {useUserStore} from "@/store.ts";
import {AuthState} from '@/app/types';
import {authService} from '@/app/api/services';


export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            setUser: (user) => {
                set({user, isAuthenticated: true});
                useUserStore.getState().setUser(user);
            },

            clearUser: () => {
                localStorage.removeItem('auth_token');
                set({user: null, isAuthenticated: false});

                useUserStore.getState().clearUser();
            },

            login: async (email, password) => {
                try {
                    set({isLoading: true, error: null});
                    console.log('Login request with:', {email, password});
                    const response = await authService.login({email, password});
                    console.log('Login response user:', response.user);

                    localStorage.setItem('auth_token', response.token);
                    set({
                        user: response.user,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    useUserStore.getState().setUser(response.user);
                } catch (error: any) {
                    console.error('Login error in store:', error);
                    set({
                        error: error.message || 'Login failed',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            register: async (email, password, firstName, lastName) => {
                try {
                    set({isLoading: true, error: null});
                    const response = await authService.register({
                        email,
                        password,
                        firstName,
                        lastName,
                    });
                    localStorage.setItem('auth_token', response.token);
                    set({
                        user: response.user,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    useUserStore.getState().setUser(response.user);
                } catch (error: any) {
                    set({
                        error: error.message || 'Registration failed',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            loginWithGoogle: () => {
                console.log('Starting Google login flow from store');
                set({isLoading: true, error: null});
                try {
                    authService.loginWithGoogle();
                    // No need to update state here as page will redirect
                } catch (error: any) {
                    console.error('Google login initiation failed:', error);
                    set({
                        error: error.message || 'Google login failed',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            handleGoogleCallback: async (token: string) => {
                try {
                    set({isLoading: true, error: null});
                    console.log('Handling Google callback with token');

                    // Save token
                    localStorage.setItem('auth_token', token);

                    // Get user info with the token
                    const {user} = await authService.getCurrentUser();

                    set({
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    useUserStore.getState().setUser(user);
                } catch (error: any) {
                    console.error('Google callback handling failed:', error);
                    set({
                        error: error.message || 'Failed to process Google login',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            checkAuth: async () => {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    set({isAuthenticated: false});
                    return;
                }

                try {
                    set({isLoading: true});
                    const {user} = await authService.getCurrentUser();
                    set({
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    useUserStore.getState().setUser(user);
                } catch (error) {
                    localStorage.removeItem('auth_token');
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            },

            logout: () => {
                localStorage.removeItem('auth_token');
                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                });

                // Sync with global user store
                useUserStore.getState().clearUser();
            },

            clearError: () => {
                set({error: null});
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);