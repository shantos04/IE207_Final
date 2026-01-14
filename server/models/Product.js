import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        productCode: {
            type: String,
            required: [true, 'Mã sản phẩm là bắt buộc'],
            unique: true,
            trim: true,
            uppercase: true,
        },
        name: {
            type: String,
            required: [true, 'Tên sản phẩm là bắt buộc'],
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        category: {
            type: String,
            required: [true, 'Danh mục là bắt buộc'],
            enum: [
                'vi-dieu-khien',
                'cam-bien',
                'module-truyen-thong',
                'linh-kien-dien-tu',
                'module-nguon',
                'bo-mach',
                'dong-co',
            ],
        },
        price: {
            type: Number,
            required: [true, 'Giá là bắt buộc'],
            min: [0, 'Giá không được âm'],
        },
        stock: {
            type: Number,
            required: [true, 'Số lượng tồn kho là bắt buộc'],
            min: [0, 'Số lượng không được âm'],
            default: 0,
        },
        status: {
            type: String,
            enum: ['in-stock', 'low-stock', 'out-of-stock'],
            default: function () {
                if (this.stock === 0) return 'out-of-stock';
                if (this.stock < 10) return 'low-stock';
                return 'in-stock';
            },
        },
        supplier: {
            type: String,
            default: '',
        },
        specifications: {
            type: Map,
            of: String,
            default: {},
        },
        imageUrl: {
            type: String,
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index để tìm kiếm nhanh hơn
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, status: 1 });

// Middleware để tự động cập nhật status khi stock thay đổi
productSchema.pre('save', function (next) {
    if (this.isModified('stock')) {
        if (this.stock === 0) {
            this.status = 'out-of-stock';
        } else if (this.stock < 10) {
            this.status = 'low-stock';
        } else {
            this.status = 'in-stock';
        }
    }
    next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
