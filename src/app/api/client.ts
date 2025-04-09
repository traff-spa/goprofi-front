import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { ErrorResponse } from '../types';

// Create API client
const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

// Generic request function with typing
export const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
    try {
        const response: AxiosResponse<T> = await apiClient(config);
        return response.data;
    } catch (error: any) {
        const errorResponse: ErrorResponse = error.response?.data || {
            message: error.message || 'Unknown error occurred',
            status: 'error'
        };
        console.error('API request failed:', errorResponse);
        throw errorResponse;
    }
};

export default apiClient;
