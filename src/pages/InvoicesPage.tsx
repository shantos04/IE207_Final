import { useEffect, useState } from 'react';
import { FileText, Search, Plus, Eye, CheckCircle, XCircle, ChevronLeft, ChevronRight, Calendar, Filter } from 'lucide-react';
import { invoiceService, Invoice } from '../services/invoiceService';

// Status mapping for Vietnamese translation
const STATUS_MAP: Record<string, string> = {
    'Paid': 'Đã thanh toán',
    'Unpaid': 'Chưa thanh toán',
    'Overdue': 'Quá hạn',
    'Cancelled': 'Đã hủy'
};

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [limit, setLimit] = useState(10);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    useEffect(() => {
        fetchInvoices();
    }, [currentPage, statusFilter, limit, startDate, endDate]);

    // Reset to page 1 when filters change
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [statusFilter, startDate, endDate]);

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

            if (startDate) {
                params.startDate = startDate;
            }

            if (endDate) {
                params.endDate = endDate;
            }

            console.log('\ud83d\udd0d Fetching invoices with params:', params);

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
                (invoice.user?.fullName || '').toLowerCase().includes(search)
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

                {/* Filter Controls - Flexbox Layout */}
                <div className="flex flex-wrap items-end gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-[250px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tìm kiếm</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Mã hóa đơn, tên khách hàng..."
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

                    {/* Limit */}
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
                        </select>
                    </div>
                </div>
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
                ) : filteredInvoices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <FileText className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Không tìm thấy hóa đơn nào
                        </h3>
                        <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
                            {(startDate || endDate || statusFilter || searchTerm) ? (
                                'Không có hóa đơn phù hợp với bộ lọc hiện tại. Thử thay đổi bộ lọc hoặc ngày tháng.'
                            ) : (
                                'Chưa có hóa đơn nào trong hệ thống. Hãy tạo hóa đơn đầu tiên.'
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
                                <Plus className="w-4 h-4 mr-2" />
                                Tạo hóa đơn
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
                                                    {invoice.user?.fullName || 'N/A'}
                                                </div>
                                                <div className="text-sm text-gray-500">{invoice.user?.email || 'N/A'}</div>
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
        </div >
    );
}
