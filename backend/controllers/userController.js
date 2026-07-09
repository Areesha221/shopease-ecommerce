const User = require('../models/User');

// Get all users (Admin only)
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get user by ID (Admin only)
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update user role (Admin only) - USER ↔ ADMIN TOGGLE
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        
        // Validate role
        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Don't allow modifying yourself
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot modify your own role' });
        }
        
        user.role = role;
        await user.save();
        
        res.status(200).json({
            message: `User role updated to ${role}`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Don't allow deleting yourself
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete yourself' });
        }
        
        await user.deleteOne();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getUsers,
    getUserById,
    updateUserRole,
    deleteUser
};