const API_URL = 'https://shopease-ecommerce-2ut5.onrender.com/api';

// Helper function to get headers
function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Predefined Categories
const categories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Sports',
    'Books', 'Beauty', 'Toys', 'Automotive'
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

// ✅ Image URL Validation
function isValidImageUrl(url) {
    if (!url || url.trim() === '') return false;
    
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}

// ✅ Image Preview Function
function showImagePreview(imageUrl) {
    const imageField = document.getElementById('image');
    let preview = document.getElementById('image-preview-container');
    
    if (!preview) {
        preview = document.createElement('div');
        preview.id = 'image-preview-container';
        preview.style.cssText = 'margin-top: 10px; text-align: center;';
        imageField.parentNode.appendChild(preview);
    }
    
    if (isValidImageUrl(imageUrl)) {
        preview.innerHTML = `
            <img src="${imageUrl}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px; border: 2px solid #ddd;" onerror="this.parentElement.innerHTML='<p style=color:red;>Invalid image URL</p>'">
            <p style="font-size: 0.9rem; color: #666; margin-top: 5px;">Image Preview</p>
        `;
    } else {
        preview.innerHTML = '<p style="color: orange; font-size: 0.9rem;">Please enter a valid image URL</p>';
    }
}

// ===== IMAGE UPLOAD FUNCTIONS =====

// Tab Switching
window.switchUploadTab = (tab) => {
    console.log('Switching to tab:', tab);
    const urlTab = document.getElementById('url-tab');
    const uploadTab = document.getElementById('upload-tab');
    const buttons = document.querySelectorAll('.tab-btn');
    
    if (tab === 'url') {
        if (urlTab) {
            urlTab.classList.add('active');
            urlTab.style.display = 'block';
        }
        if (uploadTab) {
            uploadTab.classList.remove('active');
            uploadTab.style.display = 'none';
        }
        if (buttons[0]) buttons[0].classList.add('active');
        if (buttons[1]) buttons[1].classList.remove('active');
    } else {
        if (urlTab) {
            urlTab.classList.remove('active');
            urlTab.style.display = 'none';
        }
        if (uploadTab) {
            uploadTab.classList.add('active');
            uploadTab.style.display = 'block';
        }
        if (buttons[0]) buttons[0].classList.remove('active');
        if (buttons[1]) buttons[1].classList.add('active');
    }
};

// File Upload Handler
function initFileUpload() {
    const imageFileInput = document.getElementById('image-file');
    const fileNameDisplay = document.getElementById('file-name');
    const uploadProgress = document.getElementById('upload-progress');
    const progressBar = document.querySelector('.progress-bar');
    const imagePreview = document.getElementById('image-preview');
    const uploadedImageUrl = document.getElementById('uploaded-image-url');
    
    if (!imageFileInput) {
        console.error('File input not found!');
        return;
    }
    
    console.log('File upload initialized');
    
    // File input change event
    imageFileInput.addEventListener('change', (e) => {
        console.log('File selected:', e.target.files);
        handleFiles(e.target.files);
    });
    
    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            console.log('Handling file:', file.name, file.type, file.size);
            
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                alert('Invalid file type. Please upload JPG, PNG, GIF, or WebP images only.');
                return;
            }
            
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File too large. Maximum size is 5MB.');
                return;
            }
            
            // Show file name
            if (fileNameDisplay) {
                fileNameDisplay.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
            }
            
            // Show preview
            const reader = new FileReader();
            reader.onload = (event) => {
                if (imagePreview) {
                    imagePreview.innerHTML = `
                        <img src="${event.target.result}" alt="Preview">
                        <p>✓ Image loaded successfully</p>
                    `;
                }
            };
            reader.readAsDataURL(file);
            
            // Upload to backend
            uploadFile(file);
        }
    }
    
    async function uploadFile(file) {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('image', file);
        
        if (uploadProgress) uploadProgress.style.display = 'block';
        if (progressBar) progressBar.style.width = '30%';
        
        try {
            const response = await fetch('https://shopease-ecommerce-2ut5.onrender.com/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (progressBar) progressBar.style.width = '70%';
            
            if (response.ok) {
                const data = await response.json();
                console.log('Upload success:', data);
                if (uploadedImageUrl) {
                    uploadedImageUrl.value = data.imageUrl;
                }
                if (progressBar) progressBar.style.width = '100%';
                
                setTimeout(() => {
                    if (uploadProgress) uploadProgress.style.display = 'none';
                    if (progressBar) progressBar.style.width = '0%';
                }, 500);
                
                if (typeof showToast === 'function') {
                    showToast('Image uploaded successfully!', 'success');
                } else {
                    alert('Image uploaded successfully!');
                }
            } else {
                const error = await response.json();
                console.error('Upload failed:', error);
                if (typeof showToast === 'function') {
                    showToast(error.message || 'Failed to upload image', 'error');
                } else {
                    alert(error.message || 'Failed to upload image');
                }
                if (uploadProgress) uploadProgress.style.display = 'none';
            }
        } catch (error) {
            console.error('Upload error:', error);
            if (typeof showToast === 'function') {
                showToast('Error uploading image. Please try again.', 'error');
            } else {
                alert('Error uploading image. Please try again.');
            }
            if (uploadProgress) uploadProgress.style.display = 'none';
        }
    }
}

// 1. Load Products
function loadProducts() {
    const productsList = document.getElementById('admin-products-list');
    if (!productsList) return;

    fetch(`${API_URL}/products`)
        .then(response => response.json())
        .then(products => {
            productsList.innerHTML = '';
            
            if (products.length === 0) {
                productsList.innerHTML = '<p class="empty-text">No products yet.</p>';
                return;
            }

            products.forEach(product => {
                const item = document.createElement('div');
                item.className = 'admin-product-item';
                item.innerHTML = `
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/100'">
                    <div class="product-info">
                        <h4>${product.name}</h4>
                        <p class="product-category"><i class="fas fa-tag"></i> ${product.category}</p>
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
        })
        .catch(error => {
            console.error('Error loading products:', error);
            productsList.innerHTML = '<p class="error-text">Failed to load products</p>';
        });
}

// 2. Add or Update Product
const productForm = document.getElementById('product-form');
if (productForm) {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        const id = document.getElementById('product-id').value;
        
        // ✅ Check which tab is active
        const uploadTab = document.getElementById('upload-tab');
        const isUploadTabActive = uploadTab && uploadTab.classList.contains('active');
        
        // Get image URL based on active tab
        let imageUrl;
        if (isUploadTabActive) {
            imageUrl = document.getElementById('uploaded-image-url').value;
            if (!imageUrl) {
                alert('Please upload an image first');
                return;
            }
        } else {
            imageUrl = document.getElementById('image').value.trim();
            if (!imageUrl) {
                alert('Please enter an image URL');
                return;
            }
            if (!isValidImageUrl(imageUrl)) {
                alert('Please enter a valid image URL');
                return;
            }
        }
        
        const productData = {
            name: document.getElementById('name').value.trim(),
            description: document.getElementById('description').value.trim(),
            price: parseFloat(document.getElementById('price').value),
            stock: parseInt(document.getElementById('stock').value),
            category: document.getElementById('category').value,
            image: imageUrl
        };

        if (!productData.name || !productData.description || !productData.category) {
            alert('Please fill all required fields');
            return;
        }

        if (isNaN(productData.price) || productData.price <= 0) {
            alert('Please enter a valid price');
            return;
        }

        if (isNaN(productData.stock) || productData.stock < 0) {
            alert('Please enter a valid stock quantity');
            return;
        }

        if (!token) {
            alert('Please login as admin first');
            return;
        }

        try {
            let response;
            if (id) {
                response = await fetch(`${API_URL}/products/${id}`, {
                    method: 'PUT',
                    headers: getHeaders(),
                    body: JSON.stringify(productData)
                });
            } else {
                response = await fetch(`${API_URL}/products`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify(productData)
                });
            }

            const data = await response.json();

            if (response.ok) {
                alert(id ? 'Product Updated!' : 'Product Added!');
                resetForm();
                loadProducts();
                loadAdminStats();
            } else {
                alert(data.message || 'Failed to save product');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Server error! Please try again.');
        }
    });
}

// ✅ Image field par event listener add karo
const imageInput = document.getElementById('image');
if (imageInput) {
    // Preview show karo jab user URL type kare
    imageInput.addEventListener('input', (e) => {
        showImagePreview(e.target.value);
    });
    
    // Preview show karo jab user field se bahar click kare
    imageInput.addEventListener('blur', (e) => {
        showImagePreview(e.target.value);
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

    // ✅ Show image preview when editing
    showImagePreview(image);

    document.getElementById('form-title').innerText = 'Edit Product';
    document.getElementById('submit-btn').innerText = 'Update Product';
    document.getElementById('cancel-btn').style.display = 'inline-block';
    window.scrollTo(0, 0);
};

// 4. Delete Product
window.deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (response.ok) {
            alert('Product Deleted!');
            loadProducts();
            loadAdminStats();
        } else {
            alert('Failed to delete');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Server error!');
    }
};

// 5. Reset Form
function resetForm() {
    if (productForm) productForm.reset();
    document.getElementById('product-id').value = '';
    document.getElementById('form-title').innerText = 'Add New Product';
    document.getElementById('submit-btn').innerText = 'Add Product';
    document.getElementById('cancel-btn').style.display = 'none';
    
    // ✅ Clear image preview
    const preview = document.getElementById('image-preview-container');
    if (preview) {
        preview.remove();
    }
    
    // ✅ Clear file upload
    const imageFileInput = document.getElementById('image-file');
    const fileNameDisplay = document.getElementById('file-name');
    const imagePreview = document.getElementById('image-preview');
    const uploadedImageUrl = document.getElementById('uploaded-image-url');
    const uploadProgress = document.getElementById('upload-progress');
    
    if (imageFileInput) imageFileInput.value = '';
    if (fileNameDisplay) fileNameDisplay.textContent = '';
    if (imagePreview) imagePreview.innerHTML = '';
    if (uploadedImageUrl) uploadedImageUrl.value = '';
    if (uploadProgress) uploadProgress.style.display = 'none';
}

const cancelBtn = document.getElementById('cancel-btn');
if (cancelBtn) {
    cancelBtn.addEventListener('click', resetForm);
}

// ===== ADMIN STATS =====
async function loadAdminStats() {
    const token = localStorage.getItem('token');
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
        
        // Load users
        await loadUsers();
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load Orders
async function loadOrders() {
    const token = localStorage.getItem('token');
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
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            alert(`Order status updated to ${newStatus}`);
            loadAdminStats();
        } else {
            alert('Failed to update status');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

// View Order Details
window.viewOrderDetails = async (orderId) => {
    const token = localStorage.getItem('token');
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

// ===== USER MANAGEMENT =====
async function loadUsers() {
    const token = localStorage.getItem('token');
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
        const currentUser = JSON.parse(localStorage.getItem('user'));

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
                ${users.map(user => {
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

// View User Details
window.viewUserDetails = async (userId) => {
    const token = localStorage.getItem('token');
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
                    <div class="user-avatar-large">${user.name.charAt(0).toUpperCase()}</div>
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

// Toggle User Role
window.toggleUserRole = async (userId, currentRole) => {
    const token = localStorage.getItem('token');
    const newRole = currentRole === 'user' ? 'admin' : 'user';

    if (!confirm(`Are you sure you want to make this user an ${newRole}?`)) return;

    try {
        const response = await fetch(`${API_URL}/users/${userId}/role`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ role: newRole })
        });

        if (response.ok) {
            alert(`User role updated to ${newRole}`);
            loadUsers();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to update role');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

// Delete User
window.deleteUser = async (userId) => {
    const token = localStorage.getItem('token');
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert('User deleted successfully');
            loadUsers();
            loadAdminStats();
        } else {
            alert('Failed to delete user');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initCategoryDropdown();
    loadProducts();
    loadAdminStats();
    initFileUpload(); // ✅ File upload initialize karo
});