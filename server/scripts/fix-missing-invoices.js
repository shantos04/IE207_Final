/**
 * FIX SCRIPT: Generate Missing Invoices for Delivered Orders
 * 
 * This script scans all orders with status 'Delivered' and automatically 
 * creates missing Invoice records for them.
 * 
 * USAGE:
 * 1. From server directory: node scripts/fix-missing-invoices.js
 * 2. Or with connection string: MONGODB_URI="your_uri" node scripts/fix-missing-invoices.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Order from '../models/Order.js';
import Invoice from '../models/Invoice.js';
import User from '../models/User.js'; // Required for populate() to work

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// MongoDB Connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce', {
            // MongoDB 6.x+ doesn't need these options
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

// Main Fix Function
const fixMissingInvoices = async () => {
    try {
        console.log('\n🔧 Starting Missing Invoice Fix Script...\n');

        // Step 1: Find all Delivered orders
        const deliveredOrders = await Order.find({ status: 'Delivered' })
            .populate('user', 'fullName email')
            .sort({ createdAt: -1 });

        console.log(`📊 Found ${deliveredOrders.length} delivered orders\n`);

        if (deliveredOrders.length === 0) {
            console.log('✅ No delivered orders found. Nothing to fix.');
            return { created: 0, skipped: 0, errors: 0 };
        }

        let createdCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        const results = [];

        // Step 2: Process each order
        for (const order of deliveredOrders) {
            try {
                // Check if invoice already exists
                const existingInvoice = await Invoice.findOne({ order: order._id });

                if (existingInvoice) {
                    console.log(`⏭️  SKIP: Order ${order.orderCode} already has invoice ${existingInvoice.invoiceNumber}`);
                    skippedCount++;
                    results.push({
                        orderCode: order.orderCode,
                        orderId: order._id,
                        status: 'skipped',
                        reason: `Invoice ${existingInvoice.invoiceNumber} already exists`,
                    });
                    continue;
                }

                // Create missing invoice
                console.log(`🆕 CREATING: Invoice for order ${order.orderCode}...`);

                const invoiceData = {
                    // Don't set invoiceNumber - let pre-save hook generate it
                    user: order.user._id || order.user,
                    order: order._id,
                    totalAmount: order.totalAmount,
                    status: 'Paid', // Assume paid since delivered
                    paymentMethod: order.paymentMethod || 'COD',
                    issueDate: order.deliveredAt || order.updatedAt || new Date(),
                    dueDate: order.deliveredAt || order.updatedAt || new Date(),
                    paidAt: order.paidAt || order.deliveredAt || order.updatedAt || new Date(),
                    notes: `Hóa đơn tự động (fix script) cho đơn hàng ${order.orderCode} - Đã giao ${new Date(order.deliveredAt || order.updatedAt).toLocaleDateString('vi-VN')}`,
                };

                // Use new + save instead of create to ensure pre-save hook runs
                const newInvoice = new Invoice(invoiceData);
                // Temporarily disable validation to allow pre-save hook to generate invoiceNumber
                await newInvoice.save({ validateBeforeSave: false });
                // Now validate after the hook has generated the invoiceNumber
                await newInvoice.validate();

                console.log(`   ✅ Created invoice ${newInvoice.invoiceNumber} for order ${order.orderCode}`);
                console.log(`   📅 Issue Date: ${new Date(invoiceData.issueDate).toLocaleDateString('vi-VN')}`);
                console.log(`   💰 Amount: ${order.totalAmount.toLocaleString('vi-VN')} VND`);
                console.log(`   👤 Customer: ${order.user?.fullName || 'N/A'}\n`);

                createdCount++;
                results.push({
                    orderCode: order.orderCode,
                    orderId: order._id,
                    invoiceNumber: newInvoice.invoiceNumber,
                    status: 'created',
                    amount: order.totalAmount,
                });

            } catch (orderError) {
                console.error(`❌ ERROR processing order ${order.orderCode}:`, orderError.message);
                errorCount++;
                results.push({
                    orderCode: order.orderCode,
                    orderId: order._id,
                    status: 'error',
                    error: orderError.message,
                });
            }
        }

        // Step 3: Summary Report
        console.log('\n' + '='.repeat(60));
        console.log('📋 FIX SCRIPT SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Delivered Orders:  ${deliveredOrders.length}`);
        console.log(`✅ Invoices Created:      ${createdCount}`);
        console.log(`⏭️  Already Had Invoice:   ${skippedCount}`);
        console.log(`❌ Errors:                ${errorCount}`);
        console.log('='.repeat(60) + '\n');

        // Step 4: Detailed Results (optional)
        if (createdCount > 0) {
            console.log('📝 NEWLY CREATED INVOICES:');
            results
                .filter(r => r.status === 'created')
                .forEach((r, idx) => {
                    console.log(`   ${idx + 1}. ${r.invoiceNumber} → Order ${r.orderCode} (${r.amount.toLocaleString('vi-VN')} VND)`);
                });
            console.log('');
        }

        if (errorCount > 0) {
            console.log('⚠️  ERRORS:');
            results
                .filter(r => r.status === 'error')
                .forEach((r, idx) => {
                    console.log(`   ${idx + 1}. Order ${r.orderCode}: ${r.error}`);
                });
            console.log('');
        }

        return { created: createdCount, skipped: skippedCount, errors: errorCount };

    } catch (error) {
        console.error('\n❌ Fatal Error in Fix Script:', error.message);
        console.error('Stack:', error.stack);
        throw error;
    }
};

// Execute Script
const runScript = async () => {
    try {
        await connectDB();
        await fixMissingInvoices();
        console.log('✅ Fix script completed successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Fix script failed:', error.message);
        process.exit(1);
    }
};

// Run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runScript();
}

export default fixMissingInvoices;
