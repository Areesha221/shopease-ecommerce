const wishlistContainer = document.getElementById('wishlist-container');
const emptyWishlist = document.getElementById('empty-wishlist');

document.addEventListener('DOMContentLoaded', loadWishlist);

async function loadWishlist() {
    const wishlistIds = JSON.parse(localStorage.getItem('wishlist')) || [];

    if (wishlistIds.length === 0) {
        wishlistContainer.style.display = 'none';
        emptyWishlist.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/products');
        const allProducts = await response.json();

        // Filter products that are in the wishlist
        const wishlistProducts = allProducts.filter(p => wishlistIds.includes(p._id));

        wishlistContainer.innerHTML = '';
        wishlistProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card reveal';
            card.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                </div>
                <div class="card-body">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">$${product.price}</div>
                    <button class="add-to-cart-btn" onclick="moveToCart('${product._id}', '${product.name}', ${product.price}, '${product.image}')">
                        <i class="fas fa-shopping-cart"></i> Move to Cart
                    </button>
                    <button class="remove-wishlist-btn" onclick="removeFromWishlist('${product._id}')">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            `;
            wishlistContainer.appendChild(card);
        });

        setTimeout(() => {
            window.dispatchEvent(new Event('scroll'));
            // Manual reveal for newly added cards
            document.querySelectorAll('.reveal').forEach(el => {
                const elementTop = el.getBoundingClientRect().top;
                if (elementTop < window.innerHeight - 100) {
                    el.classList.add('active');
                }
            });
        }, 200);
    } catch (error) {
        console.error('Error loading wishlist:', error);
    }
}

window.moveToCart = (id, name, price, image) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item._id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ _id: id, name, price, image, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // ✅ INSTANT COUNT UPDATE (No toast)
    updateCartCount();
    removeFromWishlist(id);
};

window.removeFromWishlist = (id) => {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    wishlist = wishlist.filter(itemId => itemId !== id);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    // ✅ INSTANT COUNT UPDATE (No toast)
    updateWishlistCount();
    loadWishlist();
};