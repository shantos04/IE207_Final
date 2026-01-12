import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username là bắt buộc'],
            unique: true,
            trim: true,
            minlength: [3, 'Username phải có ít nhất 3 ký tự'],
        },
        email: {
            type: String,
            required: [true, 'Email là bắt buộc'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
        },
        password: {
            type: String,
            required: [true, 'Password là bắt buộc'],
            minlength: [6, 'Password phải có ít nhất 6 ký tự'],
            select: false, // Không trả về password khi query
        },
        fullName: {
            type: String,
            required: [true, 'Họ tên là bắt buộc'],
            trim: true,
        },
        role: {
            type: String,
            enum: ['admin', 'manager', 'staff', 'customer'],
            default: 'customer', // ✅ SECURITY: Default to 'customer' for public registrations
        },
        avatar: {
            type: String,
            default: '',
        },
        phone: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        addresses: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true, // Tự động thêm createdAt và updatedAt
    }
);

// Hash password trước khi lưu
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method để so sánh password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method để loại bỏ password khi trả về JSON
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
