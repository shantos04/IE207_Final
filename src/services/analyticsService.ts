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

// New interfaces for the 3 additional reports
export interface OrderStatusDistribution {
    name: string;
    value: number;
    percentage: string;
}

export interface ProductSalesPerformance {
    productName: string;
    productCode: string;
    totalQty: number;
    totalRevenue: number;
    orderCount: number;
}

export interface RevenueByOrder {
    orderCode: string;
    orderDate: string;
    customerName: string;
    customerEmail: string;
    totalPrice: number;
    status: string;
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

// NEW: Lấy phân phối trạng thái đơn hàng (cho Pie Chart)
export const getOrderStatusDistribution = async (params?: AnalyticsParams) => {
    const response = await api.get<{ success: boolean; data: OrderStatusDistribution[] }>(
        '/analytics/order-status-distribution',
        {
            params,
        }
    );
    return response.data;
};

// NEW: Lấy hiệu quả bán hàng theo sản phẩm
export const getProductSalesPerformance = async (params?: AnalyticsParams) => {
    const response = await api.get<{ success: boolean; data: ProductSalesPerformance[] }>(
        '/analytics/product-sales-performance',
        {
            params,
        }
    );
    return response.data;
};

// NEW: Lấy doanh thu theo đơn hàng
export const getRevenueByOrder = async (params?: AnalyticsParams) => {
    const response = await api.get<{ success: boolean; data: RevenueByOrder[] }>(
        '/analytics/revenue-by-order',
        {
            params,
        }
    );
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

// NEW: Lấy tất cả báo cáo mới (3 reports)
export const getAllReports = async (params?: AnalyticsParams) => {
    try {
        console.log('🔍 Fetching reports data with params:', params);

        const [statusDistribution, productPerformance, revenueByOrder] = await Promise.all([
            getOrderStatusDistribution(params),
            getProductSalesPerformance(params),
            getRevenueByOrder(params),
        ]);

        console.log('✅ Reports data fetched successfully');

        return {
            statusDistribution: statusDistribution.data,
            productPerformance: productPerformance.data,
            revenueByOrder: revenueByOrder.data,
        };
    } catch (error) {
        console.error('❌ Error fetching reports:', error);
        throw error;
    }
};
