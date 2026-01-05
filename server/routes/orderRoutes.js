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

// All routes require authentication
router.use(protect);

router.route('/').get(getOrders).post(createOrder);

router.route('/:id').get(getOrder);

router.put('/:id/status', authorize('admin', 'manager'), updateOrderStatus);
router.put('/:id/payment', authorize('admin', 'manager'), updatePaymentStatus);
router.put('/:id/cancel', cancelOrder);

export default router;
