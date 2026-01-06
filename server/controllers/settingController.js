import Setting from '../models/Setting.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// @desc    Lấy thông tin cấu hình hệ thống
// @route   GET /api/settings
// @access  Public (hoặc Protected tùy yêu cầu)
export const getSettings = async (req, res) => {
    try {
        const settings = await Setting.getInstance();

        res.status(200).json({
            success: true,
            data: settings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin cấu hình',
            error: error.message,
        });
    }
};

// @desc    Cập nhật thông tin cấu hình hệ thống
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
    try {
        const {
            companyName,
            logoUrl,
            taxCode,
            address,
            phone,
            email,
            currency,
        } = req.body;

        const settings = await Setting.getInstance();

        // Cập nhật các trường được gửi lên
        if (companyName !== undefined) settings.companyName = companyName;
        if (logoUrl !== undefined) settings.logoUrl = logoUrl;
        if (taxCode !== undefined) settings.taxCode = taxCode;
        if (address !== undefined) settings.address = address;
        if (phone !== undefined) settings.phone = phone;
        if (email !== undefined) settings.email = email;
        if (currency !== undefined) settings.currency = currency;

        await settings.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật cấu hình thành công',
            data: settings,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Lỗi khi cập nhật cấu hình',
            error: error.message,
        });
    }
};

// @desc    Cập nhật thông tin cá nhân user
// @route   PUT /api/settings/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const { fullName, avatar, phone } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Người dùng không tồn tại',
            });
        }

        // Cập nhật các trường được phép
        if (fullName !== undefined) user.fullName = fullName;
        if (avatar !== undefined) user.avatar = avatar;
        if (phone !== undefined) user.phone = phone;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin cá nhân thành công',
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                avatar: user.avatar,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Lỗi khi cập nhật thông tin cá nhân',
            error: error.message,
        });
    }
};

// @desc    Đổi mật khẩu
// @route   PUT /api/settings/change-password
// @access  Private
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin',
            });
        }

        // Check if new password matches confirm password
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới và xác nhận mật khẩu không khớp',
            });
        }

        // Validate new password length
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
            });
        }

        // Get user with password field
        const user = await User.findById(userId).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Người dùng không tồn tại',
            });
        }

        // Check if current password is correct
        const isPasswordCorrect = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng',
            });
        }

        // Check if new password is same as current password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới không được trùng với mật khẩu cũ',
            });
        }

        // Hash new password and save
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Đổi mật khẩu thành công',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi đổi mật khẩu',
            error: error.message,
        });
    }
};
