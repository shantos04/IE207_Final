import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: [true, 'Tên công ty là bắt buộc'],
            trim: true,
            default: 'Công ty TNHH ABC',
        },
        logoUrl: {
            type: String,
            trim: true,
            default: '',
        },
        taxCode: {
            type: String,
            trim: true,
            default: '',
            maxlength: [20, 'Mã số thuế không được quá 20 ký tự'],
        },
        address: {
            type: String,
            trim: true,
            default: '',
        },
        phone: {
            type: String,
            trim: true,
            default: '',
            match: [/^[0-9\s\-\+\(\)]*$/, 'Số điện thoại không hợp lệ'],
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: '',
            match: [/^\S+@\S+\.\S+$|^$/, 'Email không hợp lệ'],
        },
        currency: {
            type: String,
            enum: ['VND', 'USD', 'EUR'],
            default: 'VND',
        },
        // Meta fields để đảm bảo singleton
        isSingleton: {
            type: Boolean,
            default: true,
            immutable: true,
        },
    },
    {
        timestamps: true,
        collection: 'settings',
    }
);

// Đảm bảo chỉ có 1 document duy nhất (Singleton pattern)
settingSchema.pre('save', async function (next) {
    if (this.isNew) {
        const count = await mongoose.models.Setting.countDocuments();
        if (count > 0) {
            throw new Error('Chỉ được phép tồn tại một bản ghi cấu hình hệ thống');
        }
    }
    next();
});

// Static method để lấy hoặc tạo settings (Singleton)
settingSchema.statics.getInstance = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

const Setting = mongoose.model('Setting', settingSchema);

export default Setting;
