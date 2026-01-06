import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Users, Package } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import RecentOrdersTable from '../components/dashboard/RecentOrdersTable';
import { DashboardStats, RevenueData, Order } from '../types';
import { getDashboardStats, getDashboardCharts } from '../services/dashboardService';

export default function DashboardHome() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch stats and charts in parallel
                const [statsResponse, chartsResponse] = await Promise.all([
                    getDashboardStats(),
                    getDashboardCharts(),
                ]);

                // Process stats data
                if (statsResponse.success) {
                    const { counts, growth } = statsResponse.data;
                    setStats({
                        totalRevenue: counts.revenue,
                        totalOrders: counts.orders,
                        totalCustomers: counts.customers,
                        totalProducts: counts.products,
                        revenueChange: growth.revenue,
                        ordersChange: growth.orders,
                        customersChange: growth.customers,
                    });
                }

                // Process charts data
                if (chartsResponse.success) {
                    const { revenueChart, recentOrders: orders } = chartsResponse.data;

                    // Map revenue chart data
                    setRevenueData(revenueChart.map(item => ({
                        date: item.date,
                        revenue: item.revenue,
                    })));

                    // Map recent orders
                    setRecentOrders(orders.map(order => ({
                        _id: order.orderCode,
                        orderCode: order.orderCode,
                        customer: {
                            name: order.customerName,
                            email: '',
                            phone: '',
                        },
                        items: [],
                        totalAmount: order.totalAmount,
                        status: order.status as any,
                        paymentStatus: 'paid' as any,
                        shippingAddress: '',
                        createdAt: order.createdAt,
                        updatedAt: order.createdAt,
                    })));
                }
            } catch (err: any) {
                console.error('Error fetching dashboard data:', err);
                setError(err.response?.data?.message || 'Không thể tải dữ liệu dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(value);
    };

    // Generate mini chart data
    const generateMiniChartData = (baseValue: number, trend: number) => {
        const data = [];
        for (let i = 0; i < 7; i++) {
            const variance = Math.random() * 20 - 10;
            data.push({
                value: baseValue + (baseValue * (trend / 100) * (i / 7)) + variance,
            });
        }
        return data;
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Skeleton for Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                    ))}
                </div>
                {/* Skeleton for Chart */}
                <div className="bg-white rounded-lg shadow p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
                {/* Skeleton for Table */}
                <div className="bg-white rounded-lg shadow p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-12 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="text-red-500 text-lg font-semibold mb-2">⚠️ Lỗi</div>
                    <div className="text-gray-600">{error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Tải lại
                    </button>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-pulse text-gray-500">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Doanh thu"
                    value={formatCurrency(stats.totalRevenue)}
                    change={stats.revenueChange}
                    icon={DollarSign}
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                    chartData={generateMiniChartData(stats.totalRevenue, stats.revenueChange)}
                />
                <StatCard
                    title="Đơn hàng mới"
                    value={stats.totalOrders.toLocaleString('vi-VN')}
                    change={stats.ordersChange}
                    icon={ShoppingBag}
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                    chartData={generateMiniChartData(stats.totalOrders, stats.ordersChange)}
                />
                <StatCard
                    title="Khách hàng"
                    value={stats.totalCustomers.toLocaleString('vi-VN')}
                    change={stats.customersChange}
                    icon={Users}
                    iconBgColor="bg-purple-100"
                    iconColor="text-purple-600"
                    chartData={generateMiniChartData(stats.totalCustomers, stats.customersChange)}
                />
                <StatCard
                    title="Sản phẩm"
                    value={stats.totalProducts.toLocaleString('vi-VN')}
                    change={0}
                    icon={Package}
                    iconBgColor="bg-orange-100"
                    iconColor="text-orange-600"
                    chartData={generateMiniChartData(stats.totalProducts, 0)}
                />
            </div>

            {/* Revenue Chart */}
            <RevenueChart data={revenueData} />

            {/* Recent Orders Table */}
            <RecentOrdersTable orders={recentOrders} />
        </div>
    );
}
