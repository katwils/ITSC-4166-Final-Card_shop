// API base URL
const API_BASE = 'http://localhost:3000/api';

// Global state
let currentUser = null;
let currentToken = null;
let cart = [];
let currentSection = 'home';
let currentCategoryFilter = null; // Track current category filter
let allCards = []; // Store all cards for filtering

// DOM elements
const sections = {
    home: document.getElementById('home-section'),
    login: document.getElementById('login-section'),
    register: document.getElementById('register-section'),
    cart: document.getElementById('cart-section'),
    profile: document.getElementById('profile-section'),
    admin: document.getElementById('admin-section')
};

// Navigation buttons
const navButtons = {
    home: document.getElementById('home-btn'),
    login: document.getElementById('login-btn'),
    register: document.getElementById('register-btn'),
    cart: document.getElementById('cart-btn'),
    profile: document.getElementById('profile-btn'),
    admin: document.getElementById('admin-btn'),
    logout: document.getElementById('logout-btn')
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkAuthStatus();
    loadHomeData();
});

// Setup event listeners
function setupEventListeners() {
    // Navigation
    Object.keys(navButtons).forEach(key => {
        navButtons[key].addEventListener('click', () => showSection(key));
    });

    // Auth forms
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);

    // Switch between login/register
    document.getElementById('switch-to-register').addEventListener('click', () => showSection('register'));
    document.getElementById('switch-to-login').addEventListener('click', () => showSection('login'));

    // Cart
    document.getElementById('checkout-btn').addEventListener('click', handleCheckout);

    // Admin
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchAdminTab(e.target.dataset.tab));
    });

    document.getElementById('add-card-btn').addEventListener('click', () => showModal('add-card-modal'));
    document.getElementById('add-category-btn').addEventListener('click', () => showModal('add-category-modal'));

    // Forms
    document.getElementById('add-card-form').addEventListener('submit', handleAddCard);
    document.getElementById('add-category-form').addEventListener('submit', handleAddCategory);

    // Modal close
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => hideAllModals());
    });

    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideAllModals();
        }
    });
}

// API helper functions
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        showMessage(error.message, 'error');
        throw error;
    }
}

// Authentication
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
        currentToken = token;
        currentUser = JSON.parse(user);
        updateNavForAuth();
    }
}

function updateNavForAuth() {
    // Hide auth buttons
    navButtons.login.style.display = 'none';
    navButtons.register.style.display = 'none';

    // Show user buttons
    navButtons.cart.style.display = 'inline-block';
    navButtons.profile.style.display = 'inline-block';
    navButtons.logout.style.display = 'inline-block';

    // Show admin button if user is admin
    if (currentUser && currentUser.role === 'admin') {
        navButtons.admin.style.display = 'inline-block';
    }

    updateCartCount();
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        currentToken = data.token;
        currentUser = data;
        delete currentUser.token; // Remove token from user object

        localStorage.setItem('token', currentToken);
        localStorage.setItem('user', JSON.stringify(currentUser));

        updateNavForAuth();
        showSection('home');
        showMessage('Login successful!', 'success');
    } catch (error) {
        // Error already shown by apiRequest
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const data = await apiRequest('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        showMessage('Registration successful! Please login.', 'success');
        showSection('login');
    } catch (error) {
        // Error already shown by apiRequest
    }
}

function handleLogout() {
    currentToken = null;
    currentUser = null;
    cart = [];

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Reset navigation
    navButtons.login.style.display = 'inline-block';
    navButtons.register.style.display = 'inline-block';
    navButtons.cart.style.display = 'none';
    navButtons.profile.style.display = 'none';
    navButtons.admin.style.display = 'none';
    navButtons.logout.style.display = 'none';

    showSection('home');
    showMessage('Logged out successfully', 'success');
}

// Navigation
function showSection(sectionName) {
    if (sectionName === 'logout') {
        handleLogout();
        return;
    }

    // Check if user needs to be logged in
    const protectedSections = ['cart', 'profile', 'admin'];
    if (protectedSections.includes(sectionName) && !currentToken) {
        showMessage('Please login first', 'error');
        showSection('login');
        return;
    }

    // Check admin access
    if (sectionName === 'admin' && currentUser.role !== 'admin') {
        showMessage('Admin access required', 'error');
        return;
    }

    // Hide all sections
    Object.values(sections).forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from nav buttons
    Object.values(navButtons).forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected section
    sections[sectionName].classList.add('active');
    if (navButtons[sectionName]) {
        navButtons[sectionName].classList.add('active');
    }

    currentSection = sectionName;

    // Load section data
    switch (sectionName) {
        case 'home':
            loadHomeData();
            break;
        case 'cart':
            loadCart();
            break;
        case 'profile':
            loadProfile();
            break;
        case 'admin':
            loadAdminData();
            break;
    }
}

// Home page
async function loadHomeData() {
    try {
        const [categories, cards] = await Promise.all([
            apiRequest('/categories'),
            apiRequest('/cards')
        ]);

        allCards = cards; // Store all cards for filtering
        currentCategoryFilter = null; // Reset to show all cards
        renderCategories(categories);
        renderCards(cards);
    } catch (error) {
        console.error('Failed to load home data:', error);
    }
}

function renderCategories(categories) {
    const container = document.getElementById('categories-list');
    container.innerHTML = '';

    // Add "All Cards" option
    const allCardsCard = document.createElement('div');
    allCardsCard.className = `category-card ${currentCategoryFilter === null ? 'active' : ''}`;
    allCardsCard.innerHTML = `
        <h3>All Cards</h3>
        <p>${allCards.length} cards</p>
    `;
    allCardsCard.addEventListener('click', () => filterCardsByCategory(null));
    container.appendChild(allCardsCard);

    categories.forEach(category => {
        const card = document.createElement('div');
        card.className = `category-card ${currentCategoryFilter === category.id ? 'active' : ''}`;
        const categoryCards = allCards.filter(c => c.categoryId === category.id);
        card.innerHTML = `
            <h3>${category.name}</h3>
            <p>${categoryCards.length} cards</p>
        `;
        card.addEventListener('click', () => filterCardsByCategory(category.id));
        container.appendChild(card);
    });
}

function renderCards(cards) {
    const container = document.getElementById('cards-list');
    const titleElement = document.querySelector('.featured-cards h3');

    // Update title based on current filter
    if (currentCategoryFilter === null) {
        titleElement.textContent = 'Featured Cards';
    } else {
        const categoryName = allCards.find(card => card.categoryId === currentCategoryFilter)?.category?.name || 'Unknown';
        titleElement.textContent = `${categoryName} Cards`;
    }

    container.innerHTML = '';

    if (cards.length === 0) {
        container.innerHTML = '<p>No cards found in this category.</p>';
        return;
    }

    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card-card';
        cardElement.innerHTML = `
            ${card.image ? `<img src="${card.image}" alt="${card.name}" class="card-image">` : ''}
            <h3>${card.name}</h3>
            <p class="card-price">$${card.price.toFixed(2)}</p>
            <p class="card-stock">Stock: ${card.stock}</p>
            <p>${card.category.name}</p>
            ${currentToken ? `<button class="btn-add-cart" data-id="${card.id}">Add to Cart</button>` : ''}
        `;

        if (currentToken) {
            cardElement.querySelector('.btn-add-cart').addEventListener('click', (e) => {
                e.stopPropagation();
                addToCart(card);
            });
        }

        cardElement.addEventListener('click', () => showCardDetails(card));
        container.appendChild(cardElement);
    });
}

function filterCardsByCategory(categoryId) {
    currentCategoryFilter = categoryId;

    let filteredCards;
    if (categoryId === null) {
        // Show all cards
        filteredCards = allCards;
    } else {
        // Filter by category
        filteredCards = allCards.filter(card => card.categoryId === categoryId);
    }

    // Re-render categories to show active state
    loadHomeData().then(() => {
        renderCards(filteredCards);
    });
}

// Cart functionality
function addToCart(card) {
    const existingItem = cart.find(item => item.id === card.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...card, quantity: 1 });
    }
    updateCartCount();
    showMessage(`${card.name} added to cart!`, 'success');
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

function loadCart() {
    const container = document.getElementById('cart-items');
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty</p>';
        document.getElementById('cart-total').style.display = 'none';
        return;
    }

    document.getElementById('cart-total').style.display = 'block';

    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div>
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} x ${item.quantity} = $${itemTotal.toFixed(2)}</p>
            </div>
            <div>
                <button class="btn btn-secondary" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button class="btn btn-secondary" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                <button class="btn btn-danger" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `;
        container.appendChild(itemElement);
    });

    document.getElementById('total-amount').textContent = total.toFixed(2);
}

function updateCartQuantity(cardId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(cardId);
        return;
    }

    const item = cart.find(item => item.id === cardId);
    if (item) {
        item.quantity = newQuantity;
        updateCartCount();
        loadCart();
    }
}

function removeFromCart(cardId) {
    cart = cart.filter(item => item.id !== cardId);
    updateCartCount();
    loadCart();
}

async function handleCheckout() {
    if (cart.length === 0) {
        showMessage('Your cart is empty', 'error');
        return;
    }

    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    try {
        await apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify({ totalPrice })
        });

        cart = [];
        updateCartCount();
        showMessage('Order placed successfully!', 'success');
        showSection('profile');
    } catch (error) {
        // Error already shown
    }
}

// Profile
async function loadProfile() {
    try {
        const userInfo = document.getElementById('user-info');
        userInfo.innerHTML = `
            <h3>User Information</h3>
            <p><strong>Email:</strong> ${currentUser.email}</p>
            <p><strong>Role:</strong> ${currentUser.role}</p>
        `;

        const orders = await apiRequest('/orders');
        renderOrders(orders);
    } catch (error) {
        console.error('Failed to load profile:', error);
    }
}

function renderOrders(orders) {
    const container = document.getElementById('orders-list');
    container.innerHTML = '';

    if (orders.length === 0) {
        container.innerHTML = '<p>No orders found</p>';
        return;
    }

    orders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        orderElement.innerHTML = `
            <h4>Order #${order.id}</h4>
            <p><strong>Total:</strong> $${order.totalPrice.toFixed(2)}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        `;
        container.appendChild(orderElement);
    });
}

// Admin functionality
async function loadAdminData() {
    switchAdminTab('cards');
}

function switchAdminTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(`admin-${tabName}-tab`).classList.add('active');

    // Load tab data
    switch (tabName) {
        case 'cards':
            loadAdminCards();
            break;
        case 'categories':
            loadAdminCategories();
            break;
        case 'orders':
            loadAdminOrders();
            break;
    }
}

async function loadAdminCards() {
    try {
        const cards = await apiRequest('/cards');
        const container = document.getElementById('admin-cards-list');
        container.innerHTML = '';

        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'admin-item';
            cardElement.innerHTML = `
                <div>
                    <h4>${card.name}</h4>
                    <p>$${card.price.toFixed(2)} - Stock: ${card.stock}</p>
                    <p>Category: ${card.category.name}</p>
                </div>
                <div class="admin-actions">
                    <button class="btn btn-secondary" onclick="editCard(${card.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteCard(${card.id})">Delete</button>
                </div>
            `;
            container.appendChild(cardElement);
        });
    } catch (error) {
        console.error('Failed to load admin cards:', error);
    }
}

async function loadAdminCategories() {
    try {
        const categories = await apiRequest('/categories');
        const container = document.getElementById('admin-categories-list');
        container.innerHTML = '';

        categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'admin-item';
            categoryElement.innerHTML = `
                <div>
                    <h4>${category.name}</h4>
                    <p>${category._count?.cards || 0} cards</p>
                </div>
                <div class="admin-actions">
                    <button class="btn btn-secondary" onclick="editCategory(${category.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteCategory(${category.id})">Delete</button>
                </div>
            `;
            container.appendChild(categoryElement);
        });
    } catch (error) {
        console.error('Failed to load admin categories:', error);
    }
}

async function loadAdminOrders() {
    try {
        const orders = await apiRequest('/orders');
        const container = document.getElementById('admin-orders-list');
        container.innerHTML = '';

        orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'order-item';
            orderElement.innerHTML = `
                <h4>Order #${order.id}</h4>
                <p><strong>User:</strong> ${order.user.email}</p>
                <p><strong>Total:</strong> $${order.totalPrice.toFixed(2)}</p>
                <p><strong>Status:</strong> ${order.status}</p>
                <button class="btn btn-secondary" onclick="updateOrderStatus(${order.id}, '${order.status === 'pending' ? 'completed' : 'pending'}')">
                    Mark as ${order.status === 'pending' ? 'Completed' : 'Pending'}
                </button>
            `;
            container.appendChild(orderElement);
        });
    } catch (error) {
        console.error('Failed to load admin orders:', error);
    }
}

async function handleAddCard(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const cardData = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock')),
        categoryId: parseInt(formData.get('category'))
    };

    try {
        await apiRequest('/cards', {
            method: 'POST',
            body: JSON.stringify(cardData)
        });

        hideAllModals();
        showMessage('Card added successfully!', 'success');
        loadAdminCards();
    } catch (error) {
        // Error already shown
    }
}

async function handleAddCategory(e) {
    e.preventDefault();

    const name = document.getElementById('category-name').value;

    try {
        await apiRequest('/categories', {
            method: 'POST',
            body: JSON.stringify({ name })
        });

        hideAllModals();
        showMessage('Category added successfully!', 'success');
        loadAdminCategories();
    } catch (error) {
        // Error already shown
    }
}

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';

    // Load categories for card form
    if (modalId === 'add-card-modal') {
        loadCategoriesForForm();
    }
}

function hideAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

async function loadCategoriesForForm() {
    try {
        const categories = await apiRequest('/categories');
        const select = document.getElementById('card-category');
        select.innerHTML = '';

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load categories for form:', error);
    }
}

function showCardDetails(card) {
    const modal = document.getElementById('card-modal');
    const details = document.getElementById('card-details');

    details.innerHTML = `
        ${card.image ? `<img src="${card.image}" alt="${card.name}" class="card-image-large">` : ''}
        <h3>${card.name}</h3>
        <p><strong>Description:</strong> ${card.description || 'No description available'}</p>
        <p><strong>Price:</strong> $${card.price.toFixed(2)}</p>
        <p><strong>Stock:</strong> ${card.stock}</p>
        <p><strong>Category:</strong> ${card.category.name}</p>
        ${currentToken ? `<button class="btn btn-primary" onclick="addToCartFromModal(${card.id})">Add to Cart</button>` : ''}
    `;

    modal.style.display = 'block';
}

function addToCartFromModal(cardId) {
    // This would need the full card object - for now just show a message
    showMessage('Add to cart from modal would be implemented here', 'info');
    hideAllModals();
}

// Utility functions
function showMessage(message, type = 'info') {
    // Create a simple alert for now - could be enhanced with a proper notification system
    alert(`${type.toUpperCase()}: ${message}`);
}

// Global functions for onclick handlers
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.editCard = (id) => showMessage('Edit card functionality would be implemented here', 'info');
window.deleteCard = (id) => showMessage('Delete card functionality would be implemented here', 'info');
window.editCategory = (id) => showMessage('Edit category functionality would be implemented here', 'info');
window.deleteCategory = (id) => showMessage('Delete category functionality would be implemented here', 'info');
window.updateOrderStatus = (id, status) => showMessage('Update order status functionality would be implemented here', 'info');