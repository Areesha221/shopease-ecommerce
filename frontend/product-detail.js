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
        
        // Wait for DOM to be ready
        setTimeout(() => {
            setupQuantityControls();
        }, 300);
        
        loadRelatedProducts(product.category, id);
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to load product', 'error');
    }
}

function displayProductDetail(product) {
    const breadcrumbProduct = document.getElementById('breadcrumb-product');
    const mainImage = document.getElementById('main-image');
    const detailName = document.getElementById('detail-name');
    const detailCategory = document.getElementById('detail-category');
    const detailPrice = document.getElementById('detail-price');
    const detailDescription = document.getElementById('detail-description');
    const detailOriginalPrice = document.getElementById('detail-original-price');
    const stockStatus = document.getElementById('stock-status');
    const btnAddCart = document.getElementById('btn-add-cart');
    const btnBuyNow = document.querySelector('.btn-buy-now');
    const btnWishlist = document.getElementById('btn-wishlist');
    const quantityInput = document.getElementById('quantity');

    if (breadcrumbProduct) breadcrumbProduct.textContent = product.name;
    if (mainImage) mainImage.src = product.image;
    if (detailName) detailName.textContent = product.name;
    if (detailCategory) detailCategory.textContent = product.category;
    if (detailPrice) detailPrice.textContent = `$${product.price}`;
    if (detailDescription) detailDescription.textContent = product.description;

    const originalPrice = Math.round(product.price * 1.2);
    if (detailOriginalPrice) detailOriginalPrice.textContent = `$${originalPrice}`;

    if (stockStatus) {
        if (product.stock > 0) {
            stockStatus.innerHTML = `<i class="fas fa-check-circle" style="color: #28a745;"></i><span>In Stock (${product.stock} available)</span>`;
        } else {
            stockStatus.innerHTML = `<i class="fas fa-times-circle" style="color: #dc3545;"></i><span>Out of Stock</span>`;
            stockStatus.classList.add('out-of-stock');
            if (btnAddCart) btnAddCart.disabled = true;
            if (btnBuyNow) btnBuyNow.disabled = true;
        }
    }

    document.querySelectorAll('.thumb').forEach(thumb => {
        thumb.src = product.image;
    });

    // Check wishlist status
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const isInWishlist = wishlist.includes(product._id);
    if (btnWishlist) {
        btnWishlist.innerHTML = isInWishlist 
            ? '<i class="fas fa-heart" style="color: #ff4d4d;"></i>' 
            : '<i class="far fa-heart"></i>';
    }

    // Image zoom
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

    // Add to Cart button
    if (btnAddCart) {
        btnAddCart.addEventListener('click', () => {
            const qty = quantityInput ? parseInt(quantityInput.value) || 1 : 1;

            if (qty > product.stock) {
                showToast(`Only ${product.stock} items available`, 'error');
                return;
            }

            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingItem = cart.find(item => item._id === product._id);

            if (existingItem) {
                const newTotal = (existingItem.quantity || 1) + qty;
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
                    quantity: qty
                });
                showToast(`${qty} item${qty > 1 ? 's' : ''} added to cart`, 'success');
            }

            localStorage.setItem('cart', JSON.stringify(cart));

            setTimeout(() => {
                if (typeof window.updateCartCount === 'function') {
                    window.updateCartCount();
                }
            }, 50);
        });
    }

    // Buy Now button
    if (btnBuyNow) {
        btnBuyNow.addEventListener('click', () => {
            const qty = quantityInput ? parseInt(quantityInput.value) || 1 : 1;

            if (qty > product.stock) {
                showToast(`Only ${product.stock} items available`, 'error');
                return;
            }

            const buyNowItem = {
                _id: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: qty,
                buyNow: true
            };

            localStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));
            window.location.href = 'checkout.html';
        });
    }

    // Wishlist button
    if (btnWishlist) {
        btnWishlist.addEventListener('click', () => {
            let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
            const index = wishlist.indexOf(product._id);

            if (index > -1) {
                wishlist.splice(index, 1);
                showToast('Removed from wishlist', 'info');
                btnWishlist.innerHTML = '<i class="far fa-heart"></i>';
            } else {
                wishlist.push(product._id);
                showToast('Added to wishlist! ❤️', 'success');
                btnWishlist.innerHTML = '<i class="fas fa-heart" style="color: #ff4d4d;"></i>';
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

// ✅ FIXED: Robust quantity controls setup
function setupQuantityControls() {
    const quantityInput = document.getElementById('quantity');
    
    if (!quantityInput) {
        console.log('Quantity input not found');
        return;
    }

    console.log('Setting up quantity controls, current value:', quantityInput.value);

    // Try multiple selectors for minus/plus buttons
    const minusBtn = document.querySelector('.quantity .minus') || 
                     document.querySelector('.qty-minus') ||
                     document.querySelector('[data-action="decrease"]');
    const plusBtn = document.querySelector('.quantity .plus') || 
                    document.querySelector('.qty-plus') ||
                    document.querySelector('[data-action="increase"]');

    console.log('Minus button:', minusBtn, 'Plus button:', plusBtn);

    if (minusBtn) {
        minusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            let currentValue = parseInt(quantityInput.value) || 1;
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
                console.log('Decreased to:', quantityInput.value);
            }
        });
        console.log('Minus button event listener attached');
    }

    if (plusBtn) {
        plusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            let currentValue = parseInt(quantityInput.value) || 1;
            if (product && currentValue < product.stock) {
                quantityInput.value = currentValue + 1;
                console.log('Increased to:', quantityInput.value);
            } else if (product) {
                showToast(`Maximum ${product.stock} items available`, 'warning');
            }
        });
        console.log('Plus button event listener attached');
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

        related.forEach(prod => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.cursor = 'pointer';
            card.innerHTML = `
                <div class="product-image-container">
                    <img src="${prod.image}" alt="${prod.name}" class="product-image">
                </div>
                <div class="card-body">
                    <h3 class="product-title">${prod.name}</h3>
                    <div class="product-price">$${prod.price}</div>
                </div>
            `;
            card.addEventListener('click', () => {
                window.location.href = `product-detail.html?id=${prod._id}`;
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