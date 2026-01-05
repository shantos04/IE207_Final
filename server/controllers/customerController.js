import Customer from '../models/Customer.js';
import Order from '../models/Order.js';

// @desc    Get all customers
// @route   GET /api/customers
// @access  Public (for testing)
export const getCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 10, keyword, status } = req.query;

        // Build query
        const query = {};

        // Search by keyword (name, email, phone)
        if (keyword) {
            query.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } },
                { phone: { $regex: keyword, $options: 'i' } },
            ];
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Execute query with pagination
        const customers = await Customer.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Customer.countDocuments(query);

        // Mock totalOrders and totalSpent for UI display
        const customersWithStats = customers.map((customer) => {
            const customerObj = customer.toObject();

            // Generate random stats for demo
            customerObj.totalOrders = Math.floor(Math.random() * 50) + 1; // 1-50 orders
            customerObj.totalSpent = Math.floor(Math.random() * 10000000) + 500000; // 500k-10.5M VND

            return customerObj;
        });

        res.status(200).json({
            success: true,
            data: customersWithStats,
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

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Public (for testing)
export const getCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khách hàng',
            });
        }

        // Get real order stats
        const orders = await Order.find({ 'customer.email': customer.email });
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);

        const customerObj = customer.toObject();
        customerObj.totalOrders = totalOrders;
        customerObj.totalSpent = totalSpent;

        res.status(200).json({
            success: true,
            data: customerObj,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Create customer
// @route   POST /api/customers
// @access  Public (for testing)
export const createCustomer = async (req, res) => {
    try {
        const { name, email, phone, address, loyaltyPoints } = req.body;

        // Check if customer already exists
        const existingCustomer = await Customer.findOne({
            $or: [{ email }, { phone }],
        });

        if (existingCustomer) {
            return res.status(400).json({
                success: false,
                message: 'Email hoặc số điện thoại đã tồn tại',
            });
        }

        // Create customer
        const customer = await Customer.create({
            name,
            email,
            phone,
            address,
            loyaltyPoints: loyaltyPoints || 0,
        });

        res.status(201).json({
            success: true,
            message: 'Tạo khách hàng thành công',
            data: customer,
        });
    } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
            });
        }

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Public (for testing)
export const updateCustomer = async (req, res) => {
    try {
        const { name, email, phone, address, loyaltyPoints, status } = req.body;

        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khách hàng',
            });
        }

        // Check if email or phone is taken by another customer
        if (email || phone) {
            const existingCustomer = await Customer.findOne({
                _id: { $ne: req.params.id },
                $or: [{ email: email || customer.email }, { phone: phone || customer.phone }],
            });

            if (existingCustomer) {
                return res.status(400).json({
                    success: false,
                    message: 'Email hoặc số điện thoại đã được sử dụng bởi khách hàng khác',
                });
            }
        }

        // Update fields
        if (name !== undefined) customer.name = name;
        if (email !== undefined) customer.email = email;
        if (phone !== undefined) customer.phone = phone;
        if (address !== undefined) customer.address = address;
        if (loyaltyPoints !== undefined) customer.loyaltyPoints = loyaltyPoints;
        if (status !== undefined) customer.status = status;

        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật khách hàng thành công',
            data: customer,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Public (for testing)
export const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khách hàng',
            });
        }

        // Check if customer has orders
        const orders = await Order.find({ 'customer.email': customer.email });

        if (orders.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Không thể xóa khách hàng đã có ${orders.length} đơn hàng. Hãy chuyển sang trạng thái inactive thay vì xóa.`,
            });
        }

        await Customer.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Xóa khách hàng thành công',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update loyalty points
// @route   PUT /api/customers/:id/loyalty
// @access  Public (for testing)
export const updateLoyaltyPoints = async (req, res) => {
    try {
        const { points, action } = req.body; // action: 'add' or 'subtract'

        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khách hàng',
            });
        }

        if (action === 'add') {
            customer.loyaltyPoints += points;
        } else if (action === 'subtract') {
            if (customer.loyaltyPoints < points) {
                return res.status(400).json({
                    success: false,
                    message: 'Không đủ điểm thưởng',
                });
            }
            customer.loyaltyPoints -= points;
        }

        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật điểm thưởng thành công',
            data: customer,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
