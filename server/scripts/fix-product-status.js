import mongoose from 'mongoose';
import Product from '../models/Product.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const updateProductStatus = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm');
        console.log('✅ Đã kết nối MongoDB');

        // Get all products
        const products = await Product.find({});
        console.log(`📦 Tìm thấy ${products.length} sản phẩm`);

        let updatedCount = 0;

        // Update status for each product based on stock
        for (const product of products) {
            const oldStatus = product.status;

            // Calculate new status
            if (product.stock === 0) {
                product.status = 'out-of-stock';
            } else if (product.stock < 10) {
                product.status = 'low-stock';
            } else {
                product.status = 'in-stock';
            }

            // Save if status changed
            if (oldStatus !== product.status) {
                await product.save();
                updatedCount++;
                console.log(`✏️  ${product.name} (${product.productCode}): ${oldStatus} → ${product.status} (stock: ${product.stock})`);
            }
        }

        console.log(`\n✅ Đã cập nhật trạng thái cho ${updatedCount} sản phẩm`);
        console.log(`✓ ${products.length - updatedCount} sản phẩm không cần thay đổi`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
};

updateProductStatus();
