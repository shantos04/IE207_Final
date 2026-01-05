import { useEffect, useState } from 'react';
import { Package, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { orderService, Order } from '../services/orderService';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [limit, setLimit] = useState(10);

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
    }, [currentPage, statusFilter, limit]);

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

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo mã đơn, tên khách hàng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="Draft">Draft</option>
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {/* Limit */}
                    <div>
                        <select
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value={10}>10 đơn/trang</option>
                            <option value={25}>25 đơn/trang</option>
                            <option value={50}>50 đơn/trang</option>
                            <option value={100}>100 đơn/trang</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">{error}</p>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy đơn hàng</h3>
                        <p className="mt-1 text-sm text-gray-500">Thử thay đổi bộ lọc hoặc tạo đơn hàng mới.</p>
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
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
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
