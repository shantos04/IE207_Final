import Setting from '../models/Setting.js';
import connectDB from '../config/database.js';

const seedSettings = async () => {
    try {
        await connectDB();

        // Check if settings already exist
        const existingSettings = await Setting.findOne();

        if (existingSettings) {
            console.log('⚠️  Settings đã tồn tại, bỏ qua seed...');
            console.log('Current settings:', existingSettings);
            process.exit(0);
        }

        // Create default settings
        const settings = await Setting.create({
            companyName: 'Công ty TNHH CraftUI',
            logoUrl: 'https://via.placeholder.com/200x80?text=CraftUI+Logo',
            taxCode: '0123456789',
            address: '123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh',
            phone: '0901234567',
            email: 'contact@craftui.com',
            currency: 'VND',
        });

        console.log('✅ Settings đã được khởi tạo thành công!');
        console.log('Settings:', settings);

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi khi seed settings:', error.message);
        process.exit(1);
    }
};

seedSettings();
