import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config();

// Import database connection
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Connect to database
connectDB();

// Initialize express app
const app = express();

// ============= MIDDLEWARE =============

// Security headers
app.use(helmet());

// CORS - Updated for Vercel deployment
app.use(
    cors({
        origin: [
            process.env.CLIENT_URL || 'http://localhost:3000',
            'http://localhost:5173', // Vite default port
            'http://localhost:3000', // React default port
            'http://localhost:3001', // Alternative React port
            /https:\/\/.*\.vercel\.app$/, // All Vercel deployments
            /https:\/\/ie207-final.*\.vercel\.app$/ // Your specific Vercel app (optional)
        ],
        credentials: true,
    })
);

// Body parser - Increased limit for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (for uploaded avatars)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rate limiting (more relaxed in development)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 500 : 100, // 500 for dev, 100 for production
    message: 'Quá nhiều request từ IP này, vui lòng thử lại sau 15 phút',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
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
            customers: '/api/customers',
            invoices: '/api/invoices',
            analytics: '/api/analytics',
            settings: '/api/settings',
            dashboard: '/api/dashboard',
            users: '/api/users',
        },
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

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
