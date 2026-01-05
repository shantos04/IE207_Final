import express from 'express';
import {
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    updateLoyaltyPoints,
} from '../controllers/customerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Tạm thời comment protect để test - bỏ comment khi production
// router.use(protect);

// Public routes for testing
router.route('/').get(getCustomers).post(createCustomer);

router.route('/:id').get(getCustomer).put(updateCustomer).delete(deleteCustomer);

router.put('/:id/loyalty', updateLoyaltyPoints);

export default router;
