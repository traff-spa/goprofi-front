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

interface IUser {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    roles?: string[];
}

export interface UserState {
    user: IUser | null;
    isAuthenticated: boolean;
    setUser: (user: IUser) => void;
    clearUser: () => void;
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
    register: (email: string, password: string, firstName: string, lastName: string) => Promise<User>;
    checkAuth: () => Promise<void>;
    logout: () => void;
    loginWithGoogle: () => void;
    handleGoogleCallback: (token: string) => Promise<void>;
    clearError: () => void;
}

export type FieldLoginType = {
    email: string;
    password: string;
}

export type FieldRegistrationType = {
    email: string;
    password: string;
    confirmPassword: string;
    firstName?: string;
    lastName?: string;
}