// ── ADMIN DASHBOARD ───────────────────────────────────────────
function showAdminTab(tab, link) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.add('hidden'));
  document.querySelectorAll('.admin-link').forEach(l => l.classList.remove('active'));
  const el = document.getElementById('admin' + tab.charAt(0).toUpperCase() + tab.slice(1));
  if (el) el.classList.remove('hidden');
  if (link) link.classList.add('active');

  switch(tab) {
    case 'overview': renderAdminOverview(); break;
    case 'bookings': renderAdminBookings(); break;
    case 'services': renderAdminServices(); break;
    case 'clients':  renderAdminClients();  break;
    case 'revenue':  renderAdminRevenue();  break;
  }
}

// ── OVERVIEW ─────────────────────────────────────────────────
function renderAdminOverview() {
  const total      = BOOKINGS.length;
  const confirmed  = BOOKINGS.filter(b => b.status === 'confirmed').length;
  const completed  = BOOKINGS.filter(b => b.status === 'completed').length;
  const revenue    = BOOKINGS.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.amount, 0);
  const clients    = new Set(BOOKINGS.map(b => b.clientEmail)).size;

  document.getElementById('statsGrid').innerHTML = [
    { label:'Total Bookings',   val: total,                     change:'+12% this month' },
    { label:'Confirmed',        val: confirmed,                 change:'Active bookings' },
    { label:'Completed',        val: completed,                 change:'Happy customers' },
    { label:'Total Revenue',    val:'₹'+revenue.toLocaleString('en-IN'), change:'+8% vs last month' },
    { label:'Unique Clients',   val: clients,                   change:'Registered users' },
  ].map(s => `
    <div class="stat-card">
      <div class="stat-label">${s.label}</div>
      <div class="stat-val">${s.val}</div>
      <div class="stat-change">${s.change}</div>
    </div>
  `).join('');

  renderWeekChart();
  renderRevenueChart();
  renderRecentBookings();
}

function renderWeekChart() {
  const canvas = document.getElementById('weekChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const data = [3, 5, 4, 7, 6, 9, 2];
  const max  = Math.max(...data);
  const W = canvas.parentElement.clientWidth - 32 || 300;
  const H = 180;
  canvas.width  = W;
  canvas.height = H;
  ctx.clearRect(0,0,W,H);

  const barW = (W - 60) / days.length;
  const pad  = 20;

  data.forEach((val, i) => {
    const barH = ((val / max) * (H - pad - 30));
    const x    = 40 + i * barW + barW * 0.15;
    const y    = H - 25 - barH;
    const w    = barW * 0.7;

    // Bar fill gradient manually
    ctx.fillStyle = '#f0d8d5';
    ctx.beginPath();
    ctx.roundRect(x, y, w, barH, 4);
    ctx.fill();

    ctx.fillStyle = '#c9847a';
    ctx.beginPath();
    ctx.roundRect(x, y, w, Math.min(barH, 6), [4,4,0,0]);
    ctx.fill();

    // Value label
    ctx.fillStyle = '#6b5f5f';
    ctx.font = '11px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(val, x + w/2, y - 5);

    // Day label
    ctx.fillStyle = '#a09090';
    ctx.fillText(days[i], x + w/2, H - 8);
  });
}

function renderRevenueChart() {
  const canvas = document.getElementById('revenueChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Aggregate revenue by service category
  const catRevenue = {};
  BOOKINGS.filter(b => b.status !== 'cancelled').forEach(b => {
    const svc = getServiceById(b.serviceId);
    if (!svc) return;
    catRevenue[svc.category] = (catRevenue[svc.category] || 0) + b.amount;
  });

  const labels = Object.keys(catRevenue);
  const values = Object.values(catRevenue);
  const total  = values.reduce((a,b) => a+b, 0);

  const W = canvas.parentElement.clientWidth - 32 || 280;
  const H = 180;
  canvas.width  = W;
  canvas.height = H;
  ctx.clearRect(0,0,W,H);

  const colors = ['#c9847a','#c5a45e','#8b4a43','#d4a5c9','#9bd4c8','#a8c5da'];
  const cx = W * 0.38, cy = H/2, r = Math.min(cy - 15, cx - 15);

  let angle = -Math.PI / 2;
  values.forEach((v, i) => {
    const slice = (v / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, angle + slice);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    angle += slice;
  });

  // Legend
  labels.forEach((l, i) => {
    const x = W * 0.66;
    const y = 20 + i * 24;
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(x, y, 12, 12);
    ctx.fillStyle = '#6b5f5f';
    ctx.font = '11px DM Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${l} (₹${values[i].toLocaleString('en-IN')})`, x + 16, y + 10);
  });
}

function renderRecentBookings() {
  const tbl = document.getElementById('recentBookingsTable');
  if (!tbl) return;
  // Use Min-Heap sorted array for priority — most recent/upcoming first
  const sorted = bookingQueue.toSortedArray().slice(0, 5);
  tbl.innerHTML = `
    <tr><th>Booking ID</th><th>Client</th><th>Service</th><th>Date</th><th>Status</th></tr>
    ${sorted.map(b => bookingRowHTML(b, false)).join('')}
  `;
}

// ── BOOKINGS MANAGEMENT ───────────────────────────────────────
function renderAdminBookings() {
  renderBookingsTable(BOOKINGS);
}

function filterBookings() {
  const query  = document.getElementById('bookingSearch')?.value.toLowerCase() || '';
  const status = document.getElementById('bookingStatusFilter')?.value || '';
  const filtered = BOOKINGS.filter(b => {
    const matchQ = !query || b.clientName.toLowerCase().includes(query) || b.id.toLowerCase().includes(query);
    const matchS = !status || b.status === status;
    return matchQ && matchS;
  });
  renderBookingsTable(filtered);
}

function renderBookingsTable(bookings) {
  const tbl = document.getElementById('allBookingsTable');
  if (!tbl) return;
  // Sort by date using comparator (Merge Sort conceptually via Array.sort)
  const sorted = [...bookings].sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));
  tbl.innerHTML = `
    <tr><th>ID</th><th>Client</th><th>Service</th><th>Date & Time</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
    ${sorted.map(b => bookingRowHTML(b, true)).join('')}
  `;
}

function bookingRowHTML(b, withActions) {
  const svc = getServiceById(b.serviceId);
  const actions = withActions ? `
    <td>
      ${b.status === 'pending' ? `<button class="action-btn" onclick="updateBookingStatus('${b.id}','confirmed')">Confirm</button>` : ''}
      ${b.status === 'confirmed' ? `<button class="action-btn" onclick="updateBookingStatus('${b.id}','completed')">Complete</button>` : ''}
      ${b.status !== 'cancelled' && b.status !== 'completed' ? `<button class="action-btn danger" onclick="updateBookingStatus('${b.id}','cancelled')">Cancel</button>` : ''}
    </td>` : '';
  return `
    <tr>
      <td><code>${b.id}</code></td>
      <td>${b.clientName}</td>
      <td>${svc?.icon || ''} ${svc?.name || 'Unknown'}</td>
      <td>${formatDate(b.date)} ${b.time}</td>
      <td>₹${b.amount.toLocaleString('en-IN')}</td>
      <td><span class="status-badge status-${b.status}">${b.status}</span></td>
      ${actions}
    </tr>
  `;
}

function updateBookingStatus(id, newStatus) {
  const b = BOOKINGS.find(b => b.id === id);
  if (b) {
    b.status = newStatus;
    filterBookings();
  }
}

// ── SERVICES MANAGEMENT ──────────────────────────────────────
let editingServiceId = null;

function renderAdminServices() {
  const tbl = document.getElementById('servicesTable');
  if (!tbl) return;
  // BST in-order gives price-sorted services
  const sorted = serviceBST.inOrder();
  tbl.innerHTML = `
    <tr><th>Icon</th><th>Name</th><th>Category</th><th>Duration</th><th>Price</th><th>Actions</th></tr>
    ${sorted.map(s => `
      <tr>
        <td style="font-size:1.4rem">${s.icon}</td>
        <td>${s.name}</td>
        <td><span class="svc-cat">${s.category}</span></td>
        <td>${s.duration} min</td>
        <td>₹${s.price.toLocaleString('en-IN')}</td>
        <td>
          <button class="action-btn" onclick="openServiceModal('${s.id}')">Edit</button>
          <button class="action-btn danger" onclick="deleteService('${s.id}')">Delete</button>
        </td>
      </tr>
    `).join('')}
  `;
}

function openServiceModal(id) {
  editingServiceId = id || null;
  document.getElementById('serviceModalTitle').textContent = id ? 'Edit Service' : 'Add Service';
  if (id) {
    const s = SERVICES.find(s => s.id === id);
    if (s) {
      document.getElementById('svcName').value     = s.name;
      document.getElementById('svcCategory').value = s.category;
      document.getElementById('svcDuration').value = s.duration;
      document.getElementById('svcPrice').value    = s.price;
      document.getElementById('svcIcon').value     = s.icon;
      document.getElementById('svcDesc').value     = s.desc;
      document.getElementById('svcId').value       = s.id;
    }
  } else {
    document.getElementById('svcName').value = '';
    document.getElementById('svcDuration').value = '';
    document.getElementById('svcPrice').value = '';
    document.getElementById('svcIcon').value = '💅';
    document.getElementById('svcDesc').value = '';
    document.getElementById('svcId').value = '';
  }
  document.getElementById('serviceModal').classList.remove('hidden');
}

function closeServiceModal() {
  document.getElementById('serviceModal').classList.add('hidden');
  editingServiceId = null;
}

function saveService(e) {
  e.preventDefault();
  const name     = document.getElementById('svcName').value.trim();
  const category = document.getElementById('svcCategory').value;
  const duration = parseInt(document.getElementById('svcDuration').value);
  const price    = parseInt(document.getElementById('svcPrice').value);
  const icon     = document.getElementById('svcIcon').value.trim() || '💅';
  const desc     = document.getElementById('svcDesc').value.trim();
  const id       = document.getElementById('svcId').value;

  if (id) {
    // Update existing
    const idx = SERVICES.findIndex(s => s.id === id);
    if (idx !== -1) {
      SERVICES[idx] = { ...SERVICES[idx], name, category, duration, price, icon, desc };
      // Rebuild BST after update
      serviceBST.root = null;
      SERVICES.forEach(s => serviceBST.insert(s));
      // Update Trie
      SERVICES[idx].name.split(' ').forEach(w => serviceTrie.insert(w, id));
    }
  } else {
    // Add new
    const newId = 's' + Date.now();
    const svc   = { id:newId, name, category, price, duration, icon, desc, featured:false };
    SERVICES.push(svc);
    serviceBST.insert(svc);  // BST insert O(log n)
    serviceGraph[newId] = [];
    svc.name.split(' ').forEach(w => serviceTrie.insert(w, newId)); // Trie insert
  }

  closeServiceModal();
  renderAdminServices();
  renderServicesPage();
  renderBookingServices();
}

function deleteService(id) {
  if (!confirm('Delete this service?')) return;
  const idx = SERVICES.findIndex(s => s.id === id);
  if (idx !== -1) SERVICES.splice(idx, 1);
  serviceBST.root = null;
  SERVICES.forEach(s => serviceBST.insert(s));
  renderAdminServices();
  renderServicesPage();
  renderBookingServices();
}

// ── CLIENTS ────────────────────────────────────────────────────
function renderAdminClients() {
  const users = UserHashMap.getAll().filter(u => u.role === 'client');
  filterClients();
}

function filterClients() {
  const query = document.getElementById('clientSearch')?.value.toLowerCase() || '';
  const users = UserHashMap.getAll().filter(u => u.role === 'client');
  const filtered = query ? users.filter(u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)) : users;

  const tbl = document.getElementById('clientsTable');
  if (!tbl) return;
  tbl.innerHTML = `
    <tr><th>Name</th><th>Email</th><th>Joined</th><th>Total Bookings</th><th>Total Spent</th></tr>
    ${filtered.map(u => {
      const bookings = BOOKINGS.filter(b => b.clientEmail === u.email);
      const spent    = bookings.filter(b => b.status !== 'cancelled').reduce((s,b) => s + b.amount, 0);
      // Use Linked List history
      const history  = clientHistories[u.email];
      const histCount = history ? history.size : bookings.length;
      return `
        <tr>
          <td><b>${u.name}</b></td>
          <td>${u.email}</td>
          <td>${u.joinDate}</td>
          <td>${histCount}</td>
          <td>₹${spent.toLocaleString('en-IN')}</td>
        </tr>
      `;
    }).join('')}
  `;
}

// ── REVENUE ────────────────────────────────────────────────────
function renderAdminRevenue() {
  const paid = BOOKINGS.filter(b => b.status !== 'cancelled');
  const total = paid.reduce((s,b) => s + b.amount, 0);
  const avgOrder = paid.length ? Math.round(total / paid.length) : 0;
  const pending  = BOOKINGS.filter(b => b.status === 'pending').reduce((s,b) => s + b.amount, 0);

  document.getElementById('revenueStats').innerHTML = [
    { label:'Total Revenue',   val:`₹${total.toLocaleString('en-IN')}` },
    { label:'Average Order',   val:`₹${avgOrder.toLocaleString('en-IN')}` },
    { label:'Transactions',    val: paid.length },
    { label:'Pending Value',   val:`₹${pending.toLocaleString('en-IN')}` },
  ].map(s => `
    <div class="stat-card">
      <div class="stat-label">${s.label}</div>
      <div class="stat-val">${s.val}</div>
    </div>
  `).join('');

  // Revenue table — BST-sorted by amount using rangeQuery
  const tbl = document.getElementById('revenueTable');
  if (!tbl) return;
  const sorted = [...paid].sort((a,b) => new Date(b.date) - new Date(a.date));
  tbl.innerHTML = `
    <tr><th>Date</th><th>Booking ID</th><th>Client</th><th>Service</th><th>Method</th><th>Amount</th></tr>
    ${sorted.map(b => {
      const svc = getServiceById(b.serviceId);
      return `<tr>
        <td>${formatDate(b.date)}</td>
        <td><code>${b.id}</code></td>
        <td>${b.clientName}</td>
        <td>${svc?.name || 'Unknown'}</td>
        <td>${b.payment?.toUpperCase()}</td>
        <td style="font-weight:600;color:var(--rose-dark)">₹${b.amount.toLocaleString('en-IN')}</td>
      </tr>`;
    }).join('')}
  `;
}
