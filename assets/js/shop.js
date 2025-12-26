// ===== SHOP PAGE FUNCTIONALITY =====
function initializeShopPage() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            this.parentElement.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            // Get filter type
            const filter = this.dataset.filter || this.dataset.sort || this.dataset.size;
            console.log('Filter:', filter);
            // Filter logic would go here
        });
    });
    
    // Price range
    const priceRange = document.querySelector('.price-range');
    const priceValue = document.querySelector('.price-value');
    
    if (priceRange && priceValue) {
        priceRange.addEventListener('input', function() {
            priceValue.textContent = `Up to $${this.value}`;
        });
    }
    
    // Pagination
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.textContent.includes('Next') && !this.textContent.includes('Previous')) {
                document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Shop-specific product loading
    const path = window.location.pathname;
    if (path.includes('perfumes.html') && window.renderProducts) {
        renderProducts('perfumes-grid', 'perfumes');
    }
    else if (path.includes('clothes.html') && window.renderProducts) {
        renderProducts('clothes-grid', 'clothes');
    }
    else if (path.includes('shoes.html') && window.renderProducts) {
        renderProducts('shoes-grid', 'shoes');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeShopPage);
} else {
    initializeShopPage();
}
// Luxury Dual Price Range Slider
function initLuxuryPriceSlider() {
    const minSlider = document.querySelector('.price-slider-min');
    const maxSlider = document.querySelector('.price-slider-max');
    const minInput = document.querySelector('.price-min');
    const maxInput = document.querySelector('.price-max');
    const track = document.querySelector('.price-slider-track');
    const applyBtn = document.querySelector('.apply-price-filter') || createApplyButton();
    
    if (!minSlider || !maxSlider) return;
    
    // Initialize with Strapi data
    function initWithStrapiData(minPrice, maxPrice) {
        minSlider.min = minPrice;
        minSlider.max = maxPrice;
        maxSlider.min = minPrice;
        maxSlider.max = maxPrice;
        
        minSlider.value = minPrice;
        maxSlider.value = maxPrice;
        
        minInput.min = minPrice;
        minInput.max = maxPrice;
        maxInput.min = minPrice;
        maxInput.max = maxPrice;
        
        minInput.value = minPrice;
        maxInput.value = maxPrice;
        
        updateTrack();
        updateLabels();
    }
    
    // Update the colored track
    function updateTrack() {
        const min = parseInt(minSlider.value);
        const max = parseInt(maxSlider.value);
        const minPercent = ((min - minSlider.min) / (minSlider.max - minSlider.min)) * 100;
        const maxPercent = ((max - minSlider.min) / (minSlider.max - minSlider.min)) * 100;
        
        track.style.setProperty('--slider-min', minPercent + '%');
        track.style.setProperty('--slider-max', maxPercent + '%');
    }
    
    // Update min/max labels
    function updateLabels() {
        const minLabel = document.querySelector('.price-label-min');
        const maxLabel = document.querySelector('.price-label-max');
        
        if (minLabel) minLabel.textContent = '$' + minSlider.value;
        if (maxLabel) maxLabel.textContent = '$' + maxSlider.value;
    }
    
    // Sync sliders and inputs
    function syncValues() {
        const minVal = parseInt(minSlider.value);
        const maxVal = parseInt(maxSlider.value);
        
        // Prevent min from exceeding max
        if (minVal > maxVal) {
            minSlider.value = maxVal;
            minInput.value = maxVal;
        }
        
        // Prevent max from going below min
        if (maxVal < minVal) {
            maxSlider.value = minVal;
            maxInput.value = minVal;
        }
        
        updateTrack();
        updateLabels();
    }
    
    // Event Listeners for Sliders
    minSlider.addEventListener('input', function() {
        minInput.value = this.value;
        syncValues();
    });
    
    maxSlider.addEventListener('input', function() {
        maxInput.value = this.value;
        syncValues();
    });
    
    // Event Listeners for Inputs
    minInput.addEventListener('input', function() {
        minSlider.value = this.value;
        syncValues();
    });
    
    maxInput.addEventListener('input', function() {
        maxSlider.value = this.value;
        syncValues();
    });
    
    // Apply filter button
    function createApplyButton() {
        const btn = document.createElement('button');
        btn.className = 'apply-price-filter';
        btn.innerHTML = '<i class="fas fa-check"></i> Apply Price Filter';
        
        const container = document.querySelector('.luxury-price-range');
        if (container) {
            container.appendChild(btn);
        }
        
        return btn;
    }
    
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            const minPrice = parseInt(minSlider.value);
            const maxPrice = parseInt(maxSlider.value);
            
            // Filter products
            filterProductsByPriceRange(minPrice, maxPrice);
            
            // Add visual feedback
            this.innerHTML = '<i class="fas fa-check"></i> Applied!';
            this.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
            
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-check"></i> Apply Price Filter';
                this.style.background = 'linear-gradient(135deg, #ff4757, #ff6b81)';
            }, 1500);
        });
    }
    
    // Initialize with data from Strapi
    // This function should be called after fetching products
    window.updatePriceSliderRange = function(minPrice, maxPrice) {
        initWithStrapiData(minPrice, maxPrice);
    };
    
    // Initialize with default values
    syncValues();
}

// Filter products by price range
function filterProductsByPriceRange(minPrice, maxPrice) {
    const products = document.querySelectorAll('.premium-card, .product-card');
    
    products.forEach(product => {
        const priceElement = product.querySelector('.current-price');
        if (priceElement) {
            const priceText = priceElement.textContent;
            const price = parseFloat(priceText.replace(/[^\d.-]/g, ''));
            
            if (price >= minPrice && price <= maxPrice) {
                product.style.opacity = '1';
                product.style.pointerEvents = 'all';
                product.style.transform = 'scale(1)';
            } else {
                product.style.opacity = '0.4';
                product.style.pointerEvents = 'none';
                product.style.transform = 'scale(0.95)';
            }
        }
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initLuxuryPriceSlider();
    
    // After loading products from Strapi, update the slider range
    // Example usage:
    // fetchProductsFromStrapi().then(products => {
    //     const minPrice = Math.min(...products.map(p => p.price));
    //     const maxPrice = Math.max(...products.map(p => p.price));
    //     window.updatePriceSliderRange(minPrice, maxPrice);
    // });
});