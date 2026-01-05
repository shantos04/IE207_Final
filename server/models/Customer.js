import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Tên khách hàng là bắt buộc'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email là bắt buộc'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
        },
        phone: {
            type: String,
            required: [true, 'Số điện thoại là bắt buộc'],
            trim: true,
            match: [/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số'],
        },
        address: {
            type: String,
            default: '',
        },
        loyaltyPoints: {
            type: Number,
            default: 0,
            min: [0, 'Điểm thưởng không được âm'],
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ name: 'text' });

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
