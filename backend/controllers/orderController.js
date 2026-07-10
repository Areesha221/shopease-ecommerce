const Order = require('../models/Order');
const Product = require('../models/Product');

const createOrder = async (req, res) => {
    try {
        const { items, customer, totals } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        if (!customer || !customer.fullName || !customer.email) {
            return res.status(400).json({ message: 'Customer details required' });
        }

        const order = new Order({
            user: req.user ? req.user._id : null,
            items,
            customer,
            totals,
            orderDate: new Date(),
            status: 'pending'
        });

        await order.save();

        // ✅ Return complete order with all details
        const savedOrder = await Order.findById(order._id).populate('user', 'name email');

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
            order: savedOrder
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Baaki functions same rakho...
const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ orderDate: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'name email')
            .sort({ orderDate: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
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
        res.status(500).json({ message: 'Server error' });
    }
};

const getAdminStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $group: { _id: null, total: { $sum: '$totals.total' } } }
        ]);
        const totalProducts = await Product.countDocuments();
        
        res.status(200).json({
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalProducts
        });
    } catch (error) {
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