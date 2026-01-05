import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/craftui_erp');
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const seedOrders = async () => {
    try {
        await connectDB();

        // Clear existing orders
        await Order.deleteMany({});
        console.log('🗑️  Cleared existing orders');

        // Get sample products
        const products = await Product.find().limit(20);
        if (products.length === 0) {
            console.log('❌ No products found. Please seed products first.');
            process.exit(1);
        }

        // Get sample user (or create a dummy one)
        let user = await User.findOne();
        if (!user) {
            console.log('⚠️  No users found. Creating a dummy user...');
            user = await User.create({
                fullName: 'Admin User',
                email: 'admin@erp.com',
                password: 'password123',
                role: 'admin',
            });
        }

        console.log(`📦 Found ${products.length} products`);
        console.log(`👤 Using user: ${user.fullName} (${user.email})`);

        // Customer templates
        const customers = [
            {
                name: 'Nguyễn Văn An',
                email: 'nguyenvanan@gmail.com',
                phone: '0901234567',
            },
            {
                name: 'Trần Thị Bích',
                email: 'tranbich@yahoo.com',
                phone: '0912345678',
            },
            {
                name: 'Lê Hoàng Cường',
                email: 'lehoangcuong@outlook.com',
                phone: '0923456789',
            },
            {
                name: 'Phạm Minh Đức',
                email: 'phamminhduc@gmail.com',
                phone: '0934567890',
            },
            {
                name: 'Võ Thị Em',
                email: 'vothiem@hotmail.com',
                phone: '0945678901',
            },
        ];

        // Shipping addresses
        const addresses = [
            {
                address: '123 Đường Lê Lợi, Phường Bến Thành',
                city: 'TP. Hồ Chí Minh',
                phone: '0901234567',
            },
            {
                address: '456 Trần Hưng Đạo, Quận 1',
                city: 'TP. Hồ Chí Minh',
                phone: '0912345678',
            },
            {
                address: '789 Nguyễn Huệ, Quận 1',
                city: 'TP. Hồ Chí Minh',
                phone: '0923456789',
            },
            {
                address: '321 Võ Văn Tần, Quận 3',
                city: 'TP. Hồ Chí Minh',
                phone: '0934567890',
            },
            {
                address: '654 Cách Mạng Tháng 8, Quận 10',
                city: 'TP. Hồ Chí Minh',
                phone: '0945678901',
            },
            {
                address: '147 Lý Thường Kiệt, Quận Tân Bình',
                city: 'TP. Hồ Chí Minh',
                phone: '0956789012',
            },
            {
                address: '258 Hoàng Văn Thụ, Quận Phú Nhuận',
                city: 'TP. Hồ Chí Minh',
                phone: '0967890123',
            },
            {
                address: '369 Phan Xích Long, Quận Bình Thạnh',
                city: 'TP. Hồ Chí Minh',
                phone: '0978901234',
            },
            {
                address: '741 Nguyễn Thị Minh Khai, Quận 3',
                city: 'TP. Hồ Chí Minh',
                phone: '0989012345',
            },
            {
                address: '852 Điện Biên Phủ, Quận 3',
                city: 'TP. Hồ Chí Minh',
                phone: '0990123456',
            },
        ];

        const statuses = ['Draft', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
        const paymentMethods = ['COD', 'Bank Transfer', 'Credit Card', 'E-Wallet'];
        const paymentStatuses = ['unpaid', 'paid', 'refunded'];

        const orders = [];
        const numOrders = 50; // Create 50 sample orders

        for (let i = 0; i < numOrders; i++) {
            // Random customer
            const customer = customers[Math.floor(Math.random() * customers.length)];

            // Random shipping address
            const shippingAddress = addresses[Math.floor(Math.random() * addresses.length)];

            // Random number of items (1-5)
            const numItems = Math.floor(Math.random() * 5) + 1;
            const orderItems = [];

            // Select random products
            for (let j = 0; j < numItems; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 units

                orderItems.push({
                    product: product._id,
                    productName: product.name,
                    productCode: product.productCode,
                    quantity: quantity,
                    price: product.price,
                    subtotal: product.price * quantity,
                });
            }

            // Calculate total
            const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

            // Random status (more likely to be confirmed/shipped/delivered)
            let status;
            const rand = Math.random();
            if (rand < 0.05) status = 'Draft';
            else if (rand < 0.15) status = 'Pending';
            else if (rand < 0.35) status = 'Confirmed';
            else if (rand < 0.55) status = 'Shipped';
            else if (rand < 0.85) status = 'Delivered';
            else status = 'Cancelled';

            // Payment status based on order status
            let paymentStatus;
            if (status === 'Delivered') paymentStatus = 'paid';
            else if (status === 'Cancelled') paymentStatus = Math.random() > 0.5 ? 'refunded' : 'unpaid';
            else paymentStatus = Math.random() > 0.3 ? 'unpaid' : 'paid';

            // Random payment method
            const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

            // Random notes (50% chance)
            const notes =
                Math.random() > 0.5
                    ? [
                        'Giao hàng buổi sáng',
                        'Gọi trước khi giao',
                        'Giao hàng tận tay',
                        'Không giao buổi trưa',
                        'Đóng gói cẩn thận',
                        '',
                    ][Math.floor(Math.random() * 6)]
                    : '';

            orders.push({
                customer,
                user: user._id,
                orderItems,
                totalAmount,
                totalPrice: totalAmount,
                status,
                paymentStatus,
                paymentMethod,
                shippingAddress,
                notes,
                createdBy: user._id,
                // Random createdAt within last 30 days
                createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            });
        }

        // Insert orders
        const createdOrders = await Order.insertMany(orders);
        console.log(`✅ Created ${createdOrders.length} orders successfully!`);

        // Show statistics
        const stats = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        console.log('\n📊 Order Statistics by Status:');
        stats.forEach((stat) => {
            console.log(`   ${stat._id}: ${stat.count}`);
        });

        // Show total revenue
        const totalRevenue = await Order.aggregate([
            {
                $match: {
                    status: { $ne: 'Cancelled' },
                    paymentStatus: 'paid',
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalPrice' },
                },
            },
        ]);

        if (totalRevenue.length > 0) {
            console.log(`\n💰 Total Revenue (Paid Orders): ${totalRevenue[0].total.toLocaleString('vi-VN')} VNĐ`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedOrders();
