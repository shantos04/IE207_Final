import { api } from './api';

export interface DailyRevenue {
    date: string;
    revenue: number;
    orderCount: number;
}

export interface TopProduct {
    productId: string;
    productName: string;
    productCode: string;
    totalQuantity: number;
    totalRevenue: number;
    orderCount: number;
    category?: string;
    price?: number;
    stock?: number;
}

export interface OrderStatus {
    status: string;
    count: number;
    totalRevenue: number;
    percentage: string;
}

export interface OverviewStats {
    totalRevenue: number;
    completedOrders: number;
    totalOrders: number;
    pendingOrders: number;
    totalProducts: number;
    lowStockProducts: number;
}

export interface AnalyticsParams {
    startDate?: string;
    endDate?: string;
    limit?: number;
}

// Lấy doanh thu theo ngày
export const getDailyRevenue = async (params?: AnalyticsParams) => {
    const response = await api.get<{ success: boolean; data: DailyRevenue[] }>('/analytics/revenue', {
        params,
    });
    return response.data;
};

// Lấy top sản phẩm bán chạy
export const getTopProducts = async (params?: AnalyticsParams) => {
    const response = await api.get<{ success: boolean; data: TopProduct[] }>('/analytics/top-products', {
        params,
    });
    return response.data;
};

// Lấy thống kê trạng thái đơn hàng
export const getOrderStatusStats = async (params?: AnalyticsParams) => {
    const response = await api.get<{
        success: boolean;
        data: {
            statusBreakdown: OrderStatus[];
            totalOrders: number;
        };
    }>('/analytics/status', {
        params,
    });
    return response.data;
};

// Lấy thống kê tổng quan
export const getOverviewStats = async (params?: AnalyticsParams) => {
    const response = await api.get<{ success: boolean; data: OverviewStats }>('/analytics/overview', {
        params,
    });
    return response.data;
};

// Lấy tất cả analytics data một lần
export const getAllAnalytics = async (params?: AnalyticsParams) => {
    try {
        console.log('🔍 Fetching analytics data with params:', params);

        const [revenue, topProducts, statusStats, overview] = await Promise.all([
            getDailyRevenue(params),
            getTopProducts(params),
            getOrderStatusStats(params),
            getOverviewStats(params),
        ]);

        console.log('✅ Analytics data fetched successfully');

        return {
            revenue: revenue.data,
            topProducts: topProducts.data,
            statusStats: statusStats.data,
            overview: overview.data,
        };
    } catch (error) {
        console.error('❌ Error fetching analytics:', error);
        throw error;
    }
};
