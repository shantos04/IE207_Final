import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle, XCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface Order {
    _id: string;
    orderNumber: string;
    orderItems: Array<{
        product: {
            _id: string;
            name: string;
            productCode: string;
            imageUrl?: string;
            price: number;
        };
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
}

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, processing, shipped, delivered, cancelled

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            // TODO: Call API to get user's orders
            // const response = await orderService.getMyOrders();
            // setOrders(response.data);

            // Mock data for now
            setOrders([]);
            setIsLoading(false);
        } catch (error) {
            toast.error('Không thể tải danh sách đơn hàng');
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'processing':
                return <Package className="w-5 h-5 text-blue-500" />;
            case 'shipped':
                return <Truck className="w-5 h-5 text-purple-500" />;
            case 'delivered':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'cancelled':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Package className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'Chờ xác nhận';
            case 'processing':
                return 'Đang xử lý';
            case 'shipped':
                return 'Đang giao';
            case 'delivered':
                return 'Đã giao';
            case 'cancelled':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'processing':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'shipped':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'delivered':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'cancelled':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải đơn hàng...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Đơn mua</h1>
                <p className="text-gray-600 mt-1">
                    Quản lý và theo dõi tất cả đơn hàng của bạn
                </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex overflow-x-auto border-b border-gray-200 mb-6 space-x-1 pb-1">
                {[
                    { value: 'all', label: 'Tất cả' },
                    { value: 'pending', label: 'Chờ xác nhận' },
                    { value: 'processing', label: 'Đang xử lý' },
                    { value: 'shipped', label: 'Đang giao' },
                    { value: 'delivered', label: 'Đã giao' },
                    { value: 'cancelled', label: 'Đã hủy' },
                ].map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        className={`
                            px-4 py-2 rounded-t-lg font-medium transition whitespace-nowrap
                            ${filter === tab.value
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }
                        `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {orders.length === 0 ? (
                <div className="text-center py-20">
                    <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Chưa có đơn hàng nào
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Bạn chưa có đơn hàng nào. Hãy khám phá các sản phẩm của chúng tôi!
                    </p>
                    <Link
                        to="/shop"
                        className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        Mua sắm ngay
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className="border border-gray-200 rounded-lg hover:shadow-md transition"
                        >
                            {/* Order Header */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-6">
                                        <div>
                                            <span className="text-sm text-gray-600">Mã đơn hàng:</span>
                                            <p className="font-semibold text-gray-900">
                                                {order.orderNumber}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Ngày đặt:</span>
                                            <p className="font-semibold text-gray-900">
                                                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className={`
                                            flex items-center space-x-2 px-4 py-2 rounded-lg border font-medium
                                            ${getStatusColor(order.status)}
                                        `}
                                    >
                                        {getStatusIcon(order.status)}
                                        <span>{getStatusText(order.status)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-6">
                                <div className="space-y-4">
                                    {order.orderItems.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center space-x-4 pb-4 border-b border-gray-100 last:border-0"
                                        >
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                {item.product.imageUrl ? (
                                                    <img
                                                        src={item.product.imageUrl}
                                                        alt={item.product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <Link
                                                    to={`/product/${item.product._id}`}
                                                    className="font-semibold text-gray-900 hover:text-blue-600 transition"
                                                >
                                                    {item.product.name}
                                                </Link>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Mã SP: {item.product.productCode}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Số lượng: x{item.quantity}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg text-gray-900">
                                                    {new Intl.NumberFormat('vi-VN', {
                                                        style: 'currency',
                                                        currency: 'VND',
                                                    }).format(item.price * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Footer */}
                                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                                    <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
                                        <Eye className="w-5 h-5" />
                                        <span>Xem chi tiết</span>
                                    </button>
                                    <div className="text-right">
                                        <span className="text-sm text-gray-600">Tổng tiền:</span>
                                        <p className="text-2xl font-bold text-red-600">
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                            }).format(order.totalAmount)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
