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
        description: 'Vi điều khiển Arduino Uno R3 chính hãng với chip ATmega328P',
        category: 'vi-dieu-khien',
        price: 250000,
        stock: 50,
        supplier: 'Arduino Official',
        specifications: {
            Voltage: '5V',
            Current: '50mA',
            DigitalIO: '14 pins',
            AnalogInput: '6 pins',
            FlashMemory: '32KB',
        },
        imageUrl: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400',
    },
    {
        productCode: 'ESP32-DEVKIT',
        name: 'ESP32 DevKit V1',
        description: 'Module wifi bluetooth ESP32 với khả năng kết nối IoT mạnh mẽ',
        category: 'module-truyen-thong',
        price: 150000,
        stock: 75,
        supplier: 'Espressif',
        specifications: {
            Voltage: '3.3V',
            WiFi: '802.11 b/g/n',
            Bluetooth: '4.2 BLE',
            GPIO: '36 pins',
            Clock: '240MHz',
        },
        imageUrl: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400',
    },
    {
        productCode: 'RPI-4-4GB',
        name: 'Raspberry Pi 4 Model B 4GB',
        description: 'Máy tính nhúng Raspberry Pi 4 với 4GB RAM, hiệu năng mạnh mẽ',
        category: 'vi-dieu-khien',
        price: 1200000,
        stock: 30,
        supplier: 'Raspberry Pi Foundation',
        specifications: {
            CPU: 'Quad-core ARM Cortex-A72',
            RAM: '4GB LPDDR4',
            USB: '2x USB 3.0, 2x USB 2.0',
            Network: 'Gigabit Ethernet',
            Video: '2x micro-HDMI',
        },
        imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400',
    },
    {
        productCode: 'DHT22',
        name: 'Cảm biến nhiệt độ độ ẩm DHT22',
        description: 'Cảm biến đo nhiệt độ và độ ẩm chính xác cao, phù hợp cho dự án IoT',
        category: 'cam-bien',
        price: 80000,
        stock: 8,
        supplier: 'Adafruit',
        specifications: {
            Temperature: '-40 to 80°C',
            Humidity: '0-100% RH',
            Accuracy: '±0.5°C, ±2% RH',
            Power: '3-5V DC',
            PinCount: '4 pins',
        },
        imageUrl: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=400',
    },
    {
        productCode: 'RELAY-4CH',
        name: 'Module Relay 4 kênh 5V',
        description: 'Module relay 4 kênh điều khiển tải mạnh, hỗ trợ 220V AC',
        category: 'linh-kien-dien-tu',
        price: 120000,
        stock: 60,
        supplier: 'Generic',
        specifications: {
            Voltage: '5V DC',
            Channels: '4',
            MaxLoad: '10A 250V AC',
            Control: 'Active Low',
            Optocoupler: 'Yes',
        },
        imageUrl: 'https://images.unsplash.com/photo-1517430816045-df4b7de01c0d?w=400',
    },
    {
        productCode: 'SERVO-MG996R',
        name: 'Servo Motor MG996R',
        description: 'Động cơ servo tốc độ cao với mô-men xoắn lớn 11kg.cm',
        category: 'dong-co',
        price: 95000,
        stock: 45,
        supplier: 'TowerPro',
        specifications: {
            Voltage: '4.8-7.2V',
            Torque: '11kg.cm at 6V',
            Speed: '0.17s/60° at 6V',
            Weight: '55g',
            Angle: '180°',
        },
        imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400',
    },
    {
        productCode: 'LCD-1602',
        name: 'LCD 1602 I2C',
        description: 'Màn hình LCD 16x2 ký tự với module I2C dễ dàng kết nối',
        category: 'linh-kien-dien-tu',
        price: 65000,
        stock: 1,
        supplier: 'Generic',
        specifications: {
            Display: '16x2 characters',
            Backlight: 'Blue',
            Interface: 'I2C',
            Voltage: '5V',
            Address: '0x27 or 0x3F',
        },
        imageUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400',
    },
    {
        productCode: 'OLED-096',
        name: 'OLED 0.96 inch I2C',
        description: 'Màn hình OLED 0.96 inch độ phân giải 128x64, tiết kiệm năng lượng',
        category: 'linh-kien-dien-tu',
        price: 85000,
        stock: 40,
        supplier: 'Generic',
        specifications: {
            Size: '0.96 inch',
            Resolution: '128x64',
            Color: 'White/Blue',
            Interface: 'I2C',
            Voltage: '3.3-5V',
        },
        imageUrl: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=400',
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
