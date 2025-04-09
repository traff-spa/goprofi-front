export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    isEmailVerified?: boolean;
    googleId?: string | null;
    roles?: string[];
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    setUser: (user: User) => void;
    clearUser: () => void;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
    checkAuth: () => Promise<void>;
    logout: () => void;
    loginWithGoogle: () => void;
    handleGoogleCallback: (token: string) => Promise<void>;
    clearError: () => void;
}