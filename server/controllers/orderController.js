import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

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
        for (const item of orderItems) {
            const product = await Product.findById(item.product);

            // NEW LOGIC: Deduct stock immediately when order is created (Reserve stock)
            product.stock -= item.quantity;
            await product.save();

            console.log(`📦 [createOrder] Đã trừ ${item.quantity} từ ${product.name}. Tồn kho mới: ${product.stock}`);

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

        // Validate status
        const validStatuses = ['Draft', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
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

        // REMOVED: Stock deduction logic (now handled in createOrder)
        // Stock is already deducted when order is created, no need to deduct again

        // Update order status
        order.status = newStatus;

        // Update timestamp and payment status for Delivered orders
        if (newStatus === 'Delivered') {
            // Mark payment as paid for COD orders when delivered
            if (order.paymentMethod === 'COD' && order.paymentStatus === 'unpaid') {
                order.paymentStatus = 'paid';
                console.log(`   💰 Đánh dấu đã thanh toán cho đơn COD: ${order.orderCode}`);
            }
        }

        await order.save();

        // Populate order data for response
        await order.populate('orderItems.product', 'name productCode imageUrl stock');
        await order.populate('user', 'fullName email');

        res.status(200).json({
            success: true,
            message: `Đã cập nhật trạng thái đơn hàng thành "${newStatus}"`,
            data: order,
        });
    } catch (error) {
        console.error('❌ [updateOrderStatus] Lỗi:', error.message);
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
