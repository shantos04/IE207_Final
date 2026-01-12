import Setting from '../models/Setting.js';
import User from '../models/User.js';

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

        console.log('🔐 Change Password Request:', {
            userId,
            hasCurrentPassword: !!currentPassword,
            hasNewPassword: !!newPassword,
            hasConfirmPassword: !!confirmPassword,
        });

        // 1. Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            console.log('❌ Missing fields');
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin',
            });
        }

        // 2. Check if new password matches confirm password
        if (newPassword !== confirmPassword) {
            console.log('❌ Password mismatch');
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới và xác nhận mật khẩu không khớp',
            });
        }

        // 3. Validate new password length
        if (newPassword.length < 6) {
            console.log('❌ Password too short');
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
            });
        }

        // 4. Fetch user with password field (password has select: false in schema)
        const user = await User.findById(userId).select('+password');

        if (!user) {
            console.log('❌ User not found:', userId);
            return res.status(404).json({
                success: false,
                message: 'Người dùng không tồn tại',
            });
        }

        console.log('✅ User found:', user.email);
        console.log('📋 Has password field:', !!user.password);

        // 5. ✅ CRITICAL: Verify current password
        if (!user.password) {
            console.log('❌ CRITICAL: Password field is empty!');
            return res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống: không thể lấy mật khẩu hiện tại',
            });
        }

        const isPasswordCorrect = await user.comparePassword(currentPassword);
        console.log('🔍 Current password verification:', isPasswordCorrect);

        if (!isPasswordCorrect) {
            console.log('❌ WRONG current password for user:', user.email);
            // ✅ FIX: Use 400 instead of 401 to prevent auto-logout
            // 401 triggers axios interceptor logout, but this is just wrong password
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng',
            });
        }

        console.log('✅ Current password verified');

        // 6. Check if new password is same as current password (optional but good UX)
        const isSamePassword = await user.comparePassword(newPassword);
        if (isSamePassword) {
            console.log('❌ New password same as old');
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới không được trùng với mật khẩu cũ',
            });
        }

        // 7. ✅ Update password - pre('save') hook will hash it automatically
        console.log('🔄 Updating password...');
        user.password = newPassword;
        await user.save(); // This triggers the pre('save') hook in User model

        console.log('✅ Password changed successfully for user:', user.email);

        res.status(200).json({
            success: true,
            message: 'Đổi mật khẩu thành công',
        });
    } catch (error) {
        console.error('❌ Error changing password:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi đổi mật khẩu',
            error: error.message,
        });
    }
};
