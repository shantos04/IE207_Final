import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService, LoginCredentials, SignUpData, AuthResponse } from '../services/authService';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    signUp: (data: SignUpData) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const currentUser = authService.getCurrentUser();
        const token = localStorage.getItem('accessToken');

        if (currentUser && token) {
            setUser(currentUser);
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials: LoginCredentials) => {
        const response: AuthResponse = await authService.login(credentials);
        authService.saveAuthData(response);
        setUser(response.user);
    };

    const signUp = async (data: SignUpData) => {
        const response: AuthResponse = await authService.signUp(data);
        authService.saveAuthData(response);
        setUser(response.user);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signUp,
        logout,
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
