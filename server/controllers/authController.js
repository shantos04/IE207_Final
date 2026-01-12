import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Customer from '../models/Customer.js';

// Tạo JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
    let createdUser = null; // Track created user for manual rollback

    try {
        // ⚠️ SECURITY: ONLY extract safe fields from req.body
        // NEVER pass entire req.body to avoid privilege escalation
        const { fullName, email, password, username } = req.body;

        // Validate required fields
        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ thông tin',
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email hoặc username đã tồn tại',
            });
        }

        // Check if customer exists
        const existingCustomer = await Customer.findOne({ email: email.toLowerCase().trim() });
        if (existingCustomer) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được đăng ký',
            });
        }

        // ✅ STEP 1: Create User document (for authentication)
        // SECURITY FIX: Force 'customer' role for public registration
        // NEVER trust client-sent role - always override to 'customer'
        createdUser = await User.create({
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            password,
            username: username?.trim() || email.split('@')[0],
            role: 'customer', // ← FORCED to 'customer' for security
        });

        console.log('✅ User created:', createdUser.email);

        // ✅ STEP 2: Create Customer document (for CRM/Analytics)
        // Wrap in try-catch for manual rollback if this fails
        try {
            await Customer.create({
                name: fullName.trim(),
                email: email.toLowerCase().trim(),
                phone: '0000000000', // Default phone, can be updated later
                address: '',
                loyaltyPoints: 0, // New customer starts with 0 points
                status: 'active',
            });

            console.log('✅ Customer created:', createdUser.email);
        } catch (customerError) {
            // ❌ MANUAL ROLLBACK: Customer creation failed, delete the User
            console.error('❌ Customer creation failed, rolling back User:', customerError.message);
            
            if (createdUser && createdUser._id) {
                await User.findByIdAndDelete(createdUser._id);
                console.log('🔄 User rolled back (deleted):', createdUser._id);
            }

            throw new Error(`Không thể tạo hồ sơ khách hàng: ${customerError.message}`);
        }

        // ✅ SUCCESS: Both User and Customer created
        // Generate token
        const token = generateToken(createdUser._id);

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            data: {
                user: {
                    _id: createdUser._id,
                    username: createdUser.username,
                    email: createdUser.email,
                    fullName: createdUser.fullName,
                    role: createdUser.role,
                    avatar: createdUser.avatar,
                },
                accessToken: token,
            },
        });
    } catch (error) {
        console.error('❌ Registration Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Đăng ký thất bại',
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập email và mật khẩu',
            });
        }

        // Find user and include password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng',
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản đã bị vô hiệu hóa',
            });
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng',
            });
        }

        // Generate token
        const token = generateToken(user._id);

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
                accessToken: token,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

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

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
    try {
        // Trong thực tế, có thể lưu token vào blacklist
        res.status(200).json({
            success: true,
            message: 'Đăng xuất thành công',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
