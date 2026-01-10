import express from 'express';
import { getUserProfile, updateUserProfile, googleLogin } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/google-login', googleLogin);

// Protected routes - require authentication
router
    .route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

export default router;
