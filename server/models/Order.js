import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        orderCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
        },
        customer: {
            name: {
                type: String,
                required: [true, 'Tên khách hàng là bắt buộc'],
            },
            email: {
                type: String,
                required: [true, 'Email khách hàng là bắt buộc'],
                match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
            },
            phone: {
                type: String,
                required: [true, 'Số điện thoại là bắt buộc'],
            },
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                productName: {
                    type: String,
                    required: true,
                },
                productCode: {
                    type: String,
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: [1, 'Số lượng phải lớn hơn 0'],
                },
                price: {
                    type: Number,
                    required: true,
                    min: [0, 'Giá không được âm'],
                },
                subtotal: {
                    type: Number,
                    required: true,
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: [0, 'Tổng tiền không được âm'],
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
        },
        paymentStatus: {
            type: String,
            enum: ['unpaid', 'paid', 'refunded'],
            default: 'unpaid',
        },
        paymentMethod: {
            type: String,
            enum: ['cash', 'bank-transfer', 'credit-card', 'e-wallet'],
            default: 'cash',
        },
        shippingAddress: {
            type: String,
            required: [true, 'Địa chỉ giao hàng là bắt buộc'],
        },
        notes: {
            type: String,
            default: '',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Index
orderSchema.index({ orderCode: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'customer.email': 1 });

// Tự động tạo orderCode trước khi lưu
orderSchema.pre('save', async function (next) {
    if (!this.orderCode) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');

        // Đếm số order trong tháng này
        const count = await mongoose.model('Order').countDocuments({
            createdAt: {
                $gte: new Date(year, date.getMonth(), 1),
                $lt: new Date(year, date.getMonth() + 1, 1),
            },
        });

        this.orderCode = `ORD-${year}${month}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

// Tính subtotal cho từng item trước khi lưu
orderSchema.pre('save', function (next) {
    this.items.forEach((item) => {
        item.subtotal = item.price * item.quantity;
    });

    // Tính tổng tiền
    this.totalAmount = this.items.reduce((sum, item) => sum + item.subtotal, 0);

    next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
