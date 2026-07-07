// Cart count update function (Global)
function updateCartCount() {
    let cartData = localStorage.getItem('cart');
    let cart = [];
    
    try {
        cart = cartData ? JSON.parse(cartData) : [];
        if (!Array.isArray(cart)) {
            cart = [];
        }
    } catch (error) {
        console.error('Error parsing cart:', error);
        cart = [];
    }
    
    const totalItems = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        if (totalItems > 0) {
            cartCount.textContent = totalItems;
            cartCount.style.display = 'block';
        } else {
            cartCount.style.display = 'none';
        }
    }
}

// Toast notification function
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Load cart on page load
document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');

    // Get cart from memory with error handling
    let cartData = localStorage.getItem('cart');
    let cart = [];
    
    try {
        cart = cartData ? JSON.parse(cartData) : [];
        if (!Array.isArray(cart)) {
            cart = [];
        }
    } catch (error) {
        console.error('Error parsing cart:', error);
        cart = [];
    }

    // Update cart count immediately
    updateCartCount();

    // If cart is empty
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty!</p>';
        cartTotalElement.innerText = '0';
        return;
    }

    let total = 0;

    // Loop through cart and display items
    cart.forEach((product, index) => {
        // NaN check
        const price = parseFloat(product.price) || 0;
        const quantity = parseInt(product.quantity) || 1;
        const itemTotal = price * quantity;
        
        if (!isNaN(itemTotal)) {
            total += itemTotal;
        }

        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <img src="${product.image || 'https://via.placeholder.com/100'}" alt="${product.name || 'Product'}">
            <div class="cart-item-details">
                <h4>${product.name || 'Unknown Product'}</h4>
                <p>$${price.toFixed(2)} x ${quantity}</p>
                <p class="item-total">Subtotal: $${itemTotal.toFixed(2)}</p>
            </div>
            <div class="quantity-controls-small">
                <button onclick="updateQuantity(${index}, -1)"><i class="fas fa-minus"></i></button>
                <span>${quantity}</span>
                <button onclick="updateQuantity(${index}, 1)"><i class="fas fa-plus"></i></button>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItemsContainer.appendChild(itemDiv);
    });

    // Update total price
    cartTotalElement.innerText = total.toFixed(2);

    // Make functions global
    window.updateQuantity = (index, change) => {
        let cartData = localStorage.getItem('cart');
        let cart = [];
        
        try {
            cart = cartData ? JSON.parse(cartData) : [];
            if (!Array.isArray(cart)) {
                cart = [];
            }
        } catch (error) {
            console.error('Error parsing cart:', error);
            cart = [];
        }

        if (!cart[index]) return;

        let newQuantity = (parseInt(cart[index].quantity) || 1) + change;

        if (newQuantity < 1) newQuantity = 1;
        if (newQuantity > 99) {
            showToast('Maximum 99 items allowed', 'warning');
            newQuantity = 99;
        }

        cart[index].quantity = newQuantity;

        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count
        updateCartCount();
        
        // Reload page
        window.location.reload();
    };

    window.removeFromCart = (index) => {
        let cartData = localStorage.getItem('cart');
        let cart = [];
        
        try {
            cart = cartData ? JSON.parse(cartData) : [];
            if (!Array.isArray(cart)) {
                cart = [];
            }
        } catch (error) {
            console.error('Error parsing cart:', error);
            cart = [];
        }

        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));

        // Update cart count
        updateCartCount();
        
        // Reload page
        window.location.reload();
    };

    // Checkout button logic
    const checkoutBtn = document.getElementById('checkout-btn');

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            let cartData = localStorage.getItem('cart');
            let cart = [];
            
            try {
                cart = cartData ? JSON.parse(cartData) : [];
                if (!Array.isArray(cart)) {
                    cart = [];
                }
            } catch (error) {
                console.error('Error parsing cart:', error);
                cart = [];
            }

            if (cart.length === 0) {
                showToast('Your cart is empty! Add items first.', 'error');
                return;
            }

            window.location.href = 'checkout.html';
        });
    }
});