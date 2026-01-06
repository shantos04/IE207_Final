import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import Invoice from '../models/Invoice.js';
import Setting from '../models/Setting.js';
import connectDB from '../config/database.js';

dotenv.config();

// ==================== HELPER FUNCTIONS ====================

// Random date trong 90 ngày gần đây
const randomDateInLast3Months = () => {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 90); // 0-89 ngày
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Random giờ từ 8h sáng đến 22h đêm (peak hours)
    const hour = 8 + Math.floor(Math.random() * 14); // 8-21
    const minute = Math.floor(Math.random() * 60);

    date.setHours(hour, minute, 0, 0);
    return date;
};

// Random element từ array
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Random số trong khoảng
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Random tên tiếng Việt
const vietnameseLastNames = [
    'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi',
    'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Cao', 'Huỳnh', 'Mai', 'Tô'
];

const vietnameseMiddleNames = [
    'Văn', 'Thị', 'Hữu', 'Đức', 'Minh', 'Quang', 'Thành', 'Thanh', 'Anh', 'Hồng'
];

const vietnameseFirstNames = [
    'An', 'Bình', 'Cường', 'Dũng', 'Hùng', 'Khang', 'Long', 'Nam', 'Phong', 'Quân',
    'Hà', 'Lan', 'Mai', 'Ngọc', 'Phương', 'Thảo', 'Trang', 'Vy', 'Yến', 'Linh'
];

const randomVietnameseName = () => {
    const lastName = randomElement(vietnameseLastNames);
    const middleName = randomElement(vietnameseMiddleNames);
    const firstName = randomElement(vietnameseFirstNames);
    return `${lastName} ${middleName} ${firstName}`;
};

// Random phone
const randomPhone = () => {
    const prefix = randomElement(['090', '091', '098', '097', '096', '086', '032', '033', '034', '035']);
    const suffix = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    return prefix + suffix;
};

// Random địa chỉ VN
const vietnameseCities = [
    'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'Biên Hòa', 'Nha Trang', 'Huế', 'Vũng Tàu', 'Buôn Ma Thuột'
];

const randomAddress = () => {
    const street = `${randomInt(1, 999)} ${randomElement(['Nguyễn Văn Linh', 'Lê Lợi', 'Trần Hưng Đạo', 'Hai Bà Trưng', 'Võ Văn Kiệt'])}`;
    const district = `Quận ${randomInt(1, 12)}`;
    const city = randomElement(vietnameseCities);
    return `${street}, ${district}, ${city}`;
};

// Generate order code
const generateOrderCode = (index) => {
    return `ORD${String(index).padStart(6, '0')}`;
};

// Generate invoice number
const generateInvoiceNumber = (index) => {
    return `INV${String(index).padStart(6, '0')}`;
};

// ==================== SEEDING FUNCTIONS ====================

const seedMasterData = async () => {
    try {
        console.log('\n🚀 MASTER SEEDING STARTED...\n');

        await connectDB();

        // ============= 1. CLEAN DATABASE =============
        console.log('🧹 Cleaning database...');
        await User.deleteMany({});
        await Product.deleteMany({});
        await Customer.deleteMany({});
        await Order.deleteMany({});
        await Invoice.deleteMany({});
        await Setting.deleteMany({});
        console.log('✅ Database cleaned!\n');

        // ============= 2. CREATE ADMIN USER =============
        console.log('👤 Creating admin user...');
        const adminUser = await User.create({
            username: 'admin',
            email: 'admin@craftui.com',
            password: '123456', // Will be hashed by pre-save hook
            fullName: 'Admin CraftUI',
            role: 'admin',
            avatar: '',
            phone: '0901234567',
        });
        console.log(`✅ Admin created: ${adminUser.email} / 123456\n`);

        // ============= 3. CREATE PRODUCTS =============
        console.log('📦 Creating 50 products...');

        const categories = [
            'vi-dieu-khien',
            'cam-bien',
            'dong-co',
            'module-truyen-thong',
            'linh-kien-dien-tu',
        ];

        const productNames = {
            'vi-dieu-khien': [
                'Arduino Uno R3', 'Arduino Mega 2560', 'Arduino Nano', 'ESP32 DevKit',
                'ESP8266 NodeMCU', 'Raspberry Pi 4', 'STM32F103C8T6', 'ATmega328P'
            ],
            'cam-bien': [
                'Cảm biến nhiệt độ DHT11', 'Cảm biến DHT22', 'Cảm biến DS18B20',
                'Cảm biến siêu âm HC-SR04', 'Cảm biến PIR', 'Cảm biến ánh sáng',
                'Cảm biến MQ-2', 'Cảm biến độ ẩm đất'
            ],
            'dong-co': [
                'Động cơ DC 12V', 'Động cơ Servo SG90', 'Động cơ bước 28BYJ-48',
                'Driver L298N', 'Driver A4988', 'Động cơ giảm tốc'
            ],
            'module-truyen-thong': [
                'Module Bluetooth HC-05', 'Module NRF24L01', 'Module SIM800L',
                'Module GPS NEO-6M', 'Module LoRa', 'Module WiFi ESP-01'
            ],
            'linh-kien-dien-tu': [
                'LED 5mm', 'Điện trở 1K', 'Tụ điện 100uF', 'Transistor 2N2222',
                'IC 74HC595', 'Breadboard 830', 'Jumper Wire', 'Pin 9V'
            ],
        };

        const products = [];
        let productIndex = 1;

        for (let i = 0; i < 50; i++) {
            const category = randomElement(categories);
            const categoryProducts = productNames[category];
            const baseName = randomElement(categoryProducts);
            const name = i % 3 === 0 ? `${baseName} (Ver ${randomInt(1, 5)})` : baseName;

            const price = randomInt(5, 500) * 1000; // 5k - 500k
            const stock = randomInt(0, 200);

            const product = await Product.create({
                productCode: `PROD${String(productIndex).padStart(4, '0')}`,
                name,
                description: `${name} - Linh kiện điện tử chất lượng cao`,
                category,
                price,
                stock,
                supplier: randomElement(['Việt Á', 'Điện Tử Xanh', 'IC Việt', 'Linh Kiện 247']),
                imageUrl: '',
                isActive: true,
            });

            products.push(product);
            productIndex++;
        }
        console.log(`✅ Created ${products.length} products!\n`);

        // ============= 4. CREATE CUSTOMERS =============
        console.log('👥 Creating 50 customers...');

        const customers = [];
        for (let i = 0; i < 50; i++) {
            const name = randomVietnameseName();
            const email = `customer${i + 1}@example.com`;
            const phone = randomPhone();
            const address = randomAddress();

            const customer = await Customer.create({
                name,
                email,
                phone,
                address,
                loyaltyPoints: randomInt(0, 1000),
                status: 'active',
            });

            customers.push(customer);
        }
        console.log(`✅ Created ${customers.length} customers!\n`);

        // ============= 5. CREATE ORDERS (500 orders in 3 months) =============
        console.log('📋 Creating 500 orders for last 3 months...');

        const orderStatuses = [
            { status: 'Delivered', weight: 70 },      // 70% completed
            { status: 'Cancelled', weight: 10 },      // 10% cancelled
            { status: 'Pending', weight: 10 },        // 10% pending
            { status: 'Confirmed', weight: 5 },       // 5% confirmed
            { status: 'Shipped', weight: 5 },         // 5% shipped
        ];

        const getRandomStatus = () => {
            const rand = Math.random() * 100;
            let cumulative = 0;
            for (const { status, weight } of orderStatuses) {
                cumulative += weight;
                if (rand <= cumulative) return status;
            }
            return 'Pending';
        };

        const orders = [];
        let completedOrders = [];

        for (let i = 0; i < 500; i++) {
            const createdAt = randomDateInLast3Months();
            const status = getRandomStatus();
            const customer = randomElement(customers);

            // Random chọn 1-5 sản phẩm
            const numItems = randomInt(1, 5);
            const selectedProducts = [];
            for (let j = 0; j < numItems; j++) {
                const product = randomElement(products);
                if (!selectedProducts.find(p => p._id.equals(product._id))) {
                    selectedProducts.push(product);
                }
            }

            const orderItems = selectedProducts.map(product => {
                const quantity = randomInt(1, 10);
                const subtotal = product.price * quantity;
                return {
                    product: product._id,
                    productName: product.name,
                    productCode: product.productCode,
                    quantity,
                    price: product.price,
                    subtotal,
                };
            });

            const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

            const paymentStatus = status === 'Delivered' ? 'paid' :
                status === 'Cancelled' ? 'refunded' : 'unpaid';

            const order = await Order.create({
                orderCode: generateOrderCode(i + 1),
                customer: {
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                },
                user: adminUser._id,
                orderItems,
                totalAmount,
                status,
                paymentStatus,
                paymentMethod: randomElement(['COD', 'Bank Transfer', 'Credit Card']),
                shippingAddress: customer.address,
                shippingFee: randomInt(0, 50) * 1000,
                discount: 0,
                notes: '',
                createdAt,
                updatedAt: createdAt,
            });

            orders.push(order);

            if (status === 'Delivered') {
                completedOrders.push({ order, createdAt });
            }

            // Log progress every 100 orders
            if ((i + 1) % 100 === 0) {
                console.log(`   Created ${i + 1}/500 orders...`);
            }
        }
        console.log(`✅ Created ${orders.length} orders!\n`);

        // ============= 6. CREATE INVOICES FOR COMPLETED ORDERS =============
        console.log(`💰 Creating invoices for ${completedOrders.length} completed orders...`);

        const invoices = [];
        for (let i = 0; i < completedOrders.length; i++) {
            const { order, createdAt } = completedOrders[i];

            const dueDate = new Date(createdAt);
            dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days

            const invoice = await Invoice.create({
                invoiceNumber: generateInvoiceNumber(i + 1),
                order: order._id,
                user: adminUser._id,
                issueDate: createdAt,
                dueDate,
                totalAmount: order.totalAmount,
                status: 'Paid',
                paymentMethod: order.paymentMethod,
                notes: `Hóa đơn cho đơn hàng ${order.orderCode}`,
                paidAt: createdAt,
                createdAt,
                updatedAt: createdAt,
            });

            invoices.push(invoice);
        }
        console.log(`✅ Created ${invoices.length} invoices!\n`);

        // ============= 7. CREATE SYSTEM SETTINGS =============
        console.log('⚙️  Creating system settings...');
        await Setting.create({
            companyName: 'Công ty TNHH CraftUI',
            logoUrl: 'https://via.placeholder.com/200x80?text=CraftUI',
            taxCode: '0123456789',
            address: '123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh',
            phone: '0901234567',
            email: 'contact@craftui.com',
            currency: 'VND',
        });
        console.log('✅ System settings created!\n');

        // ============= SUMMARY =============
        console.log('📊 SEEDING SUMMARY:');
        console.log('==========================================');
        console.log(`👤 Users:         ${await User.countDocuments()}`);
        console.log(`📦 Products:      ${await Product.countDocuments()}`);
        console.log(`👥 Customers:     ${await Customer.countDocuments()}`);
        console.log(`📋 Orders:        ${await Order.countDocuments()}`);
        console.log(`   - Delivered:   ${await Order.countDocuments({ status: 'Delivered' })}`);
        console.log(`   - Cancelled:   ${await Order.countDocuments({ status: 'Cancelled' })}`);
        console.log(`   - Pending:     ${await Order.countDocuments({ status: 'Pending' })}`);
        console.log(`   - Others:      ${await Order.countDocuments({ status: { $nin: ['Delivered', 'Cancelled', 'Pending'] } })}`);
        console.log(`💰 Invoices:      ${await Invoice.countDocuments()}`);
        console.log(`⚙️  Settings:      ${await Setting.countDocuments()}`);
        console.log('==========================================');

        const totalRevenue = orders
            .filter(o => o.status === 'Delivered')
            .reduce((sum, o) => sum + o.totalAmount, 0);
        console.log(`💵 Total Revenue: ${totalRevenue.toLocaleString('vi-VN')} VND`);

        const oldestOrder = orders.reduce((oldest, order) =>
            order.createdAt < oldest.createdAt ? order : oldest
        );
        const newestOrder = orders.reduce((newest, order) =>
            order.createdAt > newest.createdAt ? order : newest
        );

        console.log(`📅 Date Range: ${oldestOrder.createdAt.toLocaleDateString('vi-VN')} → ${newestOrder.createdAt.toLocaleDateString('vi-VN')}`);
        console.log('\n✨ MASTER SEEDING COMPLETED!\n');
        console.log('🔑 Login với: admin@craftui.com / 123456\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

// Run seeding
seedMasterData();
