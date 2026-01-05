import express from 'express';
import {
    getOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    updatePaymentStatus,
    cancelOrder,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Tạm thời comment protect để test - bỏ comment khi production
// router.use(protect);

// Public routes for testing
router.route('/').get(getOrders).post(createOrder);

router.route('/:id').get(getOrder);

// Protected routes - bỏ comment khi cần bảo vệ
router.put('/:id/status', /* authorize('admin', 'manager'), */ updateOrderStatus);
router.put('/:id/payment', /* authorize('admin', 'manager'), */ updatePaymentStatus);
router.put('/:id/cancel', cancelOrder);

export default router;
