import {
    Home,
    Package,
    ShoppingCart,
    Users,
    FileText,
    Settings,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    LogOut
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

const menuItems = [
    { icon: Home, label: 'Tổng quan', path: '/dashboard' },
    { icon: Package, label: 'Sản phẩm', path: '/products' },
    { icon: ShoppingCart, label: 'Đơn hàng', path: '/orders' },
    { icon: Users, label: 'Khách hàng', path: '/customers' },
    { icon: FileText, label: 'Hóa đơn', path: '/invoices' },
    { icon: BarChart3, label: 'Báo cáo', path: '/reports' },
    { icon: Settings, label: 'Cài đặt', path: '/settings' },
];

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Đăng xuất thành công!');
        navigate('/login');
    };

    return (
        <aside
            className={clsx(
                'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col',
                isCollapsed ? 'w-20' : 'w-64'
            )}
        >
            {/* Logo Section */}
            <div className="h-16 flex items-center justify-center border-b border-gray-200 relative">
                <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">C</span>
                </div>
                {!isCollapsed && (
                    <span className="ml-3 text-xl font-semibold text-gray-800">CraftUI</span>
                )}

                {/* Toggle Button */}
                <button
                    onClick={onToggle}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                    ) : (
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                    )}
                </button>
            </div>

            {/* Welcome Section */}
            {!isCollapsed && (
                <div className="p-4 border-b border-gray-200">
                    <p className="text-sm text-gray-500">Chào mừng,</p>
                    <p className="text-base font-semibold text-gray-800">CRAFTUI</p>
                </div>
            )}

            {/* Navigation Menu */}
            <nav className="flex-1 py-4 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center px-4 py-3 mx-2 mb-1 rounded-xl transition-all',
                                isActive
                                    ? 'bg-primary-50 text-primary-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                            )
                        }
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="ml-3 font-medium">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* User Profile Section */}
            {!isCollapsed && (
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-primary-600 font-semibold">
                                    {user?.fullName?.charAt(0).toUpperCase() || 'A'}
                                </span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-semibold text-gray-800">
                                    {user?.fullName || 'Admin'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user?.email || 'admin@craftui.com'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            )}
        </aside>
    );
}
