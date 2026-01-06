import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Order from '../models/Order.js';
import Invoice from '../models/Invoice.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import User from '../models/User.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

// Vietnamese cities for shipping address
const VIETNAM_CITIES = [
    'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'Biên Hòa', 'Nha Trang', 'Huế', 'Vũng Tàu', 'Buôn Ma Thuột',
    'Quy Nhơn', 'Nam Định', 'Thái Nguyên', 'Vinh', 'Hạ Long'
];

const VIETNAM_STREETS = [
    'Lê Lợi', 'Trần Phú', 'Nguyễn Huệ', 'Lý Thường Kiệt', 'Hai Bà Trưng',
    'Điện Biên Phủ', 'Hoàng Văn Thụ', 'Phan Chu Trinh', 'Võ Nguyên Giáp',
    'Lê Duẩn', 'Trần Hưng Đạo', 'Nguyễn Trãi', 'Lạc Long Quân', 'Láng Hạ'
];

const PAYMENT_METHODS = ['COD', 'Bank Transfer', 'Credit Card', 'E-Wallet'];

// Helper: Generate random date within last 90 days
const randomDateInLast90Days = () => {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    // Add random time
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    date.setSeconds(Math.floor(Math.random() * 60));

    return date;
};

// Helper: Weighted random status (more completed orders)
const getRandomStatus = () => {
    const rand = Math.random();
    if (rand < 0.60) return 'Delivered'; // 60%
    if (rand < 0.70) return 'Shipped';    // 10%
    if (rand < 0.80) return 'Confirmed';  // 10%
    if (rand < 0.90) return 'Pending';    // 10%
    return 'Cancelled';                    // 10%
};

// Helper: Get payment status based on order status
const getPaymentStatus = (orderStatus) => {
    if (orderStatus === 'Delivered' || orderStatus === 'Shipped') {
        return Math.random() > 0.1 ? 'paid' : 'unpaid'; // 90% paid
    }
    if (orderStatus === 'Cancelled') {
        return Math.random() > 0.5 ? 'refunded' : 'unpaid';
    }
    return 'unpaid';
};

// Helper: Generate order code
const generateOrderCode = (index) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `ORD-${year}${month}-${String(index + 1).padStart(4, '0')}`;
};

// Helper: Generate shipping address
const generateShippingAddress = (customerPhone) => {
    const streetNumber = Math.floor(Math.random() * 500) + 1;
    const street = VIETNAM_STREETS[Math.floor(Math.random() * VIETNAM_STREETS.length)];
    const district = `Quận ${Math.floor(Math.random() * 12) + 1}`;
    const city = VIETNAM_CITIES[Math.floor(Math.random() * VIETNAM_CITIES.length)];

    return {
        address: `${streetNumber} ${street}, ${district}`,
        city: city,
        phone: customerPhone
    };
};

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/craftui_erp');
        console.log('✅ MongoDB Connected:', mongoose.connection.host);
        console.log('📊 Database:', mongoose.connection.name);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const seedOrders = async () => {
    try {
        console.log('\n🚀 ORDERS SEEDING STARTED...\n');

        await connectDB();

        // Clean existing data
        console.log('🧹 Cleaning existing orders and invoices...');
        await Order.deleteMany({});
        await Invoice.deleteMany({});
        console.log('✅ Orders and Invoices cleaned!\n');

        // Load required data
        console.log('📦 Loading products, customers, and users...');
        const products = await Product.find({});
        const customers = await Customer.find({ status: 'active' });
        const users = await User.find({});

        if (products.length === 0 || customers.length === 0 || users.length === 0) {
            throw new Error('❌ Please seed products, customers, and users first!');
        }

        console.log(`✅ Loaded: ${products.length} products, ${customers.length} customers, ${users.length} users\n`);

        // Generate orders
        const NUM_ORDERS = 500;
        const orders = [];
        const invoices = [];

        console.log(`📋 Creating ${NUM_ORDERS} orders over last 90 days...\n`);

        // Group orders by month for better logging
        const ordersByMonth = {};

        for (let i = 0; i < NUM_ORDERS; i++) {
            // Random date
            const createdAt = randomDateInLast90Days();
            const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;

            if (!ordersByMonth[monthKey]) {
                ordersByMonth[monthKey] = 0;
            }
            ordersByMonth[monthKey]++;

            // Random customer
            const customer = customers[Math.floor(Math.random() * customers.length)];

            // Random user (staff who processed the order)
            const user = users[Math.floor(Math.random() * users.length)];

            // Random order status
            const status = getRandomStatus();
            const paymentStatus = getPaymentStatus(status);

            // Random 1-5 products
            const numItems = Math.floor(Math.random() * 5) + 1;
            const orderItems = [];
            let totalAmount = 0;

            for (let j = 0; j < numItems; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 10) + 1;
                const subtotal = product.price * quantity;

                orderItems.push({
                    product: product._id,
                    productName: product.name,
                    productCode: product.productCode,
                    quantity,
                    price: product.price,
                    subtotal
                });

                totalAmount += subtotal;
            }

            // Create order
            const order = new Order({
                orderCode: generateOrderCode(i),
                customer: {
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone
                },
                user: user._id,
                orderItems,
                totalAmount,
                totalPrice: totalAmount,
                status,
                paymentStatus,
                paymentMethod: PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)],
                shippingAddress: generateShippingAddress(customer.phone),
                notes: Math.random() > 0.7 ? 'Giao hàng giờ hành chính' : '',
                createdAt,
                updatedAt: createdAt
            });

            orders.push(order);

            // Create invoice for Delivered/Shipped orders
            if (status === 'Delivered' || (status === 'Shipped' && Math.random() > 0.3)) {
                const dueDate = new Date(createdAt);
                dueDate.setDate(dueDate.getDate() + 7); // 7 days payment term

                // Generate invoice number manually
                const year = createdAt.getFullYear();
                const month = String(createdAt.getMonth() + 1).padStart(2, '0');
                const invoiceNumber = `INV-${year}${month}-${String(invoices.length + 1).padStart(4, '0')}`;

                const invoice = new Invoice({
                    invoiceNumber,
                    order: order._id,
                    user: user._id,
                    issueDate: createdAt,
                    dueDate,
                    totalAmount,
                    status: paymentStatus === 'paid' ? 'Paid' : 'Unpaid',
                    paymentMethod: order.paymentMethod,
                    notes: `Invoice cho đơn hàng ${order.orderCode}`,
                    paidAt: paymentStatus === 'paid' ? createdAt : null,
                    createdAt,
                    updatedAt: createdAt
                });

                invoices.push(invoice);
            }

            // Progress log every 50 orders
            if ((i + 1) % 50 === 0) {
                console.log(`⏳ Đang tạo... ${i + 1}/${NUM_ORDERS} orders`);
            }
        }

        // Log orders by month
        console.log('\n📊 Orders distribution by month:');
        Object.keys(ordersByMonth).sort().forEach(month => {
            const [year, monthNum] = month.split('-');
            const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
            console.log(`   ${monthNames[parseInt(monthNum) - 1]} ${year}: ${ordersByMonth[month]} orders`);
        });

        // Bulk insert orders
        console.log('\n💾 Saving orders to database...');
        await Order.insertMany(orders);
        console.log(`✅ Created ${orders.length} orders!`);

        // Bulk insert invoices
        if (invoices.length > 0) {
            console.log('\n📄 Saving invoices to database...');
            await Invoice.insertMany(invoices);
            console.log(`✅ Created ${invoices.length} invoices!`);
        }

        // Statistics
        console.log('\n📈 SEEDING STATISTICS:');
        console.log('========================');

        const statusStats = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } },
            { $sort: { count: -1 } }
        ]);

        console.log('\nOrders by Status:');
        statusStats.forEach(stat => {
            const percentage = ((stat.count / orders.length) * 100).toFixed(1);
            console.log(`   ${stat._id}: ${stat.count} (${percentage}%) - ${stat.total.toLocaleString('vi-VN')} VND`);
        });

        const totalRevenue = orders
            .filter(o => o.status === 'Delivered')
            .reduce((sum, o) => sum + o.totalAmount, 0);

        console.log(`\n💰 Total Revenue (Delivered): ${totalRevenue.toLocaleString('vi-VN')} VND`);
        console.log(`📦 Average Order Value: ${Math.round(totalRevenue / orders.filter(o => o.status === 'Delivered').length).toLocaleString('vi-VN')} VND`);

        console.log('\n✨ SEEDING COMPLETED SUCCESSFULLY!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedOrders();
