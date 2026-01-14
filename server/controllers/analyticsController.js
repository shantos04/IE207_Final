import Order from '../models/Order.js';
import Product from '../models/Product.js';

/**
 * API 1: Thống kê Doanh thu theo ngày (Revenue Chart)
 * GET /api/analytics/revenue
 */
export const getDailyRevenue = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Build match query
        const matchQuery = {
            status: { $in: ['Delivered', 'Confirmed'] }, // Completed/Delivered orders
        };

        // Add date filter if provided
        if (startDate || endDate) {
            matchQuery.createdAt = {};
            if (startDate) {
                matchQuery.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                matchQuery.createdAt.$lte = new Date(endDate);
            }
        }

        const revenueData = await Order.aggregate([
            {
                $match: matchQuery
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    revenue: { $sum: '$totalPrice' },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id',
                    revenue: 1,
                    orderCount: 1
                }
            }
        ]);

        res.json({
            success: true,
            data: revenueData
        });
    } catch (error) {
        console.error('Error in getDailyRevenue:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê doanh thu',
            error: error.message
        });
    }
};

/**
 * API 2: Top Sản phẩm bán chạy (Best Sellers)
 * GET /api/analytics/top-products
 */
export const getTopProducts = async (req, res) => {
    try {
        const { limit = 5, startDate, endDate } = req.query;

        // Build match query
        // FIXED: Count ALL non-cancelled orders to reflect real-time inventory demand
        const matchQuery = {
            status: { $ne: 'Cancelled' }, // Include Pending, Confirmed, Shipped, Delivered
        };

        // Add date filter if provided
        if (startDate || endDate) {
            matchQuery.createdAt = {};
            if (startDate) {
                matchQuery.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                matchQuery.createdAt.$lte = new Date(endDate);
            }
        }

        const topProducts = await Order.aggregate([
            {
                $match: matchQuery
            },
            {
                $unwind: '$orderItems'
            },
            {
                $group: {
                    _id: '$orderItems.product',
                    productName: { $first: '$orderItems.productName' },
                    productCode: { $first: '$orderItems.productCode' },
                    totalQuantity: { $sum: '$orderItems.quantity' }, // Properly sum quantities
                    totalRevenue: { $sum: '$orderItems.subtotal' },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $sort: { totalQuantity: -1 }
            },
            {
                $limit: parseInt(limit)
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $unwind: {
                    path: '$productDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    productId: '$_id',
                    productName: 1,
                    productCode: 1,
                    totalQuantity: 1,
                    totalRevenue: 1,
                    orderCount: 1,
                    category: '$productDetails.category',
                    price: '$productDetails.price',
                    stock: '$productDetails.stock'
                }
            }
        ]);

        res.json({
            success: true,
            data: topProducts
        });
    } catch (error) {
        console.error('Error in getTopProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy top sản phẩm bán chạy',
            error: error.message
        });
    }
};

/**
 * API 3: Thống kê Trạng thái đơn hàng (Order Status Pie Chart)
 * GET /api/analytics/status
 * 
 * NOTE: This endpoint shows CURRENT operational state (live snapshot),
 * NOT filtered by date. It matches Order Management page counts.
 */
export const getOrderStatusStats = async (req, res) => {
    try {
        // === CRITICAL FIX: NO DATE FILTER for status distribution ===
        // Operational statuses (Pending, Shipped, etc.) should reflect
        // the CURRENT state of orders, not when they were created.
        // Example: Order created last month but still "Shipped" today
        // should appear in the chart.

        const statusStats = await Order.aggregate([
            {
                // No $match stage - count ALL orders by current status
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$totalPrice' }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $project: {
                    _id: 0,
                    status: '$_id',
                    count: 1,
                    totalRevenue: 1
                }
            }
        ]);

        // Calculate total orders
        const totalOrders = statusStats.reduce((sum, stat) => sum + stat.count, 0);

        // Add percentage to each status
        const statsWithPercentage = statusStats.map(stat => ({
            ...stat,
            percentage: totalOrders > 0 ? ((stat.count / totalOrders) * 100).toFixed(2) : 0
        }));

        res.json({
            success: true,
            data: {
                statusBreakdown: statsWithPercentage,
                totalOrders
            }
        });
    } catch (error) {
        console.error('Error in getOrderStatusStats:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê trạng thái đơn hàng',
            error: error.message
        });
    }
};

/**
 * API Bonus: Tổng quan Dashboard (Overview Stats)
 * GET /api/analytics/overview
 */
export const getOverviewStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Build date filter
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) {
                dateFilter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                dateFilter.createdAt.$lte = new Date(endDate);
            }
        }

        // Total revenue (only completed orders)
        const revenueResult = await Order.aggregate([
            {
                $match: {
                    ...dateFilter,
                    status: { $in: ['Delivered', 'Confirmed'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalPrice' },
                    orderCount: { $sum: 1 }
                }
            }
        ]);

        // Total orders (all statuses)
        const totalOrders = await Order.countDocuments(dateFilter);

        // Pending orders
        const pendingOrders = await Order.countDocuments({
            ...dateFilter,
            status: { $in: ['Pending', 'Confirmed', 'Shipped'] }
        });

        // Total products
        const totalProducts = await Product.countDocuments({ isActive: true });

        // Low stock products
        const lowStockProducts = await Product.countDocuments({
            isActive: true,
            stock: { $lte: 10 }
        });

        res.json({
            success: true,
            data: {
                totalRevenue: revenueResult[0]?.totalRevenue || 0,
                completedOrders: revenueResult[0]?.orderCount || 0,
                totalOrders,
                pendingOrders,
                totalProducts,
                lowStockProducts
            }
        });
    } catch (error) {
        console.error('Error in getOverviewStats:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê tổng quan',
            error: error.message
        });
    }
};

/**
 * API 4: Báo cáo Phân phối Trạng thái Đơn hàng (Order Status Distribution)
 * GET /api/analytics/order-status-distribution
 * 
 * NOTE: This endpoint shows CURRENT operational state (live snapshot),
 * NOT filtered by date. It matches Order Management page counts.
 */
export const getOrderStatusDistribution = async (req, res) => {
    try {
        // === CRITICAL FIX: NO DATE FILTER for status distribution ===
        // This chart visualizes the CURRENT operational state of all orders,
        // ensuring consistency with Order Management summary cards.

        const statusDistribution = await Order.aggregate([
            {
                // No $match stage - count ALL orders by current status
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Calculate total orders for percentage
        const totalOrders = statusDistribution.reduce((sum, item) => sum + item.count, 0);

        // Format data for pie chart with Vietnamese labels
        const formattedData = statusDistribution.map(item => ({
            name: item._id,
            value: item.count,
            percentage: totalOrders > 0 ? ((item.count / totalOrders) * 100).toFixed(1) : '0'
        }));

        res.json({
            success: true,
            data: formattedData
        });
    } catch (error) {
        console.error('Error in getOrderStatusDistribution:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy phân phối trạng thái đơn hàng',
            error: error.message
        });
    }
};

/**
 * API 5: Báo cáo Hiệu quả Bán hàng theo Sản phẩm (Product Sales Performance)
 * GET /api/analytics/product-sales-performance
 */
export const getProductSalesPerformance = async (req, res) => {
    try {
        const { startDate, endDate, limit = 10 } = req.query;

        // Build match query
        // FIXED: Count ALL non-cancelled orders to reflect real-time sales performance
        const matchQuery = {
            status: { $ne: 'Cancelled' } // Include Pending, Confirmed, Shipped, Delivered
        };

        // Add date filter if provided
        if (startDate || endDate) {
            matchQuery.createdAt = {};
            if (startDate) {
                matchQuery.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                matchQuery.createdAt.$lte = new Date(endDate);
            }
        }

        // Debug logging
        console.log('🔍 [getProductSalesPerformance] Match Query:', JSON.stringify(matchQuery, null, 2));
        console.log('📅 [getProductSalesPerformance] Date Range:', { startDate, endDate });

        const productPerformance = await Order.aggregate([
            {
                $match: matchQuery
            },
            {
                $unwind: '$orderItems' // Unwind orderItems array
            },
            {
                $group: {
                    _id: '$orderItems.productName',
                    productCode: { $first: '$orderItems.productCode' },
                    totalQty: { $sum: '$orderItems.quantity' }, // Sum quantities properly
                    totalRevenue: { $sum: '$orderItems.subtotal' },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $sort: { totalQty: -1 } // Sort by quantity sold (descending)
            },
            {
                $limit: parseInt(limit)
            },
            {
                $project: {
                    _id: 0,
                    productName: '$_id',
                    productCode: 1,
                    totalQty: 1,
                    totalRevenue: 1,
                    orderCount: 1
                }
            }
        ]);

        console.log(`✅ [getProductSalesPerformance] Found ${productPerformance.length} products`);
        if (productPerformance.length > 0) {
            console.log('🔝 Top product:', productPerformance[0]);
        }

        res.json({
            success: true,
            data: productPerformance
        });
    } catch (error) {
        console.error('Error in getProductSalesPerformance:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy hiệu quả bán hàng theo sản phẩm',
            error: error.message
        });
    }
};

/**
 * API 6: Báo cáo Doanh thu theo Đơn hàng (Revenue by Order)
 * GET /api/analytics/revenue-by-order
 */
export const getRevenueByOrder = async (req, res) => {
    try {
        const { startDate, endDate, limit = 20 } = req.query;

        // Build match query - only delivered (completed) orders
        const matchQuery = {
            status: 'Delivered' // Only count successfully delivered orders
        };

        // Add date filter if provided
        if (startDate || endDate) {
            matchQuery.createdAt = {};
            if (startDate) {
                matchQuery.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                matchQuery.createdAt.$lte = new Date(endDate);
            }
        }

        const revenueByOrder = await Order.find(matchQuery)
            .select('orderCode createdAt customer.name customer.email totalPrice status')
            .sort({ totalPrice: -1 }) // Sort by totalPrice descending (highest first)
            .limit(parseInt(limit))
            .lean();

        // Format data
        const formattedData = revenueByOrder.map(order => ({
            orderCode: order.orderCode,
            orderDate: order.createdAt,
            customerName: order.customer.name,
            customerEmail: order.customer.email,
            totalPrice: order.totalPrice,
            status: order.status
        }));

        res.json({
            success: true,
            data: formattedData
        });
    } catch (error) {
        console.error('Error in getRevenueByOrder:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy doanh thu theo đơn hàng',
            error: error.message
        });
    }
};
