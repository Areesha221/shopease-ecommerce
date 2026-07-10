// Global variables
let allProducts = [];
let filteredProducts = [];

// DOM Elements
const productsContainer = document.getElementById('products-container');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const priceFilter = document.getElementById('price-filter');
const sortFilter = document.getElementById('sort-filter');
const resultsCount = document.getElementById('results-count');
const clearFiltersBtn = document.getElementById('clear-filters');
const noProducts = document.getElementById('no-products');
const loadingSkeleton = document.getElementById('loading-skeleton');

// Load products on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
    
    // ✅ Update counters after a small delay
    setTimeout(() => {
        if (typeof window.updateCartCount === 'function') {
            window.updateCartCount();
        }
        if (typeof window.updateWishlistCount === 'function') {
            window.updateWishlistCount();
        }
    }, 100);
});

// Fetch products from backend
async function loadProducts() {
    showLoading(true);

    try {
        const response = await fetch('https://shopease-ecommerce-2ut5.onrender.com/api/products');
        allProducts = await response.json();
        filteredProducts = [...allProducts];

        displayProducts(filteredProducts);
        updateResultsCount();
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Failed to load products. Please refresh the page.', 'error');
    } finally {
        showLoading(false);
    }
}

// Setup event listeners for filters
function setupEventListeners() {
    searchInput.addEventListener('input', debounce(() => {
        applyFilters();
    }, 300));

    categoryFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);
    sortFilter.addEventListener('change', applyFilters);
    clearFiltersBtn.addEventListener('click', clearAllFilters);
}

// Apply all filters
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const priceRange = priceFilter.value;
    const sortBy = sortFilter.value;

    filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm);

        const matchesCategory = category ? product.category === category : true;

        let matchesPrice = true;
        if (priceRange) {
            const [min, max] = priceRange.split('-');
            if (max) {
                matchesPrice = product.price >= parseInt(min) && product.price <= parseInt(max);
            } else {
                matchesPrice = product.price >= parseInt(min);
            }
        }

        return matchesSearch && matchesCategory && matchesPrice;
    });

    sortProducts(sortBy);
    displayProducts(filteredProducts);
    updateResultsCount();
}

// Sort products
function sortProducts(sortBy) {
    switch (sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }
}

// Display products
function displayProducts(products) {
    productsContainer.innerHTML = '';

    if (products.length === 0) {
        noProducts.style.display = 'block';
        return;
    }

    noProducts.style.display = 'none';

    products.forEach(product => {
        const card = createProductCard(product);
        productsContainer.appendChild(card);
    });

    setTimeout(() => {
        window.dispatchEvent(new Event('scroll'));
        document.querySelectorAll('.reveal').forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < window.innerHeight - 100) {
                el.classList.add('active');
            }
        });
    }, 200);
}

// Create product card - SIMPLE VERSION (No quantity controls)
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card reveal';
    card.innerHTML = `
        <div class="product-image-container">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-badge">New</div>
            <button class="wishlist-btn" onclick="toggleWishlist('${product._id}')">
                <i class="far fa-heart"></i>
            </button>
            <button class="quick-view-btn" onclick="quickView('${product._id}')">
                <i class="fas fa-eye"></i> Quick View
            </button>
        </div>
        <div class="card-body">
            <div class="product-category">${product.category}</div>
            <h3 class="product-title">${product.name}</h3>
            <div class="product-rating">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="far fa-star"></i>
                <span class="rating-count">(4.0)</span>
            </div>
            <p class="product-description">${product.description.substring(0, 80)}...</p>
            <div class="product-footer">
                <div class="product-price">$${product.price}</div>
                <button class="add-to-cart-btn" onclick="addToCart('${product._id}', '${product.name}', ${product.price}, '${product.image}', ${product.stock})">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        </div>
    `;

    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });

    card.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-cart-btn') ||
            e.target.closest('.wishlist-btn') ||
            e.target.closest('.quick-view-btn')) return;

        window.location.href = `product-detail.html?id=${product._id}`;
    });

    card.style.cursor = 'pointer';

    return card;
}

// ✅ Simple Add to Cart (Products Page Ke Liye)
window.addToCart = (productId, name, price, image, stock) => {
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
    
    const existingItem = cart.find(item => item._id === productId);
    
    if (existingItem) {
        if (existingItem.quantity < stock) {
            existingItem.quantity += 1;
            showToast('Quantity updated', 'success');
        } else {
            showToast('Maximum stock reached', 'warning');
            return;
        }
    } else {
        cart.push({
            _id: productId,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
        showToast('Product added to cart', 'success');
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // ✅ Update cart count
    setTimeout(() => {
        if (typeof window.updateCartCount === 'function') {
            window.updateCartCount();
        }
    }, 50);
};

// Toggle Wishlist
window.toggleWishlist = (productId) => {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const index = wishlist.indexOf(productId);

    if (index > -1) {
        wishlist.splice(index, 1);
        const btn = document.querySelector(`button[onclick="toggleWishlist('${productId}')"] i`);
        if (btn) btn.className = 'far fa-heart';
        showToast('Removed from wishlist', 'info');
    } else {
        wishlist.push(productId);
        const btn = document.querySelector(`button[onclick="toggleWishlist('${productId}')"] i`);
        if (btn) btn.className = 'fas fa-heart';
        showToast('Added to wishlist', 'success');
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));

    // ✅ Update wishlist count
    setTimeout(() => {
        if (typeof window.updateWishlistCount === 'function') {
            window.updateWishlistCount();
        }
    }, 50);
};

// Quick View
window.quickView = (productId) => {
    showToast('Quick View feature coming soon!', 'info');
};

// Clear all filters
function clearAllFilters() {
    searchInput.value = '';
    categoryFilter.value = '';
    priceFilter.value = '';
    sortFilter.value = '';
    filteredProducts = [...allProducts];
    displayProducts(filteredProducts);
    updateResultsCount();
    showToast('Filters cleared', 'info');
}

// Update results count
function updateResultsCount() {
    resultsCount.textContent = `Showing ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`;
}

// Show/Hide loading skeleton
function showLoading(show) {
    if (show) {
        loadingSkeleton.style.display = 'grid';
        productsContainer.style.display = 'none';
    } else {
        loadingSkeleton.style.display = 'none';
        productsContainer.style.display = 'grid';
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}