import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import {
    ShoppingCart,
    Search,
    User,
    Menu,
    X,
    Home,
    Package,
    Info,
    Phone,
    LogOut,
    Settings,
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    LayoutDashboard,
    UserCircle,
    ShoppingBag
} from 'lucide-react';

export default function ClientLayout() {
    const { user, logout } = useAuth();
    const { items } = useCart();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        if (showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUserMenu]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleLogout = () => {
        // 1. Clear localStorage (handled by authService.logout)
        // 2. Update global state (Context)
        logout();

        // 3. Close dropdown menu
        setShowUserMenu(false);

        // 4. Navigate to login page immediately
        navigate('/auth');
    };

    const menuItems = [
        { path: '/', label: 'Trang chủ', icon: Home },
        { path: '/shop', label: 'Sản phẩm', icon: Package },
        { path: '/about', label: 'Giới thiệu', icon: Info },
        { path: '/contact', label: 'Liên hệ', icon: Phone },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    {/* Top Header */}
                    <div className="flex items-center justify-between py-4">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">ShopHub</span>
                        </Link>

                        {/* Search Bar - Desktop */}
                        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Tìm kiếm sản phẩm..."
                                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                            </div>
                            <button
                                type="submit"
                                className="ml-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Tìm
                            </button>
                        </form>

                        {/* Right Actions */}
                        <div className="flex items-center space-x-4">
                            {/* Cart */}
                            <Link
                                to="/cart"
                                className="relative p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <ShoppingCart className="w-6 h-6 text-gray-700" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                        {cartItemCount}
                                    </span>
                                )}
                            </Link>

                            {/* User Menu */}
                            {user ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition focus:outline-none"
                                    >
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.fullName}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-white font-medium text-sm">
                                                    {user.fullName?.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    </button>

                                    {showUserMenu && (
                                        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                            {/* Header: Avatar + Name + Email */}
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                        {user.avatar ? (
                                                            <img
                                                                src={user.avatar}
                                                                alt={user.fullName}
                                                                className="w-full h-full rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-white font-semibold text-lg">
                                                                {user.fullName?.charAt(0).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-900 truncate text-sm">
                                                            {user.fullName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Group 1: Quản lý - CHỈ HIỆN CHO ADMIN */}
                                            {user.role === 'admin' && (
                                                <>
                                                    <Link
                                                        to="/admin/dashboard"
                                                        className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <LayoutDashboard className="w-5 h-5" />
                                                        <span>Trang Quản Trị</span>
                                                    </Link>
                                                    <div className="border-t border-gray-100 my-1"></div>
                                                </>
                                            )}

                                            {/* Group 2: Cá nhân - AI CŨNG CÓ */}
                                            <Link
                                                to="/account/profile"
                                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <UserCircle className="w-4 h-4 text-gray-500" />
                                                <span>Hồ sơ cá nhân</span>
                                            </Link>
                                            <Link
                                                to="/account/orders"
                                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <ShoppingBag className="w-4 h-4 text-gray-500" />
                                                <span>Lịch sử mua hàng</span>
                                            </Link>

                                            {/* Divider */}
                                            <div className="border-t border-gray-100 my-1"></div>

                                            {/* Group 3: Đăng xuất */}
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Đăng xuất</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    to="/auth"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                >
                                    Đăng nhập
                                </Link>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-6 h-6 text-gray-700" />
                                ) : (
                                    <Menu className="w-6 h-6 text-gray-700" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Navigation Menu - Desktop */}
                    <nav className="hidden md:flex space-x-8 pb-4 border-t border-gray-200 pt-4">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition font-medium"
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 bg-white">
                        {/* Mobile Search */}
                        <form onSubmit={handleSearch} className="p-4 border-b border-gray-200">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Tìm kiếm sản phẩm..."
                                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                            </div>
                        </form>

                        {/* Mobile Navigation */}
                        <nav className="py-2">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 text-gray-700"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 mt-16 relative overflow-hidden">
                {/* Main Content */}
                <div className="container mx-auto px-6 py-12 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Column 1 - About */}
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Package className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-white text-xl font-bold">ShopHub</h3>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Nền tảng mua sắm trực tuyến hàng đầu, cung cấp linh kiện điện tử chất lượng cao với giá tốt nhất.
                            </p>
                        </div>

                        {/* Column 2 - Quick Links */}
                        <div>
                            <h3 className="text-white text-lg font-bold mb-4">Liên kết nhanh</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/" className="text-gray-400 hover:text-blue-400 transition text-sm">
                                        Trang chủ
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/shop" className="text-gray-400 hover:text-blue-400 transition text-sm">
                                        Sản phẩm
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/cart" className="text-gray-400 hover:text-blue-400 transition text-sm">
                                        Giỏ hàng
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/about" className="text-gray-400 hover:text-blue-400 transition text-sm">
                                        Giới thiệu
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/contact" className="text-gray-400 hover:text-blue-400 transition text-sm">
                                        Liên hệ
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3 - Contact Info */}
                        <div>
                            <h3 className="text-white text-lg font-bold mb-4">Liên hệ</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start space-x-3 text-sm">
                                    <Phone className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-gray-400">Hotline</p>
                                        <p className="text-white">0123 456 789</p>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-3 text-sm">
                                    <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <div>
                                        <p className="text-gray-400">Email</p>
                                        <p className="text-white">support@shophub.com</p>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-3 text-sm">
                                    <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <div>
                                        <p className="text-gray-400">Địa chỉ</p>
                                        <p className="text-white">123 Nguyễn Văn Linh, Q7, TP.HCM</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Column 4 - Social Media */}
                        <div>
                            <h3 className="text-white text-lg font-bold mb-4">Mạng xã hội</h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Theo dõi chúng tôi để cập nhật thông tin mới nhất
                            </p>
                            <div className="flex space-x-3">
                                <a
                                    href="#"
                                    className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition"
                                    aria-label="Facebook"
                                >
                                    <Facebook className="w-5 h-5" />
                                </a>
                                <a
                                    href="#"
                                    className="w-10 h-10 bg-gray-800 hover:bg-blue-400 rounded-lg flex items-center justify-center transition"
                                    aria-label="Twitter"
                                >
                                    <Twitter className="w-5 h-5" />
                                </a>
                                <a
                                    href="#"
                                    className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition"
                                    aria-label="Instagram"
                                >
                                    <Instagram className="w-5 h-5" />
                                </a>
                                <a
                                    href="#"
                                    className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition"
                                    aria-label="Youtube"
                                >
                                    <Youtube className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright Bar - Separated Section */}
                <div className="border-t border-gray-800 relative z-10">
                    <div className="container mx-auto px-6 py-4">
                        <p className="text-center text-sm text-gray-400">
                            &copy; 2026 ShopHub. Bản quyền thuộc về ShopHub. Thiết kế bởi Team IE207.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
