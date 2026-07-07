const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        trim: true
    },
    image: {
        type: String,
        required: [true, 'Please add an image URL'],
        default: 'https://via.placeholder.com/300'
    },
    stock: {
        type: Number,
        required: [true, 'Please add stock quantity'],
        min: [0, 'Stock cannot be negative']
    }
}, {
    timestamps: true  // ✅ SAHI - Second argument mein hai!
});

module.exports = mongoose.model('Product', productSchema);