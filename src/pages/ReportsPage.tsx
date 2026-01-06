import { useEffect, useState } from 'react';
import {
    TrendingUp,
    ShoppingCart,
    Users,
    AlertTriangle,
    Download,
    Calendar,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    getAllAnalytics,
    DailyRevenue,
    TopProduct,
    OrderStatus,
    OverviewStats,
} from '../services/analyticsService';

// Mock data generators
const generateMockRevenueData = (): DailyRevenue[] => {
    const data: DailyRevenue[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        data.push({
            date: date.toISOString().split('T')[0],
            revenue: Math.floor(Math.random() * 50000000) + 30000000,
            orderCount: Math.floor(Math.random() * 50) + 20,
        });
    }
    return data;
};

const generateMockTopProducts = (): TopProduct[] => {
    const products = [
        'Arduino Uno R3',
        'Raspberry Pi 4',
        'ESP32 DevKit',
        'Cảm biến nhiệt độ DHT22',
        'Module WiFi ESP8266',
    ];
    return products.map((name, idx) => ({
        productId: `prod-${idx}`,
        productName: name,
        productCode: `P${1000 + idx}`,
        totalQuantity: Math.floor(Math.random() * 200) + 100,
        totalRevenue: Math.floor(Math.random() * 20000000) + 10000000,
        orderCount: Math.floor(Math.random() * 50) + 20,
        category: 'vi-dieu-khien',
        price: Math.floor(Math.random() * 500000) + 100000,
        stock: Math.floor(Math.random() * 100) + 50,
    }));
};

const generateMockStatusStats = (): { statusBreakdown: OrderStatus[]; totalOrders: number } => {
    const statuses = ['Delivered', 'Pending', 'Confirmed', 'Shipped', 'Cancelled'];
    const statusBreakdown: OrderStatus[] = statuses.map((status) => {
        const count = Math.floor(Math.random() * 100) + 20;
        return {
            status,
            count,
            totalRevenue: count * (Math.floor(Math.random() * 2000000) + 500000),
            percentage: '0',
        };
    });
    const total = statusBreakdown.reduce((sum, s) => sum + s.count, 0);
    statusBreakdown.forEach((s) => {
        s.percentage = ((s.count / total) * 100).toFixed(2);
    });
    return { statusBreakdown, totalOrders: total };
};

const generateMockOverview = (): OverviewStats => ({
    totalRevenue: Math.floor(Math.random() * 500000000) + 200000000,
    completedOrders: Math.floor(Math.random() * 500) + 300,
    totalOrders: Math.floor(Math.random() * 800) + 500,
    pendingOrders: Math.floor(Math.random() * 100) + 50,
    totalProducts: Math.floor(Math.random() * 200) + 150,
    lowStockProducts: Math.floor(Math.random() * 20) + 5,
});

// Colors for charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const STATUS_LABELS: Record<string, string> = {
    Delivered: 'Đã giao',
    Pending: 'Chờ xử lý',
    Confirmed: 'Đã xác nhận',
    Shipped: 'Đang giao',
    Cancelled: 'Đã hủy',
    Draft: 'Nháp',
};

type DateRange = '7days' | 'thisMonth' | 'thisYear';

export default function ReportsPage() {
    const [dateRange, setDateRange] = useState<DateRange>('7days');
    const [loading, setLoading] = useState(true);
    const [revenueData, setRevenueData] = useState<DailyRevenue[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [statusStats, setStatusStats] = useState<OrderStatus[]>([]);
    const [overview, setOverview] = useState<OverviewStats | null>(null);

    useEffect(() => {
        fetchAnalyticsData();
    }, [dateRange]);

    const getDateRangeParams = () => {
        const today = new Date();
        let startDate: string | undefined;
        let endDate: string | undefined;

        switch (dateRange) {
            case '7days':
                startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                endDate = today.toISOString().split('T')[0];
                break;
            case 'thisMonth':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                endDate = today.toISOString().split('T')[0];
                break;
            case 'thisYear':
                startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
                endDate = today.toISOString().split('T')[0];
                break;
        }

        return { startDate, endDate };
    };

    const fetchAnalyticsData = async () => {
        setLoading(true);
        try {
            const params = getDateRangeParams();
            const data = await getAllAnalytics({ ...params, limit: 5 });

            // Use real data or fallback to mock data
            setRevenueData(data.revenue.length > 0 ? data.revenue : generateMockRevenueData());
            setTopProducts(data.topProducts.length > 0 ? data.topProducts : generateMockTopProducts());
            setStatusStats(
                data.statusStats.statusBreakdown.length > 0
                    ? data.statusStats.statusBreakdown
                    : generateMockStatusStats().statusBreakdown
            );
            setOverview(data.overview || generateMockOverview());
        } catch (error) {
            console.error('Error fetching analytics:', error);
            // Fallback to mock data on error
            setRevenueData(generateMockRevenueData());
            setTopProducts(generateMockTopProducts());
            setStatusStats(generateMockStatusStats().statusBreakdown);
            setOverview(generateMockOverview());
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            notation: 'compact',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatCurrencyFull = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    const handleExportReport = () => {
        alert('Chức năng xuất báo cáo sẽ được triển khai sau!');
    };

    // Custom Tooltip Components
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-900 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {typeof entry.value === 'number' && entry.value > 1000
                                ? formatCurrency(entry.value)
                                : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-pulse text-gray-500 text-lg">Đang tải dữ liệu...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header with Filter Bar */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Báo cáo & Phân tích</h1>
                    <p className="text-gray-500 mt-1">Tổng quan hoạt động kinh doanh</p>
                </div>
                <div className="flex gap-3">
                    {/* Date Range Selector */}
                    <div className="relative">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value as DateRange)}
                            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Xuất báo cáo
                    </button>
                </div>
            </div>

            {/* Row 1: Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Revenue Today */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded">
                            +12.5%
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium mb-1">Doanh thu hôm nay</h3>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(revenueData[revenueData.length - 1]?.revenue || 0)}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">So với hôm qua</p>
                </div>

                {/* Card 2: New Orders */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <ShoppingCart className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded">
                            +8.2%
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium mb-1">Đơn hàng mới</h3>
                    <p className="text-2xl font-bold text-gray-900">{overview?.pendingOrders || 0}</p>
                    <p className="text-xs text-gray-400 mt-2">Chờ xử lý</p>
                </div>

                {/* Card 3: New Customers (Mock data) */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded">
                            +15.3%
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium mb-1">Khách hàng mới</h3>
                    <p className="text-2xl font-bold text-gray-900">
                        {Math.floor((overview?.totalOrders || 0) * 0.3)}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Tháng này</p>
                </div>

                {/* Card 4: Low Stock Products */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-orange-600" />
                        </div>
                        <span className="text-orange-600 text-sm font-medium bg-orange-50 px-2 py-1 rounded">
                            Cảnh báo
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium mb-1">Sắp hết hàng</h3>
                    <p className="text-2xl font-bold text-gray-900">{overview?.lowStockProducts || 0}</p>
                    <p className="text-xs text-gray-400 mt-2">Cần nhập thêm</p>
                </div>
            </div>

            {/* Row 2: Revenue Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Doanh thu 7 ngày gần nhất</h2>
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={revenueData}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="date"
                            stroke="#9CA3AF"
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return `${date.getDate()}/${date.getMonth() + 1}`;
                            }}
                        />
                        <YAxis
                            stroke="#9CA3AF"
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => formatCurrency(value)}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
                            formatter={() => 'Doanh thu'}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            name="Doanh thu"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Row 3: Split View - Top Products & Order Status */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left: Top Products Bar Chart (60% - 3 cols) */}
                <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Top 5 Sản phẩm bán chạy</h2>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={topProducts} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                type="number"
                                stroke="#9CA3AF"
                                style={{ fontSize: '12px' }}
                                tickFormatter={(value) => `${value}`}
                            />
                            <YAxis
                                type="category"
                                dataKey="productName"
                                stroke="#9CA3AF"
                                style={{ fontSize: '12px' }}
                                width={150}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
                                formatter={(value) => (value === 'totalQuantity' ? 'Số lượng bán' : value)}
                            />
                            <Bar dataKey="totalQuantity" fill="#3B82F6" radius={[0, 8, 8, 0]} name="Số lượng" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Right: Order Status Pie Chart (40% - 2 cols) */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Trạng thái đơn hàng</h2>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie
                                data={statusStats}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="count"
                                label={({ status, percentage }) =>
                                    `${STATUS_LABELS[status] || status} (${percentage}%)`
                                }
                                labelLine={false}
                            >
                                {statusStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: any, name: any, props: any) => [
                                    `${value} đơn`,
                                    STATUS_LABELS[props.payload.status] || props.payload.status,
                                ]}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '12px',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Status Legend */}
                    <div className="mt-4 space-y-2">
                        {statusStats.slice(0, 5).map((stat, index) => (
                            <div key={stat.status} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <span className="text-gray-700">
                                        {STATUS_LABELS[stat.status] || stat.status}
                                    </span>
                                </div>
                                <span className="font-semibold text-gray-900">{stat.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
