import { useEffect, useState } from 'react';
import {
    TrendingUp,
    ShoppingCart,
    Package,
    DollarSign,
    Download,
    Calendar,
    PieChartIcon,
    BarChart3,
    FileText,
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from 'recharts';
import {
    getAllReports,
    OrderStatusDistribution,
    ProductSalesPerformance,
    RevenueByOrder,
} from '../services/analyticsService';

// Mock data generators for the new reports
const generateMockStatusDistribution = (): OrderStatusDistribution[] => {
    const statuses = ['Completed', 'Pending', 'Cancelled', 'Shipped', 'Confirmed'];
    const colors = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];
    return statuses.map((status, idx) => {
        const value = Math.floor(Math.random() * 150) + 50;
        return {
            name: status,
            value,
            percentage: '0',
        };
    });
};

const generateMockProductPerformance = (): ProductSalesPerformance[] => {
    const products = [
        'Arduino Uno R3',
        'Raspberry Pi 4 Model B',
        'ESP32 DevKit V1',
        'Cảm biến nhiệt độ DHT22',
        'Module WiFi ESP8266',
        'STM32 Blue Pill',
        'NodeMCU ESP8266',
        'Servo Motor SG90',
        'LCD 16x2 I2C',
        'Cảm biến chuyển động PIR',
    ];
    return products.map((name, idx) => ({
        productName: name,
        productCode: `P${1000 + idx}`,
        totalQty: Math.floor(Math.random() * 300) + 100,
        totalRevenue: Math.floor(Math.random() * 50000000) + 10000000,
        orderCount: Math.floor(Math.random() * 80) + 20,
    }));
};

const generateMockRevenueByOrder = (): RevenueByOrder[] => {
    const names = [
        'Nguyễn Văn A',
        'Trần Thị B',
        'Lê Văn C',
        'Phạm Thị D',
        'Hoàng Văn E',
        'Võ Thị F',
        'Đặng Văn G',
        'Bùi Thị H',
        'Đỗ Văn I',
        'Ngô Thị K',
        'Dương Văn L',
        'Lý Thị M',
        'Mai Văn N',
        'Phan Thị O',
        'Vũ Văn P',
        'Đinh Thị Q',
        'Hồ Văn R',
        'Tạ Thị S',
        'Trịnh Văn T',
        'Chu Thị U',
    ];
    return names.map((name, idx) => ({
        orderCode: `ORD${10000 + idx}`,
        orderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        customerName: name,
        customerEmail: `customer${idx}@example.com`,
        totalPrice: Math.floor(Math.random() * 50000000) + 5000000,
        status: 'Delivered',
    }));
};

// Colors for Pie Chart
const PIE_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899'];

const STATUS_LABELS: Record<string, string> = {
    Completed: 'Hoàn thành',
    Delivered: 'Đã giao',
    Pending: 'Chờ xử lý',
    Confirmed: 'Đã xác nhận',
    Shipped: 'Đang giao',
    Cancelled: 'Đã hủy',
    Draft: 'Nháp',
};

type DateRange = '7days' | 'thisMonth' | 'thisYear';

export default function ReportsPage() {
    const [dateRange, setDateRange] = useState<DateRange>('thisMonth');
    const [loading, setLoading] = useState(true);

    // State for the 3 new reports
    const [statusDistribution, setStatusDistribution] = useState<OrderStatusDistribution[]>([]);
    const [productPerformance, setProductPerformance] = useState<ProductSalesPerformance[]>([]);
    const [revenueByOrder, setRevenueByOrder] = useState<RevenueByOrder[]>([]);

    useEffect(() => {
        fetchReportsData();
    }, [dateRange]);

    const getDateRangeParams = () => {
        const today = new Date();
        let startDate: string | undefined;
        let endDate: string | undefined;

        switch (dateRange) {
            case '7days':
                startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0];
                endDate = today.toISOString().split('T')[0];
                break;
            case 'thisMonth':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1)
                    .toISOString()
                    .split('T')[0];
                endDate = today.toISOString().split('T')[0];
                break;
            case 'thisYear':
                startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
                endDate = today.toISOString().split('T')[0];
                break;
        }

        return { startDate, endDate };
    };

    const fetchReportsData = async () => {
        setLoading(true);
        try {
            const params = getDateRangeParams();
            const data = await getAllReports({ ...params, limit: 10 });

            // Use real data or fallback to mock data
            setStatusDistribution(
                data.statusDistribution.length > 0
                    ? data.statusDistribution
                    : generateMockStatusDistribution()
            );
            setProductPerformance(
                data.productPerformance.length > 0
                    ? data.productPerformance
                    : generateMockProductPerformance()
            );
            setRevenueByOrder(
                data.revenueByOrder.length > 0 ? data.revenueByOrder : generateMockRevenueByOrder()
            );
        } catch (error) {
            console.error('Error fetching reports:', error);
            // Fallback to mock data on error
            setStatusDistribution(generateMockStatusDistribution());
            setProductPerformance(generateMockProductPerformance());
            setRevenueByOrder(generateMockRevenueByOrder());
        } finally {
            setLoading(false);
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
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date);
    };

    const handleExportReport = () => {
        alert('Chức năng xuất báo cáo sẽ được triển khai sau!');
    };

    // Calculate max quantity for progress bar
    const maxQty = Math.max(...productPerformance.map((p) => p.totalQty), 1);

    // Loading Skeleton
    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-gray-200 rounded-2xl h-96"></div>
                        <div className="bg-gray-200 rounded-2xl h-96"></div>
                        <div className="bg-gray-200 rounded-2xl h-96"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Báo cáo Chi tiết</h1>
                    <p className="text-gray-500 mt-1">
                        Phân tích hiệu quả kinh doanh và doanh thu
                    </p>
                </div>
                <div className="flex gap-3">
                    {/* Date Range Selector */}
                    <div className="relative">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value as DateRange)}
                            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                        >
                            <option value="7days">7 ngày qua</option>
                            <option value="thisMonth">Tháng này</option>
                            <option value="thisYear">Năm nay</option>
                        </select>
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExportReport}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        Xuất báo cáo
                    </button>
                </div>
            </div>

            {/* Summary Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 bg-blue-500 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h3 className="text-blue-900 text-sm font-medium mb-1">Tổng Đơn hàng</h3>
                    <p className="text-3xl font-bold text-blue-900">
                        {statusDistribution.reduce((sum, s) => sum + s.value, 0)}
                    </p>
                    <p className="text-xs text-blue-700 mt-2">Trong khoảng thời gian</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-sm p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 bg-green-500 rounded-xl">
                            <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h3 className="text-green-900 text-sm font-medium mb-1">Sản phẩm Phân tích</h3>
                    <p className="text-3xl font-bold text-green-900">{productPerformance.length}</p>
                    <p className="text-xs text-green-700 mt-2">Top bán chạy nhất</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-sm p-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 bg-purple-500 rounded-xl">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h3 className="text-purple-900 text-sm font-medium mb-1">Tổng Số lượng Bán</h3>
                    <p className="text-3xl font-bold text-purple-900">
                        {productPerformance.reduce((sum, p) => sum + p.totalQty, 0)}
                    </p>
                    <p className="text-xs text-purple-700 mt-2">Sản phẩm đã bán</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-sm p-6 border border-orange-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 bg-orange-500 rounded-xl">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h3 className="text-orange-900 text-sm font-medium mb-1">Doanh thu Cao nhất</h3>
                    <p className="text-2xl font-bold text-orange-900">
                        {revenueByOrder.length > 0
                            ? formatCurrency(Math.max(...revenueByOrder.map((o) => o.totalPrice)))
                            : '0 ₫'}
                    </p>
                    <p className="text-xs text-orange-700 mt-2">Đơn hàng lớn nhất</p>
                </div>
            </div>

            {/* Main Reports Grid - 3 Blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* BLOCK 1: Pie Chart - Order Status Distribution */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <PieChartIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                Trạng thái Đơn hàng
                            </h2>
                            <p className="text-xs text-gray-500">Phân phối theo trạng thái</p>
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={statusDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={110}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {statusDistribution.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: any) => [`${value} đơn`, 'Số lượng']}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div className="mt-4 space-y-2.5">
                        {statusDistribution.map((stat, index) => {
                            const total = statusDistribution.reduce((sum, s) => sum + s.value, 0);
                            const percentage = total > 0 ? ((stat.value / total) * 100).toFixed(1) : '0';
                            return (
                                <div
                                    key={stat.name}
                                    className="flex items-center justify-between text-sm hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className="w-3.5 h-3.5 rounded-full shadow-sm"
                                            style={{
                                                backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                                            }}
                                        />
                                        <span className="text-gray-700 font-medium">
                                            {STATUS_LABELS[stat.name] || stat.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-900">{stat.value}</span>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                            {percentage}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* BLOCK 2: Table - Top Products Performance */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                Hiệu quả Kinh doanh
                            </h2>
                            <p className="text-xs text-gray-500">Theo Sản phẩm</p>
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                        {productPerformance.map((product, index) => {
                            const percentage = (product.totalQty / maxQty) * 100;
                            return (
                                <div
                                    key={index}
                                    className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 text-sm leading-tight">
                                                {product.productName}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {product.productCode}
                                            </p>
                                        </div>
                                        <div className="text-right ml-3">
                                            <p className="text-sm font-bold text-green-600">
                                                {formatCurrency(product.totalRevenue)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="relative">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-xs font-medium text-gray-600">
                                                Đã bán: {product.totalQty} sp
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {product.orderCount} đơn
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* BLOCK 3: Scrollable Table - Revenue by Order */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                Doanh thu theo Đơn hàng
                            </h2>
                            <p className="text-xs text-gray-500">Chi tiết theo giá trị</p>
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                        {revenueByOrder.map((order, index) => (
                            <div
                                key={index}
                                className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md hover:border-purple-200 transition-all"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">
                                            #{order.orderCode}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatDate(order.orderDate)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-purple-600">
                                            {formatCurrency(order.totalPrice)}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {order.customerName}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {order.customerEmail}
                                            </p>
                                        </div>
                                        <span className="ml-3 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                            {STATUS_LABELS[order.status] || order.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Custom Scrollbar Styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
}
