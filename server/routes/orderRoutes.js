import express from 'express';
import {
    getOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    updatePaymentStatus,
    cancelOrder,
    cancelMyOrder,
    confirmReceived,
    getMyOrders,
    getOrderStats,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Tạm thời comment protect để test - bỏ comment khi production
// router.use(protect);

// Protected routes - createOrder requires authentication
router.route('/').get(getOrders).post(protect, createOrder);

// IMPORTANT: Route này phải đặt TRƯỚC /:id để tránh conflict
router.route('/myorders').get(protect, getMyOrders);

// Statistics endpoint - Admin only (Tạm bỏ protect để test)
router.get('/stats', /* protect, authorize(['admin']), */ getOrderStats);

// Customer actions - must be authenticated
router.put('/:id/cancel', protect, cancelMyOrder);
router.put('/:id/received', protect, confirmReceived);

router.route('/:id').get(getOrder);

// Protected routes - bỏ comment khi cần bảo vệ
router.put('/:id/status', /* authorize('admin', 'manager'), */ updateOrderStatus);
router.put('/:id/payment', /* authorize('admin', 'manager'), */ updatePaymentStatus);
router.put('/:id/cancel-admin', /* authorize('admin', 'manager'), */ cancelOrder);

export default router;
