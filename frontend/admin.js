const API_URL = 'https://shopease-ecommerce-2ut5.onrender.com/api';
const token = localStorage.getItem('token');

// Helper function to get headers
function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Predefined Categories
const categories = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Books',
    'Beauty',
    'Toys',
    'Automotive'
];

// Initialize Category Dropdown
function initCategoryDropdown() {
    const categorySelect = document.getElementById('category');
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
    }
}

// 1. Load Products
async function loadUsers() {
    const usersList = document.getElementById('admin-users-list');
    if (!usersList || !token) return;

    // ✅ Get current logged-in admin
    const currentUser = JSON.parse(localStorage.getItem('user'));

    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to load users');
        }

        const users = await response.json();

        if (users.length === 0) {
            usersList.innerHTML = '<p class="empty-text">No users found.</p>';
            return;
        }

        // ✅ Updated rendering logic
        usersList.innerHTML = `
            <div class="users-table">
                <div class="users-table-header">
                    <span>Name</span>
                    <span>Email</span>
                    <span>Role</span>
                    <span>Joined</span>
                    <span>Actions</span>
                </div>
                ${users.map(user => {
                    // Check if this is the currently logged-in admin
                    const isCurrentUser = currentUser && user._id === currentUser._id;
                    
                    return `
                    <div class="users-table-row">
                        <span><strong>${user.name}</strong></span>
                        <span>${user.email}</span>
                        <span>
                            <span class="badge ${user.role === 'admin' ? 'admin' : 'user'}">
                                ${user.role} ${isCurrentUser ? '(You)' : ''}
                            </span>
                        </span>
                        <span>${new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                        <span class="user-actions">
                            <button class="btn-view-user" onclick="viewUserDetails('${user._id}')">
                                <i class="fas fa-eye"></i> View
                            </button>
                            ${!isCurrentUser ? `
                                <button class="btn-toggle-role" onclick="toggleUserRole('${user._id}', '${user.role}')">
                                    <i class="fas fa-user-shield"></i>
                                    ${user.role === 'user' ? 'Make Admin' : 'Make User'}
                                </button>
                                <button class="btn-delete-user" onclick="deleteUser('${user._id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : '<span class="info-text">Cannot modify</span>'}
                        </span>
                    </div>
                    `;
                }).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error loading users:', error);
        usersList.innerHTML = '<p class="error-text">Failed to load users.</p>';
    }
}

// 2. Add or Update Product
const productForm = document.getElementById('product-form');
if (productForm) {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('product-id').value;
        const productData = {
            name: document.getElementById('name').value.trim(),
            description: document.getElementById('description').value.trim(),
            price: parseFloat(document.getElementById('price').value),
            stock: parseInt(document.getElementById('stock').value),
            category: document.getElementById('category').value,
            image: document.getElementById('image').value.trim() || 'https://via.placeholder.com/300'
        };

        // Validation
        if (!productData.name || !productData.description || !productData.category) {
            showToast('Please fill all required fields', 'error');
            return;
        }

        if (!token) {
            showToast('Please login as admin first', 'error');
            return;
        }

        try {
            let response;
            if (id) {
                // Update
                response = await fetch(`${API_URL}/products/${id}`, {
                    method: 'PUT',
                    headers: getHeaders(),
                    body: JSON.stringify(productData)
                });
            } else {
                // Create
                response = await fetch(`${API_URL}/products`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify(productData)
                });
            }

            const data = await response.json();

            if (response.ok) {
                showToast(id ? 'Product Updated!' : 'Product Added!', 'success');
                resetForm();
                loadProducts();
                loadAdminStats();
            } else {
                showToast(data.message || 'Failed. Check admin access!', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Server error!', 'error');
        }
    });
}

// 3. Edit Product
window.editProduct = (id, name, description, price, stock, category, image) => {
    document.getElementById('product-id').value = id;
    document.getElementById('name').value = name;
    document.getElementById('description').value = description;
    document.getElementById('price').value = price;
    document.getElementById('stock').value = stock;
    document.getElementById('category').value = category;
    document.getElementById('image').value = image;

    document.getElementById('form-title').innerText = 'Edit Product';
    document.getElementById('submit-btn').innerText = 'Update Product';
    document.getElementById('cancel-btn').style.display = 'inline-block';
    window.scrollTo(0, 0);
};

// 4. Delete Product
window.deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (response.ok) {
            showToast('Product Deleted!', 'success');
            loadProducts();
            loadAdminStats();
        } else {
            showToast('Failed to delete', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Server error!', 'error');
    }
};

// 5. Reset Form
function resetForm() {
    if (productForm) {
        productForm.reset();
    }
    document.getElementById('product-id').value = '';
    document.getElementById('form-title').innerText = 'Add New Product';
    document.getElementById('submit-btn').innerText = 'Add Product';
    document.getElementById('cancel-btn').style.display = 'none';
}

const cancelBtn = document.getElementById('cancel-btn');
if (cancelBtn) {
    cancelBtn.addEventListener('click', resetForm);
}

// ===== ADMIN STATS =====
async function loadAdminStats() {
    if (!token) return;

    try {
        // Fetch stats
        const statsRes = await fetch(`${API_URL}/orders/stats/admin`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (statsRes.ok) {
            const stats = await statsRes.json();
            const totalProductsEl = document.getElementById('total-products-count');
            const totalOrdersEl = document.getElementById('total-orders-count');
            const totalUsersEl = document.getElementById('total-users-count');
            const totalRevenueEl = document.getElementById('total-revenue');

            if (totalProductsEl) totalProductsEl.innerText = stats.totalProducts || 0;
            if (totalOrdersEl) totalOrdersEl.innerText = stats.totalOrders || 0;
            if (totalUsersEl) totalUsersEl.innerText = stats.totalUsers || 0;
            if (totalRevenueEl) totalRevenueEl.innerText = `$${(stats.totalRevenue || 0).toFixed(2)}`;
        }

        // Load orders
        await loadOrders();
        
        // ✅ LOAD USERS
        await loadUsers();
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load Orders
async function loadOrders() {
    const adminOrdersList = document.getElementById('admin-orders-list');
    if (!adminOrdersList) return;

    try {
        const ordersRes = await fetch(`${API_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (ordersRes.ok) {
            const orders = await ordersRes.json();

            if (orders.length === 0) {
                adminOrdersList.innerHTML = '<p class="empty-text">No orders yet.</p>';
                return;
            }

            adminOrdersList.innerHTML = orders.map(order => `
                <div class="admin-order-item">
                    <div class="order-info">
                        <strong>#${order._id.substring(0, 8).toUpperCase()}</strong>
                        <p>${order.customer?.fullName || 'Guest'}</p>
                        <p style="font-size: 0.8rem; color: var(--text-secondary);">
                            ${order.customer?.email || 'No email'} | ${order.customer?.phone || 'No phone'}
                        </p>
                        <small>${new Date(order.orderDate).toLocaleString()}</small>
                    </div>
                    <div class="order-details">
                        <span class="order-items-count">${order.items.length} item(s)</span>
                        <span class="order-amount">$${order.totals?.total || 0}</span>
                        <select class="status-select" onchange="updateOrderStatus('${order._id}', this.value)">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                        <button class="btn-view-order" onclick="viewOrderDetails('${order._id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        adminOrdersList.innerHTML = '<p class="error-text">Failed to load orders</p>';
    }
}

// Update Order Status
window.updateOrderStatus = async (orderId, newStatus) => {
    try {
        const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            showToast(`Order status updated to ${newStatus}`, 'success');
            loadAdminStats();
        } else {
            showToast('Failed to update status', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Network error', 'error');
    }
};

// View Order Details
window.viewOrderDetails = async (orderId) => {
    try {
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const order = await response.json();
            showOrderModal(order);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

// Show Order Modal
function showOrderModal(order) {
    const modal = document.createElement('div');
    modal.className = 'order-modal';
    modal.innerHTML = `
        <div class="order-modal-content">
            <div class="modal-header">
                <h2>Order Details #${order._id.substring(0, 8).toUpperCase()}</h2>
                <button onclick="this.closest('.order-modal').remove()" class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="modal-body">
                <div class="modal-section">
                    <h3>Customer Information</h3>
                    <p><strong>${order.customer.fullName}</strong></p>
                    <p>${order.customer.email}</p>
                    <p>${order.customer.phone}</p>
                    <p>${order.customer.address}, ${order.customer.city} - ${order.customer.postalCode}</p>
                </div>
                
                <div class="modal-section">
                    <h3>Items Ordered</h3>
                    ${order.items.map(item => `
                        <div class="modal-item">
                            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/50'">
                            <div class="modal-item-info">
                                <h4>${item.name}</h4>
                                <p>Quantity: ${item.quantity} x $${item.price}</p>
                            </div>
                            <div class="modal-item-total">
                                <strong>$${item.quantity * item.price}</strong>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="modal-totals">
                    <div class="modal-row">
                        <span>Subtotal:</span>
                        <span>$${order.totals.subtotal}</span>
                    </div>
                    <div class="modal-row">
                        <span>Shipping:</span>
                        <span>${order.totals.shipping === 0 ? 'FREE' : '$' + order.totals.shipping}</span>
                    </div>
                    <div class="modal-row total">
                        <span>Total:</span>
                        <span>$${order.totals.total}</span>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <p>Order Date: ${new Date(order.orderDate).toLocaleString()}</p>
                    <p>Status: <span class="status-badge status-${order.status}">${order.status}</span></p>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

// ===== USER MANAGEMENT - FIXED =====
async function loadUsers() {
    const usersList = document.getElementById('admin-users-list');
    if (!usersList || !token) return;

    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to load users');
        }

        const users = await response.json();

        if (users.length === 0) {
            usersList.innerHTML = '<p class="empty-text">No users found.</p>';
            return;
        }

        usersList.innerHTML = `
            <div class="users-table">
                <div class="users-table-header">
                    <span>Name</span>
                    <span>Email</span>
                    <span>Role</span>
                    <span>Joined</span>
                    <span>Actions</span>
                </div>
                ${users.map(user => `
                    <div class="users-table-row">
                        <span><strong>${user.name}</strong></span>
                        <span>${user.email}</span>
                        <span>
                            <span class="badge ${user.role === 'admin' ? 'admin' : 'user'}">
                                ${user.role}
                            </span>
                        </span>
                        <span>${new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                        <span class="user-actions">
                            <button class="btn-view-user" onclick="viewUserDetails('${user._id}')">
                                <i class="fas fa-eye"></i> View
                            </button>
                            ${user.role !== 'admin' ? `
                                <button class="btn-toggle-role" onclick="toggleUserRole('${user._id}', '${user.role}')">
                                    <i class="fas fa-user-shield"></i>
                                    ${user.role === 'user' ? 'Make Admin' : 'Make User'}
                                </button>
                                <button class="btn-delete-user" onclick="deleteUser('${user._id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : '<span class="info-text">Cannot modify</span>'}
                        </span>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error loading users:', error);
        usersList.innerHTML = '<p class="error-text">Failed to load users. Make sure you\'re logged in as admin.</p>';
    }
}

// View User Details
window.viewUserDetails = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const user = await response.json();
            showUserModal(user);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

// Show User Modal
function showUserModal(user) {
    const modal = document.createElement('div');
    modal.className = 'order-modal';
    modal.innerHTML = `
        <div class="order-modal-content">
            <div class="modal-header">
                <h2>User Details</h2>
                <button onclick="this.closest('.order-modal').remove()" class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="modal-body">
                <div class="user-profile-header">
                    <div class="user-avatar-large">
                        ${user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3>${user.name}</h3>
                        <p class="badge ${user.role === 'admin' ? 'admin' : 'user'}">
                            ${user.role === 'admin' ? 'Administrator' : 'Customer'}
                        </p>
                    </div>
                </div>
                
                <div class="modal-section">
                    <h3>Contact Information</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <i class="fas fa-envelope"></i>
                            <span>${user.email}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-calendar"></i>
                            <span>Joined: ${new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

// Toggle User Role - USER ↔ ADMIN
window.toggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'user' ? 'admin' : 'user';

    if (!confirm(`Are you sure you want to make this user an ${newRole}?`)) return;

    try {
        const response = await fetch(`${API_URL}/users/${userId}/role`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ role: newRole })
        });

        if (response.ok) {
            showToast(`User role updated to ${newRole}`, 'success');
            loadUsers(); // Reload users
        } else {
            const data = await response.json();
            showToast(data.message || 'Failed to update role', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Network error', 'error');
    }
};

// Delete User
window.deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showToast('User deleted successfully', 'success');
            loadUsers();
            loadAdminStats();
        } else {
            showToast('Failed to delete user', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Network error', 'error');
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initCategoryDropdown();
    loadProducts();
    loadAdminStats();
    // loadUsers() is called from loadAdminStats()
});