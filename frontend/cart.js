document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');

    // Get cart from memory
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // If cart is empty
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty!</p>';
        cartTotalElement.innerText = '0';
        return;
    }

    let total = 0;

    // Loop through cart and display items
    cart.forEach((product, index) => {
        const itemTotal = product.price * (product.quantity || 1);
        total += itemTotal;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="cart-item-details">
                <h4>${product.name}</h4>
                <p>$${product.price} x ${product.quantity || 1}</p>
                <p class="item-total">Subtotal: $${itemTotal}</p>
            </div>
            <div class="quantity-controls-small">
                <button onclick="updateQuantity(${index}, -1)"><i class="fas fa-minus"></i></button>
                <span>${product.quantity || 1}</span>
                <button onclick="updateQuantity(${index}, 1)"><i class="fas fa-plus"></i></button>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItemsContainer.appendChild(itemDiv);
    });

    // Update total price
    cartTotalElement.innerText = total;

    // Make functions global
    window.updateQuantity = (index, change) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        if (!cart[index]) return;

        let newQuantity = (cart[index].quantity || 1) + change;

        if (newQuantity < 1) newQuantity = 1;
        if (newQuantity > 99) {
            showToast('Maximum 99 items allowed', 'warning');
            newQuantity = 99;
        }

        cart[index].quantity = newQuantity;

        localStorage.setItem('cart', JSON.stringify(cart));
        window.location.reload();
    };

    window.removeFromCart = (index) => {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));

        // ✅ INSTANT COUNT UPDATE (No toast)
        updateCartCount();
        window.location.reload();
    };
    // ✅ CHECKOUT BUTTON LOGIC
    const checkoutBtn = document.getElementById('checkout-btn');

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];

            if (cart.length === 0) {
                showToast('Your cart is empty! Add items first.', 'error');
                return;
            }

            // Checkout page par jao
            window.location.href = 'checkout.html';
        });
    }
});