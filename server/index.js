import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Load env vars
dotenv.config();

// Import database connection
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Connect to database
connectDB();

// Initialize express app
const app = express();

// ============= MIDDLEWARE =============

// Security headers
app.use(helmet());

// CORS
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
    })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Quá nhiều request từ IP này, vui lòng thử lại sau 15 phút',
});
app.use('/api/', limiter);

// ============= ROUTES =============

// Health check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'CraftUI ERP API Server is running! 🚀',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            orders: '/api/orders',
        },
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// ============= ERROR HANDLING =============

// 404 Not Found
app.use(notFound);

// Error handler
app.use(errorHandler);

// ============= START SERVER =============

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server đang chạy ở chế độ ${process.env.NODE_ENV}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📊 API Docs: http://localhost:${PORT}/api`);
    console.log(`\n✅ Sẵn sàng nhận requests!\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`❌ Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});

export default app;
