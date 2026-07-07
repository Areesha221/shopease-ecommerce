const Product = require('../models/Product');

// 1. GET ALL PRODUCTS (Public)
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 2. GET SINGLE PRODUCT (Public)
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// 3. CREATE PRODUCT (Admin Only)
const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;
        
        // Debug logs
        console.log('Received data:', req.body);
        console.log('Image URL:', image);
        
        const product = new Product({
            name,
            description,
            price,
            category,
            image: image || 'https://via.placeholder.com/300', // Default image
            stock,
            user: req.user._id
        });
        
        await product.save();
        
        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// 4. UPDATE PRODUCT (Admin Only)
const updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// 5. DELETE PRODUCT (Admin Only)
const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { 
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
};