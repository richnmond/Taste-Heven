document.addEventListener('DOMContentLoaded', () => {
  const cartBtn = document.getElementById('cartBtn');
  const cartModal = document.getElementById('cartModal');
  const closeCart = document.getElementById('closeCart');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartCountEl = document.getElementById('cartCount');
  const clearCartBtn = document.getElementById('clearCart');
  const checkoutBtn = document.getElementById('checkout');

  // Load cart from localStorage or start empty
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
  }

  function formatCurrency(n) {
    return '₦' + Number(n).toLocaleString();
  }

  function parsePrice(text) {
    // remove non-digits
    const digits = text.replace(/[^\d]/g, '');
    return Number(digits) || 0;
  }

  function updateCartCount() {
    const totalQty = cart.reduce((s, item) => s + item.qty, 0);
    cartCountEl.textContent = totalQty;
  }

  function addToCart(item) {
    const existing = cart.find(i => i.name === item.name);
    if (existing) existing.qty += 1;
    else cart.push({ ...item, qty: 1 });
    saveCart();
  }

  function removeFromCart(name) {
    cart = cart.filter(i => i.name !== name);
    saveCart();
  }

  function changeQty(name, delta) {
    const it = cart.find(i => i.name === name);
    if (!it) return;
    it.qty = Math.max(1, it.qty + delta);
    saveCart();
  }

  function renderCart() {
    cartItemsEl.innerHTML = '';
    let total = 0;
    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<li class="empty">Cart is empty.</li>';
    } else {
      cart.forEach(item => {
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
          <div class="ci-left">
            <strong class="ci-name">${item.name}</strong>
            <div class="ci-price">${formatCurrency(item.price)}</div>
          </div>
          <div class="ci-controls">
            <button class="qty-decrease" data-name="${item.name}">−</button>
            <span class="qty">${item.qty}</span>
            <button class="qty-increase" data-name="${item.name}">+</button>
            <button class="remove" data-name="${item.name}">Remove</button>
          </div>
        `;
        cartItemsEl.appendChild(li);
        total += item.price * item.qty;
      });
    }
    cartTotalEl.textContent = formatCurrency(total);
    // attach handlers
    cartItemsEl.querySelectorAll('.qty-decrease').forEach(btn =>
      btn.addEventListener('click', e => changeQty(e.target.dataset.name, -1))
    );
    cartItemsEl.querySelectorAll('.qty-increase').forEach(btn =>
      btn.addEventListener('click', e => changeQty(e.target.dataset.name, +1))
    );
    cartItemsEl.querySelectorAll('.remove').forEach(btn =>
      btn.addEventListener('click', e => removeFromCart(e.target.dataset.name))
    );
  }

  // Wire Add to Cart buttons
  document.querySelectorAll('.menu-card .buy button').forEach(btn => {
    btn.addEventListener('click', e => {
      const card = e.target.closest('.menu-card');
      if (!card) return;
      const nameEl = card.querySelector('.menu-info h3') || card.querySelector('h3');
      const priceEl = card.querySelector('.menu-info span') || card.querySelector('span');
      const name = nameEl ? nameEl.textContent.trim() : 'Item';
      const price = priceEl ? parsePrice(priceEl.textContent) : 0;
      addToCart({ name, price });
      // brief feedback: open cart after add
      cartModal.style.display = 'block';
      renderCart();
    });
  });

  // cart controls
  cartBtn.addEventListener('click', () => {
    cartModal.style.display = 'block';
    renderCart();
  });
  closeCart.addEventListener('click', () => cartModal.style.display = 'none');
  clearCartBtn.addEventListener('click', () => {
    cart = [];
    saveCart();
    cartModal.style.display = 'none';
  });
  checkoutBtn.addEventListener('click', () => {
    // placeholder action
    if (cart.length === 0) {
      alert('Cart is empty.');
      return;
    }
    alert('Proceeding to checkout — implement server-side flow.');
    // after checkout clear cart
    cart = [];
    saveCart();
    cartModal.style.display = 'none';
  });

  // initial render
  updateCartCount();
  renderCart();
});