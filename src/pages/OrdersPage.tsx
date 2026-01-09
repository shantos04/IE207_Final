import { useEffect, useState } from 'react';
import {
    Package, Search, Download, Plus, Eye, Pencil, X,
    TrendingUp, Clock, Truck, DollarSign, Calendar
} from 'lucide-react';
import { orderService, Order } from '../services/orderService';
import toast from 'react-hot-toast';

// Status mapping
const STATUS_MAP: Record<Order['status'], string> = {
    'Pending': 'Chờ xử lý',
    'Confirmed': 'Đã xác nhận',
    'Shipped': 'Đang giao hàng',
    'Delivered': 'Đã giao thành công',
    'Cancelled': 'Đã hủy'
};

// Status badge styles
const getStatusBadge = (status: Order['status']) => {
    const styles: Record<Order['status'], string> = {
        'Pending': 'bg-yellow-100 text-yellow-700',
        'Confirmed': 'bg-blue-100 text-blue-700',
        'Shipped': 'bg-purple-100 text-purple-700',
        'Delivered': 'bg-green-100 text-green-700',
        'Cancelled': 'bg-red-100 text-red-700'
    };
    // Fallback for old 'Draft' orders - treat as 'Pending'
    return styles[status] || styles['Pending'];
};

interface Stats {
    todayOrders: number;
    pendingOrders: number;
    shippingOrders: number;
    todayRevenue: number;
}

interface StatusUpdateModal {
    isOpen: boolean;
    order: Order | null;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // Stats
    const [stats, setStats] = useState<Stats>({
        todayOrders: 0,
        pendingOrders: 0,
        shippingOrders: 0,
        todayRevenue: 0
    });

    // Modal
    const [statusModal, setStatusModal] = useState<StatusUpdateModal>({
        isOpen: false,
        order: null
    });
    const [newStatus, setNewStatus] = useState<Order['status']>('Pending');
    const [statusNote, setStatusNote] = useState('');

    useEffect(() => {
        fetchOrders();
        fetchStats();
    }, [currentPage, statusFilter, startDate, endDate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params: any = {
                page: currentPage,
                limit,
            };

            if (statusFilter) params.status = statusFilter;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await orderService.getOrders(params);

            if (response.success) {
                setOrders(response.data);
                setTotalPages(response.pagination.pages);
            }
        } catch (err: any) {
            console.error('Error fetching orders:', err);
            toast.error('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await orderService.getOrderStats();
            if (response.success) {
                setStats({
                    todayOrders: response.data.todayOrders,
                    pendingOrders: response.data.pending,
                    shippingOrders: response.data.shipped,
                    todayRevenue: response.data.todayRevenue
                });
            }
        } catch (err: any) {
            console.error('Error fetching stats:', err);
        }
    };

    const handleQuickDateFilter = (type: 'today' | 'week' | 'month') => {
        const today = new Date();
        const start = new Date();

        if (type === 'today') {
            setStartDate(today.toISOString().split('T')[0]);
            setEndDate(today.toISOString().split('T')[0]);
        } else if (type === 'week') {
            start.setDate(today.getDate() - 7);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(today.toISOString().split('T')[0]);
        } else if (type === 'month') {
            start.setMonth(today.getMonth() - 1);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(today.toISOString().split('T')[0]);
        }
    };

    const clearFilters = () => {
        setStatusFilter('');
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };

    const openStatusModal = (order: Order) => {
        setStatusModal({ isOpen: true, order });
        setNewStatus(order.status);
        setStatusNote('');
    };

    const closeStatusModal = () => {
        setStatusModal({ isOpen: false, order: null });
        setNewStatus('Pending');
        setStatusNote('');
    };

    const handleUpdateStatus = async () => {
        if (!statusModal.order) return;

        try {
            await orderService.updateOrderStatus(statusModal.order._id, newStatus);
            toast.success('Đã cập nhật trạng thái đơn hàng');
            closeStatusModal();
            fetchOrders();
            fetchStats(); // Refresh stats after updating order
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Không thể cập nhật trạng thái');
        }
    };

    const handleExport = () => {
        toast.success('Chức năng xuất Excel đang được phát triển');
    };

    const filteredOrders = orders.filter(order => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            order.orderCode.toLowerCase().includes(search) ||
            order.customer.name.toLowerCase().includes(search) ||
            order.customer.email.toLowerCase().includes(search)
        );
    });

    // Smart pagination renderer - only show pages around current page
    const renderPagination = () => {
        const pages: (number | string)[] = [];
        const delta = 2; // Number of pages to show on each side of current page

        // Always show first page
        pages.push(1);

        // Show dots if there's a gap between 1 and the range
        if (currentPage - delta > 2) {
            pages.push('...');
        }

        // Show pages around current page
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            pages.push(i);
        }

        // Show dots if there's a gap between range and last page
        if (currentPage + delta < totalPages - 1) {
            pages.push('...');
        }

        // Always show last page (if more than 1 page)
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages.map((page, index) => {
            if (page === '...') {
                return (
                    <span
                        key={`dots-${index}`}
                        className="px-3 py-2 text-sm text-gray-500"
                    >
                        ...
                    </span>
                );
            }

            return (
                <button
                    key={page}
                    onClick={() => setCurrentPage(page as number)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    {page}
                </button>
            );
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
                    <p className="text-sm text-gray-500 mt-1">Theo dõi và quản lý tất cả đơn hàng</p>
                </div>
            </div>

            {/* Stats Cards - Lấy dữ liệu từ API độc lập, KHÔNG bị ảnh hưởng bởi filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Đơn hôm nay</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.todayOrders}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                            <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.pendingOrders}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Đang giao</p>
                            <p className="text-2xl font-bold text-purple-600 mt-2">{stats.shippingOrders}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Truck className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Doanh thu hôm nay</p>
                            <p className="text-2xl font-bold text-green-600 mt-2">
                                {new Intl.NumberFormat('vi-VN', {
                                    notation: 'compact',
                                    compactDisplay: 'short'
                                }).format(stats.todayRevenue)}₫
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Filter Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {/* Row 1: Search, Status, Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
                    {/* Search - 40% width */}
                    <div className="lg:col-span-5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm theo mã đơn, tên khách hàng, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="lg:col-span-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            aria-label="Lọc theo trạng thái"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="Pending">Chờ xử lý</option>
                            <option value="Confirmed">Đã xác nhận</option>
                            <option value="Shipped">Đang giao</option>
                            <option value="Delivered">Đã giao</option>
                            <option value="Cancelled">Đã hủy</option>
                        </select>
                    </div>

                    {/* Export & Create Buttons */}
                    <div className="lg:col-span-4 flex gap-2">
                        <button
                            onClick={handleExport}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Xuất Excel
                        </button>
                        <button className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo đơn hàng
                        </button>
                    </div>
                </div>

                {/* Row 2: Date Filters & Quick Actions */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Date Range */}
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            aria-label="Từ ngày"
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            aria-label="Đến ngày"
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Quick Date Filters */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleQuickDateFilter('today')}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                            Hôm nay
                        </button>
                        <button
                            onClick={() => handleQuickDateFilter('week')}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                            Tuần này
                        </button>
                        <button
                            onClick={() => handleQuickDateFilter('month')}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                            Tháng này
                        </button>
                    </div>

                    {/* Clear Filters */}
                    {(statusFilter || searchTerm || startDate || endDate) && (
                        <button
                            onClick={clearFilters}
                            className="ml-auto px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                        >
                            <X className="w-4 h-4" />
                            Xóa bộ lọc
                        </button>
                    )}
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Đang tải dữ liệu...</p>
                        </div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Package className="w-20 h-20 text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Không tìm thấy đơn hàng
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm || statusFilter || startDate || endDate
                                ? 'Thử điều chỉnh bộ lọc để xem kết quả khác'
                                : 'Chưa có đơn hàng nào trong hệ thống'
                            }
                        </p>
                        {(searchTerm || statusFilter || startDate || endDate) && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mã đơn hàng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Khách hàng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ngày đặt
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tổng tiền
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hành động
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                            {/* Order Code */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <a
                                                    href={`/admin/orders/${order._id}`}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    {order.orderCode}
                                                </a>
                                            </td>

                                            {/* Customer */}
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        {order.customer.name}
                                                    </div>
                                                    <div className="text-gray-500">
                                                        {order.customer.email}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Date */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(order.createdAt).toLocaleTimeString('vi-VN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </td>

                                            {/* Total Amount */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-mono font-bold text-gray-900">
                                                    {new Intl.NumberFormat('vi-VN', {
                                                        style: 'currency',
                                                        currency: 'VND'
                                                    }).format(order.totalPrice || order.totalAmount)}
                                                </div>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                                                    {/* Migration: Show 'Pending' text for old 'Draft' orders */}
                                                    {(order.status as any) === 'Draft' ? 'Chờ xử lý' : STATUS_MAP[order.status]}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => window.location.href = `/admin/orders/${order._id}`}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openStatusModal(order)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Cập nhật trạng thái"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Trang <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Trước
                                    </button>

                                    {/* Smart pagination - only show relevant pages */}
                                    {renderPagination()}

                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Status Update Modal */}
            {statusModal.isOpen && statusModal.order && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Cập nhật trạng thái đơn hàng
                            </h3>
                            <button
                                onClick={closeStatusModal}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Đóng"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-4 space-y-4">
                            {/* Order Info */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600">Mã đơn hàng</p>
                                <p className="text-base font-semibold text-gray-900 mt-1">
                                    {statusModal.order.orderCode}
                                </p>
                            </div>

                            {/* Current Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Trạng thái hiện tại
                                </label>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(statusModal.order.status)}`}>
                                    {/* Migration: Show 'Pending' text for old 'Draft' orders */}
                                    {(statusModal.order.status as any) === 'Draft' ? 'Chờ xử lý' : STATUS_MAP[statusModal.order.status]}
                                </span>
                            </div>

                            {/* New Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Trạng thái mới
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value as Order['status'])}
                                    aria-label="Chọn trạng thái mới"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="Pending">Chờ xử lý</option>
                                    <option value="Confirmed">Đã xác nhận</option>
                                    <option value="Shipped">Đang giao hàng</option>
                                    <option value="Delivered">Đã giao thành công</option>
                                    <option value="Cancelled">Đã hủy</option>
                                </select>
                            </div>

                            {/* Note */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ghi chú (tùy chọn)
                                </label>
                                <textarea
                                    value={statusNote}
                                    onChange={(e) => setStatusNote(e.target.value)}
                                    placeholder="Nhập ghi chú về việc cập nhật trạng thái..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={closeStatusModal}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleUpdateStatus}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Lưu cập nhật
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
