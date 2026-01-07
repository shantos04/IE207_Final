import { Link } from 'react-router-dom';
import { ShieldOff, Home, ArrowLeft } from 'lucide-react';

export default function ForbiddenPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="mb-8 flex justify-center">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                        <ShieldOff className="w-12 h-12 text-red-600" />
                    </div>
                </div>

                {/* Error Code */}
                <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Truy cập bị từ chối
                </h2>

                {/* Message */}
                <p className="text-gray-600 mb-8">
                    Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        <Home className="w-5 h-5" />
                        <span>Về trang chủ</span>
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Quay lại</span>
                    </button>
                </div>

                {/* Additional Info */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Nếu bạn cần trợ giúp, vui lòng liên hệ:{' '}
                        <a
                            href="mailto:support@shophub.com"
                            className="text-blue-600 hover:underline"
                        >
                            support@shophub.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
