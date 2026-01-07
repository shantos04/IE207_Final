import express from 'express';
import {
    getDailyRevenue,
    getTopProducts,
    getOrderStatusStats,
    getOverviewStats,
    getOrderStatusDistribution,
    getProductSalesPerformance,
    getRevenueByOrder
} from '../controllers/analyticsController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Optional authentication - không bắt buộc đăng nhập
// Frontend đã có ProtectedRoute nên có thể tin tưởng request từ đó
router.use(optionalAuth);

/**
 * @route   GET /api/analytics/revenue
 * @desc    Lấy thống kê doanh thu theo ngày
 * @access  Public (với optional auth)
 * @query   startDate, endDate (optional)
 */
router.get('/revenue', getDailyRevenue);

/**
 * @route   GET /api/analytics/top-products
 * @desc    Lấy top sản phẩm bán chạy
 * @access  Public (với optional auth)
 * @query   limit (default: 5), startDate, endDate (optional)
 */
router.get('/top-products', getTopProducts);

/**
 * @route   GET /api/analytics/status
 * @desc    Lấy thống kê trạng thái đơn hàng
 * @access  Public (với optional auth)
 * @query   startDate, endDate (optional)
 */
router.get('/status', getOrderStatusStats);

/**
 * @route   GET /api/analytics/overview
 * @desc    Lấy thống kê tổng quan cho dashboard
 * @access  Public (với optional auth)
 * @query   startDate, endDate (optional)
 */
router.get('/overview', getOverviewStats);

/**
 * @route   GET /api/analytics/order-status-distribution
 * @desc    Lấy phân phối trạng thái đơn hàng (cho Pie Chart)
 * @access  Public (với optional auth)
 * @query   startDate, endDate (optional)
 */
router.get('/order-status-distribution', getOrderStatusDistribution);

/**
 * @route   GET /api/analytics/product-sales-performance
 * @desc    Lấy hiệu quả bán hàng theo sản phẩm
 * @access  Public (với optional auth)
 * @query   limit (default: 10), startDate, endDate (optional)
 */
router.get('/product-sales-performance', getProductSalesPerformance);

/**
 * @route   GET /api/analytics/revenue-by-order
 * @desc    Lấy doanh thu theo đơn hàng (đơn có giá trị cao nhất)
 * @access  Public (với optional auth)
 * @query   limit (default: 20), startDate, endDate (optional)
 */
router.get('/revenue-by-order', getRevenueByOrder);

export default router;
