import User from '../models/User.js';
import bcrypt from 'bcryptjs';

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
