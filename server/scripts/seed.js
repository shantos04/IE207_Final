import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

// Sample data
const users = [
    {
        username: 'admin',
        email: 'admin@craftui.com',
        password: 'admin123',
        fullName: 'Admin User',
        role: 'admin',
    },
    {
        username: 'manager',
        email: 'manager@craftui.com',
        password: 'manager123',
        fullName: 'Manager User',
        role: 'manager',
    },
    {
        username: 'staff',
        email: 'staff@craftui.com',
        password: 'staff123',
        fullName: 'Staff User',
        role: 'staff',
    },
];

const products = [
    {
        productCode: 'ARD-UNO-R3',
        name: 'Arduino Uno R3',
        description: 'Vi điều khiển Arduino Uno R3 chính hãng',
        category: 'vi-dieu-khien',
        price: 250000,
        stock: 50,
        supplier: 'Arduino Official',
    },
    {
        productCode: 'RPI-4-4GB',
        name: 'Raspberry Pi 4 Model B 4GB',
        description: 'Máy tính nhúng Raspberry Pi 4 với 4GB RAM',
        category: 'vi-dieu-khien',
        price: 1200000,
        stock: 30,
        supplier: 'Raspberry Pi Foundation',
    },
    {
        productCode: 'DHT22',
        name: 'Cảm biến nhiệt độ độ ẩm DHT22',
        description: 'Cảm biến đo nhiệt độ và độ ẩm chính xác cao',
        category: 'cam-bien',
        price: 80000,
        stock: 100,
        supplier: 'Adafruit',
    },
    {
        productCode: 'ESP32-DEVKIT',
        name: 'ESP32 DevKit V1',
        description: 'Module wifi bluetooth ESP32',
        category: 'module-truyen-thong',
        price: 150000,
        stock: 75,
        supplier: 'Espressif',
    },
    {
        productCode: 'RELAY-4CH',
        name: 'Module Relay 4 kênh 5V',
        description: 'Module relay 4 kênh điều khiển tải mạnh',
        category: 'module-truyen-thong',
        price: 120000,
        stock: 60,
        supplier: 'Generic',
    },
];

// Import data
const importData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany();
        await Product.deleteMany();
        await Order.deleteMany();

        console.log('🗑️  Đã xóa dữ liệu cũ');

        // Insert new data
        const createdUsers = await User.insertMany(users);
        const createdProducts = await Product.insertMany(products);

        console.log('✅ Đã import users:', createdUsers.length);
        console.log('✅ Đã import products:', createdProducts.length);

        console.log('\n📝 Thông tin đăng nhập:');
        console.log('Admin: admin@craftui.com / admin123');
        console.log('Manager: manager@craftui.com / manager123');
        console.log('Staff: staff@craftui.com / staff123');

        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

// Destroy data
const destroyData = async () => {
    try {
        await connectDB();

        await User.deleteMany();
        await Product.deleteMany();
        await Order.deleteMany();

        console.log('🗑️  Đã xóa tất cả dữ liệu');

        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

// Run script based on argument
if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
