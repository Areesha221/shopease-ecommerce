document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const ordersList = document.getElementById('orders-list');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/orders/my-orders', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }

        const orders = await response.json();

        if (orders.length === 0) {
            ordersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>No orders yet</h3>
                    <p>Start shopping to see your orders here!</p>
                    <a href="products.html" class="btn-primary">Shop Now</a>
                </div>
            `;
            return;
        }

        ordersList.innerHTML = orders.map(order => {
            // Calculate total from items
            let orderTotal = 0;
            
            return `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <h4>Order #${order._id.substring(0, 8).toUpperCase()}</h4>
                            <p class="order-date">${new Date(order.orderDate).toLocaleString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}</p>
                        </div>
                        <span class="order-status status-${order.status}">${order.status || 'Pending'}</span>
                    </div>
                    
                    <div class="order-items">
                        ${order.items.map(item => {
                            // ✅ FIX: Ensure quantity exists
                            const quantity = item.quantity || 1;
                            const price = item.price || 0;
                            const itemTotal = quantity * price;
                            orderTotal += itemTotal;
                            
                            return `
                                <div class="order-item">
                                    <img src="${item.image}" alt="${item.name}">
                                    <div class="item-details">
                                        <h5>${item.name}</h5>
                                        <p>Qty: ${quantity} x $${price} = <strong>$${itemTotal.toFixed(2)}</strong></p>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="order-footer">
                        <div class="order-customer">
                            <p><i class="fas fa-user"></i> ${order.customer?.fullName || 'Guest'}</p>
                            <p><i class="fas fa-map-marker-alt"></i> ${order.customer?.address || 'N/A'}, ${order.customer?.city || 'N/A'}</p>
                            ${order.customer?.phone ? `<p><i class="fas fa-phone"></i> ${order.customer.phone}</p>` : ''}
                        </div>
                        <div class="order-total">
                            ${order.totals?.shipping !== undefined ? `
                                <p>Subtotal: $${order.totals.subtotal?.toFixed(2) || orderTotal.toFixed(2)}</p>
                                <p>Shipping: ${order.totals.shipping === 0 ? 'FREE' : '$' + order.totals.shipping.toFixed(2)}</p>
                            ` : ''}
                            <p>Total Paid: <strong>$${order.totals?.total?.toFixed(2) || orderTotal.toFixed(2)}</strong></p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error:', error);
        ordersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error loading orders</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
});