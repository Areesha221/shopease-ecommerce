// ✅ Cart count update function (Global)
window.updateCartCount = function() {
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
    
    console.log('Cart count update - total items:', totalItems, 'cart:', cart);
    
    // Try multiple selectors for cart count badge
    const cartCountSelectors = [
        '.cart-count',
        '#cart-count',
        '.cart-badge',
        '.nav-cart-count',
        '[data-cart-count]'
    ];
    
    let cartCountElement = null;
    for (const selector of cartCountSelectors) {
        cartCountElement = document.querySelector(selector);
        if (cartCountElement) {
            console.log('Found cart count element with selector:', selector);
            break;
        }
    }
    
    if (cartCountElement) {
        if (totalItems > 0) {
            cartCountElement.textContent = totalItems;
            cartCountElement.style.display = 'block';
            cartCountElement.style.visibility = 'visible';
            cartCountElement.style.opacity = '1';
        } else {
            cartCountElement.textContent = '0';
            cartCountElement.style.display = 'none';
        }
    } else {
        console.log('Cart count element not found. Available elements:', document.querySelectorAll('[class*="cart"]').length);
    }
    
    // Cart preview
    const cartPreviewCount = document.getElementById('cart-preview-count');
    if (cartPreviewCount) {
        cartPreviewCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
    }
    
    const cartPreviewItems = document.getElementById('cart-preview-items');
    const previewTotalPrice = document.getElementById('preview-total-price');
    
    if (cartPreviewItems) {
        if (cart.length === 0) {
            cartPreviewItems.innerHTML = '<p class="empty-preview">Your cart is empty</p>';
        } else {
            let total = 0;
            cartPreviewItems.innerHTML = cart.map(item => {
                const itemTotal = (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
                total += itemTotal;
                return `
                    <div class="cart-preview-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-preview-item-info">
                            <h5>${item.name}</h5>
                            <p>$${item.price} x ${item.quantity || 1}</p>
                        </div>
                        <button class="cart-preview-item-remove" onclick="removeFromCartPreview('${item._id}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            }).join('');
            if (previewTotalPrice) {
                previewTotalPrice.textContent = `$${total.toFixed(2)}`;
            }
        }
    }
};

// Remove from cart preview
window.removeFromCartPreview = (productId) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item._id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    if (typeof window.updateCartCount === 'function') {
        window.updateCartCount();
    }
    
    if (typeof showToast === 'function') {
        showToast('Item removed from cart', 'info');
    }
    
    if (document.getElementById('cart-items')) {
        window.location.reload();
    }
};

// Toast notification
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

    console.log('Cart page loaded, cart items:', cart.length);

    // Update cart count immediately
    if (typeof window.updateCartCount === 'function') {
        window.updateCartCount();
    }

    if (cart.length === 0) {
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty!</p>';
        }
        if (cartTotalElement) {
            cartTotalElement.innerText = '0';
        }
        return;
    }

    let total = 0;

    cart.forEach((product, index) => {
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

    if (cartTotalElement) {
        cartTotalElement.innerText = total.toFixed(2);
    }

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
        
        if (typeof window.updateCartCount === 'function') {
            window.updateCartCount();
        }
        
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

        if (typeof window.updateCartCount === 'function') {
            window.updateCartCount();
        }
        
        window.location.reload();
    };

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