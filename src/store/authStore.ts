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
            hasToken: false,

            setUser: (user) => {
                set({user, isAuthenticated: true});
                useUserStore.setState({user, isAuthenticated: true});
            },

            clearUser: () => {
                localStorage.removeItem('auth_token');
                set({user: null, isAuthenticated: false});
                useUserStore.setState({user: null, isAuthenticated: false});
            },

            login: async (email, password) => {
                try {
                    set({isLoading: true, error: null});
                    const response = await authService.login({email, password});

                    localStorage.setItem('auth_token', response.token);
                    set({
                        user: response.user,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    useUserStore.setState({user: response.user, isAuthenticated: true});
                } catch (error: any) {
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

                    const user = response.user;

                    set({
                        user: user,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    useUserStore.setState({user: response.user, isAuthenticated: true});
                    return user;
                } catch (error: any) {
                    set({
                        error: error.message || 'Registration failed',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            loginWithGoogle: () => {
                set({isLoading: true, error: null});
                try {
                    authService.loginWithGoogle();
                    // No need to update state here as page will redirect
                } catch (error: any) {
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

                    // Save token
                    localStorage.setItem('auth_token', token);

                    // Get user info with the token
                    const {user} = await authService.getCurrentUser();

                    set({
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    useUserStore.setState({user, isAuthenticated: true});
                } catch (error: any) {
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

                    useUserStore.setState({user, isAuthenticated: true});
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
                useUserStore.setState({user: null, isAuthenticated: false});
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