import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, MapPin, User, DollarSign, Package, ShoppingCart, Truck } from 'lucide-react';
import { invoiceService, Invoice } from '../services/invoiceService';

export default function InvoiceDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadInvoiceDetail();
    }, [id]);

    const loadInvoiceDetail = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const response = await invoiceService.getInvoiceDetail(id);
            console.log('📄 Invoice Detail:', response.data);
            setInvoice(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Không thể tải thông tin hóa đơn');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const statusLower = status?.toLowerCase() || '';
        switch (statusLower) {
            case 'paid':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'unpaid':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'overdue':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        const statusLower = status?.toLowerCase() || '';
        switch (statusLower) {
            case 'paid':
                return '✅ Đã thanh toán';
            case 'unpaid':
                return '⏳ Chờ thanh toán';
            case 'cancelled':
                return '❌ Đã hủy';
            case 'overdue':
                return '⚠️ Quá hạn';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center text-red-600">
                    {error || 'Không tìm thấy hóa đơn'}
                </div>
                <div className="mt-4 text-center">
                    <button
                        onClick={() => navigate('/admin/invoices')}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        ← Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    // Get customer info from shipping address or order customer
    const customerInfo = invoice.order?.shippingAddress || invoice.order?.customer;
    const orderItems = invoice.order?.orderItems || [];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header with Back Button and Status */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/admin/invoices')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <div>
                            <div className="flex items-center space-x-3">
                                <FileText className="w-8 h-8 text-blue-600" />
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {invoice.invoiceNumber}
                                    </h1>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Ngày tạo: {new Date(invoice.issueDate).toLocaleDateString('vi-VN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <span className={`px-6 py-3 rounded-xl text-base font-semibold border-2 ${getStatusColor(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                    </span>
                </div>
            </div>

            {/* Section B: Info Grid (2 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Customer/Shipping Info */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
                        <MapPin className="w-6 h-6 mr-2 text-blue-600" />
                        Thông tin giao hàng
                    </h2>
                    {customerInfo ? (
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <User className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Người nhận</p>
                                    <p className="font-semibold text-gray-900">
                                        {customerInfo.fullName || customerInfo.name || invoice.user?.fullName || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Package className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Số điện thoại</p>
                                    <p className="font-medium text-gray-900">
                                        {customerInfo.phone || 'Không có thông tin'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <DollarSign className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium text-gray-900">
                                        {customerInfo.email || invoice.user?.email || 'Không có thông tin'}
                                    </p>
                                </div>
                            </div>
                            {customerInfo.address && (
                                <div className="flex items-start">
                                    <MapPin className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Địa chỉ</p>
                                        <p className="font-medium text-gray-900">
                                            {customerInfo.address}
                                            {customerInfo.ward && `, ${customerInfo.ward}`}
                                            {customerInfo.district && `, ${customerInfo.district}`}
                                            {customerInfo.city && `, ${customerInfo.city}`}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">Không có thông tin giao hàng</p>
                    )}
                </div>

                {/* Right: Order Info */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
                        <ShoppingCart className="w-6 h-6 mr-2 text-blue-600" />
                        Thông tin đơn hàng
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-start">
                            <Package className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-500">Mã đơn hàng</p>
                                <button
                                    onClick={() => navigate(`/admin/orders/${invoice.order._id}`)}
                                    className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    {invoice.order.orderCode}
                                </button>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <DollarSign className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                                <p className="font-medium text-gray-900">
                                    {invoice.paymentMethod || invoice.order?.paymentMethod || 'COD'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Truck className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500">Trạng thái giao hàng</p>
                                <p className="font-medium text-gray-900 capitalize">
                                    {invoice.order.status === 'Delivered' ? '✅ Đã giao hàng' :
                                        invoice.order.status === 'Shipped' ? '🚚 Đang giao' :
                                            invoice.order.status === 'Confirmed' ? '✔️ Đã xác nhận' :
                                                invoice.order.status === 'Pending' ? '⏳ Chờ xử lý' :
                                                    invoice.order.status}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <FileText className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500">Hạn thanh toán</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(invoice.dueDate).toLocaleDateString('vi-VN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section C: Product Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold flex items-center text-gray-900">
                        <Package className="w-6 h-6 mr-2 text-blue-600" />
                        Danh sách sản phẩm
                    </h2>
                </div>

                {orderItems && orderItems.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Sản phẩm
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Đơn giá
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Số lượng
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Thành tiền
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {orderItems.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-4">
                                                {item.product?.imageUrl && (
                                                    <img
                                                        src={item.product.imageUrl}
                                                        alt={item.productName}
                                                        className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                                        onError={(e) => {
                                                            e.currentTarget.src = 'https://via.placeholder.com/48?text=No+Image';
                                                        }}
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {item.productName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Mã: {item.productCode}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm text-gray-900">
                                            {(item.price || 0).toLocaleString('vi-VN')} ₫
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                                {item.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                                            {(item.subtotal || item.price * item.quantity).toLocaleString('vi-VN')} ₫
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            {/* Grand Total Footer */}
                            <tfoot className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-blue-200">
                                <tr>
                                    <td colSpan={4} className="px-6 py-5 text-right">
                                        <span className="text-lg font-bold text-gray-900">
                                            TỔNG CỘNG:
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className="text-2xl font-bold text-blue-600">
                                            {(invoice.totalAmount || 0).toLocaleString('vi-VN')} ₫
                                        </span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">Không có sản phẩm nào trong hóa đơn này</p>
                    </div>
                )}
            </div>

            {/* Notes Section */}
            {invoice.notes && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-3 text-gray-900">📝 Ghi chú</h2>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                        {invoice.notes}
                    </p>
                </div>
            )}

            {/* Payment Info if Paid */}
            {invoice.status.toLowerCase() === 'paid' && invoice.paidAt && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-2xl">✓</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-green-900">Đã thanh toán</h3>
                            <p className="text-sm text-green-700">
                                Thanh toán vào ngày {new Date(invoice.paidAt).toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
