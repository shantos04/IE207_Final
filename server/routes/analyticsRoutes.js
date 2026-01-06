import express from 'express';
import {
    getDailyRevenue,
    getTopProducts,
    getOrderStatusStats,
    getOverviewStats
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

export default router;
