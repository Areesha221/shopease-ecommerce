document.addEventListener('DOMContentLoaded', () => {

    // --- NAVBAR LOGIN/LOGOUT LOGIC ---
    const authLink = document.getElementById('auth-link');
    const adminLink = document.getElementById('admin-link');
    const profileLink = document.querySelector('a[href="profile.html"]')?.parentElement; // Profile link dhundo
    const ordersLink = document.querySelector('a[href="orders.html"]')?.parentElement;  // Orders link dhundo

    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (token && userString) {
        const user = JSON.parse(userString);

        // 1. Admin Link
        if (user.role === 'admin' && adminLink) {
            adminLink.style.display = 'block';
        }

        // 2. Profile aur Orders Links Show Karo
        if (profileLink) profileLink.style.display = 'block';
        if (ordersLink) ordersLink.style.display = 'block';

        // 3. Logout Button
        if (authLink) {
            authLink.innerHTML = `<a href="#" id="logout-btn">Logout (${user.name})</a>`;
            document.getElementById('logout-btn').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.clear();
                window.location.reload();
            });
        }
    } else {
        // Agar user login NAHI hai, to Profile aur Orders chhupa do
        if (profileLink) profileLink.style.display = 'none';
        if (ordersLink) ordersLink.style.display = 'none';
    }

    // 1. Fetch products from our backend
    fetch('http://localhost:3000/api/products')
        .then(response => response.json()) // Turn the response into readable JSON
        .then(products => {
            // 2. Find the empty box we created in HTML
            const container = document.getElementById('products-container');

            // 3. Loop through every product and create a card
            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card reveal';

                card.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <div class="card-body">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <div class="price">$${product.price}</div>
                        <button class="add-to-cart">Add to Cart</button>
                    </div>
                `;

                container.appendChild(card);

                // Make the "Add to Cart" button work
                const addToCartBtn = card.querySelector('.add-to-cart');
                addToCartBtn.addEventListener('click', () => {
                    // Get existing cart or start a new empty one
                    let cart = JSON.parse(localStorage.getItem('cart')) || [];

                    // Add the product to the cart
                    cart.push(product);

                    // Save it back to the browser's memory
                    localStorage.setItem('cart', JSON.stringify(cart));

                    alert(product.name + ' added to cart!');
                });
            });

            setTimeout(() => {
                window.dispatchEvent(new Event('scroll'));
                revealOnScroll(); // Directly call bhi karo
            }, 200);
        })
        .catch(error => console.error('Error fetching products:', error));
});

// --- MOBILE MENU TOGGLE LOGIC ---
const menuToggle = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// ===== DARK MODE TOGGLE =====
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

// Check saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
if (themeIcon) {
    themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        if (themeIcon) {
            themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    });
}

// ===== SCROLL REVEAL ANIMATION (FIXED) =====
const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const elementVisible = 100;

    // Har scroll par FRESH query karo (purane empty variable ki jagah)
    const revealElements = document.querySelectorAll('.reveal');

    revealElements.forEach((reveal) => {
        const elementTop = reveal.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
            reveal.classList.add('active');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
// Trigger once on load
revealOnScroll();

// ===== GLOBAL UPDATE CART COUNT FUNCTION =====
window.updateCartCount = function() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountBadge = document.getElementById('cart-count');
    const cartPreviewCount = document.getElementById('cart-preview-count');
    const cartPreviewItems = document.getElementById('cart-preview-items');
    const previewTotalPrice = document.getElementById('preview-total-price');

    if (!cartCountBadge) return;

    // Update badge count
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    cartCountBadge.textContent = totalItems;

    // Show/hide badge
    if (totalItems === 0) {
        cartCountBadge.style.display = 'none';
    } else {
        cartCountBadge.style.display = 'block';
        // Add animation
        cartCountBadge.style.animation = 'none';
        setTimeout(() => {
            cartCountBadge.style.animation = 'badge-pop 0.3s ease';
        }, 10);
    }

    // Update preview
    if (cartPreviewCount) {
        cartPreviewCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
    }

    // Update preview items
    if (cartPreviewItems) {
        if (cart.length === 0) {
            cartPreviewItems.innerHTML = '<p class="empty-preview">Your cart is empty</p>';
        } else {
            let total = 0;
            cartPreviewItems.innerHTML = cart.map(item => {
                const itemTotal = item.price * (item.quantity || 1);
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

// ===== REMOVE FROM CART PREVIEW =====
window.removeFromCartPreview = (productId) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item._id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast('Item removed from cart', 'info');
};

// Call this function on every page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});

// ===== UPDATE WISHLIST COUNT =====
function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistCountBadge = document.getElementById('wishlist-count');

    if (!wishlistCountBadge) return;

    wishlistCountBadge.textContent = wishlist.length;

    if (wishlist.length === 0) {
        wishlistCountBadge.style.display = 'none';
    } else {
        wishlistCountBadge.style.display = 'block';
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', () => {
    updateWishlistCount();
});

// ===== RECENTLY VIEWED PRODUCTS =====
function addRecentlyViewed(product) {
    let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];

    // Remove if already exists
    recentlyViewed = recentlyViewed.filter(p => p._id !== product._id);

    // Add to beginning
    recentlyViewed.unshift(product);

    // Keep only last 5
    if (recentlyViewed.length > 5) {
        recentlyViewed = recentlyViewed.slice(0, 5);
    }

    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
}

function getRecentlyViewed() {
    return JSON.parse(localStorage.getItem('recentlyViewed')) || [];
}

function displayRecentlyViewed() {
    const container = document.getElementById('recently-viewed');
    if (!container) return;

    const products = getRecentlyViewed();

    if (products.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.innerHTML = `
        <h2 class="section-title">Recently Viewed</h2>
        <div class="products-container">
            ${products.map(product => `
                <div class="product-card" onclick="window.location.href='product-detail.html?id=${product._id}'">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="card-body">
                        <h3>${product.name}</h3>
                        <div class="price">$${product.price}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== GLOBAL LOADER =====
window.addEventListener('load', () => {
    const loader = document.getElementById('global-loader');
    if (loader) {
        // Thoda delay taake smooth lage
        setTimeout(() => {
            loader.classList.remove('active');
        }, 500);
    }
});