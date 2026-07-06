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
        showToast('Your cart is empty!', 'error');
        setTimeout(() => window.location.href = 'products.html', 2000);
        return;
    }

    let subtotal = 0;
    orderItemsContainer.innerHTML = '';

    items.forEach(item => {
        const quantity = item.quantity || 1;
        const price = item.price || 0;
        const itemTotal = price * quantity;
        subtotal += itemTotal;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'checkout-item';
        itemDiv.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="checkout-item-info">
            <h4>${item.name}</h4>
            <p>Quantity: ${quantity}</p>
            <p class="item-price">$${price} each</p>
        </div>
        <div class="checkout-item-total">
            <p>$${itemTotal.toFixed(2)}</p>
        </div>
    `;
        orderItemsContainer.appendChild(itemDiv);
    });
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + shipping;

    subtotalElement.innerText = `$${subtotal}`;
    shippingElement.innerText = shipping === 0 ? 'FREE' : `$${shipping}`;
    totalElement.innerText = `$${total}`;

    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please login to place order', 'error');
            setTimeout(() => window.location.href = 'login.html', 2000);
            return;
        }

        const orderData = {
            items: items,
            customer: {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                postalCode: document.getElementById('postalCode').value,
                phone: document.getElementById('phone').value
            },
            totals: {
                subtotal: subtotal,
                shipping: shipping,
                total: total
            }
        };

        try {
            const response = await fetch('http://localhost:3000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                const order = await response.json();

                // ✅ CLEAR CART/BUY NOW
                if (isBuyNow) {
                    localStorage.removeItem('buyNowItem');
                } else {
                    localStorage.removeItem('cart');
                }

                // Update cart badge
                if (typeof updateCartCount === 'function') {
                    updateCartCount();
                }

                // Show invoice
                showInvoice(order);
            } else {
                const data = await response.json();
                showToast(data.message || 'Failed to place order', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Network error. Please try again.', 'error');
        }
    });
});

// Invoice/Receipt Modal
function showInvoice(order) {
    const modal = document.createElement('div');
    modal.className = 'invoice-modal';
    modal.innerHTML = `
        <div class="invoice-content">
            <div class="invoice-header">
                <h2>🎉 Order Confirmed!</h2>
                <p>Order #${order._id.substring(0, 8).toUpperCase()}</p>
            </div>
            
            <div class="invoice-body">
                <div class="invoice-section">
                    <h3>Customer Details</h3>
                    <p><strong>${order.customer.fullName}</strong></p>
                    <p>${order.customer.email}</p>
                    <p>${order.customer.address}, ${order.customer.city}</p>
                    <p>Phone: ${order.customer.phone}</p>
                </div>
                
                <div class="invoice-section">
                    <h3>Items Ordered</h3>
                    ${order.items.map(item => `
                        <div class="invoice-item">
                            <span>${item.name} x ${item.quantity || 1}</span>
                            <span>$${(item.price || 0) * (item.quantity || 1)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="invoice-totals">
                    <div class="invoice-row">
                        <span>Subtotal:</span>
                        <span>$${order.totals.subtotal}</span>
                    </div>
                    <div class="invoice-row">
                        <span>Shipping:</span>
                        <span>${order.totals.shipping === 0 ? 'FREE' : '$' + order.totals.shipping}</span>
                    </div>
                    <div class="invoice-row total">
                        <span>Total Paid:</span>
                        <span>$${order.totals.total}</span>
                    </div>
                </div>
                
                <div class="invoice-footer">
                    <p>Order Date: ${new Date(order.orderDate).toLocaleDateString()}</p>
                    <p>Status: <span class="status-badge">Processing</span></p>
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