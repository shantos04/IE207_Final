import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

interface AdminRouteProps {
    children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    const [hasShownToast, setHasShownToast] = useState(false);

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    // Check 1: Is user authenticated?
    if (!isAuthenticated || !user) {
        // Save attempted URL to redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check 2: Is user authorized (Admin/Manager/Staff)?
    const authorizedRoles = ['admin', 'manager', 'staff'];
    const isAuthorized = authorizedRoles.includes(user.role);

    useEffect(() => {
        if (!isAuthorized && !hasShownToast) {
            toast.error('Bạn không có quyền truy cập trang quản trị!');
            setHasShownToast(true);
        }
    }, [isAuthorized, hasShownToast]);

    if (!isAuthorized) {
        // User is authenticated but NOT authorized (e.g., customer)
        // Redirect to home page
        return <Navigate to="/" replace />;
    }

    // User is both authenticated AND authorized
    return <>{children}</>;
}
