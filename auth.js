// ── AUTH MODULE ───────────────────────────────────────────────
let currentUser = null;

function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
  document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
  clearErrors();
}

function clearErrors() {
  document.getElementById('loginError').textContent = '';
  document.getElementById('regError').textContent = '';
}

function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const user     = UserHashMap.get(email);  // O(1) Hash Map lookup

  if (!user || user.password !== password) {
    document.getElementById('loginError').textContent = 'Invalid email or password.';
    return;
  }
  loginSuccess(user);
}

function handleRegister(e) {
  e.preventDefault();
  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;

  if (UserHashMap.has(email)) {
    document.getElementById('regError').textContent = 'Email already registered.';
    return;
  }
  if (password.length < 6) {
    document.getElementById('regError').textContent = 'Password must be at least 6 characters.';
    return;
  }
  const newUser = {
    id: 'u' + Date.now(),
    name, email, password,
    role: 'client',
    joinDate: new Date().toISOString().split('T')[0],
    bookings: []
  };
  UserHashMap.set(email, newUser);
  loginSuccess(newUser);
}

function loginSuccess(user) {
  currentUser = user;
  sessionStorage.setItem('luxe_user', JSON.stringify({ email: user.email, role: user.role }));
  document.getElementById('authOverlay').classList.remove('active');
  document.getElementById('app').classList.remove('hidden');
  initApp();
}

function logout() {
  currentUser = null;
  sessionStorage.removeItem('luxe_user');
  document.getElementById('app').classList.add('hidden');
  document.getElementById('authOverlay').classList.add('active');
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
}

// Auto-restore session
window.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('luxe_user');
  if (saved) {
    const s = JSON.parse(saved);
    const user = UserHashMap.get(s.email);
    if (user) { loginSuccess(user); return; }
  }
});
