import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle, XCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderService, Order as ServiceOrder } from '../../../services/orderService';

// Extend the service Order type for display purposes
interface Order extends Omit<ServiceOrder, 'orderItems'> {
    orderNumber?: string; // Optional for backward compatibility
    orderItems: Array<{
        product: any; // Can be string (ID) or populated object
        productName?: string;
        productCode?: string;
        quantity: number;
        price: number;
    }>;
}

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, processing, shipped, delivered, cancelled

    useEffect(() => {
        fetchOrders();
    }, []);

    // Filter orders based on selected filter
    const filteredOrders = orders.filter((order) => {
        if (filter === 'all') return true;
        return order.status.toLowerCase() === filter.toLowerCase();
    });

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            console.log('🔍 Fetching orders for user...');
            console.log('📦 Token:', localStorage.getItem('accessToken')?.substring(0, 20) + '...');

            const response = await orderService.getMyOrders();
            console.log('✅ Orders fetched:', response);

            if (response.success && response.data) {
                setOrders(response.data);
                // Silent load - no toast notification needed for data fetching
            } else {
                setOrders([]);
            }
        } catch (error: any) {
            console.error('❌ Error fetching orders:', error);
            console.error('Error response:', error.response?.data);
            toast.error(error.response?.data?.message || 'Không thể tải danh sách đơn hàng');
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelOrder = async (orderId: string, orderCode: string) => {
        const confirmed = window.confirm(
            `Bạn có chắc chắn muốn hủy đơn hàng ${orderCode}?\n\nHành động này không thể hoàn tác.`
        );

        if (!confirmed) return;

        try {
            const response = await orderService.cancelOrder(orderId);
            if (response.success) {
                toast.success('Đã hủy đơn hàng thành công');
                // Refresh orders
                fetchOrders();
            }
        } catch (error: any) {
            console.error('❌ Error canceling order:', error);
            toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng');
        }
    };

    const handleConfirmReceived = async (orderId: string, orderCode: string) => {
        const confirmed = window.confirm(
            `Xác nhận bạn đã nhận được hàng cho đơn ${orderCode}?\n\nSau khi xác nhận, đơn hàng sẽ được đánh dấu là đã giao.`
        );

        if (!confirmed) return;

        try {
            const response = await orderService.confirmReceived(orderId);
            if (response.success) {
                toast.success('🎉 Đã xác nhận nhận hàng thành công!', {
                    duration: 4000,
                    icon: '✅',
                });
                // Refresh orders
                fetchOrders();
            }
        } catch (error: any) {
            console.error('❌ Error confirming received:', error);
            toast.error(error.response?.data?.message || 'Không thể xác nhận đơn hàng');
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
            {filteredOrders.length === 0 ? (
                <div className="text-center py-20">
                    <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {filter === 'all' ? 'Chưa có đơn hàng nào' : `Không có đơn hàng ${getStatusText(filter).toLowerCase()}`}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {filter === 'all'
                            ? 'Bạn chưa có đơn hàng nào. Hãy khám phá các sản phẩm của chúng tôi!'
                            : 'Thử chọn bộ lọc khác hoặc khám phá sản phẩm mới!'
                        }
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
                    {filteredOrders.map((order) => (
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
                                                {order.orderCode || order.orderNumber}
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
                                    {order.orderItems.map((item, index) => {
                                        // Handle both populated and non-populated product
                                        const productName = item.product?.name || item.productName || 'Sản phẩm';
                                        const productCode = item.product?.productCode || item.productCode || 'N/A';
                                        const productId = item.product?._id || item.product;
                                        const imageUrl = item.product?.imageUrl;

                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center space-x-4 pb-4 border-b border-gray-100 last:border-0"
                                            >
                                                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                    {imageUrl ? (
                                                        <img
                                                            src={imageUrl}
                                                            alt={productName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="w-8 h-8 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    {productId && typeof productId === 'string' ? (
                                                        <Link
                                                            to={`/product/${productId}`}
                                                            className="font-semibold text-gray-900 hover:text-blue-600 transition"
                                                        >
                                                            {productName}
                                                        </Link>
                                                    ) : (
                                                        <p className="font-semibold text-gray-900">{productName}</p>
                                                    )}
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Mã SP: {productCode}
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
                                        );
                                    })}
                                </div>

                                {/* Order Footer */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    {/* Total Amount */}
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm text-gray-600">Tổng tiền:</span>
                                        <p className="text-2xl font-bold text-red-600">
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                            }).format(order.totalPrice || order.totalAmount)}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row justify-end gap-3">
                                        {/* Cancel Button - Only for Pending/Confirmed */}
                                        {['Pending', 'Confirmed'].includes(order.status) && (
                                            <button
                                                onClick={() => handleCancelOrder(order._id, order.orderCode)}
                                                className="px-6 py-2.5 rounded-lg border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all font-medium flex items-center justify-center gap-2"
                                            >
                                                <XCircle className="w-5 h-5" />
                                                Hủy đơn hàng
                                            </button>
                                        )}

                                        {/* Confirm Received Button - Only for Shipped */}
                                        {order.status === 'Shipped' && (
                                            <button
                                                onClick={() => handleConfirmReceived(order._id, order.orderCode)}
                                                className="px-6 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200 transition-all font-medium flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                                Đã nhận được hàng
                                            </button>
                                        )}

                                        {/* View Detail Button - Always visible */}
                                        <button className="px-6 py-2.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2">
                                            <Eye className="w-5 h-5" />
                                            <span>Xem chi tiết</span>
                                        </button>
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
