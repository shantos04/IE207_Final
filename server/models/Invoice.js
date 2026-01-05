import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
    {
        invoiceNumber: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: [true, 'Order là bắt buộc'],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User là bắt buộc'],
        },
        issueDate: {
            type: Date,
            default: Date.now,
        },
        dueDate: {
            type: Date,
            required: [true, 'Hạn thanh toán là bắt buộc'],
        },
        totalAmount: {
            type: Number,
            required: true,
            min: [0, 'Tổng tiền không được âm'],
        },
        status: {
            type: String,
            enum: ['Unpaid', 'Paid', 'Overdue', 'Cancelled'],
            default: 'Unpaid',
        },
        paymentMethod: {
            type: String,
            default: 'COD',
        },
        notes: {
            type: String,
            default: '',
        },
        paidAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ order: 1 });
invoiceSchema.index({ status: 1, createdAt: -1 });

// Tự động tạo invoiceNumber trước khi lưu
invoiceSchema.pre('save', async function (next) {
    if (!this.invoiceNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');

        // Đếm số invoice trong tháng này
        const count = await mongoose.model('Invoice').countDocuments({
            createdAt: {
                $gte: new Date(year, date.getMonth(), 1),
                $lt: new Date(year, date.getMonth() + 1, 1),
            },
        });

        this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

// Tự động cập nhật status thành Overdue nếu quá hạn
invoiceSchema.pre('find', function () {
    const now = new Date();
    this.model.updateMany(
        {
            status: 'Unpaid',
            dueDate: { $lt: now },
        },
        {
            status: 'Overdue',
        }
    );
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
