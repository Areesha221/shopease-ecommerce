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
});

// Fetch products from backend
async function loadProducts() {
    showLoading(true);

    try {
        const response = await fetch('http://localhost:3000/api/products');
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
    // Live search
    searchInput.addEventListener('input', debounce(() => {
        applyFilters();
    }, 300));

    // Category filter
    categoryFilter.addEventListener('change', applyFilters);

    // Price filter
    priceFilter.addEventListener('change', applyFilters);

    // Sort filter
    sortFilter.addEventListener('change', applyFilters);

    // Clear all filters
    clearFiltersBtn.addEventListener('click', clearAllFilters);
}

// Apply all filters
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const priceRange = priceFilter.value;
    const sortBy = sortFilter.value;

    // Filter products
    filteredProducts = allProducts.filter(product => {
        // Search filter
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm);

        // Category filter
        const matchesCategory = category ? product.category === category : true;

        // Price filter
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

    // Sort products
    sortProducts(sortBy);

    // Display filtered products
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
        // Manual reveal for newly added cards
        document.querySelectorAll('.reveal').forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < window.innerHeight - 100) {
                el.classList.add('active');
            }
        });
    }, 200);
}

// Create product card with enhanced features
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
                <button class="add-to-cart-btn" onclick="addToCart('${product._id}', '${product.name}', ${product.price}, '${product.image}')">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        </div>
    `;

    // Add hover animation
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });

    // Make card clickable for product detail
    card.addEventListener('click', (e) => {
        // Don't navigate if clicking buttons
        if (e.target.closest('.add-to-cart-btn') ||
            e.target.closest('.wishlist-btn') ||
            e.target.closest('.quick-view-btn')) return;

        window.location.href = `product-detail.html?id=${product._id}`;
    });

    card.style.cursor = 'pointer';

    return card;
}

// Add to Cart function
window.addToCart = (id, name, price, image) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if product already exists in cart
    const existingProduct = cart.find(item => item._id === id);
    if (existingProduct) {
        existingProduct.quantity = (existingProduct.quantity || 1) + 1;
    } else {
        cart.push({ _id: id, name, price, image, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    // ✅ ONLY UPDATE BADGE (No toast)
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
};
// Toggle Wishlist - NO TOAST, INSTANT COUNT UPDATE
window.toggleWishlist = (productId) => {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const index = wishlist.indexOf(productId);

    if (index > -1) {
        wishlist.splice(index, 1);
        // Removed from wishlist - update icon
        const btn = document.querySelector(`button[onclick="toggleWishlist('${productId}')"] i`);
        if (btn) btn.className = 'far fa-heart';
    } else {
        wishlist.push(productId);
        // Added to wishlist - update icon
        const btn = document.querySelector(`button[onclick="toggleWishlist('${productId}')"] i`);
        if (btn) btn.className = 'fas fa-heart';
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));

    // ✅ INSTANT COUNT UPDATE (No toast)
    updateWishlistCount();
};

// Quick View (placeholder for now)
window.quickView = (productId) => {
    showToast('Quick View feature coming soon!', 'info');
    // Later we'll create a modal for this
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

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
}

// Debounce function for search
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

// Toast Notification function
function showToast(message, type = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    // Add to body
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}