import { Order } from '../../types';
import clsx from 'clsx';

interface RecentOrdersTableProps {
    orders: Order[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
    draft: { label: 'Nháp', color: 'bg-gray-100 text-gray-800' },
    pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
    processing: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
    shipped: { label: 'Đang giao', color: 'bg-green-100 text-green-800' },
    delivered: { label: 'Đã giao', color: 'bg-indigo-100 text-indigo-800' },
    cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
};

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Đơn hàng gần đây</h3>
                        <p className="text-sm text-gray-500 mt-1">{orders.length} đơn hàng mới</p>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors">
                        Xem tất cả
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
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
                                Trạng thái
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tổng tiền
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{order.orderCode}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                                        {order.customer.email && (
                                            <div className="text-sm text-gray-500">{order.customer.email}</div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={clsx(
                                            'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                                            statusConfig[order.status.toLowerCase()]?.color || 'bg-gray-100 text-gray-800'
                                        )}
                                    >
                                        {statusConfig[order.status.toLowerCase()]?.label || order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {formatCurrency(order.totalAmount)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
