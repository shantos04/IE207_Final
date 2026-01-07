import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ie207_erp');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

// Seed Users
const seedUsers = async () => {
    try {
        console.log('\n🌱 Starting User Seeding Process...\n');

        // Customer account for storefront testing
        const customerEmail = 'khachhang@craftui.com';
        const existingCustomer = await User.findOne({ email: customerEmail });

        if (existingCustomer) {
            console.log('⚠️  User đã tồn tại: khachhang@craftui.com');
        } else {
            // Password will be hashed automatically by pre-save hook
            const customerUser = new User({
                username: 'khachhang',
                email: customerEmail,
                password: '123456',
                fullName: 'Khách Hàng Demo',
                role: 'customer',
                phone: '0909123456',
                isActive: true,
            });

            await customerUser.save();
            console.log('✅ Đã tạo User Khách hàng thành công:');
            console.log('   📧 Email: khachhang@craftui.com');
            console.log('   🔑 Password: 123456');
            console.log('   👤 Role: customer');
            console.log('   📱 Phone: 0909123456\n');
        }

        // Optional: Create additional test users
        const adminEmail = 'admin@craftui.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            // Password will be hashed automatically by pre-save hook
            const adminUser = new User({
                username: 'admin',
                email: adminEmail,
                password: '123456',
                fullName: 'Admin CraftUI',
                role: 'admin',
                phone: '0901234567',
                isActive: true,
            });

            await adminUser.save();
            console.log('✅ Đã tạo User Admin thành công:');
            console.log('   📧 Email: admin@craftui.com');
            console.log('   🔑 Password: 123456');
            console.log('   👤 Role: admin');
            console.log('   📱 Phone: 0901234567\n');
        } else {
            console.log('⚠️  User đã tồn tại: admin@craftui.com\n');
        }

        console.log('✅ User seeding completed successfully!\n');
        console.log('📋 Summary:');
        const totalUsers = await User.countDocuments();
        const customers = await User.countDocuments({ role: 'customer' });
        const admins = await User.countDocuments({ role: 'admin' });
        const staff = await User.countDocuments({ role: 'staff' });
        const managers = await User.countDocuments({ role: 'manager' });

        console.log(`   Total Users: ${totalUsers}`);
        console.log(`   - Customers: ${customers}`);
        console.log(`   - Admins: ${admins}`);
        console.log(`   - Managers: ${managers}`);
        console.log(`   - Staff: ${staff}\n`);

    } catch (error) {
        console.error('❌ Error seeding users:', error);
        throw error;
    }
};

// Main execution
const main = async () => {
    try {
        await connectDB();
        await seedUsers();

        console.log('✨ All done! Disconnecting from database...\n');
        await mongoose.connection.close();
        console.log('👋 Database connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
};

// Run the script
main();
