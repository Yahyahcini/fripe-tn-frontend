// ===== MAIN JAVASCRIPT =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('fripe.tn loaded!');
    initMobileMenu();
    initCart();
    initTheme();
});

// Mobile Menu
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.main-nav ul');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
}

// Cart System
let cart = {
    items: [],
    total: 0,
    
    // Load from localStorage
    load() {
        const saved = localStorage.getItem('fripe-cart');
        if (saved) {
            this.items = JSON.parse(saved);
            this.update();
        }
    },
    
    // Save to localStorage
    save() {
        localStorage.setItem('fripe-cart', JSON.stringify(this.items));
        this.update();
    },
    
    // Add item
    add(product) {
        const existing = this.items.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }
        this.save();
        this.showNotification(product.name + ' added to cart!');
        this.render();
    },
    
    // Remove item
    remove(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        this.render();
    },
    
    // Update quantity
    updateQuantity(productId, change) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity < 1) {
                this.remove(productId);
            } else {
                this.save();
                this.render();
            }
        }
    },
    
    // Calculate total
    calculateTotal() {
        this.total = this.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
        return this.total;
    },
    
    // Update display
    update() {
        // Update cart count
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    },
    
    // Render cart items
    render() {
        const cartBody = document.querySelector('.cart-body');
        const cartFooter = document.querySelector('.cart-footer');
        
        if (!cartBody) return;
        
        if (this.items.length === 0) {
            cartBody.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Your cart is empty</p>
                    <button class="btn" onclick="closeCart()">Continue Shopping</button>
                </div>
            `;
            if (cartFooter) cartFooter.style.display = 'none';
            return;
        }
        
        if (cartFooter) cartFooter.style.display = 'block';
        
        let html = '';
        this.items.forEach(item => {
            html += `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)} × ${item.quantity}</div>
                        <button class="btn" onclick="cart.remove(${item.id})" style="padding: 5px 10px; font-size: 0.9rem;">
                            Remove
                        </button>
                    </div>
                </div>
            `;
        });
        
        cartBody.innerHTML = html;
        
        // Update total
        const total = this.calculateTotal();
        const totalElement = document.querySelector('.cart-total .amount');
        if (totalElement) {
            totalElement.textContent = '$' + total.toFixed(2);
        }
    },
    
    // Show notification
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #2ed573;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 2000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }
};

// Initialize cart
function initCart() {
    cart.load();
    
    // Cart button
    const cartBtn = document.querySelector('.cart-btn');
    const closeBtn = document.querySelector('.close-cart');
    const overlay = document.querySelector('.cart-overlay');
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    if (cartBtn) {
        cartBtn.addEventListener('click', openCart);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCart);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeCart);
    }
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            alert('Checkout functionality coming soon!');
            closeCart();
        });
    }
}

// Theme Toggle
// function initTheme() {
//     const themeBtn = document.querySelector('.theme-btn');
    
//     if (themeBtn) {
//         themeBtn.addEventListener('onmouseover', function() {
//             document.body.classList.toggle('dark-mode');
//             const icon = this.querySelector('i');
//             if (document.body.classList.contains('dark-mode')) {
//                 icon.className = 'fas fa-moon';
//                 localStorage.setItem('theme', 'dark');
//             } else {
//                 icon.className = 'fas fa-sun';
//                 localStorage.setItem('theme', 'light');
//             }
//         });
        
//         // Load saved theme
//         const savedTheme = localStorage.getItem('theme');
//         if (savedTheme === 'dark') {
//             document.body.classList.add('dark-mode');
//             const icon = themeBtn.querySelector('i');
//             if (icon) icon.className = 'fas fa-moon';
//         }
//     }
// }

// Open/Close Cart
function openCart() {
    const sidebar = document.querySelector('.cart-sidebar');
    const overlay = document.querySelector('.cart-overlay');
    
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
    
    cart.render();
}

function closeCart() {
    const sidebar = document.querySelector('.cart-sidebar');
    const overlay = document.querySelector('.cart-overlay');
    
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
}

// Make available globally
window.cart = cart;
window.openCart = openCart;
window.closeCart = closeCart;