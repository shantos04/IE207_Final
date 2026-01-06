import express from 'express';
import {
    getDashboardStats,
    getDashboardCharts,
    getRevenueByMonth,
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(protect);

// Dashboard statistics
router.get('/stats', getDashboardStats);

// Dashboard charts data
router.get('/charts', getDashboardCharts);

// Revenue by month (for reports)
router.get('/revenue-by-month', getRevenueByMonth);

export default router;
