import express from 'express';
import {
    getInvoices,
    getInvoiceDetail,
    createInvoice,
    markAsPaid,
    updateInvoiceStatus,
    cancelInvoice,
} from '../controllers/invoiceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Tạm thời comment protect để test - bỏ comment khi production
// router.use(protect);

// Public routes for testing
router.route('/').get(getInvoices).post(createInvoice);

router.route('/:id').get(getInvoiceDetail);

router.put('/:id/paid', markAsPaid);
router.put('/:id/status', updateInvoiceStatus);
router.put('/:id/cancel', cancelInvoice);

export default router;
