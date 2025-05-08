import { request } from '../client';

import {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    User
} from '@app/types';

export const authService = {
    login: (data: LoginRequest) => {
        return request<AuthResponse>({
            url: '/auth/login',
            method: 'POST',
            data,
        }).then(response => {
            return response;
        }).catch(error => {
            throw error;
        });
    },

    register: (data: RegisterRequest) =>
        request<AuthResponse>({
            url: '/auth/register',
            method: 'POST',
            data,
        }),

    getCurrentUser: () =>
        request<{ user: User }>({
            url: '/auth/me',
            method: 'GET',
        }),

    loginWithGoogle: () => {
        const googleAuthUrl = `${import.meta.env.VITE_API_URL}/auth/google`;
        window.location.href = googleAuthUrl;
    },

    connectGoogleAccount: () => {
        const token = localStorage.getItem('auth_token');

        if (!token) {
            console.error('No auth token available for Google connection');
            return;
        }

        // Include the token directly in the URL for the backend to identify the user
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/google?connect=true&auth_token=${encodeURIComponent(token)}`;
    },

    // Handling token received from OAuth flow (works for both login and connection)
    handleGoogleCallback: (token: string) => {
        if (token) {
            localStorage.setItem('auth_token', token);
            return request<{ user: User }>({
                url: '/auth/me',
                method: 'GET',
            });
        }
        throw new Error('No token received from Google authentication');
    }
};