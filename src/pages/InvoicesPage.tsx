import { useEffect, useState } from 'react';
import { FileText, Search, Plus, Eye, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { invoiceService, Invoice } from '../services/invoiceService';

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [limit, setLimit] = useState(10);

    useEffect(() => {
        fetchInvoices();
    }, [currentPage, statusFilter, limit]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);

            const params: any = {
                page: currentPage,
                limit,
            };

            if (statusFilter) {
                params.status = statusFilter;
            }

            const response = await invoiceService.getInvoices(params);

            if (response.success) {
                setInvoices(response.data);
                setTotalPages(response.pagination.pages);
            }
        } catch (err: any) {
            console.error('Error fetching invoices:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async (id: string) => {
        if (!confirm('Xác nhận đánh dấu hóa đơn đã thanh toán?')) {
            return;
        }

        try {
            await invoiceService.markAsPaid(id);
            fetchInvoices();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Không thể cập nhật trạng thái');
        }
    };

    const handleCancelInvoice = async (id: string) => {
        if (!confirm('Bạn có chắc muốn hủy hóa đơn này?')) {
            return;
        }

        try {
            await invoiceService.cancelInvoice(id);
            fetchInvoices();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Không thể hủy hóa đơn');
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

    const getStatusBadge = (status: Invoice['status']) => {
        const statusConfig = {
            Paid: {
                bg: 'bg-green-100',
                text: 'text-green-700',
                label: 'Đã thanh toán',
                icon: <CheckCircle className="w-4 h-4 mr-1" />,
            },
            Unpaid: {
                bg: 'bg-amber-100',
                text: 'text-amber-700',
                label: 'Chưa thanh toán',
                icon: null,
            },
            Overdue: {
                bg: 'bg-red-100',
                text: 'text-red-700',
                label: 'Quá hạn',
                icon: <XCircle className="w-4 h-4 mr-1" />,
            },
            Cancelled: {
                bg: 'bg-gray-100',
                text: 'text-gray-700',
                label: 'Đã hủy',
                icon: null,
            },
        };

        const config = statusConfig[status];

        return (
            <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
            >
                {config.icon}
                {config.label}
            </span>
        );
    };

    const filteredInvoices = invoices.filter((invoice) => {
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                invoice.invoiceNumber.toLowerCase().includes(search) ||
                invoice.user.fullName.toLowerCase().includes(search)
            );
        }
        return true;
    });

    return (
        <div className="space-y-6">
            {/* Header & Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quản lý Hóa đơn</h1>
                        <p className="text-sm text-gray-500 mt-1">Theo dõi và quản lý hóa đơn thanh toán</p>
                    </div>
                    <button className="inline-flex items-center px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                        <Plus className="w-5 h-5 mr-2" />
                        Tạo hóa đơn
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo mã hóa đơn, khách hàng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="Unpaid">Chưa thanh toán</option>
                            <option value="Paid">Đã thanh toán</option>
                            <option value="Overdue">Quá hạn</option>
                            <option value="Cancelled">Đã hủy</option>
                        </select>
                    </div>

                    {/* Limit */}
                    <div>
                        <select
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value={10}>10 / trang</option>
                            <option value={25}>25 / trang</option>
                            <option value={50}>50 / trang</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredInvoices.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy hóa đơn</h3>
                        <p className="mt-1 text-sm text-gray-500">Thử thay đổi bộ lọc hoặc tạo hóa đơn mới.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mã hóa đơn
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Khách hàng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ngày xuất
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hạn nộp
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
                                    {filteredInvoices.map((invoice) => (
                                        <tr key={invoice._id} className="hover:bg-gray-50 transition-colors">
                                            {/* Mã hóa đơn */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-blue-600">
                                                    #{invoice.invoiceNumber}
                                                </div>
                                                <div className="text-xs text-gray-500">{invoice.order.orderCode}</div>
                                            </td>

                                            {/* Khách hàng */}
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {invoice.user.fullName}
                                                </div>
                                                <div className="text-sm text-gray-500">{invoice.user.email}</div>
                                            </td>

                                            {/* Ngày xuất */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{formatDate(invoice.issueDate)}</div>
                                            </td>

                                            {/* Hạn nộp */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{formatDate(invoice.dueDate)}</div>
                                            </td>

                                            {/* Tổng tiền */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {formatCurrency(invoice.totalAmount)}
                                                </div>
                                            </td>

                                            {/* Trạng thái */}
                                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(invoice.status)}</td>

                                            {/* Hành động */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    className="text-blue-600 hover:text-blue-900 mr-3 inline-flex items-center"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {invoice.status === 'Unpaid' && (
                                                    <button
                                                        onClick={() => handleMarkAsPaid(invoice._id)}
                                                        className="text-green-600 hover:text-green-900 mr-3 inline-flex items-center"
                                                        title="Đánh dấu đã thanh toán"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {(invoice.status === 'Unpaid' || invoice.status === 'Overdue') && (
                                                    <button
                                                        onClick={() => handleCancelInvoice(invoice._id)}
                                                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                                                        title="Hủy hóa đơn"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                )}
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
