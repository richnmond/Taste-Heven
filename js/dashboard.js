const DASH_API = window.API_BASE || (() => {
  if (window.location.protocol === 'file:') return 'http://localhost:4000/api';
  const host = window.location.hostname || 'localhost';
  return `http://${host}:4000/api`;
})();

const ordersEl = document.getElementById('dashboardOrders');
const refreshBtn = document.getElementById('refreshDashboard');
const logoutBtn = document.getElementById('logoutUser');

const formatMoney = (n) => `₦${Number(n).toLocaleString()}`;

const authToken = () => localStorage.getItem('user_token') || '';
const userInfo = () => {
  try {
    return JSON.parse(localStorage.getItem('user_info') || '{}');
  } catch {
    return {};
  }
};
    
const requireLogin = () => {
  if (!authToken()) {
    alert('Please login to view your dashboard.');
    window.location.href = 'login.html';
    return false;
  }
  return true;
};

const renderOrders = (orders) => {
  if (!orders.length) {
    ordersEl.innerHTML = '<p>No orders yet. Visit the menu to place an order.</p>';
    return;
  }

  ordersEl.innerHTML = orders.map(order => {
    const itemsHtml = order.items.map(item => `
      <div class="order-item">
        <img src="${item.image || 'images/dish1.jpg'}" alt="${item.name}" />
        <div>
          <h4>${item.name}</h4>
          <span>${item.quantity} x ${formatMoney(item.price)}</span>
        </div>
      </div>
    `).join('');

    return `
      <div class="order-card">
        <div class="order-meta">
          <div><strong>${order._id}</strong></div>
          <div>${new Date(order.createdAt).toLocaleString()}</div>
          <div class="status-pill status-${order.status}">${order.status}</div>
        </div>
        <div class="order-items">${itemsHtml}</div>
        <div><strong>Total:</strong> ${formatMoney(order.total)}</div>
      </div>
    `;
  }).join('');
};

const fetchOrders = async () => {
  if (!requireLogin()) return;
  const res = await fetch(`${DASH_API}/orders/me`, {
    headers: { Authorization: `Bearer ${authToken()}` }
  });
  if (!res.ok) {
    alert('Session expired. Please login again.');
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_info');
    window.location.href = 'login.html';
    return;
  }
  const data = await res.json();
  renderOrders(data.orders || []);
};

refreshBtn?.addEventListener('click', fetchOrders);
logoutBtn?.addEventListener('click', () => {
  localStorage.removeItem('user_token');
  localStorage.removeItem('user_info');
  alert('Logged out.');
  window.location.href = 'login.html';
});

if (requireLogin()) {
  const info = userInfo();
  if (info.role === 'admin') {
    window.location.href = 'admin.html';
  } else {
    fetchOrders();
    setInterval(fetchOrders, 15000);
  }
}
