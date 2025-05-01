export interface ApiResponse<T> {
    data: T;
    message?: string;
    status: string;
}

export interface ErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
    status: string;
}