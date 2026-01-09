/**
 * Migration Script: Remove Draft Status
 * 
 * This script updates all orders with 'Draft' status to 'Pending'
 * Run this ONCE after deploying the code changes
 * 
 * Usage: node server/scripts/migrate-remove-draft-status.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/erp_db';

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB Connected for migration');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

// Migration function
const migrateDraftOrders = async () => {
    try {
        console.log('\n🔄 Starting migration: Draft → Pending...\n');

        // Get Order model
        const Order = mongoose.model('Order');

        // Find all orders with 'Draft' status
        const draftOrders = await Order.find({ status: 'Draft' });

        console.log(`📊 Found ${draftOrders.length} orders with 'Draft' status`);

        if (draftOrders.length === 0) {
            console.log('✨ No orders to migrate. All done!');
            return;
        }

        // Update all draft orders to Pending
        const result = await Order.updateMany(
            { status: 'Draft' },
            { $set: { status: 'Pending' } }
        );

        console.log(`\n✅ Migration completed successfully!`);
        console.log(`   - Orders updated: ${result.modifiedCount}`);
        console.log(`   - Orders matched: ${result.matchedCount}`);

        // Show sample of migrated orders
        if (draftOrders.length > 0) {
            console.log('\n📝 Sample of migrated orders:');
            draftOrders.slice(0, 5).forEach((order, index) => {
                console.log(`   ${index + 1}. ${order.orderCode} - Customer: ${order.customer?.name || 'N/A'}`);
            });
            if (draftOrders.length > 5) {
                console.log(`   ... and ${draftOrders.length - 5} more`);
            }
        }

    } catch (error) {
        console.error('❌ Migration error:', error);
        throw error;
    }
};

// Main execution
const runMigration = async () => {
    console.log('🚀 Order Status Migration Tool');
    console.log('================================');
    console.log('Purpose: Update all "Draft" orders to "Pending"\n');

    try {
        await connectDB();
        await migrateDraftOrders();

        console.log('\n✅ Migration completed! Safe to close.');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        process.exit(1);
    }
};

// Run the migration
runMigration();
