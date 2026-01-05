import Invoice from '../models/Invoice.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Public (for testing)
export const getInvoices = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        // Build query
        const query = {};
        if (status) query.status = status;

        // Execute query with pagination
        const invoices = await Invoice.find(query)
            .populate('order', 'orderCode totalPrice status')
            .populate('user', 'fullName email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

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
