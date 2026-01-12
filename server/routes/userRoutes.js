import express from 'express';
import {
    getUserProfile,
    updateUserProfile,
    uploadUserAvatar,
    googleLogin,
    getUsers,
    getUserById,
    deleteUser,
    updateUser,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';
import { uploadAvatar } from '../config/multer.js';

const router = express.Router();

// Public routes
router.post('/google-login', googleLogin);

// Protected routes - require authentication
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.put('/profile/avatar', protect, uploadAvatar.single('avatar'), uploadUserAvatar);

// Admin routes - require admin role
router.route('/').get(protect, admin, getUsers);
router.route('/:id').get(protect, admin, getUserById).put(protect, admin, updateUser).delete(protect, admin, deleteUser);

export default router;

