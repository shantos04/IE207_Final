import { useEffect, useState } from 'react';
import { Users, Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { customerService, Customer } from '../services/customerService';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [limit, setLimit] = useState(10);

    useEffect(() => {
        fetchCustomers();
    }, [currentPage, limit]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const params: any = {
                page: currentPage,
                limit,
            };

            if (searchKeyword) {
                params.keyword = searchKeyword;
            }

            const response = await customerService.getCustomers(params);

            if (response.success) {
                setCustomers(response.data);
                setTotalPages(response.pagination.pages);
            }
        } catch (err: any) {
            console.error('Error fetching customers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchCustomers();
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Bạn có chắc muốn xóa khách hàng "${name}"?`)) {
            return;
        }

        try {
            await customerService.deleteCustomer(id);
            fetchCustomers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Không thể xóa khách hàng');
        }
    };

    const getAvatarUrl = (name: string) => {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
    };

    const getMembershipBadge = (points: number) => {
        if (points > 1000) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    🏆 Gold
                </span>
            );
        } else if (points > 500) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-300 text-gray-800">
                    🥈 Silver
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    🥉 Bronze
                </span>
            );
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    // Helper function to generate pagination array with ellipsis
    const generatePaginationArray = (currentPage: number, totalPages: number): (number | string)[] => {
        const pages: (number | string)[] = [];

        // If total pages <= 7, show all pages
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // Always show first page
        pages.push(1);

        // Calculate range around current page
        const showLeftEllipsis = currentPage > 3;
        const showRightEllipsis = currentPage < totalPages - 2;

        if (!showLeftEllipsis && showRightEllipsis) {
            // Near the start: [1, 2, 3, 4, '...', totalPages]
            for (let i = 2; i <= 4; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(totalPages);
        } else if (showLeftEllipsis && !showRightEllipsis) {
            // Near the end: [1, '...', totalPages-3, totalPages-2, totalPages-1, totalPages]
            pages.push('...');
            for (let i = totalPages - 3; i <= totalPages; i++) {
                pages.push(i);
            }
        } else if (showLeftEllipsis && showRightEllipsis) {
            // In the middle: [1, '...', currentPage-1, currentPage, currentPage+1, '...', totalPages]
            pages.push('...');
            pages.push(currentPage - 1);
            pages.push(currentPage);
            pages.push(currentPage + 1);
            pages.push('...');
            pages.push(totalPages);
        } else {
            // Edge case: just show all
            for (let i = 2; i < totalPages; i++) {
                pages.push(i);
            }
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="space-y-6">
            {/* Header & Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quản lý Khách hàng</h1>
                        <p className="text-sm text-gray-500 mt-1">Quản lý thông tin và theo dõi khách hàng</p>
                    </div>
                    <button className="inline-flex items-center px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                        <Plus className="w-5 h-5 mr-2" />
                        Thêm khách hàng
                    </button>
                </div>

                {/* Search Bar */}
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        Tìm kiếm
                    </button>
                    <select
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value={10}>10 / trang</option>
                        <option value={25}>25 / trang</option>
                        <option value={50}>50 / trang</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : customers.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy khách hàng</h3>
                        <p className="mt-1 text-sm text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc thêm khách hàng mới.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Khách hàng
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Liên hệ
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Địa chỉ
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hạng thành viên
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Đơn hàng
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tổng chi tiêu
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hành động
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {customers.map((customer) => (
                                        <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                                            {/* Khách hàng (Avatar + Name + Email) */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <img
                                                        src={getAvatarUrl(customer.name)}
                                                        alt={customer.name}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {customer.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{customer.email}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Liên hệ */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{customer.phone}</div>
                                            </td>

                                            {/* Địa chỉ */}
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                                    {customer.address || '—'}
                                                </div>
                                            </td>

                                            {/* Hạng thành viên */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getMembershipBadge(customer.loyaltyPoints)}
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {customer.loyaltyPoints} điểm
                                                </div>
                                            </td>

                                            {/* Đơn hàng */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {customer.totalOrders || 0} đơn
                                                </div>
                                            </td>

                                            {/* Tổng chi tiêu */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {formatCurrency(customer.totalSpent || 0)}
                                                </div>
                                            </td>

                                            {/* Hành động */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    className="text-blue-600 hover:text-blue-900 mr-4 inline-flex items-center"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(customer._id, customer.name)}
                                                    className="text-red-600 hover:text-red-900 inline-flex items-center"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-white px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Trang {currentPage} / {totalPages}
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            <button
                                                onClick={() => setCurrentPage(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="sr-only">Trước</span>
                                                <svg
                                                    className="h-5 w-5"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                            {generatePaginationArray(currentPage, totalPages).map((page, index) => (
                                                page === '...' ? (
                                                    <span
                                                        key={`ellipsis-${index}`}
                                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 cursor-default"
                                                    >
                                                        ...
                                                    </span>
                                                ) : (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page as number)}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
                                                                ? 'z-10 bg-blue-600 border-blue-600 text-white'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                )
                                            ))}
                                            <button
                                                onClick={() => setCurrentPage(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="sr-only">Sau</span>
                                                <svg
                                                    className="h-5 w-5"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
