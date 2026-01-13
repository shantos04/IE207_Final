import { Search, Bell, ShoppingCart, AlertTriangle, UserPlus, ExternalLink } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';

export default function Header() {
    const [showNotifications, setShowNotifications] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
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

    // Fetch suggestions with debounce
    const fetchSuggestions = async (query: string) => {
        if (query.trim().length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setLoadingSuggestions(true);
        try {
            const response = await productService.getSuggestions(query);
            setSuggestions(response.data || []);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
            setSuggestions([]);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    // Handle input change with debounce
    const handleInputChange = (value: string) => {
        setKeyword(value);

        // Clear previous timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set new timer (400ms debounce)
        debounceTimerRef.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 400);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (keyword.trim()) {
            navigate(`/shop?keyword=${encodeURIComponent(keyword.trim())}`);
            setShowSuggestions(false);
            setSuggestions([]);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch(e as any);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestionName: string) => {
        setKeyword(suggestionName);
        navigate(`/shop?keyword=${encodeURIComponent(suggestionName)}`);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-800">Tổng quan</h1>
            </div>

            <div className="flex items-center gap-2">
                {/* Search with Autocomplete */}
                <form onSubmit={handleSearch} className="relative hidden md:flex items-center gap-2 mr-2">
                    <div className="relative" ref={searchRef}>
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={keyword}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onKeyDown={handleKeyPress}
                            onFocus={() => keyword.trim().length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
                            className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />

                        {/* Autocomplete Dropdown */}
                        {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
                                {loadingSuggestions ? (
                                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                        <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                        <span className="ml-2">Đang tìm kiếm...</span>
                                    </div>
                                ) : (
                                    suggestions.map((suggestion) => (
                                        <button
                                            key={suggestion._id}
                                            type="button"
                                            onClick={() => handleSuggestionClick(suggestion.name)}
                                            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-0"
                                        >
                                            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            <span className="text-sm text-gray-700 truncate">{suggestion.name}</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    >
                        Tìm
                    </button>
                </form>

                {/* Visit Storefront Button */}
                <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors mr-2"
                    title="Xem trang cửa hàng"
                >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden md:inline">Xem cửa hàng</span>
                </a>

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
            </div>
        </header>
    );
}
