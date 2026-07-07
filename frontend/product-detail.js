// Global product variable
let product = null;

// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

document.addEventListener('DOMContentLoaded', () => {
    if (!productId) {
        window.location.href = 'products.html';
        return;
    }
    loadProductDetail(productId);
    setupQuantityControls();
});

// Load product details
async function loadProductDetail(id) {
    try {
        const response = await fetch(`https://shopease-ecommerce-2ut5.onrender.com/api/products/${id}`);

        if (!response.ok) {
            showToast('Product not found!', 'error');
            setTimeout(() => window.location.href = 'products.html', 2000);
            return;
        }

        product = await response.json(); // Global variable set karo
        displayProductDetail(product);
        setupQuantityControls();
        loadRelatedProducts(product.category, id);
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to load product', 'error');
    }
}

// Display product details
function displayProductDetail(product) {
    document.getElementById('breadcrumb-product').textContent = product.name;
    document.getElementById('main-image').src = product.image;
    document.getElementById('detail-name').textContent = product.name;
    document.getElementById('detail-category').textContent = product.category;
    document.getElementById('detail-price').textContent = `$${product.price}`;
    document.getElementById('detail-description').textContent = product.description;

    // Set original price (20% higher for discount display)
    const originalPrice = Math.round(product.price * 1.2);
    document.getElementById('detail-original-price').textContent = `$${originalPrice}`;

    // Stock status
    const stockStatus = document.getElementById('stock-status');
    if (product.stock > 0) {
        stockStatus.innerHTML = `<i class="fas fa-check-circle" style="color: #28a745;"></i><span>In Stock (${product.stock} available)</span>`;
    } else {
        stockStatus.innerHTML = `<i class="fas fa-times-circle" style="color: #dc3545;"></i><span>Out of Stock</span>`;
        stockStatus.classList.add('out-of-stock');
        document.getElementById('btn-add-cart').disabled = true;
        document.querySelector('.btn-buy-now').disabled = true;
    }

    // Set thumbnails (using same image with different filters for demo)
    document.querySelectorAll('.thumb').forEach(thumb => {
        thumb.src = product.image;
    });

    // Image zoom effect
    const mainImage = document.getElementById('main-image');
    const zoomContainer = document.querySelector('.image-zoom-container');

    zoomContainer.addEventListener('mousemove', (e) => {
        const rect = zoomContainer.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        mainImage.style.transformOrigin = `${x}% ${y}%`;
        mainImage.style.transform = 'scale(1.5)';
    });

    zoomContainer.addEventListener('mouseleave', () => {
        mainImage.style.transform = 'scale(1)';
    });

    // Add to Cart button
    document.getElementById('btn-add-cart').addEventListener('click', () => {
        const quantity = parseInt(document.getElementById('quantity').value);

        // Check if quantity exceeds stock
        if (quantity > product.stock) {
            showToast(`Only ${product.stock} items available in stock`, 'error');
            return;
        }

        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Check if product already exists in cart
        const existingItem = cart.find(item => item._id === product._id);

        if (existingItem) {
            const newTotal = (existingItem.quantity || 1) + quantity;
            if (newTotal > product.stock) {
                showToast(`Cannot add more. Only ${product.stock} items available in total`, 'error');
                return;
            }
            existingItem.quantity = newTotal;
        } else {
            cart.push({
                _id: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));

        // Update cart badge
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
    });

    // ✅ BUY NOW BUTTON - FIXED
    document.querySelector('.btn-buy-now').addEventListener('click', () => {
        const quantity = parseInt(document.getElementById('quantity').value);

        // Check if quantity exceeds stock
        if (quantity > product.stock) {
            showToast(`Only ${product.stock} items available in stock`, 'error');
            return;
        }

        // Create buy now item
        const buyNowItem = {
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity,
            buyNow: true
        };

        // Save to localStorage
        localStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));

        // Redirect to checkout
        window.location.href = 'checkout.html';
    });

    // Wishlist button
    document.getElementById('btn-wishlist').addEventListener('click', () => {
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const index = wishlist.indexOf(product._id);

        if (index > -1) {
            wishlist.splice(index, 1);
            showToast('Removed from wishlist', 'info');
            document.getElementById('btn-wishlist').innerHTML = '<i class="far fa-heart"></i>';
        } else {
            wishlist.push(product._id);
            showToast('Added to wishlist! ❤️', 'success');
            document.getElementById('btn-wishlist').innerHTML = '<i class="fas fa-heart" style="color: #ff4d4d;"></i>';
        }

        localStorage.setItem('wishlist', JSON.stringify(wishlist));

        // Update wishlist badge
        if (typeof updateWishlistCount === 'function') {
            updateWishlistCount();
        }
    });

    // Page title
    document.title = `${product.name} - ShopEase`;
}

// Setup quantity controls
function setupQuantityControls() {
    // Quantity buttons - Event delegation use karo
    const quantityContainer = document.querySelector('.quantity');

    if (quantityContainer) {
        quantityContainer.addEventListener('click', (e) => {
            const quantityInput = document.querySelector('.quantity-input');

            if (e.target.classList.contains('minus')) {
                let currentValue = parseInt(quantityInput.value) || 1;
                if (currentValue > 1) {
                    quantityInput.value = currentValue - 1;
                }
            }

            if (e.target.classList.contains('plus')) {
                let currentValue = parseInt(quantityInput.value) || 1;
                quantityInput.value = currentValue + 1;
            }
        });
    }

    qtyInput.addEventListener('change', () => {
        let val = parseInt(qtyInput.value);
        if (isNaN(val) || val < 1) {
            qtyInput.value = 1;
        } else if (product && val > product.stock) {
            qtyInput.value = product.stock;
            showToast(`Maximum ${product.stock} items available`, 'warning');
        }
    });
}

// Load related products
async function loadRelatedProducts(category, currentId) {
    try {
        const response = await fetch('https://shopease-ecommerce-2ut5.onrender.com/api/products');
        const products = await response.json();

        const related = products.filter(p => p._id !== currentId).slice(0, 4);
        const container = document.getElementById('related-products');
        container.innerHTML = '';

        related.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.cursor = 'pointer';
            card.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                </div>
                <div class="card-body">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">$${product.price}</div>
                </div>
            `;
            card.addEventListener('click', () => {
                window.location.href = `product-detail.html?id=${product._id}`;
            });
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading related products:', error);
    }
}