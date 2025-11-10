document.addEventListener('DOMContentLoaded', () => {
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

    // Cart functions
    const saveCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        updateCartCount();
    };

    const formatPrice = (price) => {
        return '₦' + Number(price).toLocaleString();
    };

    const getItemPrice = (priceText) => {
        return parseInt(priceText.replace(/[^\d]/g, ''));
    };

    const updateCartCount = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountEl.textContent = totalItems;
    };

    const addToCart = (name, price) => {
        const existingItem = cart.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name: name,
                price: price,
                quantity: 1
            });
        }
        
        // Show success message
        showNotification(`Added ${name} to cart`);
        saveCart();
    };

    const removeFromCart = (name) => {
        cart = cart.filter(item => item.name !== name);
        saveCart();
    };

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

    const showNotification = (message) => {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    };

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
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <div class="price">${formatPrice(item.price)} × ${item.quantity}</div>
                    </div>
                    <div class="item-controls">
                        <button class="quantity-btn minus" data-name="${item.name}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-name="${item.name}">+</button>
                        <button class="remove-btn" data-name="${item.name}">×</button>
                    </div>
                `;
                cartItemsEl.appendChild(li);
            });
        }

        cartTotalEl.textContent = formatPrice(total);
    };

    // Event Listeners
    document.querySelectorAll('.buy button').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.menu-card');
            const name = card.querySelector('h3').textContent;
            const price = getItemPrice(card.querySelector('span').textContent);
            addToCart(name, price);
        });
    });

    // Update the cart open/close functions
    cartBtn.addEventListener('click', () => {
        cartModal.classList.toggle('active');
        renderCart();
    });
    
    closeCart.addEventListener('click', () => cartModal.classList.remove('active'));
    
    // Close when clicking outside (ignore clicks on the cart button)
    document.addEventListener('click', (e) => {
        if (!cartModal.contains(e.target) && !cartBtn.contains(e.target)) {
            cartModal.classList.remove('active');
        }
    });
    
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
        alert('Processing your order...');
        cart = [];
        saveCart();
        cartModal.classList.remove('active');
    });
    
    // Event delegation for cart item controls
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

    // Initialize cart
    updateCartCount();
    renderCart();
});