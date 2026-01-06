import { useEffect, useState } from 'react';
import { Package, Search, Filter, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { orderService, Order } from '../services/orderService';

// Status mapping for Vietnamese translation
const STATUS_MAP: Record<string, string> = {
    'Draft': 'Nháp',
    'Pending': 'Chờ xử lý',
    'Confirmed': 'Đã xác nhận',
    'Shipped': 'Đang giao hàng',
    'Delivered': 'Đã giao thành công',
    'Cancelled': 'Đã hủy'
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [limit, setLimit] = useState(10);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // Mock data nếu API trả về rỗng
    const mockOrders: Order[] = [
        {
            _id: '1',
            orderCode: 'ORD-202601-0001',
            customer: {
                name: 'Nguyễn Văn An',
                email: 'nguyenvanan@gmail.com',
                phone: '0901234567',
            },
            orderItems: [
                {
                    product: '1',
                    productName: 'Arduino Uno R3',
                    productCode: 'ARD-UNO-R3',
                    quantity: 2,
                    price: 250000,
                    subtotal: 500000,
                },
            ],
            shippingAddress: {
                address: '123 Đường Lê Lợi',
                city: 'TP. Hồ Chí Minh',
                phone: '0901234567',
            },
            paymentMethod: 'COD',
            totalAmount: 500000,
            totalPrice: 500000,
            status: 'Pending',
            paymentStatus: 'unpaid',
            createdAt: '2026-01-03T08:30:00.000Z',
            updatedAt: '2026-01-03T08:30:00.000Z',
        },
        {
            _id: '2',
            orderCode: 'ORD-202601-0002',
            customer: {
                name: 'Trần Thị Bích',
                email: 'tranbich@yahoo.com',
                phone: '0912345678',
            },
            orderItems: [
                {
                    product: '2',
                    productName: 'ESP32 DevKit',
                    productCode: 'ESP32-DEVKIT',
                    quantity: 1,
                    price: 180000,
                    subtotal: 180000,
                },
            ],
            shippingAddress: {
                address: '456 Trần Hưng Đạo',
                city: 'TP. Hồ Chí Minh',
                phone: '0912345678',
            },
            paymentMethod: 'Bank Transfer',
            totalAmount: 180000,
            totalPrice: 180000,
            status: 'Shipped',
            paymentStatus: 'paid',
            createdAt: '2026-01-02T14:20:00.000Z',
            updatedAt: '2026-01-04T09:15:00.000Z',
        },
        {
            _id: '3',
            orderCode: 'ORD-202601-0003',
            customer: {
                name: 'Lê Hoàng Cường',
                email: 'lehoangcuong@outlook.com',
                phone: '0923456789',
            },
            orderItems: [
                {
                    product: '3',
                    productName: 'Cảm biến DHT22',
                    productCode: 'DHT22-SENSOR',
                    quantity: 5,
                    price: 85000,
                    subtotal: 425000,
                },
            ],
            shippingAddress: {
                address: '789 Nguyễn Huệ',
                city: 'Hà Nội',
                phone: '0923456789',
            },
            paymentMethod: 'Credit Card',
            totalAmount: 425000,
            totalPrice: 425000,
            status: 'Delivered',
            paymentStatus: 'paid',
            createdAt: '2026-01-01T10:00:00.000Z',
            updatedAt: '2026-01-03T16:45:00.000Z',
        },
        {
            _id: '4',
            orderCode: 'ORD-202601-0004',
            customer: {
                name: 'Phạm Minh Đức',
                email: 'phamminhduc@gmail.com',
                phone: '0934567890',
            },
            orderItems: [
                {
                    product: '4',
                    productName: 'LED RGB 5mm',
                    productCode: 'LED-RGB-5MM',
                    quantity: 100,
                    price: 1500,
                    subtotal: 150000,
                },
            ],
            shippingAddress: {
                address: '321 Võ Văn Tần',
                city: 'Đà Nẵng',
                phone: '0934567890',
            },
            paymentMethod: 'COD',
            totalAmount: 150000,
            totalPrice: 150000,
            status: 'Cancelled',
            paymentStatus: 'refunded',
            createdAt: '2025-12-30T11:30:00.000Z',
            updatedAt: '2025-12-31T08:00:00.000Z',
        },
        {
            _id: '5',
            orderCode: 'ORD-202601-0005',
            customer: {
                name: 'Võ Thị Em',
                email: 'vothiem@hotmail.com',
                phone: '0945678901',
            },
            orderItems: [
                {
                    product: '5',
                    productName: 'Module Bluetooth HC-05',
                    productCode: 'HC05-BLUETOOTH',
                    quantity: 3,
                    price: 120000,
                    subtotal: 360000,
                },
            ],
            shippingAddress: {
                address: '654 Cách Mạng Tháng 8',
                city: 'TP. Hồ Chí Minh',
                phone: '0945678901',
            },
            paymentMethod: 'E-Wallet',
            totalAmount: 360000,
            totalPrice: 360000,
            status: 'Confirmed',
            paymentStatus: 'unpaid',
            createdAt: '2026-01-04T15:45:00.000Z',
            updatedAt: '2026-01-04T16:00:00.000Z',
        },
    ];

    useEffect(() => {
        fetchOrders();
    }, [currentPage, statusFilter, limit, startDate, endDate]);

    // Reset to page 1 when filters change
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [statusFilter, startDate, endDate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const params: any = {
                page: currentPage,
                limit,
            };

            if (statusFilter) {
                params.status = statusFilter;
            }

            if (startDate) {
                params.startDate = startDate;
            }

            if (endDate) {
                params.endDate = endDate;
            }

            console.log('🔍 Fetching orders with params:', params);

            const response = await orderService.getOrders(params);

            if (response.success && response.data.length > 0) {
                setOrders(response.data);
                setTotalPages(response.pagination.pages);
            } else {
                // Nếu API trả về rỗng, dùng mock data
                setOrders(mockOrders);
                setTotalPages(1);
            }
        } catch (err: any) {
            console.error('Error fetching orders:', err);
            // Nếu API lỗi, dùng mock data
            setOrders(mockOrders);
            setTotalPages(1);
            setError('Đang sử dụng dữ liệu mẫu');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            // Refresh data
            fetchOrders();
        } catch (err: any) {
            alert('Không thể cập nhật trạng thái: ' + err.message);
        }
    };

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setStatusFilter('');
        setSearchTerm('');
        setCurrentPage(1);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getStatusBadge = (status: Order['status']) => {
        const statusConfig = {
            Draft: {
                bg: 'bg-gray-100',
                text: 'text-gray-800',
                label: 'Nháp',
            },
            Pending: {
                bg: 'bg-yellow-100',
                text: 'text-yellow-800',
                label: 'Chờ xử lý',
            },
            Confirmed: {
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                label: 'Đã xác nhận',
            },
            Shipped: {
                bg: 'bg-green-100',
                text: 'text-green-800',
                label: 'Đang giao',
            },
            Delivered: {
                bg: 'bg-indigo-100',
                text: 'text-indigo-800',
                label: 'Đã giao',
            },
            Cancelled: {
                bg: 'bg-red-100',
                text: 'text-red-800',
                label: 'Đã hủy',
            },
        };

        const config = statusConfig[status];

        return (
            <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
            >
                {config.label}
            </span>
        );
    };

    const filteredOrders = orders.filter((order) => {
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                order.orderCode.toLowerCase().includes(search) ||
                order.customer.name.toLowerCase().includes(search) ||
                order.customer.email.toLowerCase().includes(search)
            );
        }
        return true;
    });

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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
                    <p className="text-sm text-gray-500 mt-1">Theo dõi và quản lý tất cả đơn hàng</p>
                </div>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Package className="w-4 h-4 mr-2" />
                    Tạo đơn hàng
                </button>
            </div>

            {/* Filters - Refactored with Flexbox */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                {/* Active Filters Display */}
                {(startDate || endDate || statusFilter || searchTerm) && (
                    <div className="mb-4 flex items-center justify-between pb-4 border-b border-gray-200">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-gray-600">Đang lọc:</span>
                            {startDate && (
                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                    Từ {new Date(startDate).toLocaleDateString('vi-VN')}
                                </span>
                            )}
                            {endDate && (
                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                    Đến {new Date(endDate).toLocaleDateString('vi-VN')}
                                </span>
                            )}
                            {statusFilter && (
                                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                    {STATUS_MAP[statusFilter]}
                                </span>
                            )}
                            {searchTerm && (
                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                    "{searchTerm}"
                                </span>
                            )}
                        </div>
                        <button
                            onClick={clearFilters}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa tất cả bộ lọc"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Xóa lọc
                        </button>
                    </div>
                )}

                {/* Filter Controls - Using Flexbox with items-end */}
                <div className="flex flex-wrap items-end gap-4">
                    {/* Search - Flex 1 to take remaining space */}
                    <div className="flex-1 min-w-[250px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tìm kiếm</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Mã đơn, tên khách hàng, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            />
                        </div>
                    </div>

                    {/* Start Date */}
                    <div className="w-full sm:w-auto min-w-[160px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Từ ngày</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                max={endDate || undefined}
                                className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            />
                        </div>
                    </div>

                    {/* End Date */}
                    <div className="w-full sm:w-auto min-w-[160px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Đến ngày</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate || undefined}
                                className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="w-full sm:w-auto min-w-[180px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Trạng thái</label>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full h-10 pl-9 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-colors cursor-pointer"
                            >
                                <option value="">Tất cả</option>
                                {Object.entries(STATUS_MAP).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Limit Per Page */}
                    <div className="w-full sm:w-auto min-w-[140px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Hiển thị</label>
                        <select
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            className="w-full h-10 px-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-colors cursor-pointer"
                        >
                            <option value={10}>10 / trang</option>
                            <option value={25}>25 / trang</option>
                            <option value={50}>50 / trang</option>
                            <option value={100}>100 / trang</option>
                        </select>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">{error}</p>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                            <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
                        </div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg
                                className="w-10 h-10 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Không tìm thấy đơn hàng nào
                        </h3>
                        <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
                            {(startDate || endDate || statusFilter || searchTerm) ? (
                                'Không có đơn hàng phù hợp với bộ lọc hiện tại. Thử thay đổi bộ lọc hoặc ngày tháng.'
                            ) : (
                                'Chưa có đơn hàng nào trong hệ thống. Hãy tầo đơn hàng đầu tiên.'
                            )}
                        </p>
                        <div className="flex gap-3">
                            {(startDate || endDate || statusFilter || searchTerm) && (
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Xóa bộ lọc
                                </button>
                            )}
                            <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                                <Package className="w-4 h-4 mr-2" />
                                Tạo đơn hàng
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mã đơn hàng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Khách hàng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tổng tiền
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ngày đặt
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-blue-600">
                                                    #{order.orderCode}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {order.customer.name}
                                                </div>
                                                <div className="text-sm text-gray-500">{order.customer.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {formatCurrency(order.totalPrice)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) =>
                                                        handleStatusChange(order._id, e.target.value as Order['status'])
                                                    }
                                                    className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="Draft">Nháp</option>
                                                    <option value="Pending">Chờ xử lý</option>
                                                    <option value="Confirmed">Đã xác nhận</option>
                                                    <option value="Shipped">Đang giao</option>
                                                    <option value="Delivered">Đã giao</option>
                                                    <option value="Cancelled">Đã hủy</option>
                                                </select>
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
