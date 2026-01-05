import { Search, Bell, Settings } from 'lucide-react';

export default function Header() {
    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-800">Tổng quan</h1>
            </div>

            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>

                {/* Notification Icon */}
                <button className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center relative transition-colors">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Settings Icon */}
                <button className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <Settings className="w-5 h-5 text-gray-600" />
                </button>
            </div>
        </header>
    );
}
