import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, MapPin, Calendar, CreditCard, Truck, FileText } from 'lucide-react';
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
        'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'Confirmed': 'bg-blue-100 text-blue-700 border-blue-200',
        'Shipped': 'bg-purple-100 text-purple-700 border-purple-200',
        'Delivered': 'bg-green-100 text-green-700 border-green-200',
        'Cancelled': 'bg-red-100 text-red-700 border-red-200'
    };
    return styles[status] || styles['Pending'];
};

const getStatusIcon = (status: Order['status']) => {
    const icons: Record<Order['status'], JSX.Element> = {
        'Pending': <FileText className="w-5 h-5" />,
        'Confirmed': <Package className="w-5 h-5" />,
        'Shipped': <Truck className="w-5 h-5" />,
        'Delivered': <Package className="w-5 h-5" />,
        'Cancelled': <FileText className="w-5 h-5" />
    };
    return icons[status] || icons['Pending'];
};

export default function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchOrderDetail(id);
        }
    }, [id]);

    const fetchOrderDetail = async (orderId: string) => {
        try {
            setLoading(true);
            const response = await orderService.getOrder(orderId);
            if (response.success) {
                setOrder(response.data);
            }
        } catch (error: any) {
            console.error('Lỗi khi tải chi tiết đơn hàng:', error);
            toast.error('Không thể tải thông tin đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
                    <p className="text-gray-500 mb-6">Đơn hàng không tồn tại hoặc đã bị xóa</p>
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
                        <p className="text-sm text-gray-500 mt-1">Mã đơn hàng: {order.orderCode}</p>
                    </div>
                </div>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusBadge(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {STATUS_MAP[order.status]}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Sản phẩm đã đặt</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {order.orderItems && order.orderItems.length > 0 ? (
                                order.orderItems.map((item, index) => (
                                    <div key={index} className="px-6 py-4 flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                            {item.product?.imageUrl ? (
                                                <img
                                                    src={item.product.imageUrl}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{item.product?.name || 'Sản phẩm'}</h3>
                                            <p className="text-sm text-gray-500">SKU: {item.product?.productCode}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">x{item.quantity}</p>
                                            <p className="font-semibold text-gray-900">{formatCurrency(item.price)}</p>
                                        </div>
                                        <div className="text-right min-w-[120px]">
                                            <p className="text-sm text-gray-500">Thành tiền</p>
                                            <p className="font-bold text-blue-600">{formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-6 py-8 text-center text-gray-500">
                                    Không có sản phẩm trong đơn hàng
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">Địa chỉ giao hàng</h2>
                        </div>
                        <div className="space-y-2 text-sm">
                            <p className="text-gray-900 font-medium">{order.shippingAddress.fullName}</p>
                            <p className="text-gray-600">{order.shippingAddress.phone}</p>
                            <p className="text-gray-600">
                                {order.shippingAddress.address}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column - Summary */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <User className="w-5 h-5 text-purple-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">Thông tin khách hàng</h2>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div>
                                <p className="text-gray-500">Tên khách hàng</p>
                                <p className="text-gray-900 font-medium">{order.customer.name}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Email</p>
                                <p className="text-gray-900">{order.customer.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-green-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">Tổng quan đơn hàng</h2>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tạm tính</span>
                                <span className="text-gray-900 font-medium">{formatCurrency(order.totalPrice || order.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Phí vận chuyển</span>
                                <span className="text-gray-900 font-medium">{formatCurrency(order.shippingFee || 0)}</span>
                            </div>
                            {order.discount && order.discount > 0 && (
                                <div className="flex justify-between text-red-600">
                                    <span>Giảm giá</span>
                                    <span className="font-medium">-{formatCurrency(order.discount)}</span>
                                </div>
                            )}
                            <div className="pt-3 border-t border-gray-200 flex justify-between">
                                <span className="text-gray-900 font-semibold">Tổng cộng</span>
                                <span className="text-blue-600 font-bold text-lg">
                                    {formatCurrency(order.totalPrice || order.totalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Order Timeline */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-orange-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">Thời gian</h2>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div>
                                <p className="text-gray-500">Ngày tạo</p>
                                <p className="text-gray-900 font-medium">
                                    {new Date(order.createdAt).toLocaleString('vi-VN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">Cập nhật lần cuối</p>
                                <p className="text-gray-900 font-medium">
                                    {new Date(order.updatedAt).toLocaleString('vi-VN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            {order.paymentMethod && (
                                <div>
                                    <p className="text-gray-500">Phương thức thanh toán</p>
                                    <p className="text-gray-900 font-medium">
                                        {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : order.paymentMethod}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
