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
    
    setTimeout(() => {
        if (typeof window.updateCartCount === 'function') {
            window.updateCartCount();
        }
        if (typeof window.updateWishlistCount === 'function') {
            window.updateWishlistCount();
        }
    }, 100);
});

async function loadProductDetail(id) {
    try {
        const response = await fetch(`https://shopease-ecommerce-2ut5.onrender.com/api/products/${id}`);
        
        if (!response.ok) {
            showToast('Product not found!', 'error');
            setTimeout(() => window.location.href = 'products.html', 2000);
            return;
        }

        product = await response.json();
        displayProductDetail(product);
        
        setTimeout(() => {
            setupQuantityControls();
        }, 100);
        
        loadRelatedProducts(product.category, id);
        
        setTimeout(() => {
            if (typeof window.updateCartCount === 'function') {
                window.updateCartCount();
            }
            if (typeof window.updateWishlistCount === 'function') {
                window.updateWishlistCount();
            }
        }, 200);
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to load product', 'error');
    }
}

function displayProductDetail(product) {
    document.getElementById('breadcrumb-product').textContent = product.name;
    document.getElementById('main-image').src = product.image;
    document.getElementById('detail-name').textContent = product.name;
    document.getElementById('detail-category').textContent = product.category;
    document.getElementById('detail-price').textContent = `$${product.price}`;
    document.getElementById('detail-description').textContent = product.description;

    const originalPrice = Math.round(product.price * 1.2);
    document.getElementById('detail-original-price').textContent = `$${originalPrice}`;

    const stockStatus = document.getElementById('stock-status');
    if (product.stock > 0) {
        stockStatus.innerHTML = `<i class="fas fa-check-circle" style="color: #28a745;"></i><span>In Stock (${product.stock} available)</span>`;
    } else {
        stockStatus.innerHTML = `<i class="fas fa-times-circle" style="color: #dc3545;"></i><span>Out of Stock</span>`;
        stockStatus.classList.add('out-of-stock');
        const addCartBtn = document.getElementById('btn-add-cart');
        const buyNowBtn = document.querySelector('.btn-buy-now');
        if (addCartBtn) addCartBtn.disabled = true;
        if (buyNowBtn) buyNowBtn.disabled = true;
    }

    document.querySelectorAll('.thumb').forEach(thumb => {
        thumb.src = product.image;
    });

    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const isInWishlist = wishlist.includes(product._id);
    const wishlistBtn = document.getElementById('btn-wishlist');
    if (wishlistBtn) {
        wishlistBtn.innerHTML = isInWishlist 
            ? '<i class="fas fa-heart" style="color: #ff4d4d;"></i>' 
            : '<i class="far fa-heart"></i>';
    }

    const mainImage = document.getElementById('main-image');
    const zoomContainer = document.querySelector('.image-zoom-container');
    if (zoomContainer && mainImage) {
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
    }

    const addCartBtn = document.getElementById('btn-add-cart');
    if (addCartBtn) {
        addCartBtn.addEventListener('click', () => {
            const quantityInput = document.getElementById('quantity');
            const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;

            if (quantity > product.stock) {
                showToast(`Only ${product.stock} items available`, 'error');
                return;
            }

            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingItem = cart.find(item => item._id === product._id);

            if (existingItem) {
                const newTotal = (existingItem.quantity || 1) + quantity;
                if (newTotal > product.stock) {
                    showToast(`Cannot add more. Only ${product.stock} items available`, 'error');
                    return;
                }
                existingItem.quantity = newTotal;
                showToast(`Quantity updated to ${newTotal}`, 'success');
            } else {
                cart.push({
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: quantity
                });
                showToast(`${quantity} item${quantity > 1 ? 's' : ''} added to cart`, 'success');
            }

            localStorage.setItem('cart', JSON.stringify(cart));

            setTimeout(() => {
                if (typeof window.updateCartCount === 'function') {
                    window.updateCartCount();
                }
            }, 50);
        });
    }

    const buyNowBtn = document.querySelector('.btn-buy-now');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', () => {
            const quantityInput = document.getElementById('quantity');
            const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;

            if (quantity > product.stock) {
                showToast(`Only ${product.stock} items available`, 'error');
                return;
            }

            const buyNowItem = {
                _id: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity,
                buyNow: true
            };

            localStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));
            window.location.href = 'checkout.html';
        });
    }

    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => {
            let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
            const index = wishlist.indexOf(product._id);

            if (index > -1) {
                wishlist.splice(index, 1);
                showToast('Removed from wishlist', 'info');
                wishlistBtn.innerHTML = '<i class="far fa-heart"></i>';
            } else {
                wishlist.push(product._id);
                showToast('Added to wishlist! ❤️', 'success');
                wishlistBtn.innerHTML = '<i class="fas fa-heart" style="color: #ff4d4d;"></i>';
            }

            localStorage.setItem('wishlist', JSON.stringify(wishlist));

            setTimeout(() => {
                if (typeof window.updateWishlistCount === 'function') {
                    window.updateWishlistCount();
                }
            }, 50);
        });
    }

    document.title = `${product.name} - ShopEase`;
}

function setupQuantityControls() {
    const quantityInput = document.getElementById('quantity');
    const minusBtn = document.querySelector('.minus');
    const plusBtn = document.querySelector('.plus');

    if (!quantityInput) {
        console.log('Quantity input not found');
        return;
    }

    console.log('Setting up quantity controls');

    if (minusBtn) {
        minusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            let currentValue = parseInt(quantityInput.value) || 1;
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });
    }

    if (plusBtn) {
        plusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            let currentValue = parseInt(quantityInput.value) || 1;
            if (product && currentValue < product.stock) {
                quantityInput.value = currentValue + 1;
            } else if (product) {
                showToast(`Maximum ${product.stock} items available`, 'warning');
            }
        });
    }

    quantityInput.addEventListener('change', () => {
        let val = parseInt(quantityInput.value);
        if (isNaN(val) || val < 1) {
            quantityInput.value = 1;
        } else if (product && val > product.stock) {
            quantityInput.value = product.stock;
            showToast(`Maximum ${product.stock} items available`, 'warning');
        }
    });
}

async function loadRelatedProducts(category, currentId) {
    try {
        const response = await fetch('https://shopease-ecommerce-2ut5.onrender.com/api/products');
        const products = await response.json();

        const related = products.filter(p => p._id !== currentId).slice(0, 4);
        const container = document.getElementById('related-products');
        if (!container) return;
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

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> <span>${message}</span>`;

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}