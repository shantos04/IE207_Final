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

// Mock API responses for development
const MOCK_USER: User = {
    _id: '1',
    username: 'admin',
    email: 'admin@craftui.com',
    fullName: 'Admin User',
    role: 'admin',
    avatar: '',
};

export const authService = {
    // Login
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            // Real API call (uncomment when backend is ready)
            // const response = await api.post<AuthResponse>('/auth/login', credentials);
            // return response.data;

            // Mock response for development
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (credentials.email === 'admin@craftui.com' && credentials.password === 'admin123') {
                        resolve({
                            user: MOCK_USER,
                            accessToken: 'mock-jwt-token-' + Date.now(),
                        });
                    } else {
                        reject(new Error('Email hoặc mật khẩu không đúng'));
                    }
                }, 1000);
            });
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
        }
    },

    // Sign Up
    async signUp(data: SignUpData): Promise<AuthResponse> {
        try {
            // Real API call (uncomment when backend is ready)
            // const response = await api.post<AuthResponse>('/auth/signup', data);
            // return response.data;

            // Mock response for development
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (data.email && data.password.length >= 6) {
                        resolve({
                            user: {
                                ...MOCK_USER,
                                email: data.email,
                                fullName: data.fullName,
                                _id: 'new-user-' + Date.now(),
                            },
                            accessToken: 'mock-jwt-token-' + Date.now(),
                        });
                    } else {
                        reject(new Error('Thông tin đăng ký không hợp lệ'));
                    }
                }, 1000);
            });
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
