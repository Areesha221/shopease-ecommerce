const Order = require('../models/Order');
const Product = require('../models/Product');

// Create Order
const createOrder = async (req, res) => {
    try {
        const { items, customer, totals } = req.body;

        // Validation
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        if (!customer || !customer.fullName || !customer.email) {
            return res.status(400).json({ message: 'Customer details required' });
        }

        // ✅ User check - agar login hai toh user attach karo
        let userId = null;
        if (req.user && req.user._id) {
            userId = req.user._id;
        }

        const order = new Order({
            user: userId,  // ✅ null bhi allow hoga
            items,
            customer,
            totals,
            orderDate: new Date(),
            status: 'pending'
        });

        await order.save();

        // Update product stock
        for (const item of items) {
            if (item._id) {
                await Product.findByIdAndUpdate(item._id, {
                    $inc: { stock: -(item.quantity || 1) }
                });
            }
        }

        res.status(201).json({
            message: 'Order placed successfully',
            order
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};

// Get User Orders
const getUserOrders = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Please login' });
        }

        const orders = await Order.find({ user: req.user._id })
            .sort({ orderDate: -1 });
        
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get All Orders (Admin)
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'name email')
            .sort({ orderDate: -1 });
        
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Order by ID
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email');
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is authorized
        if (req.user && order.user && order.user._id.toString() !== req.user._id.toString()) {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized' });
            }
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Order Status
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ message: 'Status required' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Admin Stats
const getAdminStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $group: { _id: null, total: { $sum: '$totals.total' } } }
        ]);

        const totalProducts = await Product.countDocuments();
        
        // Total users (assuming User model exists)
        let totalUsers = 0;
        try {
            const User = require('../models/User');
            totalUsers = await User.countDocuments();
        } catch (error) {
            console.log('User model not found');
        }

        res.status(200).json({
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalProducts,
            totalUsers
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    getAdminStats
};