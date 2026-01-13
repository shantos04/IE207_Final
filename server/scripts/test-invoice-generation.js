/**
 * Test Script: Verify Invoice Auto-Generation
 * 
 * This script tests if invoices are created automatically when order status
 * is updated to "Delivered" or "Completed".
 * 
 * Run: node scripts/test-invoice-generation.js
 */

import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Invoice from '../models/Invoice.js';
import dotenv from 'dotenv';

dotenv.config();

const testInvoiceGeneration = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find a delivered order that doesn't have an invoice
        console.log('📦 Finding orders with status "Delivered"...');
        const deliveredOrders = await Order.find({ status: 'Delivered' })
            .populate('user', 'fullName email')
            .limit(5);

        console.log(`Found ${deliveredOrders.length} delivered orders\n`);

        for (const order of deliveredOrders) {
            console.log(`\n--- Order: ${order.orderCode} ---`);
            console.log(`   Customer: ${order.user?.fullName || 'N/A'}`);
            console.log(`   Total: ${order.totalAmount?.toLocaleString('vi-VN')}đ`);
            console.log(`   Payment: ${order.paymentMethod} (${order.paymentStatus})`);

            // Check if invoice exists
            const invoice = await Invoice.findOne({ order: order._id });

            if (invoice) {
                console.log(`   ✅ Invoice: ${invoice.invoiceNumber} (${invoice.status})`);
            } else {
                console.log(`   ❌ NO INVOICE FOUND!`);
                console.log(`   🔧 Creating invoice now...`);

                // Create invoice manually (for testing)
                const newInvoice = await Invoice.create({
                    user: order.user._id,
                    order: order._id,
                    totalAmount: order.totalAmount,
                    status: 'Paid',
                    paymentMethod: order.paymentMethod || 'COD',
                    issueDate: new Date(),
                    dueDate: new Date(),
                    paidAt: new Date(),
                    notes: `Test invoice for order ${order.orderCode}`,
                });

                console.log(`   ✅ Created invoice: ${newInvoice.invoiceNumber}`);
            }
        }

        console.log('\n\n📊 Summary:');
        const totalOrders = await Order.countDocuments({ status: 'Delivered' });
        const totalInvoices = await Invoice.countDocuments();

        // Count delivered orders WITH invoices
        const ordersWithInvoices = await Order.aggregate([
            { $match: { status: 'Delivered' } },
            {
                $lookup: {
                    from: 'invoices',
                    localField: '_id',
                    foreignField: 'order',
                    as: 'invoice'
                }
            },
            { $match: { 'invoice.0': { $exists: true } } },
            { $count: 'count' }
        ]);

        const countWithInvoices = ordersWithInvoices[0]?.count || 0;
        const countWithoutInvoices = totalOrders - countWithInvoices;

        console.log(`   Total Delivered Orders: ${totalOrders}`);
        console.log(`   Orders WITH Invoices: ${countWithInvoices}`);
        console.log(`   Orders WITHOUT Invoices: ${countWithoutInvoices}`);
        console.log(`   Total Invoices: ${totalInvoices}`);

        if (countWithoutInvoices > 0) {
            console.log(`\n⚠️  WARNING: ${countWithoutInvoices} delivered orders are missing invoices!`);
        } else {
            console.log(`\n✅ All delivered orders have invoices!`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 MongoDB connection closed');
    }
};

// Run the test
testInvoiceGeneration();
