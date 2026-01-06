import { api } from './api';

// Dashboard Stats Response
export interface DashboardStatsData {
    counts: {
        revenue: number;
        orders: number;
        products: number;
        customers: number;
    };
    growth: {
        revenue: number;
        orders: number;
        customers: number;
    };
}

// Dashboard Charts Response
export interface DashboardChartsData {
    revenueChart: Array<{
        date: string;
        revenue: number;
    }>;
    statusChart: Array<{
        status: string;
        count: number;
        revenue: number;
    }>;
    topProducts: Array<{
        productName: string;
        productCode: string;
        totalQuantity: number;
        totalRevenue: number;
        orderCount: number;
    }>;
    recentOrders: Array<{
        orderCode: string;
        customerName: string;
        totalAmount: number;
        status: string;
        createdAt: string;
    }>;
}

// Revenue by Month Response
export interface MonthlyRevenueData {
    month: string;
    year: number;
    revenue: number;
    orderCount: number;
}

/**
 * Get dashboard statistics (revenue, orders, customers, products with growth rates)
 */
export const getDashboardStats = async () => {
    const response = await api.get<{
        success: boolean;
        data: DashboardStatsData;
    }>('/dashboard/stats');
    return response.data;
};

/**
 * Get dashboard charts data (revenue chart, status distribution, top products, recent orders)
 */
export const getDashboardCharts = async () => {
    const response = await api.get<{
        success: boolean;
        data: DashboardChartsData;
    }>('/dashboard/charts');
    return response.data;
};

/**
 * Get revenue by month for the last N months
 * @param months - Number of months to retrieve (default: 6)
 */
export const getRevenueByMonth = async (months: number = 6) => {
    const response = await api.get<{
        success: boolean;
        data: MonthlyRevenueData[];
    }>(`/dashboard/revenue-by-month`, {
        params: { months }
    });
    return response.data;
};

export default {
    getDashboardStats,
    getDashboardCharts,
    getRevenueByMonth,
};
