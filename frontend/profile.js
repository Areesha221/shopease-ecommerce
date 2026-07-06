document.addEventListener('DOMContentLoaded', async () => {
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userString || !token) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(userString);
    
    // Display profile info
    const profileInfo = document.getElementById('profile-info');
    profileInfo.innerHTML = `
        <div class="info-row">
            <label>Name:</label>
            <span>${user.name}</span>
        </div>
        <div class="info-row">
            <label>Email:</label>
            <span>${user.email}</span>
        </div>
        <div class="info-row">
            <label>Member Since:</label>
            <span>${new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
        </div>
        <div class="info-row">
            <label>Account Type:</label>
            <span class="badge ${user.role === 'admin' ? 'admin' : 'user'}">
                ${user.role === 'admin' ? 'Administrator' : 'Customer'}
            </span>
        </div>
    `;
    
    // Fetch real orders from backend
    let totalOrders = 0;
    let pendingOrders = 0;
    
    try {
        const ordersRes = await fetch('http://localhost:3000/api/orders/my-orders', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (ordersRes.ok) {
            const orders = await ordersRes.json();
            totalOrders = orders.length;
            pendingOrders = orders.filter(o => o.status === 'pending').length;
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
    
    // Update stats
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('wishlist-count-stat').textContent = wishlist.length;
    
    const pendingElement = document.getElementById('pending-orders');
    if (pendingElement) {
        pendingElement.textContent = pendingOrders;
    }
});

window.logout = () => {
    localStorage.clear();
    showToast('Logged out successfully!', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
};