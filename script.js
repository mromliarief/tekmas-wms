// Data inisialisasi
let items = JSON.parse(localStorage.getItem('warehouse_items')) || [];
let returns = JSON.parse(localStorage.getItem('warehouse_returns')) || [];
let suppliers = JSON.parse(localStorage.getItem('warehouse_suppliers')) || [];
let members = JSON.parse(localStorage.getItem('warehouse_members')) || [];
let outgoingItems = JSON.parse(localStorage.getItem('warehouse_outgoing')) || [];
let incomingItems = JSON.parse(localStorage.getItem('warehouse_incoming')) || [];

const users = [
    { username: 'admin', password: 'admin123', name: 'Administrator' },
    { username: 'staff', password: 'staff123', name: 'Staff Gudang' },
    { username: 'kasir', password: 'kasir123', name: 'Kasir' },
    { username: 'kepala', password: 'kepala123', name: 'Kepala Gudang' }
];

let currentUser = null;
let isEditingItem = false;
let isEditingReturn = false;
let isEditingSupplier = false;
let isEditingMember = false;
let isEditingOutgoing = false;

// DOM Elements
const loginForm = document.getElementById('login-form');
const userInfo = document.getElementById('user-info');
const loggedInUser = document.getElementById('logged-in-user');
const mainNav = document.getElementById('main-nav');
const memberSection = document.getElementById('member-section');

// Form elements
const itemForm = document.getElementById('item-form');
const returnForm = document.getElementById('return-form');
const supplierForm = document.getElementById('supplier-form');
const memberForm = document.getElementById('member-form');
const outgoingForm = document.getElementById('outgoing-form');

// Table elements
const stockTableBody = document.getElementById('stock-table-body');
const returnHistoryBody = document.getElementById('return-history-body');
const supplierTableBody = document.getElementById('supplier-table-body');
const memberTableBody = document.getElementById('member-table-body');
const incomingHistoryBody = document.getElementById('incoming-history-body');
const outgoingHistoryBody = document.getElementById('outgoing-history-body');

// Select elements
const returnItemSelect = document.getElementById('return-item');
const itemSupplierSelect = document.getElementById('item-supplier');
const returnMemberSelect = document.getElementById('return-member');
const outgoingItemSelect = document.getElementById('outgoing-item');

// Stat elements
const totalItemsEl = document.getElementById('total-items');
const totalStockEl = document.getElementById('total-stock');
const totalSuppliersEl = document.getElementById('total-suppliers');
const totalMembersEl = document.getElementById('total-members');

// Button elements
const itemSubmitBtn = document.getElementById('item-submit-btn');
const itemCancelBtn = document.getElementById('item-cancel-btn');
const returnSubmitBtn = document.getElementById('return-submit-btn');
const returnCancelBtn = document.getElementById('return-cancel-btn');
const supplierSubmitBtn = document.getElementById('supplier-submit-btn');
const supplierCancelBtn = document.getElementById('supplier-cancel-btn');
const memberSubmitBtn = document.getElementById('member-submit-btn');
const memberCancelBtn = document.getElementById('member-cancel-btn');
const outgoingSubmitBtn = document.getElementById('outgoing-submit-btn');
const outgoingCancelBtn = document.getElementById('outgoing-cancel-btn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    if (itemForm) itemForm.addEventListener('submit', handleItemSubmit);
    if (returnForm) returnForm.addEventListener('submit', handleReturnSubmit);
    if (supplierForm) supplierForm.addEventListener('submit', handleSupplierSubmit);
    if (memberForm) memberForm.addEventListener('submit', handleMemberSubmit);
    if (outgoingForm) outgoingForm.addEventListener('submit', handleOutgoingSubmit);
    
    // Set default dates
    document.getElementById('member-join-date').valueAsDate = new Date();
    document.getElementById('outgoing-date').valueAsDate = new Date();
    document.getElementById('item-date').valueAsDate = new Date();
    document.getElementById('return-date').valueAsDate = new Date();
    
    // Add event listeners for price calculation
    const itemPrice = document.getElementById('item-price');
    const itemDiscount = document.getElementById('item-discount');
    const itemFinalPrice = document.getElementById('item-final-price');
    
    if (itemPrice && itemDiscount && itemFinalPrice) {
        itemPrice.addEventListener('input', calculateFinalPrice);
        itemDiscount.addEventListener('input', calculateFinalPrice);
    }
});

// Login function
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        loginForm.style.display = 'none';
        userInfo.style.display = 'flex';
        loggedInUser.textContent = user.name;
        mainNav.style.display = 'flex';
        
        // Show/hide member section based on user role
        if (username === 'kasir' || username === 'kepala') {
            memberSection.style.display = 'block';
        } else {
            memberSection.style.display = 'none';
        }
        
        showSection('dashboard');
        updateStats();
        renderAllTables();
        populateSelectOptions();
    } else {
        alert('Username atau password salah!');
    }
}

// Logout function
function logout() {
    currentUser = null;
    userInfo.style.display = 'none';
    loginForm.style.display = 'block';
    mainNav.style.display = 'none';
    memberSection.style.display = 'none';
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Reset form
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Show specific section
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    document.getElementById(sectionId).style.display = 'block';
    
    // Update data for the shown section
    switch(sectionId) {
        case 'dashboard':
            updateStats();
            break;
        case 'input-barang':
            renderIncomingHistory();
            populateItemSupplierSelect();
            break;
        case 'stok-barang':
            renderStockTable();
            break;
        case 'barang-keluar':
            renderOutgoingHistory();
            populateOutgoingItemSelect();
            break;
        case 'retur-barang':
            renderReturnHistory();
            populateReturnItemSelect();
            break;
        case 'supplier':
            renderSupplierTable();
            break;
        case 'member':
            renderMemberTable();
            break;
    }
}

// Di fungsi toggleInputForm, hapus resetItemForm()
function toggleInputForm(view) {
    const historiSection = document.getElementById('input-barang-histori');
    const formSection = document.getElementById('input-barang-form');
    const buttons = document.querySelectorAll('#input-barang .toggle-form-btn');
    
    if (view === 'form') {
        historiSection.classList.add('hidden');
        formSection.classList.remove('hidden');
        buttons[0].classList.remove('active');
        buttons[1].classList.add('active');
        // Hapus resetItemForm() dari sini
    } else {
        historiSection.classList.remove('hidden');
        formSection.classList.add('hidden');
        buttons[0].classList.add('active');
        buttons[1].classList.remove('active');
        renderIncomingHistory();
    }
}

// Di fungsi toggleOutgoingForm, hapus resetOutgoingForm()
function toggleOutgoingForm(view) {
    const historiSection = document.getElementById('barang-keluar-histori');
    const formSection = document.getElementById('barang-keluar-form');
    const buttons = document.querySelectorAll('#barang-keluar .toggle-form-btn');
    
    if (view === 'form') {
        historiSection.classList.add('hidden');
        formSection.classList.remove('hidden');
        buttons[0].classList.remove('active');
        buttons[1].classList.add('active');
        // Hapus resetOutgoingForm() dari sini
    } else {
        historiSection.classList.remove('hidden');
        formSection.classList.add('hidden');
        buttons[0].classList.add('active');
        buttons[1].classList.remove('active');
        renderOutgoingHistory();
    }
}

// Di fungsi toggleReturnForm, hapus resetReturnForm()
function toggleReturnForm(view) {
    const historiSection = document.getElementById('retur-barang-histori');
    const formSection = document.getElementById('retur-barang-form');
    const buttons = document.querySelectorAll('#retur-barang .toggle-form-btn');
    
    if (view === 'form') {
        historiSection.classList.add('hidden');
        formSection.classList.remove('hidden');
        buttons[0].classList.remove('active');
        buttons[1].classList.add('active');
        // Hapus resetReturnForm() dari sini
    } else {
        historiSection.classList.remove('hidden');
        formSection.classList.add('hidden');
        buttons[0].classList.add('active');
        buttons[1].classList.remove('active');
        renderReturnHistory();
    }
}

// Di fungsi toggleSupplierForm, hapus resetSupplierForm()
function toggleSupplierForm(view) {
    const historiSection = document.getElementById('supplier-histori');
    const formSection = document.getElementById('supplier-form-container');
    const buttons = document.querySelectorAll('#supplier .toggle-form-btn');
    
    if (view === 'form') {
        historiSection.classList.add('hidden');
        formSection.classList.remove('hidden');
        buttons[0].classList.remove('active');
        buttons[1].classList.add('active');
        // Hapus resetSupplierForm() dari sini
    } else {
        historiSection.classList.remove('hidden');
        formSection.classList.add('hidden');
        buttons[0].classList.add('active');
        buttons[1].classList.remove('active');
        renderSupplierTable();
    }
}

// Calculate final price after discount
function calculateFinalPrice() {
    const price = parseFloat(document.getElementById('item-price').value) || 0;
    const discount = parseFloat(document.getElementById('item-discount').value) || 0;
    
    const discountAmount = price * (discount / 100);
    const finalPrice = price - discountAmount;
    
    document.getElementById('item-final-price').value = finalPrice.toFixed(2);
}

// Item form handler
function handleItemSubmit(e) {
    e.preventDefault();
    
    const itemData = {
        id: document.getElementById('edit-item-id').value || generateId(),
        date: document.getElementById('item-date').value,
        code: document.getElementById('item-code').value,
        name: document.getElementById('item-name').value,
        quantity: parseInt(document.getElementById('item-qty').value),
        unit: document.getElementById('item-unit').value,
        price: parseFloat(document.getElementById('item-price').value),
        discount: parseFloat(document.getElementById('item-discount').value),
        finalPrice: parseFloat(document.getElementById('item-final-price').value),
        supplier: document.getElementById('item-supplier').value
    };
    
    // Check if item with same code exists on the same date
    if (!isEditingItem) {
        const existingItemIndex = incomingItems.findIndex(item => 
            item.code === itemData.code && item.date === itemData.date
        );
        
        if (existingItemIndex !== -1) {
            // Update quantity of existing item
            incomingItems[existingItemIndex].quantity += itemData.quantity;
            // Also update the main items array
            const mainItemIndex = items.findIndex(item => 
                item.code === itemData.code && item.date === itemData.date
            );
            if (mainItemIndex !== -1) {
                items[mainItemIndex].quantity += itemData.quantity;
            }
            saveData();
            resetItemForm();
            updateUIAfterItemChange();
            toggleInputForm('histori');
            alert('Jumlah barang berhasil ditambahkan ke stok yang sudah ada!');
            return;
        }
    }
    
    if (isEditingItem) {
        // Update existing item
        const index = items.findIndex(item => item.id === itemData.id);
        if (index !== -1) {
            items[index] = itemData;
        }
        
        // Update incoming history
        const incomingIndex = incomingItems.findIndex(item => item.id === itemData.id);
        if (incomingIndex !== -1) {
            incomingItems[incomingIndex] = itemData;
        }
        
        isEditingItem = false;
    } else {
        // Add new item
        items.push(itemData);
        
        // Also add to incoming history
        incomingItems.push({...itemData});
    }
    
    saveData();
    resetItemForm();
    updateUIAfterItemChange();
    toggleInputForm('histori');
    
    alert('Data barang berhasil disimpan!');
}

// Outgoing form handler
function handleOutgoingSubmit(e) {
    e.preventDefault();
    
    const selectedItemCode = document.getElementById('outgoing-item').value;
    const selectedItem = items.find(item => item.code === selectedItemCode);
    
    if (!selectedItem) {
        alert('Barang tidak ditemukan!');
        return;
    }
    
    const outgoingQty = parseInt(document.getElementById('outgoing-qty').value);
    
    if (outgoingQty > selectedItem.quantity) {
        alert('Jumlah barang keluar melebihi stok yang tersedia!');
        return;
    }

    
    const outgoingData = {
        id: document.getElementById('edit-outgoing-id').value || generateId(),
        date: document.getElementById('outgoing-date').value,
        itemCode: selectedItemCode,
        itemName: selectedItem.name,
        quantity: outgoingQty,
        destination: document.getElementById('outgoing-destination').value,
        notes: document.getElementById('outgoing-notes').value || ''
    };
    
    if (isEditingOutgoing) {
        // Update existing outgoing item
        const index = outgoingItems.findIndex(item => item.id === outgoingData.id);
        if (index !== -1) {
            // Calculate the difference in quantity
            const oldQty = outgoingItems[index].quantity;
            const diff = oldQty - outgoingData.quantity;
            
            // Update the stock
            selectedItem.quantity += diff;
            
            outgoingItems[index] = outgoingData;
        }
        isEditingOutgoing = false;
    } else {
        // Add new outgoing item
        outgoingItems.push(outgoingData);
        
        // Update item quantity
        selectedItem.quantity -= outgoingData.quantity;
    }
    
    saveData();
    resetOutgoingForm();
    updateUIAfterOutgoingChange();
    toggleOutgoingForm('histori');
    
    alert('Data barang keluar berhasil disimpan!');
}

// Return form handler
function handleReturnSubmit(e) {
    e.preventDefault();
    
    const selectedItemCode = returnItemSelect.value;
    const selectedItem = items.find(item => item.code === selectedItemCode);
    
    if (!selectedItem) {
        alert('Barang tidak ditemukan!');
        return;
    }
    
    const returnQty = parseInt(document.getElementById('return-qty').value);
    
    if (returnQty > selectedItem.quantity) {
        alert('Jumlah retur melebihi stok yang tersedia!');
        return;
    }
    
    const returnData = {
        id: document.getElementById('edit-return-id').value || generateId(),
        date: document.getElementById('return-date').value,
        itemCode: selectedItemCode,
        itemName: selectedItem.name,
        quantity: returnQty,
        reason: document.getElementById('return-reason').value,
        notes: document.getElementById('return-notes').value || ''
    };
    
    if (isEditingReturn) {
        // Update existing return
        const index = returns.findIndex(ret => ret.id === returnData.id);
        if (index !== -1) {
            // Calculate the difference in quantity
            const oldQty = returns[index].quantity;
            const diff = oldQty - returnData.quantity;
            
            // Update the stock
            selectedItem.quantity += diff;
            
            returns[index] = returnData;
        }
        isEditingReturn = false;
    } else {
        // Add new return
        returns.push(returnData);
        
        // Update item quantity
        selectedItem.quantity -= returnData.quantity;
    }
    
    saveData();
    resetReturnForm();
    updateUIAfterReturnChange();
    toggleReturnForm('histori');
    
    alert('Retur berhasil diproses!');
}

// Supplier form handler
// Supplier form handler dengan validasi duplikasi
// Supplier form handler dengan validasi duplikasi FIXED
function handleSupplierSubmit(e) {
    e.preventDefault();
    
    // Ambil dan trim semua input
    const supplierCode = document.getElementById('supplier-code').value.trim();
    const supplierName = document.getElementById('supplier-name').value.trim();
    const supplierAddress = document.getElementById('supplier-address').value.trim();
    const supplierPhone = document.getElementById('supplier-phone').value.trim();
    const supplierSalesman = document.getElementById('supplier-salesman').value.trim();
    
    // Validasi input tidak kosong
    if (!supplierCode || !supplierName || !supplierAddress || !supplierPhone) {
        alert('Kode, Nama, Alamat, dan Nomor Kontak harus diisi!');
        return false; // IMPORTANT: Stop execution here
    }
    
    const supplierData = {
        id: document.getElementById('edit-supplier-id').value || generateId(),
        code: supplierCode,
        name: supplierName,
        address: supplierAddress,
        phone: supplierPhone,
        salesman: supplierSalesman
    };
    
    // Cari supplier yang sedang diedit (jika dalam mode edit)
    const editingSupplierId = document.getElementById('edit-supplier-id').value;
    
    // FUNGSI VALIDASI DUPLIKASI YANG KONSISTEN
    const validationResult = validateSupplierDuplicate(
        supplierData.code, 
        supplierData.name, 
        editingSupplierId
    );
    
    // Jika ada error validasi, tampilkan dan STOP
    if (validationResult.hasError) {
        let errorMessage = 'Terjadi Kesalahan';
        
        if (validationResult.duplicateCode && validationResult.duplicateName) {
            errorMessage = `Supplier dengan kode "${supplierData.code}" dan nama "${supplierData.name}" sudah ada!`;
        } else if (validationResult.duplicateCode) {
            errorMessage = `Kode supplier "${supplierData.code}" sudah digunakan!`;
        } else if (validationResult.duplicateName) {
            errorMessage = `Nama supplier "${supplierData.name}" sudah digunakan!`;
        }
        
        alert(errorMessage);
        
        // Highlight field yang error
        if (validationResult.duplicateCode) {
            document.getElementById('supplier-code').style.borderColor = '#f94144';
            document.getElementById('supplier-code').focus();
        }
        if (validationResult.duplicateName) {
            document.getElementById('supplier-name').style.borderColor = '#f94144';
            if (!validationResult.duplicateCode) {
                document.getElementById('supplier-name').focus();
            }
        }
        
        return false; // IMPORTANT: Stop execution
    }
    
    // Jika lolos validasi, lanjutkan proses penyimpanan
    if (isEditingSupplier) {
        // Update existing supplier
        const index = suppliers.findIndex(sup => sup.id === supplierData.id);
        if (index !== -1) {
            suppliers[index] = supplierData;
        }
        isEditingSupplier = false;
    } else {
        // Add new supplier
        suppliers.push(supplierData);
    }
    
    // Simpan ke localStorage
    saveData();
    
    // Reset form dan UI
    resetSupplierForm();
    updateUIAfterSupplierChange();
    toggleSupplierForm('histori');
    
    // Show success message
    alert('Data supplier berhasil disimpan!');
    
    return true; // Success
}

// FUNGSI VALIDASI YANG KONSISTEN DAN TERPUSAT
function validateSupplierDuplicate(code, name, excludeId = null) {
    // Normalize input
    const normalizedCode = code.toLowerCase().trim();
    const normalizedName = name.toLowerCase().trim();
    
    // Filter suppliers untuk diperiksa (exclude current jika edit)
    const suppliersToCheck = excludeId 
        ? suppliers.filter(sup => sup.id !== excludeId)
        : suppliers;
    
    // Cek duplikasi
    let duplicateCode = false;
    let duplicateName = false;
    let exactDuplicate = false;
    
    for (const supplier of suppliersToCheck) {
        const supplierCode = supplier.code.toLowerCase().trim();
        const supplierName = supplier.name.toLowerCase().trim();
        
        // Cek duplikasi kode
        if (supplierCode === normalizedCode) {
            duplicateCode = true;
        }
        
        // Cek duplikasi nama
        if (supplierName === normalizedName) {
            duplicateName = true;
        }
        
        // Cek exact duplicate
        if (supplierCode === normalizedCode && supplierName === normalizedName) {
            exactDuplicate = true;
        }
        
        // Jika sudah ditemukan duplikasi, bisa break untuk efisiensi
        if (duplicateCode && duplicateName) break;
    }
    
    return {
        duplicateCode,
        duplicateName,
        exactDuplicate,
        hasError: duplicateCode || duplicateName
    };
}

// Member form handler
function handleMemberSubmit(e) {
    e.preventDefault();
    
    const memberData = {
        id: document.getElementById('edit-member-id').value || generateId(),
        code: document.getElementById('member-code').value,
        name: document.getElementById('member-name').value,
        address: document.getElementById('member-address').value,
        phone: document.getElementById('member-phone').value,
        email: document.getElementById('member-email').value,
        joinDate: document.getElementById('member-join-date').value
    };
    
    if (isEditingMember) {
        // Update existing member
        const index = members.findIndex(mem => mem.id === memberData.id);
        if (index !== -1) {
            members[index] = memberData;
        }
        isEditingMember = false;
    } else {
        // Add new member
        members.push(memberData);
    }
    
    saveData();
    resetMemberForm();
    updateUIAfterMemberChange();
    
    alert('Data member berhasil disimpan!');
}

// Edit functions
function editItem(itemId) {
    const item = incomingItems.find(item => item.id === itemId);
    if (!item) return;
    
    document.getElementById('edit-item-id').value = item.id;
    document.getElementById('item-date').value = item.date;
    document.getElementById('item-code').value = item.code;
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-qty').value = item.quantity;
    document.getElementById('item-unit').value = item.unit;
    document.getElementById('item-price').value = item.price;
    document.getElementById('item-discount').value = item.discount;
    document.getElementById('item-final-price').value = item.finalPrice;
    document.getElementById('item-supplier').value = item.supplier;
    
    itemSubmitBtn.textContent = 'Update';
    itemCancelBtn.style.display = 'inline-block';
    isEditingItem = true;
    
    toggleInputForm('form');
}

function editOutgoing(outgoingId) {
    const outgoing = outgoingItems.find(item => item.id === outgoingId);
    if (!outgoing) return;
    
    document.getElementById('edit-outgoing-id').value = outgoing.id;
    document.getElementById('outgoing-date').value = outgoing.date;
    document.getElementById('outgoing-item').value = outgoing.itemCode;
    document.getElementById('outgoing-qty').value = outgoing.quantity;
    document.getElementById('outgoing-destination').value = outgoing.destination;
    document.getElementById('outgoing-notes').value = outgoing.notes || '';
    
    document.getElementById('outgoing-submit-btn').textContent = 'Update';
    document.getElementById('outgoing-cancel-btn').style.display = 'inline-block';
    isEditingOutgoing = true;
    
    toggleOutgoingForm('form');
}

function editReturn(returnId) {
    const ret = returns.find(ret => ret.id === returnId);
    if (!ret) return;
    
    document.getElementById('edit-return-id').value = ret.id;
    document.getElementById('return-date').value = ret.date;
    document.getElementById('return-item').value = ret.itemCode;
    document.getElementById('return-qty').value = ret.quantity;
    document.getElementById('return-reason').value = ret.reason;
    document.getElementById('return-notes').value = ret.notes || '';
    
    returnSubmitBtn.textContent = 'Update';
    returnCancelBtn.style.display = 'inline-block';
    isEditingReturn = true;
    
    toggleReturnForm('form');
}

function editSupplier(supplierId) {
    const supplier = suppliers.find(sup => sup.id === supplierId);
    if (!supplier) return;
    
    document.getElementById('edit-supplier-id').value = supplier.id;
    document.getElementById('supplier-code').value = supplier.code;
    document.getElementById('supplier-name').value = supplier.name;
    document.getElementById('supplier-address').value = supplier.address;
    document.getElementById('supplier-phone').value = supplier.phone;
    document.getElementById('supplier-salesman').value = supplier.salesman || '';
    
    document.getElementById('supplier-submit-btn').textContent = 'Update';
    document.getElementById('supplier-cancel-btn').style.display = 'inline-block';
    isEditingSupplier = true;
    
    toggleSupplierForm('form');
}

function editMember(memberId) {
    const member = members.find(mem => mem.id === memberId);
    if (!member) return;
    
    document.getElementById('edit-member-id').value = member.id;
    document.getElementById('member-code').value = member.code;
    document.getElementById('member-name').value = member.name;
    document.getElementById('member-address').value = member.address;
    document.getElementById('member-phone').value = member.phone;
    document.getElementById('member-email').value = member.email;
    document.getElementById('member-join-date').value = member.joinDate;
    
    memberSubmitBtn.textContent = 'Update';
    memberCancelBtn.style.display = 'inline-block';
    isEditingMember = true;
}

// Cancel edit functions
function cancelEditItem() {
    resetItemForm();
    toggleInputForm('histori');
}

function cancelEditOutgoing() {
    resetOutgoingForm();
    toggleOutgoingForm('histori');
}

function cancelEditReturn() {
    resetReturnForm();
    toggleReturnForm('histori');
}

function cancelEditSupplier() {
    resetSupplierForm();
    toggleSupplierForm('histori');
}

function cancelEditMember() {
    resetMemberForm();
}

// Delete functions
function deleteItem(itemId) {
    if (!confirm('Apakah Anda yakin ingin menghapus barang ini?')) return;
    
    // Remove from both items and incomingItems
    items = items.filter(item => item.id !== itemId);
    incomingItems = incomingItems.filter(item => item.id !== itemId);
    
    saveData();
    updateUIAfterItemChange();
    
    alert('Barang berhasil dihapus!');
}

function deleteOutgoing(outgoingId) {
    if (!confirm('Apakah Anda yakin ingin menghapus data barang keluar ini?')) return;
    
    // Find the outgoing item to get the quantity
    const outgoingItem = outgoingItems.find(item => item.id === outgoingId);
    if (outgoingItem) {
        // Find the original item and restore the quantity
        const originalItem = items.find(item => item.code === outgoingItem.itemCode);
        if (originalItem) {
            originalItem.quantity += outgoingItem.quantity;
        }
    }
    
    outgoingItems = outgoingItems.filter(item => item.id !== outgoingId);
    saveData();
    updateUIAfterOutgoingChange();
    
    alert('Data barang keluar berhasil dihapus!');
}

function deleteReturn(returnId) {
    if (!confirm('Apakah Anda yakin ingin menghapus data retur ini?')) return;
    
    // Find the return item to get the quantity
    const returnItem = returns.find(item => item.id === returnId);
    if (returnItem) {
        // Find the original item and restore the quantity
        const originalItem = items.find(item => item.code === returnItem.itemCode);
        if (originalItem) {
            originalItem.quantity += returnItem.quantity;
        }
    }
    
    returns = returns.filter(ret => ret.id !== returnId);
    saveData();
    updateUIAfterReturnChange();
    
    alert('Data retur berhasil dihapus!');
}

function deleteSupplier(supplierId) {
    if (!confirm('Apakah Anda yakin ingin menghapus supplier ini?')) return;
    
    suppliers = suppliers.filter(sup => sup.id !== supplierId);
    saveData();
    updateUIAfterSupplierChange();
    
    alert('Supplier berhasil dihapus!');
}

function deleteMember(memberId) {
    if (!confirm('Apakah Anda yakin ingin menghapus member ini?')) return;
    
    members = members.filter(mem => mem.id !== memberId);
    saveData();
    updateUIAfterMemberChange();
    
    alert('Member berhasil dihapus!');
}

// Render functions
function renderIncomingHistory() {
    const tbody = document.getElementById('incoming-history-body');
    tbody.innerHTML = '';
    
    incomingItems.forEach(item => {
        const supplier = suppliers.find(sup => sup.code === item.supplier);
        const supplierName = supplier ? supplier.name : item.supplier;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.unit}</td>
            <td>${item.price.toLocaleString()}</td>
            <td>${item.discount}%</td>
            <td>${item.finalPrice.toLocaleString()}</td>
            <td>${supplierName}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editItem('${item.id}')">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteItem('${item.id}')">Hapus</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderOutgoingHistory() {
    const tbody = document.getElementById('outgoing-history-body');
    tbody.innerHTML = '';
    
    outgoingItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.itemCode}</td>
            <td>${item.itemName}</td>
            <td>${item.quantity}</td>
            <td>${item.destination}</td>
            <td>${item.notes || '-'}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editOutgoing('${item.id}')">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteOutgoing('${item.id}')">Hapus</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderStockTable() {
    stockTableBody.innerHTML = '';
    
    // Group items by code and calculate total quantity and average price
    const itemMap = new Map();
    
    items.forEach(item => {
        if (itemMap.has(item.code)) {
            const existing = itemMap.get(item.code);
            existing.quantity += item.quantity;
            existing.totalPrice += item.finalPrice * item.quantity;
        } else {
            itemMap.set(item.code, {
                code: item.code,
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                totalPrice: item.finalPrice * item.quantity,
                supplier: item.supplier
            });
        }
    });
    
    itemMap.forEach(item => {
        const avgPrice = item.totalPrice / item.quantity;
        const supplier = suppliers.find(sup => sup.code === item.supplier);
        const supplierName = supplier ? supplier.name : item.supplier;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.unit}</td>
            <td>${avgPrice.toFixed(2)}</td>
            <td>${supplierName}</td>
        `;
        stockTableBody.appendChild(row);
    });
}

function renderReturnHistory() {
    returnHistoryBody.innerHTML = '';
    
    returns.forEach(ret => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${ret.date}</td>
            <td>${ret.itemCode}</td>
            <td>${ret.itemName}</td>
            <td>${ret.quantity}</td>
            <td>${ret.reason}</td>
            <td>${ret.notes || '-'}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editReturn('${ret.id}')">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteReturn('${ret.id}')">Hapus</button>
            </td>
        `;
        returnHistoryBody.appendChild(row);
    });
}

function renderSupplierTable() {
    supplierTableBody.innerHTML = '';
    
    suppliers.forEach(supplier => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${supplier.code}</td>
            <td>${supplier.name}</td>
            <td>${supplier.address}</td>
            <td>${supplier.phone}</td>
            <td>${supplier.salesman || '-'}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editSupplier('${supplier.id}')">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteSupplier('${supplier.id}')">Hapus</button>
            </td>
        `;
        supplierTableBody.appendChild(row);
    });
}

function renderMemberTable() {
    memberTableBody.innerHTML = '';
    
    members.forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${member.code}</td>
            <td>${member.name}</td>
            <td>${member.address}</td>
            <td>${member.phone}</td>
            <td>${member.email}</td>
            <td>${member.joinDate}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editMember('${member.id}')">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteMember('${member.id}')">Hapus</button>
            </td>
        `;
        memberTableBody.appendChild(row);
    });
}

function renderAllTables() {
    renderIncomingHistory();
    renderStockTable();
    renderOutgoingHistory();
    renderReturnHistory();
    renderSupplierTable();
    renderMemberTable();
}

// Helper functions
function populateSelectOptions() {
    populateItemSupplierSelect();
    populateReturnItemSelect();
    populateReturnMemberSelect();
    populateOutgoingItemSelect();
}

function populateItemSupplierSelect() {
    itemSupplierSelect.innerHTML = '<option value="">Pilih Supplier</option>';
    
    suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier.code;
        option.textContent = `${supplier.code} - ${supplier.name}`;
        itemSupplierSelect.appendChild(option);
    });
}

function populateReturnItemSelect() {
    returnItemSelect.innerHTML = '<option value="">Pilih Barang</option>';
    
    items.forEach(item => {
        if (item.quantity > 0) {
            const option = document.createElement('option');
            option.value = item.code;
            option.textContent = `${item.code} - ${item.name} (Stok: ${item.quantity} ${item.unit})`;
            returnItemSelect.appendChild(option);
        }
    });
}

function populateReturnMemberSelect() {
    returnMemberSelect.innerHTML = '<option value="">Tanpa Member</option>';
    
    members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.code;
        option.textContent = `${member.code} - ${member.name}`;
        returnMemberSelect.appendChild(option);
    });
}

function populateOutgoingItemSelect() {
    const select = document.getElementById('outgoing-item');
    select.innerHTML = '<option value="">Pilih Barang</option>';
    
    items.forEach(item => {
        if (item.quantity > 0) {
            const option = document.createElement('option');
            option.value = item.code;
            option.textContent = `${item.code} - ${item.name} (Stok: ${item.quantity} ${item.unit})`;
            select.appendChild(option);
        }
    });
}

function updateStats() {
    totalItemsEl.textContent = items.length;
    
    const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);
    totalStockEl.textContent = totalStock;
    
    totalSuppliersEl.textContent = suppliers.length;
    totalMembersEl.textContent = members.length;
}

function resetItemForm() {
    itemForm.reset();
    document.getElementById('edit-item-id').value = '';
    document.getElementById('item-date').valueAsDate = new Date();
    document.getElementById('item-discount').value = 0;
    calculateFinalPrice();
    itemSubmitBtn.textContent = 'Simpan';
    itemCancelBtn.style.display = 'none';
    isEditingItem = false;
}

function resetOutgoingForm() {
    outgoingForm.reset();
    document.getElementById('edit-outgoing-id').value = '';
    document.getElementById('outgoing-date').valueAsDate = new Date();
    document.getElementById('outgoing-submit-btn').textContent = 'Simpan';
    document.getElementById('outgoing-cancel-btn').style.display = 'none';
    isEditingOutgoing = false;
}

function resetReturnForm() {
    returnForm.reset();
    document.getElementById('edit-return-id').value = '';
    document.getElementById('return-date').valueAsDate = new Date();
    returnSubmitBtn.textContent = 'Proses Retur';
    returnCancelBtn.style.display = 'none';
    isEditingReturn = false;
}

function resetSupplierForm() {
    // Reset form
    supplierForm.reset();
    document.getElementById('edit-supplier-id').value = '';
    
    // Reset tombol
    document.getElementById('supplier-submit-btn').textContent = 'Simpan';
    document.getElementById('supplier-cancel-btn').style.display = 'none';
    
    // Reset tampilan field
    const codeInput = document.getElementById('supplier-code');
    const nameInput = document.getElementById('supplier-name');
    
    if (codeInput) {
        codeInput.style.borderColor = '';
        codeInput.style.backgroundColor = '';
    }
    
    if (nameInput) {
        nameInput.style.borderColor = '';
        nameInput.style.backgroundColor = '';
    }
    
    // Hapus pesan error jika ada
    const codeError = document.getElementById('code-error');
    const nameError = document.getElementById('name-error');
    if (codeError) codeError.remove();
    if (nameError) nameError.remove();
    
    // Reset flag edit
    isEditingSupplier = false;
}

function resetMemberForm() {
    memberForm.reset();
    document.getElementById('edit-member-id').value = '';
    document.getElementById('member-join-date').valueAsDate = new Date();
    memberSubmitBtn.textContent = 'Simpan';
    memberCancelBtn.style.display = 'none';
    isEditingMember = false;
}

// Fungsi untuk mereset semua data
function resetAllData() {
    if (confirm('Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan!')) {
        // Hapus semua data dari localStorage
        localStorage.removeItem('warehouse_items');
        localStorage.removeItem('warehouse_returns');
        localStorage.removeItem('warehouse_suppliers');
        localStorage.removeItem('warehouse_members');
        localStorage.removeItem('warehouse_outgoing');
        localStorage.removeItem('warehouse_incoming');
        
        // Reset variabel global
        items = [];
        returns = [];
        suppliers = [];
        members = [];
        outgoingItems = [];
        incomingItems = [];
        
        // Update UI
        updateStats();
        renderAllTables();
        
        alert('Semua data berhasil direset!');
    }
}

// Fungsi konfirmasi reset dengan prompt teks
function confirmReset() {
    const promptText = prompt("Untuk mengonfirmasi reset, ketik 'RESET' pada kotak di bawah:");
    
    if (promptText === 'RESET') {
        resetAllData();
    } else if (promptText !== null) {
        alert('Kata konfirmasi tidak sesuai. Reset data dibatalkan.');
    }
}

function updateUIAfterItemChange() {
    updateStats();
    renderIncomingHistory();
    renderStockTable();
    populateReturnItemSelect();
    populateOutgoingItemSelect();
}

function updateUIAfterOutgoingChange() {
    updateStats();
    renderOutgoingHistory();
    renderStockTable();
    populateOutgoingItemSelect();
}

function updateUIAfterReturnChange() {
    updateStats();
    renderReturnHistory();
    renderStockTable();
    populateReturnItemSelect();
}

function updateUIAfterSupplierChange() {
    updateStats();
    renderSupplierTable();
    populateItemSupplierSelect();
}

function updateUIAfterMemberChange() {
    updateStats();
    renderMemberTable();
    populateReturnMemberSelect();
}

function saveData() {
    localStorage.setItem('warehouse_items', JSON.stringify(items));
    localStorage.setItem('warehouse_returns', JSON.stringify(returns));
    localStorage.setItem('warehouse_suppliers', JSON.stringify(suppliers));
    localStorage.setItem('warehouse_members', JSON.stringify(members));
    localStorage.setItem('warehouse_outgoing', JSON.stringify(outgoingItems));
    localStorage.setItem('warehouse_incoming', JSON.stringify(incomingItems));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function exportToExcel(tableId, fileName) {
    try {
        // Dapatkan tabel yang akan diekspor
        const table = document.getElementById(tableId);
        if (!table) {
            alert('Tabel tidak ditemukan!');
            return;
        }

        // Buat string HTML untuk dokumen
        let html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                  xmlns:x="urn:schemas-microsoft-com:office:excel" 
                  xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <!--[if gte mso 9]>
                <xml>
                    <x:ExcelWorkbook>
                        <x:ExcelWorksheets>
                            <x:ExcelWorksheet>
                                <x:Name>${fileName}</x:Name>
                                <x:WorksheetOptions>
                                    <x:DisplayGridlines/>
                                </x:WorksheetOptions>
                            </x:ExcelWorksheet>
                        </x:ExcelWorksheets>
                    </x:ExcelWorkbook>
                </xml>
                <![endif]-->
                <meta charset="UTF-8">
            </head>
            <body>
                ${table.outerHTML}
            </body>
            </html>
        `;

        // Buat blob dari HTML
        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        
        // Buat URL untuk blob
        const url = URL.createObjectURL(blob);
        
        // Buat elemen anchor untuk download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}_${new Date().toISOString().slice(0,10)}.xls`;
        
        // Trigger klik
        document.body.appendChild(a);
        a.click();
        
        // Bersihkan
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Terjadi kesalahan saat mengekspor ke Excel');
    }
}