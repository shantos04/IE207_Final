import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, User, DollarSign, Package } from 'lucide-react';
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
            setInvoice(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Không thể tải thông tin hóa đơn');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'overdue':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'paid':
                return 'Đã thanh toán';
            case 'pending':
                return 'Chờ thanh toán';
            case 'cancelled':
                return 'Đã hủy';
            case 'overdue':
                return 'Quá hạn';
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/admin/invoices')}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Chi tiết hóa đơn</h1>
                        <p className="text-gray-600">Mã hóa đơn: {invoice.invoiceNumber}</p>
                    </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                    {getStatusText(invoice.status)}
                </span>
            </div>

            {/* Invoice Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Thông tin chung */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Thông tin chung
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Mã hóa đơn:</span>
                            <span className="font-medium">{invoice.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Ngày tạo:</span>
                            <span className="font-medium">
                                {new Date(invoice.issueDate).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Hạn thanh toán:</span>
                            <span className="font-medium">
                                {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Tổng tiền:</span>
                            <span className="font-semibold text-lg text-blue-600">
                                {invoice.totalAmount?.toLocaleString('vi-VN') || '0'} VNĐ
                            </span>
                        </div>
                    </div>
                </div>

                {/* Thông tin khách hàng */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Thông tin khách hàng
                    </h2>
                    {invoice.customer ? (
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tên:</span>
                                <span className="font-medium">{invoice.customer.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Email:</span>
                                <span className="font-medium">{invoice.customer.email}</span>
                            </div>
                            {invoice.customer.phone && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Số điện thoại:</span>
                                    <span className="font-medium">{invoice.customer.phone}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500">Không có thông tin khách hàng</p>
                    )}
                </div>
            </div>

            {/* Đơn hàng liên quan */}
            {invoice.order && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                        <Package className="w-5 h-5 mr-2" />
                        Đơn hàng liên quan
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Mã đơn hàng:</span>
                            <span className="font-medium">{invoice.order.orderNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Trạng thái:</span>
                            <span className="font-medium capitalize">{invoice.order.status}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Ghi chú */}
            {invoice.notes && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Ghi chú</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
            )}
        </div>
    );
}
