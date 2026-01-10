import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService, LoginCredentials, SignUpData, AuthResponse } from '../services/authService';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<User>;
    signUp: (data: SignUpData) => Promise<User>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider - Quản lý trạng thái xác thực người dùng
 * 
 * Tính năng:
 * - Lazy initialization: Tự động khôi phục phiên đăng nhập từ localStorage
 * - Đồng bộ token với axios interceptor
 * - Xử lý login/logout/signup
 * - Cập nhật thông tin user
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    // 1. LAZY INITIALIZATION - Khôi phục user từ localStorage ngay khi khởi tạo
    const [user, setUser] = useState<User | null>(() => {
        try {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('accessToken');

            // Chỉ khôi phục user nếu cả user và token đều tồn tại
            if (storedUser && token) {
                return JSON.parse(storedUser);
            }
            return null;
        } catch (error) {
            console.error('Lỗi đọc localStorage:', error);
            // Xóa dữ liệu lỗi
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            return null;
        }
    });

    const [isLoading, setIsLoading] = useState(false);

    // 2. Đồng bộ token với axios instance khi app khởi động
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token && user) {
            // Token đã được cấu hình trong api.ts interceptor
            // Không cần làm gì thêm ở đây
        }
    }, [user]);

    const login = async (credentials: LoginCredentials) => {
        const response: AuthResponse = await authService.login(credentials);
        authService.saveAuthData(response);
        setUser(response.user);
        return response.user; // Return user for role-based navigation
    };

    const signUp = async (data: SignUpData) => {
        const response: AuthResponse = await authService.signUp(data);
        authService.saveAuthData(response);
        setUser(response.user);
        return response.user; // Return user for role-based navigation
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const updateUser = (userData: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signUp,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
