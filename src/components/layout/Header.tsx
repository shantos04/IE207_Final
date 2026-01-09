import { Search, Bell, Settings, ShoppingCart, AlertTriangle, UserPlus, LogOut, Users, FileText, SettingsIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setShowSettings(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Dummy notifications data
    const notifications = [
        {
            id: 1,
            type: 'order',
            icon: ShoppingCart,
            iconColor: 'text-blue-600 bg-blue-100',
            title: 'Đơn hàng mới #ORD-2026-0001',
            message: 'Khách hàng Trần Văn B đã đặt 3 sản phẩm',
            time: 'Vừa xong',
            unread: true
        },
        {
            id: 2,
            type: 'warning',
            icon: AlertTriangle,
            iconColor: 'text-yellow-600 bg-yellow-100',
            title: 'Cảnh báo tồn kho',
            message: 'Arduino Uno R3 chỉ còn 5 sản phẩm trong kho',
            time: '2 giờ trước',
            unread: true
        },
        {
            id: 3,
            type: 'user',
            icon: UserPlus,
            iconColor: 'text-purple-600 bg-purple-100',
            title: 'Khách hàng mới',
            message: 'Nguyễn Văn A vừa đăng ký tài khoản',
            time: '5 giờ trước',
            unread: false
        }
    ];

    const hasUnreadNotifications = notifications.some(n => n.unread);

    const handleLogout = () => {
        // Add logout logic here
        console.log('Đăng xuất');
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-800">Tổng quan</h1>
            </div>

            <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative hidden md:block mr-2">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>

                {/* Notification Dropdown */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-all relative"
                    >
                        <Bell className="w-6 h-6" />
                        {hasUnreadNotifications && (
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2">
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800">Thông báo</h3>
                                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                    Đánh dấu đã đọc
                                </button>
                            </div>

                            {/* Notifications List */}
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.map((notif) => {
                                    const IconComponent = notif.icon;
                                    return (
                                        <div
                                            key={notif.id}
                                            className={`px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0 ${notif.unread ? 'bg-blue-50/30' : ''
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.iconColor}`}>
                                                    <IconComponent className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 mb-1">
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {notif.time}
                                                    </p>
                                                </div>
                                                {notif.unread && (
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <div className="px-5 py-3 border-t border-gray-100">
                                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                    Xem tất cả thông báo
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Settings Dropdown */}
                <div className="relative" ref={settingsRef}>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-all hover:rotate-90 duration-500"
                    >
                        <Settings className="w-6 h-6" />
                    </button>

                    {showSettings && (
                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 py-2">
                            <Link
                                to="/admin/settings/general"
                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <SettingsIcon className="w-4 h-4 text-gray-500" />
                                <span>Cấu hình hệ thống</span>
                            </Link>

                            <Link
                                to="/admin/settings/staff"
                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Users className="w-4 h-4 text-gray-500" />
                                <span>Quản lý nhân viên</span>
                            </Link>

                            <Link
                                to="/admin/settings/logs"
                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <FileText className="w-4 h-4 text-gray-500" />
                                <span>Nhật ký hoạt động</span>
                            </Link>

                            <div className="my-2 border-t border-gray-100"></div>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
