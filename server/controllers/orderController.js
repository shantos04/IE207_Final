import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Get my orders (Customer)
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
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

        // 2. Validate and populate product details (NO STOCK DEDUCTION HERE)
        const processedOrderItems = [];
        let calculatedTotal = 0;

        for (const item of orderItems) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Không tìm thấy sản phẩm với ID: ${item.product}`,
                });
            }

            // Note: We check stock but DON'T deduct it yet
            // Stock will be deducted when order status changes to 'Shipped'
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Sản phẩm ${product.name} hiện tại không đủ hàng (còn ${product.stock})`,
                });
            }

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
        if (req.user?.id && shippingAddress) {
            try {
                const userRecord = await User.findById(req.user.id);
                if (userRecord) {
                    // Check if address already exists
                    const addressExists = userRecord.addresses?.some(
                        addr => JSON.stringify(addr) === JSON.stringify(shippingAddress)
                    );

                    if (!addressExists) {
                        await User.findByIdAndUpdate(
                            req.user.id,
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
            createdBy: req.user.id,
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

        // Find order first to check current status
        const order = await Order.findById(req.params.id).populate('orderItems.product');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng',
            });
        }

        const oldStatus = order.status;

        // CRITICAL BUSINESS LOGIC: Deduct stock ONLY when status changes to 'Shipped'
        if (status === 'Shipped' && oldStatus !== 'Shipped') {
            // Validate stock availability before deducting
            for (const item of order.orderItems) {
                const product = await Product.findById(item.product);

                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: `Không tìm thấy sản phẩm: ${item.productName}`,
                    });
                }

                // Check if there's enough stock
                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Sản phẩm "${product.name}" không đủ hàng để xuất kho. Còn lại: ${product.stock}, Cần: ${item.quantity}`,
                    });
                }
            }

            // All products have enough stock, proceed with deduction
            for (const item of order.orderItems) {
                await Product.findByIdAndUpdate(
                    item.product,
                    { $inc: { stock: -item.quantity } },
                    { new: true }
                );
            }

            console.log(`✅ Stock deducted for order ${order._id} when status changed to Shipped`);
        }

        // Update order status
        order.status = status;
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái thành công',
            data: order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
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

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
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
