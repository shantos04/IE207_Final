import express from 'express';
import {
    getSettings,
    updateSettings,
    updateUserProfile,
    changePassword,
} from '../controllers/settingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public/Protected routes
router.get('/', getSettings);

// Admin only routes
router.put('/', protect, authorize('admin'), updateSettings);

// User profile routes (Authenticated users)
router.put('/profile', protect, updateUserProfile);
router.put('/change-password', protect, changePassword);

export default router;
