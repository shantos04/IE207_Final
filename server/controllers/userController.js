import User from '../models/User.js';
import Customer from '../models/Customer.js';
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

        // === STEP 1: Create/Update User in Users Collection ===
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user - this triggers pre('save') middleware for password hashing
            console.log('👉 User chưa tồn tại, đang tạo mới...');
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

            user = await User.create({
                fullName: name,
                email: email,
                password: randomPassword,
                username: email.split('@')[0] + Math.random().toString(36).slice(-4),
                role: 'user',
                avatar: picture,
            });
            console.log('✅ User mới đã được tạo:', user.email);
        } else {
            // Update existing user's profile data
            console.log('👉 User đã tồn tại, đang cập nhật thông tin...');
            user.fullName = name;
            user.avatar = picture;
            await user.save();
            console.log('✅ User đã được cập nhật:', user.email);
        }

        // === STEP 2: Create/Update Customer in Customers Collection (Use Upsert) ===
        const defaultPhone = '0000000000'; // Placeholder for Google users

        let customer = await Customer.findOneAndUpdate(
            { email }, // Find by email
            {
                $set: {
                    name: name,
                    email: email,
                    address: '', // Can be updated later
                },
                $setOnInsert: {
                    phone: defaultPhone,
                    loyaltyPoints: 0,
                    status: 'active',
                },
            },
            {
                new: true,
                upsert: true,
                runValidators: false, // Skip validation for default phone
            }
        );

        console.log('✅ Customer đã được tạo/cập nhật:', customer.email);
        console.log('📋 Customer ID:', customer._id);

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

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.pageNumber) || 1;

        // Tìm kiếm đa năng: name, email, username, phone
        const keyword = req.query.keyword
            ? {
                $or: [
                    { fullName: { $regex: req.query.keyword, $options: 'i' } },
                    { email: { $regex: req.query.keyword, $options: 'i' } },
                    { username: { $regex: req.query.keyword, $options: 'i' } },
                    { phone: { $regex: req.query.keyword, $options: 'i' } },
                ],
            }
            : {};

        // --- DEBUG LOG (Xem server terminal để check) ---
        console.log('🔍 Admin đang tìm kiếm:', req.query.keyword || 'Tất cả');
        console.log('📋 Query MongoDB:', JSON.stringify(keyword));

        // Filter by role if provided
        const roleFilter = req.query.role ? { role: req.query.role } : {};

        // Combine filters
        const filter = { ...keyword, ...roleFilter };

        // Count total documents
        const count = await User.countDocuments(filter);

        // Get users with pagination
        const users = await User.find(filter)
            .select('-password') // Exclude password
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ createdAt: -1 }); // Newest first

        res.status(200).json({
            success: true,
            data: users,
            page,
            pages: Math.ceil(count / pageSize),
            total: count,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

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

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng',
            });
        }

        // Prevent deleting yourself
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa tài khoản của chính bạn',
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Đã xóa người dùng thành công',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng',
            });
        }

        const { fullName, email, role, isActive } = req.body;

        if (fullName) user.fullName = fullName;
        if (email) user.email = email;
        if (role) user.role = role;
        if (typeof isActive !== 'undefined') user.isActive = isActive;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật người dùng thành công',
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
