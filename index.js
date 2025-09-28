
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
        const productsGrid = document.getElementById('products-grid');
        const salesHistory = document.getElementById('sales-history');
        const todaySalesCount = document.getElementById('today-sales-count');
        const todayRevenue = document.getElementById('today-revenue');
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
        
        // Format currency to Indian Rupees
        function formatCurrency(amount) {
            return `<span class="currency">₹</span>${amount.toFixed(2)}`;
        }
        
        // Initialize the POS system
        function init() {
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
            
            // Set up event listeners
            setupEventListeners();
        }
        
        // Set up event listeners
        function setupEventListeners() {
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
                            <span class="barcode">${product.barcode || 'No barcode'}</span>
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
            
            sellProductModal.classList.add('active');
        }
        
        // Sell product
        function sellProduct() {
            if (!currentProductForSale) return;
            
            const quantity = parseInt(document.getElementById('sell-quantity').value);
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
            
            // Update stock
            product.totalUnits = totalUnits - quantity;
            
            // Create sale record
            const sale = {
                id: Date.now(),
                timestamp: new Date().toLocaleString(),
                product: {
                    id: product.id,
                    name: product.name,
                    price: product.price
                },
                quantity: quantity,
                total: product.price * quantity
            };
            
            // Add to sales history
            sales.unshift(sale);
            saveSales();
            
            // Save updated products
            saveProducts();
            
            // Show success message
            showNotification(`Sold ${quantity} units of ${product.name} for ${formatCurrency(sale.total)}`);
            
            // Close modal
            sellProductModal.classList.remove('active');
            currentProductForSale = null;
            
            // Update displays
            renderProducts(products);
            updateInventoryDisplay();
            updateSalesDisplay();
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
            
            // Update summary cards
            todaySalesCount.textContent = salesCount;
            todayRevenue.innerHTML = formatCurrency(revenue);
            
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
                saleItem.innerHTML = `
                    <div class="sale-header">
                        <div class="sale-time">${sale.timestamp}</div>
                        <div class="sale-total">${formatCurrency(sale.total)}</div>
                    </div>
                    <div class="sale-products">
                        Sold ${sale.quantity} units of ${sale.product.name}
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
                            <span>Quantity:</span>
                            <span>${sale.quantity}</span>
                        </div>
                        <div class="detail-item">
                            <span>Total:</span>
                            <span>${formatCurrency(sale.total)}</span>
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
                const revenueEl = document.createElement('p');
                revenueEl.style.marginBottom = '10px';
                revenueEl.style.fontWeight = '600';
                revenueEl.innerHTML = `Total Revenue: ${formatCurrency(dateRevenue)}`;
                allSalesList.appendChild(revenueEl);
                
                dateSales.forEach(sale => {
                    const saleItem = document.createElement('div');
                    saleItem.className = 'sale-item';
                    saleItem.innerHTML = `
                        <div class="sale-header">
                            <div class="sale-time">${sale.timestamp.split(', ')[1]}</div>
                            <div class="sale-total">${formatCurrency(sale.total)}</div>
                        </div>
                        <div class="sale-products">
                            Sold ${sale.quantity} units of ${sale.product.name}
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
                        <td colspan="6" style="text-align: center; padding: 30px;">No products in inventory</td>
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
            const price = parseFloat(document.getElementById('product-price').value);
            const barcode = document.getElementById('product-barcode').value;
            const unitsPerBox = parseInt(document.getElementById('units-per-box').value);
            const totalUnits = parseInt(document.getElementById('total-units').value);
            const description = document.getElementById('product-description').value;
            
            if (!name || !category || !price || !unitsPerBox || totalUnits < 0) {
                showNotification('Please fill all required fields', 'error');
                return;
            }
            
            const newProduct = {
                id: Date.now(),
                name,
                category,
                price,
                barcode,
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
            
            showNotification(`${name} added successfully`);
        }
        
        // Show inventory report
        function showInventoryReport() {
            let lowStockCount = 0;
            let outOfStockCount = 0;
            let totalProducts = products.length;
            let totalValue = 0;
            
            products.forEach(product => {
                const totalUnits = product.totalUnits || 0;
                totalValue += product.price * totalUnits;
                
                const unitsPerBox = product.unitsPerBox || 1;
                if (totalUnits === 0) {
                    outOfStockCount++;
                } else if (totalUnits < unitsPerBox) {
                    lowStockCount++;
                }
            });
            
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
                    }).map(p => `<li>${p.name} (${totalUnits} units remaining)</li>`).join('') || '<li>No low stock items</li>'}
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
    