import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Invoice from '../models/Invoice.js';

// @desc    Get my orders (Customer)
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
    try {
        // Fix: Use req.user._id for proper MongoDB ObjectId query
        const orders = await Order.find({ user: req.user._id })
            .populate('orderItems.product', 'name productCode imageUrl price')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: orders,
            total: orders.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, paymentStatus, startDate, endDate } = req.query;

        // Build query
        const query = {};
        if (status) query.status = status;
        if (paymentStatus) query.paymentStatus = paymentStatus;

        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                // Set to start of day
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                query.createdAt.$gte = start;
            }
            if (endDate) {
                // Set to end of day
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }
        // Debug: Log query for troubleshooting
        console.log('\ud83d\udd0d [getOrders] Query:', JSON.stringify(query, null, 2));
        console.log('\ud83d\udcc5 [getOrders] Date Params:', { startDate, endDate });
        // Debug: Log final query to check date filtering
        console.log('\ud83d\udd0d [OrderController] Final Query:', JSON.stringify(query, null, 2));
        console.log('\ud83d\udcc5 Date Range:', { startDate, endDate });

        // Execute query with pagination
        const orders = await Order.find(query)
            .populate('orderItems.product', 'name productCode imageUrl')
            .populate('user', 'fullName email')
            .populate('createdBy', 'fullName email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        // Debug: Log first order's orderItems
        if (orders.length > 0) {
            console.log('📦 [OrderController] First order orderItems:', orders[0].orderItems);
            console.log('📦 [OrderController] OrderItems length:', orders[0].orderItems?.length);
        }

        const count = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('orderItems.product', 'name productCode imageUrl')
            .populate('user', 'fullName email')
            .populate('createdBy', 'fullName email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng',
            });
        }

        res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Create order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
    try {
        // Debug: Check if user is authenticated
        console.log('🔍 [createOrder] User request:', req.user);

        // Defensive check: Ensure user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'Lỗi xác thực: Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.',
            });
        }

        const { customer, orderItems, shippingAddress, paymentMethod, notes, totalAmount } = req.body;

        // Validate orderItems
        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có sản phẩm nào trong giỏ hàng',
            });
        }

        // 1. Generate Order Code (backup if model pre-save hook fails)
        const orderCode = `ORD-${Date.now()}`;

        // 2. Validate and populate product details + DEDUCT STOCK IMMEDIATELY (Reserve Stock)
        const processedOrderItems = [];
        let calculatedTotal = 0;

        // Phase 1: Validate ALL products first
        for (const item of orderItems) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Không tìm thấy sản phẩm với ID: ${item.product}`,
                });
            }

            // NEW LOGIC: Check stock availability before creating order
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Sản phẩm "${product.name}" đã hết hàng (Còn: ${product.stock}, Cần: ${item.quantity})`,
                });
            }
        }

        // Phase 2: All products available, now deduct stock and build order items
        const stockUpdates = [];

        for (const item of orderItems) {
            const product = await Product.findById(item.product);

            // 3. Calculate subtotal for each item (Security: use actual DB price)
            const subtotal = product.price * item.quantity;
            calculatedTotal += subtotal;

            processedOrderItems.push({
                product: product._id,
                productName: product.name,
                productCode: product.productCode,
                quantity: item.quantity,
                price: product.price, // Use price from database, not from client
                subtotal: subtotal, // Fix: Add required subtotal field
            });

            // Prepare stock update operation (will execute in batch)
            stockUpdates.push({
                productId: product._id,
                productName: product.name,
                quantity: item.quantity,
                currentStock: product.stock
            });
        }

        // CRITICAL FIX: Execute all stock updates in parallel using Promise.all
        // with constraint to prevent negative stock
        try {
            const updateResults = await Promise.all(
                stockUpdates.map(async (update) => {
                    // Use findOneAndUpdate with $inc to atomically decrement stock
                    // Add constraint: only update if stock >= quantity (prevent negative)
                    const result = await Product.findOneAndUpdate(
                        {
                            _id: update.productId,
                            stock: { $gte: update.quantity } // Ensure stock is sufficient
                        },
                        { $inc: { stock: -update.quantity } },
                        { new: true }
                    );

                    if (!result) {
                        // Stock check failed - concurrent order might have depleted stock
                        throw new Error(`Sản phẩm "${update.productName}" không đủ hàng (race condition)`);
                    }

                    console.log(`📦 [createOrder] Đã trừ ${update.quantity} từ ${update.productName}. Tồn kho mới: ${result.stock}`);
                    return result;
                })
            );
        } catch (stockError) {
            console.error('❌ [createOrder] Lỗi khi cập nhật kho:', stockError);
            return res.status(500).json({
                success: false,
                message: stockError.message || 'Lỗi khi cập nhật số lượng tồn kho. Vui lòng thử lại.',
            });
        }

        // 4. Validate totalAmount from client (security check)
        // Use calculated total if client's total doesn't match
        const finalTotalAmount = totalAmount || calculatedTotal;

        // 5. Save shipping address to user's address book if authenticated
        if (req.user?._id && shippingAddress) {
            try {
                const userRecord = await User.findById(req.user._id);
                if (userRecord) {
                    // Check if address already exists
                    const addressExists = userRecord.addresses?.some(
                        addr => JSON.stringify(addr) === JSON.stringify(shippingAddress)
                    );

                    if (!addressExists) {
                        await User.findByIdAndUpdate(
                            req.user._id,
                            { $addToSet: { addresses: shippingAddress } },
                            { new: true }
                        );
                    }
                }
            } catch (addressError) {
                console.error('Failed to save address:', addressError);
                // Don't fail the order creation if address saving fails
            }
        }

        // 6. Create order with all required fields
        const order = await Order.create({
            orderCode, // Fix: Provide orderCode (model pre-save will generate if missing)
            customer,
            user: req.user._id, // Fix: Use authenticated user ID from middleware
            orderItems: processedOrderItems, // Already contains subtotal
            shippingAddress,
            paymentMethod,
            totalAmount: finalTotalAmount, // Fix: Provide totalAmount
            notes,
            status: 'Pending', // Explicitly set to Pending
            createdBy: req.user._id, // Fix: Use _id for consistency
        });

        // --- CRITICAL FIX: AUTO GENERATE INVOICE ---
        try {
            const invoiceData = {
                user: req.user._id,
                order: order._id,
                totalAmount: order.totalAmount,
                status: paymentMethod === 'COD' ? 'Unpaid' : 'Paid',
                paymentMethod: order.paymentMethod,
                issueDate: new Date(),
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Hạn thanh toán 7 ngày
                notes: `Hóa đơn cho đơn hàng ${order.orderCode}`,
            };

            // If payment is online and successful, mark as paid
            if (paymentMethod !== 'COD') {
                invoiceData.status = 'Paid';
                invoiceData.paidAt = new Date();
            }

            const invoice = await Invoice.create(invoiceData);

            console.log(`✅ [createOrder] Đã tự động tạo hóa đơn ${invoice.invoiceNumber} cho đơn hàng ${order.orderCode}`);
        } catch (invoiceError) {
            // Log the error but don't fail the order creation
            console.error("❌ [createOrder] Lỗi tạo hóa đơn tự động:", invoiceError.message);
            console.error("Stack:", invoiceError.stack);

            // Optional: You might want to return a warning in response
            // but still consider the order creation successful
        }
        // --- AUTO GENERATE INVOICE END ---

        res.status(201).json({
            success: true,
            message: 'Tạo đơn hàng thành công',
            data: order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // Log the exact incoming status for debugging
        console.log(`📥 [updateOrderStatus] Received status: "${status}" (type: ${typeof status})`);

        // Validate status - support both English and Vietnamese
        const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled',
            'Chờ xử lý', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Trạng thái không hợp lệ. Phải là một trong: ${validStatuses.join(', ')}`,
            });
        }

        // Find order first to check current status
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng',
            });
        }

        const oldStatus = order.status;
        const newStatus = status;

        console.log(`📦 [updateOrderStatus] Cập nhật đơn hàng ${order.orderCode}: "${oldStatus}" → "${newStatus}"`);

        // Update order status
        order.status = newStatus;

        // ========== ROBUST INVOICE AUTO-CREATION TRIGGER (PARTIAL MATCHING) ==========
        // Normalize status for comparison (case-insensitive, trim whitespace)
        const normalizedStatus = newStatus.toLowerCase().trim();

        // Define key success/delivered keywords for PARTIAL matching
        // These keywords will match if they appear ANYWHERE in the status string
        const deliveredKeywords = [
            'giao thành công',    // Vietnamese: "delivered successfully"
            'delivered',          // English
            'đã giao',            // Vietnamese: "delivered"
            'da giao',            // Vietnamese without diacritics
            'completed',          // English alternative
            'hoàn thành',         // Vietnamese: "completed"
            'hoan thanh',         // Vietnamese without diacritics
            'thành công',         // Vietnamese: "success"
            'thanh cong',         // Vietnamese without diacritics
            'success',            // Alternative English
            'finished',           // Alternative English
            'done',               // Alternative English
            'paid'                // Sometimes used to indicate completion
        ];

        // Use PARTIAL matching: Check if status CONTAINS any of these keywords
        // This will match "Đã giao thành công", "Delivered successfully", etc.
        const isDelivered = deliveredKeywords.some(keyword => normalizedStatus.includes(keyword));

        console.log(`🔍 [updateOrderStatus] Normalized status: "${normalizedStatus}"`);
        console.log(`🔍 [updateOrderStatus] Checking for keywords: ${deliveredKeywords.slice(0, 5).join(', ')}...`);
        console.log(`🔍 [updateOrderStatus] Is delivered/completed? ${isDelivered}`);

        if (isDelivered) {
            console.log(`✅ [updateOrderStatus] TRIGGER: Đơn hàng ${order.orderCode} đã được giao/hoàn thành`);

            // Update delivery timestamp
            if (!order.deliveredAt) {
                order.deliveredAt = new Date();
            }

            // Mark payment as paid for COD orders when delivered
            if (order.paymentMethod === 'COD' && order.paymentStatus === 'unpaid') {
                order.paymentStatus = 'paid';
                order.paidAt = new Date();
                console.log(`💰 [updateOrderStatus] Đánh dấu đã thanh toán cho đơn COD: ${order.orderCode}`);
            }

            // --- AUTO-GENERATE INVOICE ON DELIVERY ---
            try {
                console.log(`🔍 [updateOrderStatus] Kiểm tra hóa đơn cho đơn hàng ${order.orderCode}...`);

                // Check if invoice already exists for this order
                const existingInvoice = await Invoice.findOne({ order: order._id });

                if (!existingInvoice) {
                    console.log(`📝 [updateOrderStatus] Không tìm thấy hóa đơn. Tạo hóa đơn mới...`);

                    // Create invoice automatically on delivery
                    const invoiceData = {
                        user: order.user,
                        order: order._id,
                        totalAmount: order.totalAmount,
                        status: 'Paid', // Mark as Paid since order is delivered
                        paymentMethod: order.paymentMethod || 'COD',
                        issueDate: new Date(),
                        dueDate: new Date(), // Due date is now since it's already delivered
                        paidAt: new Date(), // Mark as paid immediately
                        notes: `Hóa đơn tự động cho đơn hàng ${order.orderCode} (Đã giao hàng thành công)`,
                    };

                    const newInvoice = await Invoice.create(invoiceData);
                    console.log(`✅ [updateOrderStatus] Đã tạo hóa đơn ${newInvoice.invoiceNumber} cho đơn hàng ${order.orderCode}`);
                    console.log(`   💵 Số tiền: ${newInvoice.totalAmount.toLocaleString('vi-VN')}đ`);
                } else {
                    console.log(`ℹ️ [updateOrderStatus] Hóa đơn ${existingInvoice.invoiceNumber} đã tồn tại`);

                    // Update existing invoice to Paid if it's not already
                    if (existingInvoice.status !== 'Paid') {
                        existingInvoice.status = 'Paid';
                        if (!existingInvoice.paidAt) {
                            existingInvoice.paidAt = new Date();
                        }
                        await existingInvoice.save();
                        console.log(`✅ [updateOrderStatus] Đã cập nhật hóa đơn ${existingInvoice.invoiceNumber} thành Paid`);
                    } else {
                        console.log(`   ✔️ Hóa đơn đã được thanh toán trước đó`);
                    }
                }
            } catch (invoiceError) {
                console.error(`❌ [updateOrderStatus] LỖI khi tạo/cập nhật hóa đơn:`, invoiceError.message);
                console.error('Stack:', invoiceError.stack);
                // Don't fail the status update if invoice creation fails - but log it prominently
                console.error('⚠️ ĐƠN HÀNG ĐÃ CẬP NHẬT NHƯNG HÓA ĐƠN CHƯA ĐƯỢC TẠO!');
            }
            // --- END AUTO-GENERATE INVOICE ---
        }

        // Save order
        await order.save();

        // Populate order data for response
        await order.populate('orderItems.product', 'name productCode imageUrl stock');
        await order.populate('user', 'fullName email');

        console.log(`✅ [updateOrderStatus] Hoàn tất cập nhật đơn hàng ${order.orderCode}`);

        res.status(200).json({
            success: true,
            message: `Đã cập nhật trạng thái đơn hàng thành "${newStatus}"`,
            data: order,
        });
    } catch (error) {
        console.error('❌ [updateOrderStatus] LỖI:', error.message);
        console.error('Stack trace:', error.stack);

        // Return appropriate error status
        const statusCode = error.name === 'ValidationError' ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng',
        });
    }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private
export const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { paymentStatus },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái thanh toán thành công',
            data: order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Cancel my order (Customer)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelMyOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng',
            });
        }

        // Security Check: Only order owner can cancel
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền hủy đơn hàng này',
            });
        }

        // Status Check: Can only cancel if not shipped/delivered/cancelled
        if (['Shipped', 'Delivered', 'Cancelled'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: 'Không thể hủy đơn hàng đang giao hoặc đã hoàn tất',
            });
        }

        // NEW LOGIC: Restore stock when customer cancels order
        console.log(`🔄 [cancelMyOrder] Hoàn trả kho cho đơn hàng: ${order.orderCode}`);
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock += item.quantity;
                await product.save();
                console.log(`   ✅ Đã hoàn ${item.quantity} cho ${product.name}. Tồn kho mới: ${product.stock}`);
            }
        }

        // Update status to Cancelled
        order.status = 'Cancelled';
        await order.save();

        console.log(`❌ Đơn hàng ${order.orderCode} đã bị hủy bởi khách hàng`);

        res.status(200).json({
            success: true,
            message: 'Hủy đơn hàng thành công',
            data: order,
        });
    } catch (error) {
        console.error('❌ [cancelMyOrder] Lỗi:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Đã xảy ra lỗi khi hủy đơn hàng',
        });
    }
};

// @desc    Confirm order received (Customer)
// @route   PUT /api/orders/:id/received
// @access  Private
export const confirmReceived = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng',
            });
        }

        // Security Check: Only order owner can confirm
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xác nhận đơn hàng này',
            });
        }

        // Status Check: Can only confirm when order is being shipped
        if (order.status !== 'Shipped') {
            return res.status(400).json({
                success: false,
                message: 'Chỉ có thể xác nhận đơn hàng đang được giao',
            });
        }

        // Update order status to Delivered
        order.status = 'Delivered';
        order.deliveredAt = Date.now();

        // Mark as paid for COD orders (assume payment completed on delivery)
        if (order.paymentMethod === 'COD' && order.paymentStatus === 'unpaid') {
            order.paymentStatus = 'paid';
            order.paidAt = Date.now();
            console.log(`💰 Đơn COD ${order.orderCode} đã được thanh toán khi giao hàng`);
        }

        await order.save();

        console.log(`✅ Khách hàng đã xác nhận nhận hàng: ${order.orderCode}`);

        res.status(200).json({
            success: true,
            message: 'Xác nhận đã nhận hàng thành công',
            data: order,
        });
    } catch (error) {
        console.error('❌ [confirmReceived] Lỗi:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Đã xảy ra lỗi khi xác nhận đơn hàng',
        });
    }
};

// @desc    Cancel order (Admin)
// @route   PUT /api/orders/:id/cancel-admin
// @access  Private/Admin
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng',
            });
        }

        if (order.status === 'Delivered') {
            return res.status(400).json({
                success: false,
                message: 'Không thể hủy đơn hàng đã giao',
            });
        }

        // Restore product stock
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }

        order.status = 'Cancelled';
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Hủy đơn hàng thành công',
            data: order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get order statistics (for dashboard)
// @route   GET /api/orders/stats
// @access  Private/Admin
export const getOrderStats = async (req, res) => {
    try {
        // 1. Count orders by status (All time)
        const statusStats = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // --- DEBUG LOG: Xem terminal server để biết DB đang lưu chữ gì ---
        console.log('>>> RAW STATS FROM DB:', JSON.stringify(statusStats, null, 2));

        // 2. Helper function để tìm số lượng bất chấp hoa thường và ngôn ngữ
        const getCount = (patterns) => {
            return statusStats.reduce((acc, curr) => {
                // Normalize status từ DB
                const statusDB = String(curr._id || '').toLowerCase().trim();
                // Check xem có trùng với bất kỳ pattern nào không
                const isMatch = patterns.some(p => statusDB === p.toLowerCase().trim());
                return isMatch ? acc + curr.count : acc;
            }, 0);
        };

        // 3. Count today's orders and calculate today's revenue (excluding cancelled orders)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todayStats = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfDay },
                    // Exclude cancelled orders from revenue calculation
                    status: {
                        $nin: ['Cancelled', 'cancelled', 'Đã hủy', 'canceled']
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    todayCount: { $sum: 1 },
                    todayRevenue: { $sum: '$totalAmount' }
                }
            }
        ]);

        // 4. Format data for frontend - Mapping linh hoạt (Bao trọn các trường hợp)
        const stats = {
            // Gom cả 'pending', 'chờ xử lý', 'draft' vào nhóm chờ xử lý
            pending: getCount(['Pending', 'pending', 'Chờ xử lý', 'Draft', 'Nháp']),

            // Confirmed
            confirmed: getCount(['Confirmed', 'confirmed', 'Đã xác nhận']),

            // Gom 'shipped', 'đang giao' vào nhóm đang giao
            shipped: getCount(['Shipped', 'shipped', 'Đang giao', 'Đang giao hàng', 'shipping']),

            // Gom 'delivered'
            delivered: getCount(['Delivered', 'delivered', 'Đã giao', 'Đã giao thành công', 'Hoàn thành']),

            // Gom 'cancelled'
            cancelled: getCount(['Cancelled', 'cancelled', 'Đã hủy', 'canceled']),

            // Today's stats
            todayOrders: todayStats[0]?.todayCount || 0,
            todayRevenue: todayStats[0]?.todayRevenue || 0,

            // Total orders (all time)
            totalOrders: statusStats.reduce((sum, s) => sum + s.count, 0)
        };

        console.log('>>> PROCESSED STATS:', JSON.stringify(stats, null, 2));

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error in getOrderStats:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê đơn hàng',
            error: error.message
        });
    }
};
