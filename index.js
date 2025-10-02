
    // User authentication system
    let currentUser = null;
    
    // Product database - Start with empty array
    let products = [];
    
    // Sales data
    let sales = [];
    
    // Track product to sell or edit stock
    let currentProductForSale = null;
    let currentProductForStockEdit = null;
    
    // Track confirmation action
    let pendingAction = null;
    
    // DOM Elements
    const authContainer = document.getElementById('auth-container');
    const app = document.getElementById('app');
    const authTabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const logoutBtn = document.getElementById('logout-btn');
    const userNameEl = document.getElementById('user-name');
    
    const productsGrid = document.getElementById('products-grid');
    const salesHistory = document.getElementById('sales-history');
    const todaySalesCount = document.getElementById('today-sales-count');
    const todayRevenue = document.getElementById('today-revenue');
    const todayProfit = document.getElementById('today-profit');
    const addProductBtn = document.getElementById('add-product-btn');
    const addProductModal = document.getElementById('add-product-modal');
    const addProductForm = document.getElementById('add-product-form');
    const sellProductModal = document.getElementById('sell-product-modal');
    const confirmSellBtn = document.getElementById('confirm-sell-btn');
    const editStockModal = document.getElementById('edit-stock-modal');
    const updateStockBtn = document.getElementById('update-stock-btn');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const inventoryTableBody = document.getElementById('inventory-table-body');
    const viewInventoryBtn = document.getElementById('view-inventory-btn');
    const inventoryReportModal = document.getElementById('inventory-report-modal');
    const inventoryReport = document.getElementById('inventory-report');
    const notificationEl = document.getElementById('notification');
    const currentDateEl = document.getElementById('current-date');
    const categoryTabs = document.querySelectorAll('.category-tab');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const viewAllSalesBtn = document.getElementById('view-all-sales-btn');
    const allSalesModal = document.getElementById('all-sales-modal');
    const allSalesList = document.getElementById('all-sales-list');
    const clearAllSalesBtn = document.getElementById('clear-all-sales-btn');
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmationMessage = document.getElementById('confirmation-message');
    const cancelConfirmBtn = document.getElementById('cancel-confirm-btn');
    const confirmActionBtn = document.getElementById('confirm-action-btn');
    
    // Discount elements
    const discountAmount = document.getElementById('discount-amount');
    const discountType = document.getElementById('discount-type');
    const priceBreakdown = document.getElementById('price-breakdown');
    
    // Search elements
    const productSearch = document.getElementById('product-search');
    const searchResults = document.getElementById('search-results');
    
    // Stats elements
    const totalProductsEl = document.getElementById('total-products');
    const inStockCountEl = document.getElementById('in-stock-count');
    const lowStockCountEl = document.getElementById('low-stock-count');
    
    // Format currency to Pakistani Rupees
    function formatCurrency(amount) {
        return `<span class="currency">Rs</span>${amount.toFixed(2)}`;
    }
    
    // Initialize the POS system
    function init() {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('posCurrentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            showApp();
        } else {
            showAuth();
        }
        
        // Set up authentication event listeners
        setupAuthListeners();
    }
    
    // Set up authentication event listeners
    function setupAuthListeners() {
        // Auth tabs
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                
                authTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                loginForm.classList.remove('active');
                signupForm.classList.remove('active');
                
                if (tabName === 'login') {
                    loginForm.classList.add('active');
                } else {
                    signupForm.classList.add('active');
                }
            });
        });
        
        // Login form
        loginForm.addEventListener('submit', handleLogin);
        
        // Signup form
        signupForm.addEventListener('submit', handleSignup);
        
        // Logout button
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Handle user login
    function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Simple validation
        if (!email || !password) {
            showNotification('Please enter both email and password', 'error');
            return;
        }
        
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('posUsers') || '[]');
        
        // Check if user exists
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('posCurrentUser', JSON.stringify(currentUser));
            showApp();
            showNotification(`Welcome back, ${user.name}!`);
        } else {
            showNotification('Invalid email or password', 'error');
        }
    }
    
    // Handle user signup
    function handleSignup(e) {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;
        
        // Validation
        if (!name || !email || !password || !confirm) {
            showNotification('Please fill all fields', 'error');
            return;
        }
        
        if (password !== confirm) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 6) {
            showNotification('Password must be at least 6 characters', 'error');
            return;
        }
        
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('posUsers') || '[]');
        
        // Check if user already exists
        if (users.find(u => u.email === email)) {
            showNotification('User with this email already exists', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('posUsers', JSON.stringify(users));
        
        // Log in the new user
        currentUser = newUser;
        localStorage.setItem('posCurrentUser', JSON.stringify(currentUser));
        
        showApp();
        showNotification(`Account created successfully! Welcome, ${name}!`);
    }
    
    // Handle user logout
    function handleLogout() {
        currentUser = null;
        localStorage.removeItem('posCurrentUser');
        showAuth();
        showNotification('You have been logged out', 'error');
    }
    
    // Show authentication screen
    function showAuth() {
        authContainer.style.display = 'flex';
        app.style.display = 'none';
    }
    
    // Show main application
    function showApp() {
        authContainer.style.display = 'none';
        app.style.display = 'flex';
        
        // Set current user name
        userNameEl.textContent = currentUser.name;
        
        // Set current date
        const now = new Date();
        currentDateEl.textContent = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Load products from localStorage
        const savedProducts = localStorage.getItem('posProducts');
        if (savedProducts) {
            products = JSON.parse(savedProducts);
        }
        
        // Load sales from localStorage if available
        const savedSales = localStorage.getItem('posSales');
        if (savedSales) {
            sales = JSON.parse(savedSales);
        }
        
        // Render products and inventory
        renderProducts(products);
        updateInventoryDisplay();
        updateSalesDisplay();
        updateStats();
        
        // Set up event listeners
        setupAppEventListeners();
    }
    
    // Set up application event listeners
    function setupAppEventListeners() {
        // Category tabs
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                categoryTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const category = tab.getAttribute('data-category');
                filterProducts(category);
            });
        });
        
        // Modal buttons
        addProductBtn.addEventListener('click', () => addProductModal.classList.add('active'));
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                addProductModal.classList.remove('active');
                sellProductModal.classList.remove('active');
                editStockModal.classList.remove('active');
                inventoryReportModal.classList.remove('active');
                allSalesModal.classList.remove('active');
                confirmationModal.classList.remove('active');
            });
        });
        
        // Add product form
        addProductForm.addEventListener('submit', addNewProduct);
        
        // Sell product
        confirmSellBtn.addEventListener('click', sellProduct);
        
        // Update stock
        updateStockBtn.addEventListener('click', updateStock);
        
        // Inventory report
        viewInventoryBtn.addEventListener('click', showInventoryReport);
        
        // Sales history actions
        clearHistoryBtn.addEventListener('click', () => {
            showConfirmation(
                "Are you sure you want to clear today's sales history? This action cannot be undone.",
                clearTodaysHistory
            );
        });
        
        viewAllSalesBtn.addEventListener('click', showAllSales);
        
        clearAllSalesBtn.addEventListener('click', () => {
            showConfirmation(
                "Are you sure you want to clear ALL sales history? This action cannot be undone.",
                clearAllSalesHistory
            );
        });
        
        // Confirmation modal
        cancelConfirmBtn.addEventListener('click', () => {
            confirmationModal.classList.remove('active');
            pendingAction = null;
        });
        
        confirmActionBtn.addEventListener('click', executePendingAction);
        
        // Discount calculation
        discountAmount.addEventListener('input', calculatePriceBreakdown);
        discountType.addEventListener('change', calculatePriceBreakdown);
        document.getElementById('sell-quantity').addEventListener('input', calculatePriceBreakdown);
        
        // Search functionality
        productSearch.addEventListener('input', handleSearch);
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                searchResults.classList.remove('active');
            }
        });
    }
    
    // Handle search functionality
    function handleSearch() {
        const query = productSearch.value.trim().toLowerCase();
        
        if (query.length === 0) {
            searchResults.classList.remove('active');
            return;
        }
        
        // Filter products by name, category, or description
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(query) || 
            product.category.toLowerCase().includes(query) ||
            (product.description && product.description.toLowerCase().includes(query))
        );
        
        // Display search results
        displaySearchResults(filteredProducts);
    }
    
    // Display search results
    function displaySearchResults(results) {
        searchResults.innerHTML = '';
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">No products found</div>';
        } else {
            results.forEach(product => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                
                const totalUnits = product.totalUnits || 0;
                let stockStatus = 'In Stock';
                let stockClass = 'stock-ok';
                
                if (totalUnits === 0) {
                    stockStatus = 'Out of Stock';
                    stockClass = 'stock-out';
                } else if (totalUnits < (product.unitsPerBox || 1)) {
                    stockStatus = 'Low Stock';
                    stockClass = 'stock-low';
                }
                
                resultItem.innerHTML = `
                    <div class="search-result-info">
                        <div class="search-result-name">${product.name}</div>
                        <div class="search-result-details">
                            ${product.category} | ${formatCurrency(product.price)} | <span class="${stockClass}">${stockStatus}</span>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.8rem;" data-id="${product.id}">
                        <i class="fas fa-cash-register"></i> Sell
                    </button>
                `;
                
                // Add event listener to sell button
                const sellBtn = resultItem.querySelector('.btn');
                sellBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const productToSell = products.find(p => p.id === product.id);
                    if (productToSell) {
                        openSellModal(productToSell);
                        searchResults.classList.remove('active');
                        productSearch.value = '';
                    }
                });
                
                // Add event listener to select product
                resultItem.addEventListener('click', () => {
                    const productToSell = products.find(p => p.id === product.id);
                    if (productToSell) {
                        openSellModal(productToSell);
                        searchResults.classList.remove('active');
                        productSearch.value = '';
                    }
                });
                
                searchResults.appendChild(resultItem);
            });
        }
        
        searchResults.classList.add('active');
    }
    
    // Calculate price breakdown with discount
    function calculatePriceBreakdown() {
        if (!currentProductForSale) return;
        
        const quantity = parseInt(document.getElementById('sell-quantity').value) || 1;
        const discount = parseFloat(discountAmount.value) || 0;
        const discountTypeValue = discountType.value;
        
        const product = products.find(p => p.id === currentProductForSale.id);
        if (!product) return;
        
        const costPrice = product.costPrice || 0;
        const sellingPrice = product.price;
        
        // Calculate subtotal
        const subtotal = sellingPrice * quantity;
        
        // Calculate discount amount
        let discountAmountValue = 0;
        if (discountTypeValue === 'percentage') {
            discountAmountValue = (subtotal * discount) / 100;
        } else {
            discountAmountValue = discount;
        }
        
        // Ensure discount doesn't exceed subtotal
        discountAmountValue = Math.min(discountAmountValue, subtotal);
        
        // Calculate final total
        const total = subtotal - discountAmountValue;
        
        // Calculate profit
        const profit = (sellingPrice - costPrice) * quantity - discountAmountValue;
        
        // Update price breakdown display
        priceBreakdown.innerHTML = `
            <div class="price-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(subtotal)}</span>
            </div>
            <div class="price-row">
                <span>Discount:</span>
                <span>-${formatCurrency(discountAmountValue)}</span>
            </div>
            <div class="price-row total">
                <span>Total:</span>
                <span>${formatCurrency(total)}</span>
            </div>
            <div class="price-row">
                <span>Estimated Profit:</span>
                <span style="color: var(--success);">${formatCurrency(profit)}</span>
            </div>
        `;
    }
    
    // Show confirmation dialog
    function showConfirmation(message, action) {
        confirmationMessage.textContent = message;
        pendingAction = action;
        confirmationModal.classList.add('active');
    }
    
    // Execute the pending action after confirmation
    function executePendingAction() {
        if (pendingAction) {
            pendingAction();
        }
        confirmationModal.classList.remove('active');
        pendingAction = null;
    }
    
    // Clear today's sales history
    function clearTodaysHistory() {
        const today = new Date().toLocaleDateString('en-CA');
        sales = sales.filter(sale => {
            const saleDate = new Date(sale.timestamp).toLocaleDateString('en-CA');
            return saleDate !== today;
        });
        
        saveSales();
        updateSalesDisplay();
        showNotification("Today's sales history cleared", "error");
    }
    
    // Clear all sales history
    function clearAllSalesHistory() {
        sales = [];
        saveSales();
        updateSalesDisplay();
        if (allSalesModal.classList.contains('active')) {
            renderAllSales();
        }
        showNotification("All sales history cleared", "error");
    }
    
    // Save products to localStorage
    function saveProducts() {
        localStorage.setItem('posProducts', JSON.stringify(products));
    }
    
    // Save sales to localStorage
    function saveSales() {
        localStorage.setItem('posSales', JSON.stringify(sales));
    }
    
    // Update stats display
    function updateStats() {
        totalProductsEl.textContent = products.length;
        
        const inStockCount = products.filter(p => {
            const totalUnits = p.totalUnits || 0;
            const unitsPerBox = p.unitsPerBox || 1;
            return totalUnits >= unitsPerBox;
        }).length;
        
        const lowStockCount = products.filter(p => {
            const totalUnits = p.totalUnits || 0;
            const unitsPerBox = p.unitsPerBox || 1;
            return totalUnits > 0 && totalUnits < unitsPerBox;
        }).length;
        
        inStockCountEl.textContent = inStockCount;
        lowStockCountEl.textContent = lowStockCount;
    }
    
    // Render products to the grid
    function renderProducts(productsToRender) {
        productsGrid.innerHTML = '';
        
        if (productsToRender.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-products">
                    <i class="fas fa-box-open"></i>
                    <h3>No Products Added Yet</h3>
                    <p>Click the "Add Product" button to start building your inventory</p>
                    <button class="btn btn-primary" style="margin-top: 20px;" id="add-first-product">
                        <i class="fas fa-plus"></i> Add Your First Product
                    </button>
                </div>
            `;
            
            // Add event listener to the button
            const addFirstProductBtn = document.getElementById('add-first-product');
            if (addFirstProductBtn) {
                addFirstProductBtn.addEventListener('click', () => {
                    addProductModal.classList.add('active');
                });
            }
            
            return;
        }
        
        productsToRender.forEach(product => {
            const totalUnits = product.totalUnits || 0;
            const unitsPerBox = product.unitsPerBox || 1;
            const boxes = Math.floor(totalUnits / unitsPerBox);
            const remainingUnits = totalUnits % unitsPerBox;
            
            let stockStatus = 'ok';
            let stockText = 'In Stock';
            
            if (totalUnits === 0) {
                stockStatus = 'out';
                stockText = 'Out of Stock';
            } else if (totalUnits < unitsPerBox) {
                stockStatus = 'low';
                stockText = 'Low Stock';
            }
            
            const productCard = document.createElement('div');
            productCard.className = `product-card ${product.category}`;
            productCard.innerHTML = `
                <div class="stock-badge ${stockStatus}">${stockText}</div>
                <div class="product-image">
                    <i class="fas ${product.category === 'makeup' ? 'fa-palette' : 'fa-utensils'}"></i>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description || 'No description'}</p>
                    <div class="product-details">
                        <span>${unitsPerBox} units/box</span>
                        <span>${boxes} boxes + ${remainingUnits} units</span>
                    </div>
                    <div class="product-price">
                        ${formatCurrency(product.price)}
                    </div>
                    <div class="product-actions">
                        <button class="action-btn stock-btn" data-id="${product.id}">
                            <i class="fas fa-boxes"></i> Stock
                        </button>
                        <button class="action-btn delete-btn" data-id="${product.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                    <button class="action-btn sell-btn" data-id="${product.id}">
                        <i class="fas fa-cash-register"></i> Sell Product
                    </button>
                </div>
            `;
            
            // Add event listeners to action buttons
            const stockBtn = productCard.querySelector('.stock-btn');
            const deleteBtn = productCard.querySelector('.delete-btn');
            const sellBtn = productCard.querySelector('.sell-btn');
            
            stockBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openStockModal(product);
            });
            
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteProduct(product.id);
            });
            
            sellBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openSellModal(product);
            });
            
            productsGrid.appendChild(productCard);
        });
    }
    
    // Filter products by category
    function filterProducts(category) {
        if (category === 'all') {
            renderProducts(products);
        } else if (category === 'low-stock') {
            const lowStock = products.filter(p => {
                const totalUnits = p.totalUnits || 0;
                const unitsPerBox = p.unitsPerBox || 1;
                return totalUnits > 0 && totalUnits < unitsPerBox;
            });
            renderProducts(lowStock);
        } else {
            const filtered = products.filter(p => p.category === category);
            renderProducts(filtered);
        }
    }
    
    // Open sell product modal
    function openSellModal(product) {
        currentProductForSale = product;
        
        const productInfo = document.getElementById('sell-product-info');
        const totalUnits = product.totalUnits || 0;
        
        productInfo.innerHTML = `
            <h3>${product.name}</h3>
            <p>Price: ${formatCurrency(product.price)} per unit</p>
            <p>Available Stock: ${totalUnits} units</p>
        `;
        
        document.getElementById('sell-quantity').value = 1;
        document.getElementById('sell-quantity').max = totalUnits;
        
        // Reset discount
        discountAmount.value = 0;
        discountType.value = 'fixed';
        
        // Calculate initial price breakdown
        calculatePriceBreakdown();
        
        sellProductModal.classList.add('active');
    }
    
    // Sell product
    function sellProduct() {
        if (!currentProductForSale) return;
        
        const quantity = parseInt(document.getElementById('sell-quantity').value);
        const discount = parseFloat(discountAmount.value) || 0;
        const discountTypeValue = discountType.value;
        
        const product = products.find(p => p.id === currentProductForSale.id);
        
        if (!product || quantity <= 0) {
            showNotification('Please enter a valid quantity', 'error');
            return;
        }
        
        const totalUnits = product.totalUnits || 0;
        
        if (quantity > totalUnits) {
            showNotification(`Only ${totalUnits} units available for ${product.name}`, 'error');
            return;
        }
        
        // Calculate sale details
        const costPrice = product.costPrice || 0;
        const sellingPrice = product.price;
        const subtotal = sellingPrice * quantity;
        
        // Calculate discount amount
        let discountAmountValue = 0;
        if (discountTypeValue === 'percentage') {
            discountAmountValue = (subtotal * discount) / 100;
        } else {
            discountAmountValue = discount;
        }
        
        // Ensure discount doesn't exceed subtotal
        discountAmountValue = Math.min(discountAmountValue, subtotal);
        
        // Calculate final total
        const total = subtotal - discountAmountValue;
        
        // Calculate profit
        const profit = (sellingPrice - costPrice) * quantity - discountAmountValue;
        
        // Update stock
        product.totalUnits = totalUnits - quantity;
        
        // Create sale record
        const sale = {
            id: Date.now(),
            timestamp: new Date().toLocaleString(),
            product: {
                id: product.id,
                name: product.name,
                price: product.price,
                costPrice: costPrice
            },
            quantity: quantity,
            subtotal: subtotal,
            discount: discountAmountValue,
            discountType: discountTypeValue,
            total: total,
            profit: profit
        };
        
        // Add to sales history
        sales.unshift(sale);
        saveSales();
        
        // Save updated products
        saveProducts();
        
        // Show success message
        let message = `Sold ${quantity} units of ${product.name} for ${formatCurrency(total)}`;
        if (discountAmountValue > 0) {
            message += ` (${formatCurrency(discountAmountValue)} discount applied)`;
        }
        showNotification(message);
        
        // Close modal
        sellProductModal.classList.remove('active');
        currentProductForSale = null;
        
        // Update displays
        renderProducts(products);
        updateInventoryDisplay();
        updateSalesDisplay();
        updateStats();
    }
    
    // Delete product
    function deleteProduct(id) {
        showConfirmation(
            "Are you sure you want to delete this product? This action cannot be undone.",
            () => {
                products = products.filter(p => p.id !== id);
                saveProducts();
                
                // Update displays
                renderProducts(products);
                updateInventoryDisplay();
                updateStats();
                
                showNotification('Product deleted successfully', 'error');
            }
        );
    }
    
    // Open stock management modal
    function openStockModal(product) {
        currentProductForStockEdit = product;
        
        const productInfo = document.getElementById('stock-product-info');
        const unitsPerBox = product.unitsPerBox || 1;
        const boxes = Math.floor(product.totalUnits / unitsPerBox);
        const remainingUnits = product.totalUnits % unitsPerBox;
        
        productInfo.innerHTML = `
            <h3>${product.name}</h3>
            <p>Current Stock: ${boxes} boxes + ${remainingUnits} units (Total: ${product.totalUnits} units)</p>
            <p>Price: ${formatCurrency(product.price)} per unit</p>
        `;
        
        document.getElementById('stock-change').value = 0;
        document.getElementById('stock-reason').value = '';
        
        editStockModal.classList.add('active');
    }
    
    // Update stock
    function updateStock() {
        if (!currentProductForStockEdit) return;
        
        const change = parseInt(document.getElementById('stock-change').value);
        const reason = document.getElementById('stock-reason').value;
        
        if (isNaN(change) || change === 0) {
            showNotification('Please enter a valid number to add or remove stock', 'error');
            return;
        }
        
        const product = products.find(p => p.id === currentProductForStockEdit.id);
        if (!product) return;
        
        const newTotal = product.totalUnits + change;
        
        if (newTotal < 0) {
            showNotification('Cannot remove more units than available in stock', 'error');
            return;
        }
        
        product.totalUnits = newTotal;
        saveProducts();
        
        // Update displays
        renderProducts(products);
        updateInventoryDisplay();
        updateStats();
        
        // Show notification with reason if provided
        const action = change > 0 ? 'added to' : 'removed from';
        const absChange = Math.abs(change);
        const message = reason 
            ? `${absChange} units ${action} ${product.name} (${reason})`
            : `${absChange} units ${action} ${product.name}`;
            
        showNotification(message, change > 0 ? 'success' : 'error');
        
        // Close modal
        editStockModal.classList.remove('active');
        currentProductForStockEdit = null;
    }
    
    // Update sales display
    function updateSalesDisplay() {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
        
        // Filter sales from today
        const todaySales = sales.filter(sale => {
            const saleDate = new Date(sale.timestamp).toLocaleDateString('en-CA');
            return saleDate === today;
        });
        
        // Calculate today's totals
        const salesCount = todaySales.length;
        const revenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
        const profit = todaySales.reduce((sum, sale) => sum + sale.profit, 0);
        
        // Update summary cards
        todaySalesCount.textContent = salesCount;
        todayRevenue.innerHTML = formatCurrency(revenue);
        todayProfit.innerHTML = formatCurrency(profit);
        
        // Update sales history
        salesHistory.innerHTML = '';
        
        if (todaySales.length === 0) {
            salesHistory.innerHTML = `
                <div class="empty-sales">
                    <i class="fas fa-receipt"></i>
                    <p>No sales today</p>
                    <p>Sell products to see history here</p>
                </div>
            `;
            return;
        }
        
        todaySales.forEach(sale => {
            const saleItem = document.createElement('div');
            saleItem.className = 'sale-item';
            
            let discountText = '';
            if (sale.discount > 0) {
                discountText = `<span class="discount-badge">-${formatCurrency(sale.discount)}</span>`;
            }
            
            saleItem.innerHTML = `
                <div class="sale-header">
                    <div class="sale-time">${sale.timestamp}</div>
                    <div class="sale-total">${formatCurrency(sale.total)}${discountText}</div>
                </div>
                <div class="sale-products">
                    Sold ${sale.quantity} units of ${sale.product.name}
                </div>
                <div class="sale-profit">
                    Profit: ${formatCurrency(sale.profit)}
                </div>
                <div class="sale-actions">
                    <button class="detail-btn" data-id="${sale.id}">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                    <button class="delete-sale-btn" data-id="${sale.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
                <div class="sale-details" id="details-${sale.id}">
                    <div class="detail-item">
                        <span>Product:</span>
                        <span>${sale.product.name}</span>
                    </div>
                    <div class="detail-item">
                        <span>Price per unit:</span>
                        <span>${formatCurrency(sale.product.price)}</span>
                    </div>
                    <div class="detail-item">
                        <span>Cost per unit:</span>
                        <span>${formatCurrency(sale.product.costPrice || 0)}</span>
                    </div>
                    <div class="detail-item">
                        <span>Quantity:</span>
                        <span>${sale.quantity}</span>
                    </div>
                    <div class="detail-item">
                        <span>Subtotal:</span>
                        <span>${formatCurrency(sale.subtotal)}</span>
                    </div>
                    ${sale.discount > 0 ? `
                    <div class="detail-item">
                        <span>Discount:</span>
                        <span>-${formatCurrency(sale.discount)}</span>
                    </div>
                    ` : ''}
                    <div class="detail-item">
                        <span>Total:</span>
                        <span>${formatCurrency(sale.total)}</span>
                    </div>
                    <div class="detail-item">
                        <span>Profit:</span>
                        <span style="color: var(--success);">${formatCurrency(sale.profit)}</span>
                    </div>
                </div>
            `;
            
            salesHistory.appendChild(saleItem);
            
            // Add event listeners to action buttons
            const detailBtn = saleItem.querySelector('.detail-btn');
            const deleteBtn = saleItem.querySelector('.delete-sale-btn');
            const detailsDiv = saleItem.querySelector(`#details-${sale.id}`);
            
            detailBtn.addEventListener('click', () => {
                detailsDiv.classList.toggle('active');
                detailBtn.innerHTML = detailsDiv.classList.contains('active') 
                    ? '<i class="fas fa-chevron-up"></i> Hide Details' 
                    : '<i class="fas fa-info-circle"></i> Details';
            });
            
            deleteBtn.addEventListener('click', () => {
                showConfirmation(
                    "Are you sure you want to delete this sale record?",
                    () => deleteSale(sale.id)
                );
            });
        });
    }
    
    // Delete individual sale
    function deleteSale(saleId) {
        sales = sales.filter(sale => sale.id !== saleId);
        saveSales();
        updateSalesDisplay();
        if (allSalesModal.classList.contains('active')) {
            renderAllSales();
        }
        showNotification('Sale record deleted', 'error');
    }
    
    // Show all sales history
    function showAllSales() {
        allSalesModal.classList.add('active');
        renderAllSales();
    }
    
    // Render all sales in the modal
    function renderAllSales() {
        allSalesList.innerHTML = '';
        
        if (sales.length === 0) {
            allSalesList.innerHTML = `
                <div class="empty-sales">
                    <i class="fas fa-receipt"></i>
                    <p>No sales history</p>
                    <p>Sell products to see history here</p>
                </div>
            `;
            return;
        }
        
        // Group sales by date
        const salesByDate = {};
        sales.forEach(sale => {
            const saleDate = new Date(sale.timestamp).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            if (!salesByDate[saleDate]) {
                salesByDate[saleDate] = [];
            }
            salesByDate[saleDate].push(sale);
        });
        
        // Render sales grouped by date
        for (const [date, dateSales] of Object.entries(salesByDate)) {
            const dateHeader = document.createElement('h3');
            dateHeader.style.margin = '15px 0 10px 0';
            dateHeader.style.color = 'var(--primary)';
            dateHeader.textContent = date;
            allSalesList.appendChild(dateHeader);
            
            const dateRevenue = dateSales.reduce((sum, sale) => sum + sale.total, 0);
            const dateProfit = dateSales.reduce((sum, sale) => sum + sale.profit, 0);
            
            const revenueEl = document.createElement('p');
            revenueEl.style.marginBottom = '5px';
            revenueEl.style.fontWeight = '600';
            revenueEl.innerHTML = `Total Revenue: ${formatCurrency(dateRevenue)}`;
            allSalesList.appendChild(revenueEl);
            
            const profitEl = document.createElement('p');
            profitEl.style.marginBottom = '10px';
            profitEl.style.fontWeight = '600';
            profitEl.style.color = 'var(--success)';
            profitEl.innerHTML = `Total Profit: ${formatCurrency(dateProfit)}`;
            allSalesList.appendChild(profitEl);
            
            dateSales.forEach(sale => {
                let discountText = '';
                if (sale.discount > 0) {
                    discountText = `<span class="discount-badge">-${formatCurrency(sale.discount)}</span>`;
                }
                
                const saleItem = document.createElement('div');
                saleItem.className = 'sale-item';
                saleItem.innerHTML = `
                    <div class="sale-header">
                        <div class="sale-time">${sale.timestamp.split(', ')[1]}</div>
                        <div class="sale-total">${formatCurrency(sale.total)}${discountText}</div>
                    </div>
                    <div class="sale-products">
                        Sold ${sale.quantity} units of ${sale.product.name}
                    </div>
                    <div class="sale-profit">
                        Profit: ${formatCurrency(sale.profit)}
                    </div>
                    <div class="sale-actions">
                        <button class="delete-sale-btn" data-id="${sale.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                `;
                
                allSalesList.appendChild(saleItem);
                
                // Add event listener to delete button
                const deleteBtn = saleItem.querySelector('.delete-sale-btn');
                deleteBtn.addEventListener('click', () => {
                    showConfirmation(
                        "Are you sure you want to delete this sale record?",
                        () => deleteSale(sale.id)
                    );
                });
            });
        }
    }
    
    // Update inventory display
    function updateInventoryDisplay() {
        inventoryTableBody.innerHTML = '';
        
        if (products.length === 0) {
            inventoryTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 30px;">No products in inventory</td>
                </tr>
            `;
            return;
        }
        
        products.forEach(product => {
            const totalUnits = product.totalUnits || 0;
            const unitsPerBox = product.unitsPerBox || 1;
            const boxes = Math.floor(totalUnits / unitsPerBox);
            const remainingUnits = totalUnits % unitsPerBox;
            
            let stockStatus = 'ok';
            
            if (totalUnits === 0) {
                stockStatus = 'out';
            } else if (totalUnits < unitsPerBox) {
                stockStatus = 'low';
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${formatCurrency(product.costPrice || 0)}</td>
                <td>${formatCurrency(product.price)}</td>
                <td>${unitsPerBox}</td>
                <td>${boxes} boxes + ${remainingUnits} units</td>
                <td class="stock-cell ${stockStatus}">
                    ${stockStatus === 'out' ? 'Out of Stock' : 
                        stockStatus === 'low' ? 'Low Stock' : 'In Stock'}
                </td>
                <td>
                    <div class="table-actions">
                        <button class="table-btn stock-btn" data-id="${product.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="table-btn delete-btn" data-id="${product.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            // Add event listeners to action buttons
            const stockBtn = row.querySelector('.stock-btn');
            const deleteBtn = row.querySelector('.delete-btn');
            
            stockBtn.addEventListener('click', () => {
                openStockModal(product);
            });
            
            deleteBtn.addEventListener('click', () => {
                showConfirmation(
                    "Are you sure you want to delete this product? This action cannot be undone.",
                    () => deleteProduct(product.id)
                );
            });
            
            inventoryTableBody.appendChild(row);
        });
    }
    
    // Add new product
    function addNewProduct(e) {
        e.preventDefault();
        
        const name = document.getElementById('product-name').value;
        const category = document.getElementById('product-category').value;
        const costPrice = parseFloat(document.getElementById('cost-price').value);
        const price = parseFloat(document.getElementById('product-price').value);
        const unitsPerBox = parseInt(document.getElementById('units-per-box').value);
        const totalUnits = parseInt(document.getElementById('total-units').value);
        const description = document.getElementById('product-description').value;
        
        if (!name || !category || !costPrice || !price || !unitsPerBox || totalUnits < 0) {
            showNotification('Please fill all required fields', 'error');
            return;
        }
        
        const newProduct = {
            id: Date.now(),
            name,
            category,
            costPrice,
            price,
            unitsPerBox,
            totalUnits,
            description
        };
        
        products.push(newProduct);
        saveProducts();
        
        // Reset form and close modal
        addProductForm.reset();
        addProductModal.classList.remove('active');
        
        // Update displays
        renderProducts(products);
        updateInventoryDisplay();
        updateStats();
        
        showNotification(`${name} added successfully`);
    }
    
    // Show inventory report
    function showInventoryReport() {
        let lowStockCount = 0;
        let outOfStockCount = 0;
        let totalProducts = products.length;
        let totalValue = 0;
        let totalCostValue = 0;
        
        products.forEach(product => {
            const totalUnits = product.totalUnits || 0;
            totalValue += product.price * totalUnits;
            totalCostValue += (product.costPrice || 0) * totalUnits;
            
            const unitsPerBox = product.unitsPerBox || 1;
            if (totalUnits === 0) {
                outOfStockCount++;
            } else if (totalUnits < unitsPerBox) {
                lowStockCount++;
            }
        });
        
        const potentialProfit = totalValue - totalCostValue;
        
        inventoryReport.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                    <h3 style="color: var(--primary); margin-bottom: 8px;">${totalProducts}</h3>
                    <p>Total Products</p>
                </div>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                    <h3 style="color: var(--primary); margin-bottom: 8px;">${formatCurrency(totalValue)}</h3>
                    <p>Total Inventory Value</p>
                </div>
                <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; text-align: center;">
                    <h3 style="color: var(--success); margin-bottom: 8px;">${formatCurrency(potentialProfit)}</h3>
                    <p>Potential Profit</p>
                </div>
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; text-align: center;">
                    <h3 style="color: var(--warning); margin-bottom: 8px;">${lowStockCount}</h3>
                    <p>Low Stock Items</p>
                </div>
                <div style="background: #f8d7da; padding: 15px; border-radius: 8px; text-align: center;">
                    <h3 style="color: var(--danger); margin-bottom: 8px;">${outOfStockCount}</h3>
                    <p>Out of Stock Items</p>
                </div>
            </div>
            
            <h3 style="margin-bottom: 12px;">Low Stock Items</h3>
            <ul style="margin-bottom: 20px;">
                ${products.filter(p => {
                    const totalUnits = p.totalUnits || 0;
                    const unitsPerBox = p.unitsPerBox || 1;
                    return totalUnits > 0 && totalUnits < unitsPerBox;
                }).map(p => `<li>${p.name} (${p.totalUnits} units remaining)</li>`).join('') || '<li>No low stock items</li>'}
            </ul>
            
            <h3 style="margin-bottom: 12px;">Out of Stock Items</h3>
            <ul>
                ${products.filter(p => (p.totalUnits || 0) === 0).map(p => `<li>${p.name}</li>`).join('') || '<li>No out of stock items</li>'}
            </ul>
        `;
        
        inventoryReportModal.classList.add('active');
    }
    
    // Show notification
    function showNotification(message, type = 'success') {
        notificationEl.textContent = message;
        notificationEl.className = 'notification';
        notificationEl.classList.add('show', type);
        
        setTimeout(() => {
            notificationEl.classList.remove('show');
        }, 3000);
    }
    
    // Initialize the POS system when page loads
    document.addEventListener('DOMContentLoaded', init);
