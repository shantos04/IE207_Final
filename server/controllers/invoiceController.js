import Invoice from '../models/Invoice.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Public (for testing)
export const getInvoices = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, startDate, endDate } = req.query;

        // Build query
        const query = {};
        if (status) query.status = status;

        // Date range filter (by issueDate)
        if (startDate || endDate) {
            query.issueDate = {};
            if (startDate) {
                // Set to start of day
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                query.issueDate.$gte = start;
            }
            if (endDate) {
                // Set to end of day
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.issueDate.$lte = end;
            }
        }

        // Debug: Log query for troubleshooting
        console.log('\ud83d\udd0d [getInvoices] Query:', JSON.stringify(query, null, 2));
        console.log('\ud83d\udcc5 [getInvoices] Date Params:', { startDate, endDate });

        // Execute query with pagination (CRITICAL: sort BEFORE pagination)
        const invoices = await Invoice.find(query)
            .sort({ issueDate: -1, createdAt: -1 }) // Sort by issue date first (newest), then createdAt
            .populate('order', 'orderCode totalPrice status')
            .populate('user', 'fullName email')
            .skip((page - 1) * limit)
            .limit(limit * 1);

        const count = await Invoice.countDocuments(query);

        res.status(200).json({
            success: true,
            data: invoices,
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

// @desc    Get invoice detail
// @route   GET /api/invoices/:id
// @access  Public (for testing)
export const getInvoiceDetail = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate({
                path: 'order',
                populate: {
                    path: 'orderItems.product',
                    select: 'name productCode price imageUrl',
                },
            })
            .populate('user', 'fullName email phone');

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn',
            });
        }

        res.status(200).json({
            success: true,
            data: invoice,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Create invoice from order
// @route   POST /api/invoices
// @access  Public (for testing)
export const createInvoice = async (req, res) => {
    try {
        const { orderId, dueDate, paymentMethod, notes } = req.body;

        // Kiểm tra order tồn tại
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng',
            });
        }

        // Kiểm tra đơn hàng đã có invoice chưa
        const existingInvoice = await Invoice.findOne({ order: orderId });

        if (existingInvoice) {
            return res.status(400).json({
                success: false,
                message: 'Đơn hàng này đã có hóa đơn',
                data: existingInvoice,
            });
        }

        // Tính dueDate nếu không được cung cấp (mặc định 7 ngày)
        const calculatedDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // Tạo invoice
        const invoice = await Invoice.create({
            order: orderId,
            user: order.user,
            totalAmount: order.totalPrice,
            dueDate: calculatedDueDate,
            paymentMethod: paymentMethod || order.paymentMethod,
            notes: notes || '',
            status: order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid',
        });

        // Populate để trả về đầy đủ thông tin
        const populatedInvoice = await Invoice.findById(invoice._id)
            .populate('order', 'orderCode totalPrice')
            .populate('user', 'fullName email');

        res.status(201).json({
            success: true,
            message: 'Tạo hóa đơn thành công',
            data: populatedInvoice,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Mark invoice as paid
// @route   PUT /api/invoices/:id/paid
// @access  Public (for testing)
export const markAsPaid = async (req, res) => {
    try {
        const { paymentMethod } = req.body;

        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn',
            });
        }

        if (invoice.status === 'Paid') {
            return res.status(400).json({
                success: false,
                message: 'Hóa đơn đã được thanh toán',
            });
        }

        if (invoice.status === 'Cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Không thể thanh toán hóa đơn đã hủy',
            });
        }

        // Cập nhật invoice
        invoice.status = 'Paid';
        invoice.paidAt = new Date();
        if (paymentMethod) {
            invoice.paymentMethod = paymentMethod;
        }
        await invoice.save();

        // Cập nhật order payment status
        const order = await Order.findById(invoice.order);
        if (order) {
            order.paymentStatus = 'paid';
            await order.save();
        }

        res.status(200).json({
            success: true,
            message: 'Đánh dấu thanh toán thành công',
            data: invoice,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update invoice status
// @route   PUT /api/invoices/:id/status
// @access  Public (for testing)
export const updateInvoiceStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const invoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái thành công',
            data: invoice,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Cancel invoice
// @route   PUT /api/invoices/:id/cancel
// @access  Public (for testing)
export const cancelInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn',
            });
        }

        if (invoice.status === 'Paid') {
            return res.status(400).json({
                success: false,
                message: 'Không thể hủy hóa đơn đã thanh toán',
            });
        }

        invoice.status = 'Cancelled';
        await invoice.save();

        res.status(200).json({
            success: true,
            message: 'Hủy hóa đơn thành công',
            data: invoice,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Sync missing invoices for delivered orders (Data Migration)
// @route   POST /api/invoices/sync-missing
// @access  Public (temporary endpoint for data migration)
export const syncMissingInvoices = async (req, res) => {
    try {
        console.log('\n🔄 [syncMissingInvoices] Starting invoice sync for delivered orders...');

        // Find ALL delivered orders (support both English and Vietnamese status)
        const deliveredOrders = await Order.find({
            status: { $in: ['Delivered', 'Đã giao', 'Completed', 'Hoàn thành'] }
        })
            .populate('user', 'fullName email')
            .sort({ deliveredAt: 1 }); // Oldest first

        console.log(`📦 [syncMissingInvoices] Found ${deliveredOrders.length} delivered orders`);

        let createdCount = 0;
        let alreadyExistsCount = 0;
        let errorCount = 0;
        const createdInvoices = [];
        const errors = [];

        // Iterate through each delivered order
        for (const order of deliveredOrders) {
            try {
                // Check if invoice already exists
                const existingInvoice = await Invoice.findOne({ order: order._id });

                if (existingInvoice) {
                    console.log(`   ✅ Order ${order.orderCode}: Invoice ${existingInvoice.invoiceNumber} already exists`);
                    alreadyExistsCount++;
                    continue;
                }

                // Create missing invoice
                console.log(`   📝 Order ${order.orderCode}: Creating invoice...`);

                // Generate invoice number explicitly to avoid race conditions
                const issueDate = order.deliveredAt || order.updatedAt || new Date();
                const year = issueDate.getFullYear();
                const month = String(issueDate.getMonth() + 1).padStart(2, '0');

                // Count existing invoices in the same month
                const count = await Invoice.countDocuments({
                    createdAt: {
                        $gte: new Date(year, issueDate.getMonth(), 1),
                        $lt: new Date(year, issueDate.getMonth() + 1, 1),
                    },
                });

                const invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;

                const invoiceData = {
                    invoiceNumber,
                    user: order.user._id || order.user,
                    order: order._id,
                    totalAmount: order.totalAmount,
                    status: 'Paid', // Mark as paid since order is delivered
                    paymentMethod: order.paymentMethod || 'COD',
                    issueDate: issueDate,
                    dueDate: issueDate,
                    paidAt: order.paidAt || order.deliveredAt || new Date(),
                    notes: `Hóa đơn tự động đồng bộ cho đơn hàng ${order.orderCode} (Đã giao hàng)`,
                };

                const newInvoice = await Invoice.create(invoiceData);

                console.log(`   ✅ Order ${order.orderCode}: Created invoice ${newInvoice.invoiceNumber}`);
                console.log(`      💵 Amount: ${newInvoice.totalAmount.toLocaleString('vi-VN')}đ`);
                console.log(`      📅 Issue Date: ${newInvoice.issueDate.toLocaleDateString('vi-VN')}`);

                createdCount++;
                createdInvoices.push({
                    orderCode: order.orderCode,
                    invoiceNumber: newInvoice.invoiceNumber,
                    totalAmount: newInvoice.totalAmount,
                    issueDate: newInvoice.issueDate,
                });

            } catch (orderError) {
                console.error(`   ❌ Order ${order.orderCode}: Error creating invoice:`, orderError.message);
                errorCount++;
                errors.push({
                    orderCode: order.orderCode,
                    orderId: order._id,
                    error: orderError.message,
                });
            }
        }

        console.log('\n📊 [syncMissingInvoices] Sync Summary:');
        console.log(`   Total Delivered Orders: ${deliveredOrders.length}`);
        console.log(`   ✅ Invoices Created: ${createdCount}`);
        console.log(`   ℹ️ Already Had Invoices: ${alreadyExistsCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        console.log('\n✅ [syncMissingInvoices] Sync complete!\n');

        res.status(200).json({
            success: true,
            message: `Sync complete. Created ${createdCount} invoices for delivered orders.`,
            summary: {
                totalDeliveredOrders: deliveredOrders.length,
                createdCount,
                alreadyExistsCount,
                errorCount,
            },
            createdInvoices,
            errors: errorCount > 0 ? errors : undefined,
        });

    } catch (error) {
        console.error('\n❌ [syncMissingInvoices] Fatal Error:', error.message);
        console.error('Stack:', error.stack);

        res.status(500).json({
            success: false,
            message: 'Error during invoice sync: ' + error.message,
        });
    }
};
