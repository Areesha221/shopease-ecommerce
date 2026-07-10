document.addEventListener('DOMContentLoaded', () => {
    const orderItemsContainer = document.getElementById('order-items');
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    const checkoutForm = document.getElementById('checkout-form');

    const buyNowItem = JSON.parse(localStorage.getItem('buyNowItem'));
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    let items = [];
    let isBuyNow = false;

    if (buyNowItem) {
        items = [buyNowItem];
        isBuyNow = true;
    } else if (cart.length > 0) {
        items = cart;
    } else {
        if (typeof showToast === 'function') {
            showToast('Your cart is empty!', 'error');
        } else {
            alert('Your cart is empty!');
        }
        setTimeout(() => window.location.href = 'products.html', 2000);
        return;
    }

    let subtotal = 0;
    orderItemsContainer.innerHTML = '';

    items.forEach(item => {
        const quantity = parseInt(item.quantity) || 1;
        const price = parseFloat(item.price) || 0;
        const itemTotal = price * quantity;
        
        if (!isNaN(itemTotal)) {
            subtotal += itemTotal;
        }

        const itemDiv = document.createElement('div');
        itemDiv.className = 'checkout-item';
        itemDiv.innerHTML = `
            <img src="${item.image || 'https://via.placeholder.com/100'}" alt="${item.name || 'Product'}">
            <div class="checkout-item-info">
                <h4>${item.name || 'Unknown Product'}</h4>
                <p>Quantity: ${quantity}</p>
                <p class="item-price">$${price.toFixed(2)} each</p>
            </div>
            <div class="checkout-item-total">
                <p>$${itemTotal.toFixed(2)}</p>
            </div>
        `;
        orderItemsContainer.appendChild(itemDiv);
    });

    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + shipping;

    subtotalElement.innerText = `$${subtotal.toFixed(2)}`;
    shippingElement.innerText = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    totalElement.innerText = `$${total.toFixed(2)}`;

    // Form submission
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            if (typeof showToast === 'function') {
                showToast('Please login to place order', 'error');
            } else {
                alert('Please login to place order');
            }
            setTimeout(() => window.location.href = 'login.html', 2000);
            return;
        }

        const orderData = {
            items: items.map(item => ({
                _id: item._id,
                name: item.name,
                price: parseFloat(item.price),
                quantity: parseInt(item.quantity) || 1,
                image: item.image
            })),
            customer: {
                fullName: document.getElementById('fullName').value.trim(),
                email: document.getElementById('email').value.trim(),
                address: document.getElementById('address').value.trim(),
                city: document.getElementById('city').value.trim(),
                postalCode: document.getElementById('postalCode').value.trim(),
                phone: document.getElementById('phone').value.trim()
            },
            totals: {
                subtotal: parseFloat(subtotal.toFixed(2)),
                shipping: parseFloat(shipping.toFixed(2)),
                total: parseFloat(total.toFixed(2))
            }
        };

        if (!orderData.customer.fullName || !orderData.customer.email || 
            !orderData.customer.address || !orderData.customer.city || 
            !orderData.customer.postalCode || !orderData.customer.phone) {
            if (typeof showToast === 'function') {
                showToast('Please fill all required fields', 'error');
            } else {
                alert('Please fill all required fields');
            }
            return;
        }

        try {
            console.log('Sending order:', orderData);
            
            const response = await fetch('https://shopease-ecommerce-2ut5.onrender.com/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const order = await response.json();
                console.log('Order successful:', order);

                // ✅ CLEAR CART - Sirf successful order par
                if (isBuyNow) {
                    localStorage.removeItem('buyNowItem');
                } else {
                    localStorage.removeItem('cart');
                }

                if (typeof window.updateCartCount === 'function') {
                    window.updateCartCount();
                }

                if (typeof showToast === 'function') {
                    showToast('Order placed successfully!', 'success');
                }

                showInvoice(order);
            } else {
                let errorMessage = 'Failed to place order';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                    console.error('Server error:', errorData);
                } catch (e) {
                    console.error('Error parsing error response:', e);
                }
                
                if (typeof showToast === 'function') {
                    showToast(errorMessage, 'error');
                } else {
                    alert(errorMessage);
                }
                // ❌ Cart clear NAHI hoga
            }
        } catch (error) {
            console.error('Network error:', error);
            if (typeof showToast === 'function') {
                showToast('Network error. Please check your connection and try again.', 'error');
            } else {
                alert('Network error. Please check your connection and try again.');
            }
            //  Cart clear NAHI hoga
        }
    });
});

// Invoice Modal
function showInvoice(order) {
    const modal = document.createElement('div');
    modal.className = 'invoice-modal';
    modal.innerHTML = `
        <div class="invoice-content">
            <div class="invoice-header">
                <h2>🎉 Order Confirmed!</h2>
                <p>Order #${order._id ? order._id.substring(0, 8).toUpperCase() : 'N/A'}</p>
            </div>
            
            <div class="invoice-body">
                <div class="invoice-section">
                    <h3>Customer Details</h3>
                    <p><strong>${order.customer?.fullName || 'N/A'}</strong></p>
                    <p>${order.customer?.email || 'N/A'}</p>
                    <p>${order.customer?.address || 'N/A'}, ${order.customer?.city || 'N/A'}</p>
                    <p>Phone: ${order.customer?.phone || 'N/A'}</p>
                </div>
                
                <div class="invoice-section">
                    <h3>Items Ordered</h3>
                    ${order.items && order.items.length > 0 ? order.items.map(item => `
                        <div class="invoice-item">
                            <span>${item.name} x ${item.quantity || 1}</span>
                            <span>$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                        </div>
                    `).join('') : '<p>No items</p>'}
                </div>
                
                <div class="invoice-totals">
                    <div class="invoice-row">
                        <span>Subtotal:</span>
                        <span>$${(order.totals?.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div class="invoice-row">
                        <span>Shipping:</span>
                        <span>${order.totals?.shipping === 0 ? 'FREE' : '$' + (order.totals?.shipping || 0).toFixed(2)}</span>
                    </div>
                    <div class="invoice-row total">
                        <span>Total Paid:</span>
                        <span>$${(order.totals?.total || 0).toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="invoice-footer">
                    <p>Order Date: ${order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}</p>
                    <p>Status: <span class="status-badge">${order.status || 'Processing'}</span></p>
                </div>
            </div>
            
            <div class="invoice-actions">
                <button onclick="window.print()" class="btn-print">
                    <i class="fas fa-print"></i> Print Invoice
                </button>
                <a href="orders.html" class="btn-primary">View Orders</a>
                <a href="index.html" class="btn-secondary">Continue Shopping</a>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}