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
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User là bắt buộc'],
        },
        orderItems: [
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
            enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },
        paymentStatus: {
            type: String,
            enum: ['unpaid', 'paid', 'refunded'],
            default: 'unpaid',
        },
        paymentMethod: {
            type: String,
            default: 'COD',
        },
        shippingAddress: {
            address: {
                type: String,
                required: [true, 'Địa chỉ là bắt buộc'],
            },
            city: {
                type: String,
                required: [true, 'Thành phố là bắt buộc'],
            },
            phone: {
                type: String,
                required: [true, 'Số điện thoại là bắt buộc'],
            },
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0,
        },
        notes: {
            type: String,
            default: '',
        },
        deliveredAt: {
            type: Date,
        },
        paidAt: {
            type: Date,
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
    this.orderItems.forEach((item) => {
        item.subtotal = item.price * item.quantity;
    });

    // Tính tổng tiền
    this.totalAmount = this.orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    this.totalPrice = this.totalAmount; // Đồng bộ totalPrice với totalAmount

    next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
