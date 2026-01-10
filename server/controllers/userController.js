import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    });
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const { fullName, phone, address, avatar, password, currentPassword } = req.body;

        // Find user
        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng',
            });
        }

        // Update basic fields
        if (fullName) user.fullName = fullName;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (avatar) user.avatar = avatar;

        // Update password if provided
        if (password) {
            // Verify current password if provided
            if (currentPassword) {
                const isPasswordMatch = await user.comparePassword(currentPassword);
                if (!isPasswordMatch) {
                    return res.status(400).json({
                        success: false,
                        message: 'Mật khẩu hiện tại không đúng',
                    });
                }
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        // Return user without password
        const updatedUser = await User.findById(user._id);

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin thành công',
            data: updatedUser,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng',
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Google Login
// @route   POST /api/users/google-login
// @access  Public
export const googleLogin = async (req, res) => {
    console.log('-----------------------------------------');
    console.log('👉 Đang xử lý Google Login...');
    console.log('👉 Client ID Backend:', process.env.GOOGLE_CLIENT_ID);

    try {
        const { idToken } = req.body;

        if (!idToken) {
            console.log('❌ Không có idToken trong request');
            return res.status(400).json({
                success: false,
                message: 'Token không được cung cấp',
            });
        }

        console.log('👉 idToken nhận được (first 50 chars):', idToken.substring(0, 50) + '...');

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { name, email, picture } = payload;

        console.log('✅ Google Verify thành công!');
        console.log('👉 Email:', email);
        console.log('👉 Name:', name);

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email không hợp lệ từ Google',
            });
        }

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            console.log('👉 User chưa tồn tại, đang tạo mới...');
            // Create new user with random password
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

            user = await User.create({
                fullName: name,
                email: email,
                password: randomPassword,
                username: email.split('@')[0] + Math.random().toString(36).slice(-4),
                role: 'customer', // Default role for Google login users (customer, not user)
                avatar: picture,
            });
            console.log('✅ User mới đã được tạo:', user.email);
        } else {
            console.log('✅ User đã tồn tại:', user.email);
        }

        // Generate JWT token
        const token = generateToken(user._id);

        console.log('✅ JWT Token đã được tạo');
        console.log('👉 Response data:', { email: user.email, role: user.role });
        console.log('-----------------------------------------');

        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    avatar: user.avatar,
                },
                token,
            },
        });
    } catch (error) {
        console.error('❌ LỖI GOOGLE VERIFY:', error.message);
        console.error('❌ Chi tiết lỗi:', error);
        console.log('-----------------------------------------');

        res.status(400).json({
            success: false,
            message: 'Google Token không hợp lệ hoặc đã hết hạn',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
};
