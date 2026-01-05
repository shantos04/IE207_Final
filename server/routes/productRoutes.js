import express from 'express';
import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router
    .route('/')
    .get(getProducts)
    .post(authorize('admin', 'manager'), createProduct);

router
    .route('/:id')
    .get(getProduct)
    .put(authorize('admin', 'manager'), updateProduct)
    .delete(authorize('admin'), deleteProduct);

export default router;
