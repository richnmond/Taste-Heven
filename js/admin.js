const API_BASE = window.API_BASE || (() => {
  if (window.location.protocol === 'file:') return 'http://localhost:4000/api';
  const host = window.location.hostname || 'localhost';
  return `http://${host}:4000/api`;
})();

const state = {
  token: localStorage.getItem('admin_token') || ''
};

const adminLogin = document.getElementById('adminLogin');
const adminDashboard = document.getElementById('adminDashboard');
const adminLoginForm = document.getElementById('adminLoginForm');
const orderList = document.getElementById('orderList');
const refreshOrders = document.getElementById('refreshOrders');
const logoutAdmin = document.getElementById('logoutAdmin');

const showDashboard = () => {
  adminLogin.classList.add('hidden');
  adminDashboard.classList.remove('hidden');
};

const showLogin = () => {
  adminLogin.classList.remove('hidden');
  adminDashboard.classList.add('hidden');
};

const authHeaders = () => ({
  Authorization: `Bearer ${state.token}`,
  'Content-Type': 'application/json'
});

const formatMoney = (n) => `₦${Number(n).toLocaleString()}`;

const renderOrders = (orders) => {
  if (!orders.length) {
    orderList.innerHTML = '<p>No orders yet.</p>';
    return;
  }

  orderList.innerHTML = orders.map(order => {
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
          <div><strong>${order.user?.name || 'Guest'}</strong> (${order.user?.email || 'no email'})</div>
          <div>${new Date(order.createdAt).toLocaleString()}</div>
          <div class="status-pill status-${order.status}">${order.status}</div>
        </div>
        <div class="order-items">${itemsHtml}</div>
        <div><strong>Total:</strong> ${formatMoney(order.total)}</div>
        <div class="order-actions">
          <button class="btn-approve" data-id="${order._id}">Approve</button>
          <button class="btn-reject" data-id="${order._id}">Reject</button>
        </div>
      </div>
    `;
  }).join('');

  orderList.querySelectorAll('.btn-approve').forEach(btn => {
    btn.addEventListener('click', () => updateOrder(btn.dataset.id, 'approve'));
  });
  orderList.querySelectorAll('.btn-reject').forEach(btn => {
    btn.addEventListener('click', () => updateOrder(btn.dataset.id, 'reject'));
  });
};

const fetchOrders = async () => {
  const res = await fetch(`${API_BASE}/admin/orders`, { headers: authHeaders() });
  if (!res.ok) {
    showLogin();
    return;
  }
  const data = await res.json();
  renderOrders(data.orders || []);
};

const updateOrder = async (id, action) => {
  await fetch(`${API_BASE}/admin/orders/${id}/${action}`, {
    method: 'POST',
    headers: authHeaders()
  });
  fetchOrders();
};

adminLoginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok || data.user?.role !== 'admin') {
    alert(data.error || 'Admin login failed.');
    return;
  }
  state.token = data.token;
  localStorage.setItem('admin_token', data.token);
  showDashboard();
  fetchOrders();
});

refreshOrders?.addEventListener('click', fetchOrders);
logoutAdmin?.addEventListener('click', () => {
  state.token = '';
  localStorage.removeItem('admin_token');
  showLogin();
});

if (state.token) {
  showDashboard();
  fetchOrders();
}
