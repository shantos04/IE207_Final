import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { User, Lock, ShoppingBag } from 'lucide-react';

export default function AccountLayout() {
    const { user } = useAuth();
    const location = useLocation();

    const menuItems = [
        {
            path: '/account/profile',
            label: 'Hồ sơ của tôi',
            icon: User,
        },
        {
            path: '/account/orders',
            label: 'Đơn mua',
            icon: ShoppingBag,
        },
        {
            path: '/account/password',
            label: 'Đổi mật khẩu',
            icon: Lock,
        },
    ];

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* LEFT SIDEBAR - 25% */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                            {/* User Profile Header */}
                            <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.fullName}
                                            referrerPolicy="no-referrer"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement!.innerHTML = `<div class="w-8 h-8 text-blue-600"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>`;
                                            }}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-8 h-8 text-blue-600" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">
                                        {user?.fullName || 'Khách hàng'}
                                    </h3>
                                    <p className="text-sm text-gray-500 truncate">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>

                            {/* Navigation Menu */}
                            <nav className="mt-6 space-y-2">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);

                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`
                                                flex items-center space-x-3 px-4 py-3 rounded-lg transition
                                                ${active
                                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* RIGHT CONTENT - 75% */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
