const AUTH_API = window.API_BASE || (() => {
  if (window.location.protocol === 'file:') return 'http://localhost:4000/api';
  const host = window.location.hostname || 'localhost';
  return `http://${host}:4000/api`;
})();

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const tabs = document.querySelectorAll('.auth-tabs .tab');

const switchTab = (target) => {
  tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.tab === target));
  loginForm.classList.toggle('hidden', target !== 'login');
  registerForm.classList.toggle('hidden', target !== 'register');
};

tabs.forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

const saveUser = (data) => {
  localStorage.setItem('user_token', data.token);
  localStorage.setItem('user_info', JSON.stringify(data.user));
};

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const res = await fetch(`${AUTH_API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    alert(data.error || 'Login failed.');
    return;
  }
  saveUser(data);
  if (data.user?.role === 'admin') {
    alert('Admin login successful.');
    window.location.href = 'admin.html';
    return;
  }
  alert('Login successful. You can now place orders.');
  window.location.href = 'dashboard.html';
});

registerForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const phone = document.getElementById('registerPhone').value.trim();
  const password = document.getElementById('registerPassword').value;
  const res = await fetch(`${AUTH_API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, password })
  });
  const data = await res.json();
  if (!res.ok) {
    alert(data.error || 'Registration failed.');
    return;
  }
  saveUser(data);
  alert('Account created. You can now place orders.');
  window.location.href = 'dashboard.html';
});
