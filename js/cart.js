document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = window.API_BASE || (() => {
        if (window.location.protocol === 'file:') return 'http://localhost:4000/api';
        const host = window.location.hostname || 'localhost';
        return `http://${host}:4000/api`;
    })();
    const userToken = () => localStorage.getItem('user_token') || '';

    // Cart elements
    const cartBtn = document.getElementById('cartBtn');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.getElementById('closeCart');
    const cartItemsEl = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    const cartCountEl = document.getElementById('cartCount');
    const clearCartBtn = document.getElementById('clearCart');
    const checkoutBtn = document.getElementById('checkout');

    // Cart state
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Helper functions
    const saveCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        updateCartCount();
    };

    const formatPrice = (price) => 'NGN ' + Number(price).toLocaleString();

    const updateCartCount = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountEl.textContent = totalItems;
    };

    const showNotification = (message) => {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 2000);
    };

    // Add to cart
    const addToCart = (name, price, img) => {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, img, quantity: 1 });
        }

        showNotification(`Added ${name} to cart`);
        saveCart();
    };

    // Remove item
    const removeFromCart = (name) => {
        cart = cart.filter(item => item.name !== name);
        saveCart();
    };

    // Change quantity
    const updateQuantity = (name, change) => {
        const item = cart.find(item => item.name === name);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(name);
            } else {
                saveCart();
            }
        }
    };

    // Render cart with images + total
    const renderCart = () => {
        cartItemsEl.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsEl.innerHTML = '<li class="empty-cart">Your cart is empty</li>';
        } else {
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;

                const li = document.createElement('li');
                li.className = 'cart-item';
                li.innerHTML = `
                    <div class="item-image">
                        <img src="${item.img || 'images/dish1.jpg'}" alt="${item.name}">
                    </div>
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <div class="price">${formatPrice(item.price)} x ${item.quantity}</div>
                    </div>
                    <div class="item-controls">
                        <button class="quantity-btn minus" data-name="${item.name}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-name="${item.name}">+</button>
                        <button class="remove-btn" data-name="${item.name}">x</button>
                    </div>
                `;
                cartItemsEl.appendChild(li);
            });
        }

        cartTotalEl.textContent = formatPrice(total);
    };

    const submitOrder = async () => {
        const token = userToken();
        if (!token) {
            alert('Please login to place an order.');
            window.location.href = 'login.html';
            return;
        }

        const payload = {
            items: cart.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.img || ''
            }))
        };

        const res = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
            alert(data.error || 'Order failed.');
            return;
        }
        alert('Order submitted! We will notify you when approved.');
        cart = [];
        saveCart();
        cartModal.classList.remove('active');
        localStorage.setItem('last_order_id', data.order._id);
    };

    const checkApprovals = async () => {
        const token = userToken();
        if (!token) return;
        const res = await fetch(`${API_BASE}/orders/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        const notified = JSON.parse(localStorage.getItem('notified_orders') || '[]');
        const approved = (data.orders || []).filter(o => o.status === 'approved' && !notified.includes(o._id));
        approved.forEach(order => {
            alert(`Your order ${order._id} has been approved!`);
            notified.push(order._id);
        });
        localStorage.setItem('notified_orders', JSON.stringify(notified));
    };

    // Add-to-cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.menu-card');
            if (!card) return;
            const nameEl = card.querySelector('.menu-info h3') || card.querySelector('h3');
            const priceEl = card.querySelector('.menu-info span') || card.querySelector('span');
            const imgEl = card.querySelector('img');
            const name = nameEl ? nameEl.textContent.trim() : 'Item';
            const price = priceEl ? parseInt(priceEl.textContent.replace(/[^\d]/g, '')) : 0;
            const img = imgEl ? imgEl.getAttribute('src') : '';
            addToCart(name, price, img);
        });
    });

    // Cart modal open/close
    cartBtn.addEventListener('click', () => {
        cartModal.classList.toggle('active');
        renderCart();
    });

    closeCart.addEventListener('click', () => cartModal.classList.remove('active'));

    document.addEventListener('click', (e) => {
        if (!cartModal.contains(e.target) && !cartBtn.contains(e.target)) {
            cartModal.classList.remove('active');
        }
    });

    // Clear & checkout
    clearCartBtn.addEventListener('click', () => {
        cart = [];
        saveCart();
        cartModal.classList.remove('active');
    });

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        submitOrder();
    });

    // Quantity buttons in cart
    cartItemsEl.addEventListener('click', (e) => {
        const name = e.target.dataset.name;
        if (!name) return;

        if (e.target.classList.contains('minus')) {
            updateQuantity(name, -1);
        } else if (e.target.classList.contains('plus')) {
            updateQuantity(name, 1);
        } else if (e.target.classList.contains('remove-btn')) {
            removeFromCart(name);
        }
    });

    // Init
    updateCartCount();
    renderCart();
    checkApprovals();
    setInterval(checkApprovals, 15000);
});
