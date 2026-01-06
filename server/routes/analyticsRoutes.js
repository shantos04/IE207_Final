import express from 'express';
import {
    getDailyRevenue,
    getTopProducts,
    getOrderStatusStats,
    getOverviewStats
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all analytics routes - require authentication
router.use(protect);

/**
 * @route   GET /api/analytics/revenue
 * @desc    Lấy thống kê doanh thu theo ngày
 * @access  Private
 * @query   startDate, endDate (optional)
 */
router.get('/revenue', getDailyRevenue);

/**
 * @route   GET /api/analytics/top-products
 * @desc    Lấy top sản phẩm bán chạy
 * @access  Private
 * @query   limit (default: 5), startDate, endDate (optional)
 */
router.get('/top-products', getTopProducts);

/**
 * @route   GET /api/analytics/status
 * @desc    Lấy thống kê trạng thái đơn hàng
 * @access  Private
 * @query   startDate, endDate (optional)
 */
router.get('/status', getOrderStatusStats);

/**
 * @route   GET /api/analytics/overview
 * @desc    Lấy thống kê tổng quan cho dashboard
 * @access  Private
 * @query   startDate, endDate (optional)
 */
router.get('/overview', getOverviewStats);

export default router;
