// CART ARRAY
let cart = [];

// VIEW SWITCHER
function showView(view) {
    let billing = document.getElementById('billingView');
    let transactions = document.getElementById('transactionsView');
    let navBilling = document.getElementById('navBilling');
    let navTransactions = document.getElementById('navTransactions');

    if (view === 'transactions') {
        if (billing) billing.style.display = 'none';
        if (transactions) transactions.style.display = 'flex';
        if (navBilling) navBilling.classList.remove('active');
        if (navTransactions) navTransactions.classList.add('active');
        loadTransactions();
    } else {
        if (billing) billing.style.display = 'flex';
        if (transactions) transactions.style.display = 'none';
        if (navBilling) navBilling.classList.add('active');
        if (navTransactions) navTransactions.classList.remove('active');
    }
}

// ACCORDION TOGGLE
function toggleAccordion(bodyId, headerEl) {
    let body = document.getElementById(bodyId);
    let arrow = headerEl.querySelector('.accordion-arrow');
    if (body.style.display === 'none' || body.style.display === '') {
        body.style.display = 'flex';
        if (arrow) arrow.classList.add('open');
    } else {
        body.style.display = 'none';
        if (arrow) arrow.classList.remove('open');
    }
}

// SEARCH PRODUCT
function searchMedicine() {
    let query = document.getElementById('searchInput').value.trim();
    let resultsBox = document.getElementById('searchResults');

    if (query.length === 0) {
        resultsBox.innerHTML = '';
        return;
    }

    fetch('api/products.php?action=get&search=' + encodeURIComponent(query))
        .then(response => response.json())
        .then(data => {
            resultsBox.innerHTML = '';

            if (data.length === 0) {
                resultsBox.innerHTML = '<div class="search-item">No products found</div>';
                return;
            }

            data.forEach(medicine => {
                let item = document.createElement('div');
                item.className = 'search-item';
                let expText = '';
                if (medicine.expiration_date) {
                    let expDate = new Date(medicine.expiration_date);
                    let today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (expDate < today) {
                        expText = '<div class="expired-text">EXPIRED</div>';
                    }
                }

                item.innerHTML =
                    '<div class="medicine-info">' +
                    '<span class="medicine-name">' + medicine.product_name + '</span>' +
                    expText +
                    '</div>' +
                    '<span class="price">&#8369;' + parseFloat(medicine.price).toFixed(2) + '</span>';
                item.onclick = function () {
                    addToCart(medicine);
                    resultsBox.innerHTML = '';
                    document.getElementById('searchInput').value = '';
                };
                resultsBox.appendChild(item);
            });
        })
        .catch(error => {
            resultsBox.innerHTML = '<div class="search-item">Error loading products</div>';
        });
}

// ADD TO CART
function addToCart(medicine) {
    if (medicine.expiration_date) {
        let expDate = new Date(medicine.expiration_date);
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        if (expDate < today) {
            alert('WARNING: This medicine is expired and cannot be added to the cart.');
            return; // Block addition
        }
    }

    let existing = cart.find(item => item.product_id === medicine.product_id);

    if (existing) {
        existing.quantity += 1;
        existing.subtotal = existing.quantity * existing.price;
    } else {
        cart.push({
            product_id: medicine.product_id,
            product_name: medicine.product_name,
            price: parseFloat(medicine.price),
            quantity: 1,
            subtotal: parseFloat(medicine.price)
        });
    }

    renderCart();
}

// RENDER CART
function renderCart() {
    let cartBody = document.getElementById('cartItems');
    if (!cartBody) return;

    cartBody.innerHTML = '';

    cart.forEach((item, index) => {
        let row = document.createElement('tr');
        row.innerHTML =
            '<td>' + item.product_name + '</td>' +
            '<td>' +
            '<input type="number" class="qty-input" value="' + item.quantity + '" min="1" ' +
            'onchange="updateQty(' + index + ', this.value)">' +
            '</td>' +
            '<td>&#8369;' + item.price.toFixed(2) + '</td>' +
            '<td>&#8369;' + item.subtotal.toFixed(2) + '</td>' +
            '<td>' +
            '<button class="btn-delete" onclick="removeFromCart(' + index + ')">Remove</button>' +
            '</td>';
        cartBody.appendChild(row);
    });

    calculateCartTotal();
}

// CALCULATE TOTALS
function calculateCartTotal() {
    let subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    let total = subtotal;

    if (document.getElementById('subTotalAmount')) document.getElementById('subTotalAmount').innerHTML = '&#8369;' + subtotal.toFixed(2);
    if (document.getElementById('totalAmount')) document.getElementById('totalAmount').innerHTML = '&#8369;' + total.toFixed(2);

    calculateChange();
}

// CALCULATE CHANGE
function calculateChange() {
    let subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    let total = subtotal;

    let cashInput = document.getElementById('cashTendered');
    if (!cashInput) return;

    let cash = parseFloat(cashInput.value);
    let changeEl = document.getElementById('changeAmount');

    if (isNaN(cash) || cash < total) {
        changeEl.innerHTML = '&#8369;0.00';
    } else {
        let change = cash - total;
        changeEl.innerHTML = '&#8369;' + change.toFixed(2);
    }
}

// UPDATE QUANTITY
function updateQty(index, value) {
    let qty = parseInt(value);
    if (qty < 1 || isNaN(qty)) qty = 1;
    cart[index].quantity = qty;
    cart[index].subtotal = qty * cart[index].price;
    renderCart();
}

// REMOVE FROM CART
function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

// CLEAR CART
function clearCart() {
    cart = [];
    if (document.getElementById('cashTendered')) document.getElementById('cashTendered').value = '';
    if (document.getElementById('checkoutError')) document.getElementById('checkoutError').innerText = '';
    if (document.getElementById('receiptPreview')) document.getElementById('receiptPreview').style.display = 'none';
    renderCart();
}

let isProcessingTransaction = false;

// CONFIRM TRANSACTION
function confirmTransaction() {
    if (isProcessingTransaction) return;

    let errorMsg = document.getElementById('checkoutError');
    if (errorMsg) errorMsg.innerText = '';

    if (cart.length === 0) {
        if (errorMsg) errorMsg.innerText = 'Cart is empty. Please add medicines first.';
        else alert('Cart is empty. Please add medicines first.');
        return;
    }

    let subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    let total = subtotal;

    let cashInput = document.getElementById('cashTendered');
    let cash = cashInput && cashInput.value !== '' ? parseFloat(cashInput.value) : 0;

    if (cash < total) {
        if (errorMsg) errorMsg.innerText = 'Insufficient cash tendered.';
        return;
    }

    let change = cash - total;

    isProcessingTransaction = true;
    let confirmBtn = document.querySelector('.right-panel .btn-confirm');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerText = 'Processing...';
    }

    fetch('api/transactions.php?action=save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: cart, subtotal: subtotal, total: total, cash: cash, change: change })
    })
        .then(response => response.json())
        .then(data => {
            isProcessingTransaction = false;
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.innerText = 'Confirm Transaction';
            }

            if (data.success) {
                let transId = data.transaction_id || Math.floor(Math.random() * 1000000);
                let savedCart = [...cart];
                showReceipt(savedCart, subtotal, total, cash, change, transId);
                
                // Clear the cart contents so it can't be processed again
                cart = [];
                if (document.getElementById('cashTendered')) document.getElementById('cashTendered').value = '';
                renderCart();
            } else {
                if (errorMsg) errorMsg.innerText = 'Error: ' + data.message;
                else alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            isProcessingTransaction = false;
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.innerText = 'Confirm Transaction';
            }
            if (errorMsg) errorMsg.innerText = 'Error connecting to server.';
            else alert('Error connecting to server.');
        });
}

// RECEIPT FUNCTIONS
function showReceipt(cartItems, subtotal, total, cash, change, transactionId) {
    let itemsContainer = document.getElementById('receiptItems');
    if (!itemsContainer) return;

    let currentDateTime = new Date().toLocaleTimeString('en-US', { hour12: true, hour: "numeric", minute: "numeric", second: "numeric" });
    let currentDate = new Date().toLocaleDateString('en-US'); // You can format this further if needed

    let receiptNoEl = document.getElementById('receiptNo');
    if (receiptNoEl) receiptNoEl.innerText = transactionId !== undefined ? transactionId : Math.floor(Math.random() * 1000000);

    let receiptDateEl = document.getElementById('receiptDateTime');
    if (receiptDateEl) receiptDateEl.innerText = currentDate + ' ' + currentDateTime;

    itemsContainer.innerHTML = '';
    cartItems.forEach(item => {
        let div = document.createElement('div');
        div.style.marginBottom = '10px';
        div.innerHTML =
            '<div style="display: flex;">' +
            '<span style="flex: 1;">' + item.quantity + ' PC</span>' +
            '<span style="flex: 3;">' + item.product_name + '</span>' +
            '<span style="flex: 1; text-align: right;">' + item.subtotal.toFixed(2) + '</span>' +
            '</div>' +
            '<div>@' + item.price.toFixed(2) + '</div>';
        itemsContainer.appendChild(div);
    });

    let totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('receiptTotalItems').innerText = totalItems;

    document.getElementById('rSubtotal').innerText = subtotal.toFixed(2);
    document.getElementById('rTotal').innerText = total.toFixed(2);
    document.getElementById('rCash').innerText = cash.toFixed(2);
    document.getElementById('rChange').innerText = change.toFixed(2);

    document.getElementById('receiptPreview').style.display = 'block';
}

function printReceipt() {
    window.print();
}

function closeReceipt() {
    document.getElementById('receiptPreview').style.display = 'none';
    clearCart();
}

// ADMIN: LOAD PRODUCT LIST
function loadMedicineList() {
    let tbody = document.getElementById('medicineList');
    if (!tbody) return;

    fetch('api/products.php?action=get')
        .then(response => response.json())
        .then(data => {
            tbody.innerHTML = '';

            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3">No products found</td></tr>';
                return;
            }

            data.forEach(medicine => {
                let row = document.createElement('tr');
                
                // Highlight logic
                let expDisplay = 'None';
                if (medicine.expiration_date) {
                    expDisplay = medicine.expiration_date;
                    let expDate = new Date(medicine.expiration_date);
                    let today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    let thirtyDaysFromNow = new Date();
                    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                    
                    if (expDate < today) {
                        row.classList.add('expired-row');
                    } else if (expDate <= thirtyDaysFromNow) {
                        row.classList.add('expiring-row');
                    }
                }

                row.innerHTML =
                    '<td>' + medicine.product_name + '</td>' +
                    '<td>&#8369;' + parseFloat(medicine.price).toFixed(2) + '</td>' +
                    '<td>' + expDisplay + '</td>' +
                    '<td>' +
                    '<button class="btn-edit" onclick="openEditModal(' +
                    medicine.product_id + ',\'' +
                    medicine.product_name.replace(/'/g, "\\'") + '\',' +
                    medicine.price + ',\'' +
                    (medicine.expiration_date || '') + '\'' +
                    ')">Edit</button>' +
                    '<button class="btn-delete" onclick="deleteMedicine(' + medicine.product_id + ')">Delete</button>' +
                    '</td>';
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            tbody.innerHTML = '<tr><td colspan="3">Error loading products</td></tr>';
        });
}

// ADMIN: ADD PRODUCT
function addMedicine() {
    let name = document.getElementById('medicineName').value.trim();
    let price = document.getElementById('medicinePrice').value.trim();
    let expDate = document.getElementById('medicineExp').value;
    let msg = document.getElementById('adminMsg');

    if (name === '' || price === '') {
        msg.style.color = '#A15158';
        msg.innerText = 'Please fill in all required fields.';
        return;
    }

    if (parseFloat(price) <= 0) {
        msg.style.color = '#A15158';
        msg.innerText = 'Price must be greater than zero.';
        return;
    }

    fetch('api/products.php?action=add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            product_name: name,
            price: price,
            expiration_date: expDate
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                msg.style.color = '#3E4272';
                msg.innerText = 'Product added successfully!';
                document.getElementById('medicineName').value = '';
                document.getElementById('medicinePrice').value = '';
                document.getElementById('medicineExp').value = '';
                loadMedicineList();
            } else {
                msg.style.color = '#A15158';
                msg.innerText = 'Error: ' + data.message;
            }
        })
        .catch(error => {
            msg.style.color = '#A15158';
            msg.innerText = 'Error connecting to server.';
        });
}

// ADMIN: FILTER MEDICINE LIST
function filterAdminList() {
    let query = document.getElementById('adminSearch').value.toLowerCase();
    let rows = document.querySelectorAll('#medicineList tr');

    rows.forEach(row => {
        let name = row.cells[0] ? row.cells[0].innerText.toLowerCase() : '';
        row.style.display = name.startsWith(query) ? '' : 'none';
    });
}

// ADMIN: OPEN EDIT MODAL
function openEditModal(id, name, price, expDate) {
    document.getElementById('editId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editPrice').value = price;
    document.getElementById('editExp').value = expDate || '';
    document.getElementById('editModal').style.display = 'flex';
}

// ADMIN: CLOSE MODAL
function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

// ADMIN: SAVE EDIT 
function saveEdit() {
    let id = document.getElementById('editId').value;
    let name = document.getElementById('editName').value.trim();
    let price = document.getElementById('editPrice').value.trim();
    let expDate = document.getElementById('editExp').value;

    if (name === '' || price === '') {
        alert('Please fill in all required fields.');
        return;
    }

    fetch('api/products.php?action=edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            product_id: id,
            product_name: name,
            price: price,
            expiration_date: expDate
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                closeModal();
                loadMedicineList();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            alert('Error connecting to server.');
        });
}

// ADMIN: DELETE MEDICINE
function deleteMedicine(id) {
    if (!confirm('Are you sure you want to delete this medicine?')) return;

    fetch('api/products.php?action=delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: id })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadMedicineList();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            alert('Error connecting to server.');
        });
}

// ADMIN: CLEAR ALL TRANSACTIONS
function confirmClearTransactions() {
    let startDate = document.getElementById('delStartDate').value;
    let endDate = document.getElementById('delEndDate').value;

    if (!startDate || !endDate) {
        alert('Please select both a "From Date" and "To Date" to delete transactions.');
        return;
    }

    let confirmed = confirm(
        'WARNING: This will permanently delete transactions from ' + startDate + ' to ' + endDate + '.\n\nThis action CANNOT be undone.\n\nAre you sure you want to proceed?'
    );
    if (!confirmed) return;

    let msg = document.getElementById('clearMsg');
    if (msg) { msg.style.color = '#888'; msg.innerText = 'Deleting...'; }

    fetch('api/transactions.php?action=clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_date: startDate, end_date: endDate })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (msg) { msg.style.color = '#3E4272'; msg.innerText = 'Transactions deleted successfully. (' + data.deleted_count + ' records)'; }
                // Reload transactions if we are on that tab
                let tabTransactions = document.getElementById('tabTransactions');
                if (tabTransactions && tabTransactions.classList.contains('active')) {
                    loadTransactions();
                }
            } else {
                if (msg) { msg.style.color = '#A15158'; msg.innerText = 'Error: ' + (data.message || 'Unknown error'); }
            }
        })
        .catch(() => {
            if (msg) { msg.style.color = '#A15158'; msg.innerText = 'Error connecting to server.'; }
        });
}

// ADMIN: CHANGE CREDENTIALS
function changeCredentials() {
    let currentPassword = document.getElementById('currentPassword').value.trim();
    let newUsername = document.getElementById('newUsername').value.trim();
    let newPassword = document.getElementById('newPassword').value.trim();
    let confirmPassword = document.getElementById('confirmPassword').value.trim();
    let msg = document.getElementById('credMsg');

    if (!currentPassword || !newUsername || !newPassword || !confirmPassword) {
        msg.style.color = '#A15158';
        msg.innerText = 'Please fill in all fields.';
        return;
    }

    if (newPassword !== confirmPassword) {
        msg.style.color = '#A15158';
        msg.innerText = 'New passwords do not match.';
        return;
    }

    fetch('api/auth.php?action=change_credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            current_password: currentPassword,
            new_username: newUsername,
            new_password: newPassword,
            confirm_password: confirmPassword
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                msg.style.color = '#3E4272';
                msg.innerText = 'Credentials updated successfully!';
                document.getElementById('currentPassword').value = '';
                document.getElementById('newUsername').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
            } else {
                msg.style.color = '#A15158';
                msg.innerText = 'Error: ' + (data.message || 'Unknown error');
            }
        })
        .catch(() => {
            msg.style.color = '#A15158';
            msg.innerText = 'Error connecting to server.';
        });
}

// ADMIN: SESSION CHECK
function checkAdminSession() {
    fetch('api/auth.php?action=check')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                showAdminPanel();
            } else {
                showAdminLogin();
            }
        })
        .catch(() => showAdminLogin());
}

function showAdminPanel() {
    let loginSection = document.getElementById('adminLoginSection');
    let panelSection = document.getElementById('adminPanelSection');
    let logoutBtn = document.getElementById('navLogout');
    if (loginSection) loginSection.style.display = 'none';
    if (panelSection) panelSection.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    loadMedicineList();
}

function showAdminLogin() {
    let loginSection = document.getElementById('adminLoginSection');
    let panelSection = document.getElementById('adminPanelSection');
    let logoutBtn = document.getElementById('navLogout');
    if (loginSection) loginSection.style.display = 'block';
    if (panelSection) panelSection.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
}

// ADMIN TABS
function showAdminTab(tab) {
    let inventoryView = document.getElementById('adminInventoryView');
    let transactionsView = document.getElementById('adminTransactionsView');
    let tabInventory = document.getElementById('tabInventory');
    let tabTransactions = document.getElementById('tabTransactions');

    if (tab === 'transactions') {
        if (inventoryView) inventoryView.style.display = 'none';
        if (transactionsView) transactionsView.style.display = 'block';
        if (tabInventory) tabInventory.classList.remove('active');
        if (tabTransactions) tabTransactions.classList.add('active');

        // Set default dates to today if empty
        let startInput = document.getElementById('startDate');
        let endInput = document.getElementById('endDate');
        if (startInput && !startInput.value) {
            let today = new Date().toISOString().split('T')[0];
            startInput.value = today;
            endInput.value = today;
        }

        loadTransactions();
    } else {
        if (inventoryView) inventoryView.style.display = 'flex';
        if (transactionsView) transactionsView.style.display = 'none';
        if (tabInventory) tabInventory.classList.add('active');
        if (tabTransactions) tabTransactions.classList.remove('active');
    }
}

// LOGIN
function handleLogin() {
    let username = document.getElementById('username').value.trim();
    let password = document.getElementById('password').value.trim();
    let errorMsg = document.getElementById('loginError');

    if (username === '' || password === '') {
        errorMsg.innerText = 'Please enter username and password.';
        return;
    }

    fetch('api/auth.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAdminPanel();
            } else {
                errorMsg.innerText = 'Invalid username or password.';
            }
        })
        .catch(error => {
            errorMsg.innerText = 'Error connecting to server.';
        });
}

// FILTER TRANSACTIONS
function filterTransactions() {
    loadTransactions();
}

// LOAD TRANSACTIONS
function loadTransactions() {
    let tbody = document.getElementById('transactionList');
    if (!tbody) return;

    let startInput = document.getElementById('startDate');
    let endInput = document.getElementById('endDate');
    
    let startDate = startInput ? startInput.value : '';
    let endDate = endInput ? endInput.value : '';

    let url = 'api/transactions.php?action=get';
    if (startDate || endDate) {
        url += '&start_date=' + encodeURIComponent(startDate) + '&end_date=' + encodeURIComponent(endDate);
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            tbody.innerHTML = '';
            
            let totalTransactions = data.length;
            let totalRevenue = 0;

            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7">No transactions found</td></tr>';
            } else {
                data.forEach(transaction => {
                    let row = document.createElement('tr');
                    let subtotal = transaction.subtotal_amount ? parseFloat(transaction.subtotal_amount) : parseFloat(transaction.total_amount);
                    let cash = transaction.cash_tendered ? parseFloat(transaction.cash_tendered) : parseFloat(transaction.total_amount);
                    let change = transaction.change_amount ? parseFloat(transaction.change_amount) : 0;
                    let total_amt = parseFloat(transaction.total_amount);
                    
                    totalRevenue += total_amt;

                    row.innerHTML =
                        '<td>#' + transaction.transaction_id + '</td>' +
                        '<td>' + transaction.transaction_date + '</td>' +
                        '<td>' + transaction.items + '</td>' +
                        '<td>&#8369;' + subtotal.toFixed(2) + '</td>' +
                        '<td>&#8369;' + total_amt.toFixed(2) + '</td>' +
                        '<td>&#8369;' + cash.toFixed(2) + '</td>' +
                        '<td>&#8369;' + change.toFixed(2) + '</td>';
                    tbody.appendChild(row);
                });
            }

            let reportTotalTransactions = document.getElementById('reportTotalTransactions');
            let reportTotalRevenue = document.getElementById('reportTotalRevenue');
            
            if (reportTotalTransactions) reportTotalTransactions.innerText = totalTransactions;
            if (reportTotalRevenue) reportTotalRevenue.innerHTML = '&#8369;' + totalRevenue.toFixed(2);
        })
        .catch(error => {
            tbody.innerHTML = '<tr><td colspan="7">Error loading transactions</td></tr>';
        });
}

// AUTO LOAD ON PAGE 
window.onload = function () {
    if (document.getElementById('adminLoginSection')) {
        // We are on admin.html
        checkAdminSession();
    }
    // index.html needs nothing on load — search is triggered by typing
};