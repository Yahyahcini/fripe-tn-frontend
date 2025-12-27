// ===== CLEAN products.js - STRAPI ONLY =====
console.log('✅ products.js loaded - Strapi Only');

const STRAPI_URL = "https://fripe-tn-backend.onrender.com";

// Pagination settings
let currentPage = 1;
let totalPages = 1;
const ITEMS_PER_PAGE = 6;

// ===== STRAPI FUNCTIONS =====

// Load ALL products from Strapi
async function loadAllProductsFromStrapi() {
    try {
        const url = `${STRAPI_URL}/api/products?populate=*`;
        console.log('🌐 Fetching all products:', url);
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        console.log(`📦 Loaded ${data.data?.length || 0} products from Strapi`);
        
        if (!data.data || data.data.length === 0) {
            console.log('📭 No products in Strapi');
            return [];
        }
        
        // Transform Strapi data
        return data.data.map(item => {
            // Extract image URL
            let imageUrl = 'assets/images/default-product.jpg';
            if (item.image?.url) {
                imageUrl = `${STRAPI_URL}${item.image.url}`;
            } else if (item.image?.formats?.small?.url) {
                imageUrl = `${STRAPI_URL}${item.image.formats.small.url}`;
            }
            
            // Extract description
            let description = '';
            if (item.description) {
                if (Array.isArray(item.description)) {
                    item.description.forEach(block => {
                        if (block.children) {
                            block.children.forEach(child => {
                                if (child.text) description += child.text + ' ';
                            });
                        }
                    });
                    description = description.trim();
                } else {
                    description = item.description;
                }
            }
            
            return {
                id: item.id,
                name: item.title || 'Product',
                price: parseFloat(item.price) || 0,
                oldPrice: item.oldPrice ? parseFloat(item.oldPrice) : null,
                image: imageUrl,
                category: item.category || 'uncategorized',
                description: description || 'Premium quality product',
                badge: item.badge,
                rating: item.rating || 4.0,
                stock: item.stock !== undefined && item.stock !== null ? parseInt(item.stock) : 100
            };
        });
        
    } catch (error) {
        console.error('❌ Error loading from Strapi:', error);
        return []; // Return empty array, no fallback
    }
}

// Get paginated products for a category
async function getPaginatedProducts(category = 'all', page = 1) {
    console.log(`📄 Getting ${category} - Page ${page}`);
    
    // Load all products from Strapi
    const allProducts = await loadAllProductsFromStrapi();
    
    // Filter by category if needed
    let filteredProducts = allProducts;
    if (category !== 'all') {
        filteredProducts = allProducts.filter(p => p.category === category);
        console.log(`🔍 Filtered ${category}: ${filteredProducts.length} products`);
    }
    
    // Calculate pagination
    totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    currentPage = Math.min(page, totalPages) || 1;
    
    // Get products for current page
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageProducts = filteredProducts.slice(startIndex, endIndex);
    
    console.log(`📊 Pagination: ${filteredProducts.length} total, ${totalPages} pages, showing ${pageProducts.length} on page ${currentPage}`);
    
    return {
        products: pageProducts,
        totalPages: totalPages,
        currentPage: currentPage,
        totalItems: filteredProducts.length
    };
}
// ===== HELPER FUNCTIONS =====

// Generate star rating HTML
function generateStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}
// ===== RENDER FUNCTIONS =====

// Render products to a grid
function renderProducts(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`❌ Container #${containerId} not found`);
        return;
    }
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="no-products" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-box-open"></i>
                <h3>No products found</h3>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            <img src="${product.image}"  class="product-image">
            <div class="product-info">
                <div class="product-header">
                    <h3 class="product-name">${product.name}</h3>
                    <span class="product-category" data-category="${product.category}">
                        ${product.category}
                    </span>
                </div>
                <p class="product-description">${product.description}</p>
                
                <!-- ADDED: Rating and Stock Info from Strapi -->
                <div class="product-meta">
                    <div class="product-rating">
                        <div class="stars">
                            ${generateStarRating(product.rating)}
                        </div>
                        <span class="rating-value">${product.rating.toFixed(1)}</span>
                    </div>
                    
                    <div class="stock-info ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                        <i class="fas ${product.stock > 0 ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                        ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </div>
                </div>
                <!-- END OF ADDED SECTION -->
                
                <div class="product-footer">
                    <div class="product-price">
                        <span class="current-price">$${product.price.toFixed(2)}</span>
                        ${product.oldPrice ? `
                            <span class="old-price">$${product.oldPrice.toFixed(2)}</span>
                        ` : ''}
                    </div>
                    <button class="btn add-to-cart" data-id="${product.id}" 
                            ${product.stock <= 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                        ${product.stock > 0 ? 'Add' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add cart event listeners
    addCartListeners(products);
}

// Render with pagination
async function renderProductsWithPagination(containerId, category = 'all', page = 1) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`❌ Container #${containerId} not found`);
        return;
    }
    
    // Show loading
    container.innerHTML = `
        <div class="loading" style="grid-column: 1/-1; text-align: center; padding: 40px;">
            <div class="loader"></div>
            <p>Loading ${category === 'all' ? 'products' : category}...</p>
        </div>
    `;
    
    try {
        // Get paginated products
        const result = await getPaginatedProducts(category, page);
        
        // Render products
        renderProducts(containerId, result.products);
        
        // Render pagination if we have multiple pages
        if (result.totalPages > 1) {
            renderPagination(containerId, category, result.currentPage, result.totalPages);
        } else {
            // Remove any existing pagination
            const existingPagination = document.querySelector(`.pagination[data-container="${containerId}"]`);
            if (existingPagination) {
                existingPagination.remove();
            }
        }
        
    } catch (error) {
        console.error('❌ Error rendering products:', error);
        container.innerHTML = `
            <div class="error" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error loading products</h3>
                <p>${error.message}</p>
                <button onclick="location.reload()" class="btn" style="margin-top: 15px;">
                    Retry
                </button>
            </div>
        `;
    }
}

// ===== PAGINATION UI =====

// Render pagination controls
function renderPagination(containerId, category, currentPage, totalPages) {
    console.log(`🔢 Rendering pagination: Page ${currentPage}/${totalPages}`);
    
    // Remove existing pagination
    const oldPagination = document.querySelector(`.pagination[data-container="${containerId}"]`);
    if (oldPagination) oldPagination.remove();
    
    // Create new pagination container
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';
    paginationContainer.dataset.container = containerId;
    paginationContainer.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        margin: 40px 0;
        padding: 20px;
        flex-wrap: wrap;
    `;
    
    // Previous button
    if (currentPage > 1) {
        const prevBtn = createPaginationButton('prev', 'Previous', () => {
            renderProductsWithPagination(containerId, category, currentPage - 1);
        });
        paginationContainer.appendChild(prevBtn);
    }
    
    // Page numbers
    const pages = generatePageNumbers(currentPage, totalPages);
    
    pages.forEach(pageNum => {
        if (pageNum === '...') {
            const dots = document.createElement('span');
            dots.className = 'page-dots';
            dots.textContent = '...';
            dots.style.cssText = 'color: rgba(255,255,255,0.4); padding: 0 10px;';
            paginationContainer.appendChild(dots);
        } else {
            const isActive = pageNum === currentPage;
            const pageBtn = createPaginationButton('number', pageNum, () => {
                renderProductsWithPagination(containerId, category, pageNum);
            }, isActive);
            paginationContainer.appendChild(pageBtn);
        }
    });
    
    // Next button
    if (currentPage < totalPages) {
        const nextBtn = createPaginationButton('next', 'Next', () => {
            renderProductsWithPagination(containerId, category, currentPage + 1);
        });
        paginationContainer.appendChild(nextBtn);
    }
    
    // Page info
    const pageInfo = document.createElement('div');
    pageInfo.className = 'page-info';
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    pageInfo.style.cssText = `
        margin-left: 20px;
        color: rgba(255,255,255,0.7);
        font-size: 0.9rem;
        padding: 10px 15px;
        background: rgba(255,255,255,0.05);
        border-radius: 8px;
    `;
    paginationContainer.appendChild(pageInfo);
    
    // Add to DOM
    const container = document.getElementById(containerId);
    if (container && container.parentNode) {
        container.parentNode.insertBefore(paginationContainer, container.nextSibling);
    }
}

// Create pagination button
function createPaginationButton(type, text, onClick, isActive = false) {
    const button = document.createElement('button');
    button.className = `page-btn ${type}-btn ${isActive ? 'active' : ''}`;
    
    if (type === 'prev') {
        button.innerHTML = `<i class="fas fa-chevron-left"></i> ${text}`;
    } else if (type === 'next') {
        button.innerHTML = `${text} <i class="fas fa-chevron-right"></i>`;
    } else {
        button.textContent = text;
    }
    
    button.style.cssText = `
        min-width: ${type === 'number' ? '45px' : '100px'};
        height: 45px;
        padding: 0 ${type === 'number' ? '0' : '15px'};
        background: ${isActive ? '#ff4757' : 'rgba(255,255,255,0.07)'};
        border: 1px solid ${isActive ? 'transparent' : 'rgba(255,255,255,0.15)'};
        border-radius: 10px;
        color: ${isActive ? 'white' : 'rgba(255,255,255,0.9)'};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 0.95rem;
        font-weight: 600;
        transition: all 0.3s ease;
    `;
    
    if (!isActive) {
        button.onmouseenter = () => {
            button.style.background = 'rgba(255,71,87,0.2)';
            button.style.borderColor = 'rgba(255,71,87,0.4)';
            button.style.transform = 'translateY(-2px)';
        };
        
        button.onmouseleave = () => {
            button.style.background = 'rgba(255,255,255,0.07)';
            button.style.borderColor = 'rgba(255,255,255,0.15)';
            button.style.transform = 'translateY(0)';
        };
    }
    
    button.addEventListener('click', onClick);
    return button;
}

// Generate smart page numbers
function generatePageNumbers(currentPage, totalPages) {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        
        let start = Math.max(2, currentPage - 1);
        let end = Math.min(totalPages - 1, currentPage + 1);
        
        if (currentPage <= 3) {
            start = 2;
            end = 4;
        } else if (currentPage >= totalPages - 2) {
            start = totalPages - 3;
            end = totalPages - 1;
        }
        
        if (start > 2) pages.push('...');
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages - 1) pages.push('...');
        
        pages.push(totalPages);
    }
    
    return pages;
}

// ===== CART FUNCTIONALITY =====

// Add cart event listeners
function addCartListeners(products) {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            const product = products.find(p => p.id === productId);
            
            if (product && window.cart) {
                window.cart.add(product);
                
                // Visual feedback
                const original = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i> Added';
                this.style.background = '#2ed573';
                
                setTimeout(() => {
                    this.innerHTML = original;
                    this.style.background = '';
                }, 1500);
            }
        });
    });
}

// ===== INITIALIZATION =====

// Initialize based on page
function initializeProducts() {
    console.log('🚀 Initializing products...');
    console.log('Current page:', window.location.pathname);
    
    // Check which grid exists
    if (document.getElementById('perfumes-grid')) {
        console.log('🌸 Loading perfumes with pagination');
        renderProductsWithPagination('perfumes-grid', 'perfumes', 1);
    } 
    else if (document.getElementById('clothes-grid')) {
        console.log('👕 Loading clothes with pagination');
        renderProductsWithPagination('clothes-grid', 'clothes', 1);
    }
    else if (document.getElementById('shoes-grid')) {
        console.log('👟 Loading shoes with pagination');
        renderProductsWithPagination('shoes-grid', 'shoes', 1);
    }
    else if (document.getElementById('products-grid')) {
        console.log('🏠 Loading homepage WITH pagination');
        renderProductsWithPagination('products-grid', 'all', 1);
    }
    else {
        console.log('📄 No product grid found on this page');
    }
}

// Wait for DOM and main.js
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProducts);
} else {
    setTimeout(initializeProducts, 100);
}

// ===== DEBUG FUNCTIONS =====

window.debugProducts = async function() {
    console.group('🔍 Product Debug');
    const products = await loadAllProductsFromStrapi();
    console.log('Total products:', products.length);
    console.log('Products by category:');
    
    const categories = {};
    products.forEach(p => {
        categories[p.category] = (categories[p.category] || 0) + 1;
    });
    
    console.log(categories);
    console.groupEnd();
};

window.testPagination = function() {
    console.log('🧪 Testing pagination...');
    console.log('Current page:', currentPage);
    console.log('Total pages:', totalPages);
    console.log('Items per page:', ITEMS_PER_PAGE);
    
    // Force show pagination
    if (document.getElementById('perfumes-grid')) {
        renderPagination('perfumes-grid', 'perfumes', 1, 3);
    }
};

window.refreshProducts = function() {
    console.log('🔄 Refreshing products...');
    initializeProducts();
};

// Make functions available globally
window.renderProductsWithPagination = renderProductsWithPagination;
window.loadAllProductsFromStrapi = loadAllProductsFromStrapi;

