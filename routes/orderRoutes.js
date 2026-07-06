const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    getUserOrders, 
    getAllOrders, 
    getOrderById, 
    updateOrderStatus,
    getAdminStats 
} = require('../controllers/orderController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// User routes
router.post('/', verifyToken, createOrder);
router.get('/my-orders', verifyToken, getUserOrders);
router.get('/:id', verifyToken, getOrderById);

// Admin routes
router.get('/', verifyToken, isAdmin, getAllOrders);
router.put('/:id/status', verifyToken, isAdmin, updateOrderStatus);
router.get('/stats/admin', verifyToken, isAdmin, getAdminStats);

module.exports = router;