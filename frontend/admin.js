const API_URL = 'https://shopease-ecommerce-2ut5.onrender.com/api/products';
const ORDERS_API = 'https://shopease-ecommerce-2ut5.onrender.com/api/orders';
const productForm = document.getElementById('product-form');
const productsList = document.getElementById('admin-products-list');
const adminOrdersList = document.getElementById('admin-orders-list');

// Helper function to get headers with Token
function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// 1. Fetch and Display Products
async function loadProducts() {
    try {
        const response = await fetch(API_URL);
        const products = await response.json();
        
        productsList.innerHTML = '';
        products.forEach(product => {
            const item = document.createElement('div');
            item.className = 'admin-product-item';
            item.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p>$${product.price} | Stock: ${product.stock}</p>
                </div>
                <div class="product-actions">
                    <button class="btn-edit" onclick="editProduct('${product._id}', '${product.name}', '${product.description}', ${product.price}, ${product.stock}, '${product.category}', '${product.image}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteProduct('${product._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            productsList.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// 2. Add or Update Product
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('product-id').value;
    const productData = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        price: document.getElementById('price').value,
        stock: document.getElementById('stock').value,
        category: document.getElementById('category').value,
        image: document.getElementById('image').value
    };

    try {
        let response;
        if (id) {
            response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(productData)
            });
        } else {
            response = await fetch(API_URL, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(productData)
            });
        }

        if (response.ok) {
            alert(id ? 'Product Updated!' : 'Product Added!');
            resetForm();
            loadProducts();
            loadAdminStats(); // Refresh stats
        } else {
            const data = await response.json();
            alert(data.message || 'Failed. Are you logged in as Admin?');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Server error!');
    }
});

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
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            
            if (response.ok) {
                alert('Product Deleted!');
                loadProducts();
                loadAdminStats();
            } else {
                alert('Failed to delete. Check admin access!');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
};

// 5. Reset Form
function resetForm() {
    productForm.reset();
    document.getElementById('product-id').value = '';
    document.getElementById('form-title').innerText = 'Add New Product';
    document.getElementById('submit-btn').innerText = 'Add Product';
    document.getElementById('cancel-btn').style.display = 'none';
}

document.getElementById('cancel-btn').addEventListener('click', resetForm);

// ===== ADMIN STATS & ORDERS (FIXED) =====
async function loadAdminStats() {
    const token = localStorage.getItem('token');
    
    try {
        // Fetch stats
        const statsRes = await fetch(`${ORDERS_API}/stats/admin`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (statsRes.ok) {
            const stats = await statsRes.json();
            document.getElementById('total-products-count').innerText = stats.totalProducts;
            document.getElementById('total-orders-count').innerText = stats.totalOrders;
            document.getElementById('total-users-count').innerText = stats.totalUsers;
            document.getElementById('total-revenue').innerText = `$${stats.totalRevenue.toFixed(2)}`;
        }

        // Load recent orders
        const ordersRes = await fetch(ORDERS_API, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (ordersRes.ok) {
            const orders = await ordersRes.json();
            
            if (orders.length === 0) {
                adminOrdersList.innerHTML = '<p class="empty-text">No orders yet.</p>';
            } else {
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
        }
    } catch (error) {
        console.error('Error loading admin stats:', error);
        adminOrdersList.innerHTML = '<p class="error-text">Failed to load orders. Please refresh.</p>';
    }
}

// Update order status
window.updateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${ORDERS_API}/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            showToast(`Order status updated to ${newStatus}`, 'success');
            loadAdminStats(); // Refresh stats (revenue will update if cancelled)
        } else {
            showToast('Failed to update status', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Network error', 'error');
    }
};

// View order details
window.viewOrderDetails = async (orderId) => {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${ORDERS_API}/${orderId}`, {
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

// Show order details modal
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
                            <img src="${item.image}" alt="${item.name}">
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

// Load on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadAdminStats();
});

// ===== USER MANAGEMENT =====
async function loadUsers() {
    const token = localStorage.getItem('token');
    const usersList = document.getElementById('admin-users-list');
    
    try {
        const response = await fetch('https://shopease-ecommerce-2ut5.onrender.com/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
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
                        <div class="users-table-row" onclick="viewUserDetails('${user._id}')">
                            <span><strong>${user.name}</strong></span>
                            <span>${user.email}</span>
                            <span>
                                <span class="badge ${user.role === 'admin' ? 'admin' : 'user'}">
                                    ${user.role}
                                </span>
                            </span>
                            <span>${new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                            <span class="user-actions">
                                <button class="btn-view-user" onclick="event.stopPropagation(); viewUserDetails('${user._id}')">
                                    <i class="fas fa-eye"></i> View
                                </button>
                                ${user.role !== 'admin' ? `
                                    <button class="btn-delete-user" onclick="event.stopPropagation(); deleteUser('${user._id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                ` : ''}
                            </span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading users:', error);
        usersList.innerHTML = '<p class="error-text">Failed to load users.</p>';
    }
}

// View user details
window.viewUserDetails = async (userId) => {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`https://shopease-ecommerce-2ut5.onrender.com/api/users/${userId}`, {
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

// Show user modal
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
                
                <div class="modal-section">
                    <h3>Account Actions</h3>
                    <div class="user-action-buttons">
                        ${user.role !== 'admin' ? `
                            <button class="btn-toggle-role" onclick="toggleUserRole('${user._id}', '${user.role}')">
                                <i class="fas fa-user-shield"></i> 
                                ${user.role === 'user' ? 'Make Admin' : 'Make User'}
                            </button>
                        ` : '<p class="info-text">Cannot modify admin accounts</p>'}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

// Toggle user role
window.toggleUserRole = async (userId, currentRole) => {
    const token = localStorage.getItem('token');
    const newRole = currentRole === 'user' ? 'admin' : 'user';
    
    if (!confirm(`Are you sure you want to make this user an ${newRole}?`)) return;
    
    try {
        const response = await fetch(`https://shopease-ecommerce-2ut5.onrender.com/api/users/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role: newRole })
        });
        
        if (response.ok) {
            showToast(`User role updated to ${newRole}`, 'success');
            loadUsers();
        } else {
            showToast('Failed to update role', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Network error', 'error');
    }
};

// Delete user
window.deleteUser = async (userId) => {
    const token = localStorage.getItem('token');
    
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
        const response = await fetch(`https://shopease-ecommerce-2ut5.onrender.com/api/users/${userId}`, {
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

// Update DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadAdminStats();
    loadUsers(); // Add this line
});