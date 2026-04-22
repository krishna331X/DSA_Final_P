// ── APP CORE ──────────────────────────────────────────────────
function initApp() {
  const user = currentUser;
  document.getElementById('navUsername').textContent = user.name;

  // Show admin nav if admin
  if (user.role === 'admin') {
    document.getElementById('adminNavItem').classList.remove('hidden');
  } else {
    document.getElementById('adminNavItem').classList.add('hidden');
  }

  // Load all pages
  renderFeaturedServices();
  renderServicesPage();
  renderGallery();
  renderBookingServices();
  updateStatBookings();

  // Prefill booking form with user info
  const custEmail = document.getElementById('custEmail');
  const custName  = document.getElementById('custName');
  if (custEmail) custEmail.value = user.email;
  if (custName)  custName.value  = user.name;

  showPage('home', document.querySelector('[href="#home"]'));
}

function showPage(name, link) {
  const pages = ['home','services','booking','gallery','admin'];
  pages.forEach(p => {
    const el = document.getElementById(p + 'Page');
    if (el) el.classList.toggle('hidden', p !== name);
  });

  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  if (link) link.classList.add('active');

  if (name === 'admin' && currentUser?.role !== 'admin') {
    showPage('home', document.querySelector('[href="#home"]'));
    return;
  }
  if (name === 'admin') renderAdminOverview();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── HOME ────────────────────────────────────────────────────
function renderFeaturedServices() {
  const featured = SERVICES.filter(s => s.featured).slice(0, 4);
  const grid = document.getElementById('featuredServices');
  grid.innerHTML = featured.map(s => serviceCardHTML(s, true)).join('');
}

function updateStatBookings() {
  const el = document.getElementById('statBookings');
  if (!el) return;
  const target = BOOKINGS.length + 127;
  let count = 0;
  const step = Math.ceil(target / 50);
  const t = setInterval(() => {
    count = Math.min(count + step, target);
    el.textContent = count + '+';
    if (count >= target) clearInterval(t);
  }, 30);
}

// ── SERVICES PAGE ───────────────────────────────────────────
let activeCategory = 'All';
const CATEGORIES = ['All', ...new Set(SERVICES.map(s => s.category))];

function renderServicesPage() {
  // Category buttons
  const catContainer = document.getElementById('categoryFilters');
  catContainer.innerHTML = CATEGORIES.map(c =>
    `<button class="cat-btn ${c === 'All' ? 'active' : ''}" onclick="setCat('${c}', this)">${c}</button>`
  ).join('');

  // Services grid
  renderServicesGrid(SERVICES);
}

function setCat(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filterServices();
}

function filterServices() {
  const query = document.getElementById('serviceSearch')?.value || '';
  // Use Trie for search, then filter by category
  let results = searchServices(query);
  if (activeCategory !== 'All') results = results.filter(s => s.category === activeCategory);
  renderServicesGrid(results);
}

function renderServicesGrid(services) {
  const grid = document.getElementById('servicesGrid');
  if (!grid) return;
  if (!services.length) {
    grid.innerHTML = '<p class="muted" style="padding:2rem">No services found.</p>';
    return;
  }
  grid.innerHTML = services.map(s => serviceCardHTML(s, false)).join('');
}

function serviceCardHTML(s, compact) {
  return `
    <div class="service-card" onclick="selectAndBook('${s.id}')">
      <div class="svc-icon">${s.icon}</div>
      <div class="svc-cat">${s.category}</div>
      <div class="svc-name">${s.name}</div>
      <div class="svc-desc">${s.desc}</div>
      <div class="svc-footer">
        <span class="svc-price">₹${s.price.toLocaleString('en-IN')}</span>
        <span class="svc-duration">⏱ ${s.duration} min</span>
      </div>
    </div>
  `;
}

function selectAndBook(serviceId) {
  showPage('booking', document.querySelector('[href="#booking"]'));
  setTimeout(() => selectBookingService(serviceId), 100);
}

// ── GALLERY ─────────────────────────────────────────────────
function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  grid.innerHTML = GALLERY.map((g, i) => `
    <div class="gallery-item" style="background:${g.color}">
      <div class="gallery-thumb">${g.icon}</div>
      <div class="gallery-label">${g.label}</div>
    </div>
  `).join('');
}
