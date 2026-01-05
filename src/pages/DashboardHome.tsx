import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import RecentOrdersTable from '../components/dashboard/RecentOrdersTable';
import { DashboardStats, RevenueData, Order } from '../types';
import { mockDashboardStats, mockRevenueData, mockRecentOrders } from '../data/mockData';

export default function DashboardHome() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setStats(mockDashboardStats);
            setRevenueData(mockRevenueData);
            setRecentOrders(mockRecentOrders);
        }, 500);
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
                    title="Tỷ lệ chuyển đổi"
                    value={`${stats.conversionRate}%`}
                    change={2.3}
                    icon={TrendingUp}
                    iconBgColor="bg-orange-100"
                    iconColor="text-orange-600"
                    chartData={generateMiniChartData(stats.conversionRate, 2.3)}
                />
            </div>

            {/* Revenue Chart */}
            <RevenueChart data={revenueData} />

            {/* Recent Orders Table */}
            <RecentOrdersTable orders={recentOrders} />
        </div>
    );
}
