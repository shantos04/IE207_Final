import api from './api';
import { User } from '../types';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignUpData {
    fullName: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken?: string;
}

export const authService = {
    // Login
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await api.post<{
                success: boolean;
                message: string;
                data: {
                    user: any;
                    accessToken: string;
                }
            }>('/auth/login', credentials);

            // Transform backend response to AuthResponse format
            return {
                user: {
                    _id: response.data.data.user._id,
                    username: response.data.data.user.username,
                    email: response.data.data.user.email,
                    fullName: response.data.data.user.fullName,
                    role: response.data.data.user.role,
                    avatar: response.data.data.user.avatar,
                    phone: response.data.data.user.phone,
                },
                accessToken: response.data.data.accessToken,
            };
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
        }
    },

    // Sign Up
    async signUp(data: SignUpData): Promise<AuthResponse> {
        try {
            const response = await api.post<{
                success: boolean;
                message: string;
                data: {
                    user: any;
                    accessToken: string;
                }
            }>('/auth/signup', data);

            // Transform backend response to AuthResponse format
            return {
                user: {
                    _id: response.data.data.user._id,
                    username: response.data.data.user.username,
                    email: response.data.data.user.email,
                    fullName: response.data.data.user.fullName,
                    role: response.data.data.user.role,
                    avatar: response.data.data.user.avatar,
                    phone: response.data.data.user.phone,
                },
                accessToken: response.data.data.accessToken,
            };
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Đăng ký thất bại');
        }
    },

    // Logout
    logout(): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
    },

    // Get current user
    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Save auth data
    saveAuthData(data: AuthResponse): void {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
    },
};
