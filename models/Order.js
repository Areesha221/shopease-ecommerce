const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        _id: String,
        name: String,
        price: Number,
        image: String,
        quantity: Number
    }],
    customer: {
        fullName: String,
        email: String,
        address: String,
        city: String,
        postalCode: String,
        phone: String
    },
    totals: {
        subtotal: Number,
        shipping: Number,
        total: Number
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);