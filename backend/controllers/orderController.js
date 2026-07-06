const Order = require('../models/Order');

// Create new order
const createOrder = async (req, res) => {
    try {
        const { items, customer, totals } = req.body;
        
        const newOrder = await Order.create({
            user: req.userId,
            items,
            customer,
            totals
        });

        res.status(201).json(newOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get user's orders
const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.userId }).sort({ orderDate: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get all orders (Admin)
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ orderDate: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get order by ID
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update order status (Admin)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get admin stats
const getAdminStats = async (req, res) => {
    try {
        const Product = require('../models/Product');
        const User = require('../models/User');

        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        
        // ✅ FIX: Only count delivered/processing orders for revenue (not cancelled)
        const orders = await Order.find({ 
            status: { $in: ['processing', 'shipped', 'delivered'] } 
        });
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totals?.total || 0), 0);

        res.status(200).json({
            totalProducts,
            totalOrders,
            totalUsers,
            totalRevenue
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
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