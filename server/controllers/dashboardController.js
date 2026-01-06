import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Protected
export const getDashboardStats = async (req, res) => {
    try {
        // Tính tổng số
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalCustomers = await Customer.countDocuments();

        // Tính tổng doanh thu (chỉ đơn Delivered)
        const revenueResult = await Order.aggregate([
            {
                $match: {
                    status: 'Delivered',
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' },
                },
            },
        ]);

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Tính doanh thu tháng này
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        const currentMonthRevenue = await Order.aggregate([
            {
                $match: {
                    status: 'Delivered',
                    createdAt: { $gte: startOfMonth },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' },
                },
            },
        ]);

        const lastMonthRevenue = await Order.aggregate([
            {
                $match: {
                    status: 'Delivered',
                    createdAt: {
                        $gte: startOfLastMonth,
                        $lte: endOfLastMonth,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' },
                },
            },
        ]);

        const currentRevenue = currentMonthRevenue.length > 0 ? currentMonthRevenue[0].total : 0;
        const lastRevenue = lastMonthRevenue.length > 0 ? lastMonthRevenue[0].total : 0;

        // Tính % tăng trưởng doanh thu
        let revenueGrowth = 0;
        if (lastRevenue > 0) {
            revenueGrowth = ((currentRevenue - lastRevenue) / lastRevenue) * 100;
        } else if (currentRevenue > 0) {
            revenueGrowth = 100;
        }

        // Tính số đơn hàng tháng này vs tháng trước
        const currentMonthOrders = await Order.countDocuments({
            createdAt: { $gte: startOfMonth },
        });

        const lastMonthOrders = await Order.countDocuments({
            createdAt: {
                $gte: startOfLastMonth,
                $lte: endOfLastMonth,
            },
        });

        let ordersGrowth = 0;
        if (lastMonthOrders > 0) {
            ordersGrowth = ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100;
        } else if (currentMonthOrders > 0) {
            ordersGrowth = 100;
        }

        // Tính số khách hàng tháng này vs tháng trước
        const currentMonthCustomers = await Customer.countDocuments({
            createdAt: { $gte: startOfMonth },
        });

        const lastMonthCustomers = await Customer.countDocuments({
            createdAt: {
                $gte: startOfLastMonth,
                $lte: endOfLastMonth,
            },
        });

        let customersGrowth = 0;
        if (lastMonthCustomers > 0) {
            customersGrowth = ((currentMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100;
        } else if (currentMonthCustomers > 0) {
            customersGrowth = 100;
        }

        res.status(200).json({
            success: true,
            data: {
                counts: {
                    revenue: totalRevenue,
                    orders: totalOrders,
                    products: totalProducts,
                    customers: totalCustomers,
                },
                growth: {
                    revenue: Math.round(revenueGrowth * 10) / 10, // 1 decimal
                    orders: Math.round(ordersGrowth * 10) / 10,
                    customers: Math.round(customersGrowth * 10) / 10,
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê dashboard',
            error: error.message,
        });
    }
};

// @desc    Get dashboard charts data
// @route   GET /api/dashboard/charts
// @access  Protected
export const getDashboardCharts = async (req, res) => {
    try {
        // ============= REVENUE CHART (30 ngày gần nhất) =============
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const revenueData = await Order.aggregate([
            {
                $match: {
                    status: 'Delivered',
                    createdAt: { $gte: thirtyDaysAgo },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                    },
                    revenue: { $sum: '$totalAmount' },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);

        // Zero-filling: Tạo mảng 30 ngày đầy đủ (có thể có ngày = 0)
        const revenueChart = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const dateStr = date.toISOString().split('T')[0]; // "YYYY-MM-DD"

            const foundData = revenueData.find((d) => d._id === dateStr);

            revenueChart.push({
                date: dateStr, // Return ISO format YYYY-MM-DD for frontend parsing
                revenue: foundData ? foundData.revenue : 0,
            });
        }

        // ============= STATUS CHART =============
        const statusData = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const statusChart = statusData.map((item) => ({
            status: item._id,
            count: item.count,
        }));

        // ============= TOP PRODUCTS (Bonus) =============
        const topProducts = await Order.aggregate([
            {
                $match: {
                    status: 'Delivered',
                },
            },
            {
                $unwind: '$orderItems',
            },
            {
                $group: {
                    _id: '$orderItems.productName',
                    totalQuantity: { $sum: '$orderItems.quantity' },
                    totalRevenue: { $sum: '$orderItems.subtotal' },
                },
            },
            {
                $sort: { totalQuantity: -1 },
            },
            {
                $limit: 10,
            },
            {
                $project: {
                    name: '$_id',
                    quantity: '$totalQuantity',
                    revenue: '$totalRevenue',
                    _id: 0,
                },
            },
        ]);

        // ============= RECENT ORDERS =============
        const recentOrdersRaw = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('orderCode customer totalAmount status createdAt')
            .lean();

        // Transform to match frontend expected format
        const recentOrders = recentOrdersRaw.map(order => ({
            orderCode: order.orderCode,
            customerName: order.customer?.name || 'N/A',
            totalAmount: order.totalAmount,
            status: order.status,
            createdAt: order.createdAt,
        }));

        res.status(200).json({
            success: true,
            data: {
                revenueChart,
                statusChart,
                topProducts,
                recentOrders,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy dữ liệu biểu đồ',
            error: error.message,
        });
    }
};

// @desc    Get revenue by month (for reports)
// @route   GET /api/dashboard/revenue-by-month
// @access  Protected
export const getRevenueByMonth = async (req, res) => {
    try {
        const { months = 6 } = req.query;
        const monthsAgo = new Date();
        monthsAgo.setMonth(monthsAgo.getMonth() - parseInt(months));

        const revenueByMonth = await Order.aggregate([
            {
                $match: {
                    status: 'Delivered',
                    createdAt: { $gte: monthsAgo },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 },
                },
            },
            {
                $sort: {
                    '_id.year': 1,
                    '_id.month': 1,
                },
            },
            {
                $project: {
                    month: {
                        $concat: [
                            {
                                $toString: '$_id.month',
                            },
                            '/',
                            {
                                $toString: '$_id.year',
                            },
                        ],
                    },
                    revenue: 1,
                    orders: 1,
                    _id: 0,
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: revenueByMonth,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy doanh thu theo tháng',
            error: error.message,
        });
    }
};

export default {
    getDashboardStats,
    getDashboardCharts,
    getRevenueByMonth,
};
