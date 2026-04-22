// ── BOOKING MODULE ────────────────────────────────────────────
let selectedService = null;
let selectedDate    = null;
let selectedTime    = null;
let calYear, calMonth;

function renderBookingServices() {
  const list = document.getElementById('bookServiceList');
  if (!list) return;
  list.innerHTML = SERVICES.map(s => `
    <div class="book-svc-card ${selectedService?.id === s.id ? 'selected' : ''}"
         id="bsc-${s.id}" onclick="selectBookingService('${s.id}')">
      <div class="bsc-icon">${s.icon}</div>
      <div class="bsc-name">${s.name}</div>
      <div class="bsc-price">₹${s.price.toLocaleString('en-IN')}</div>
      <div class="muted" style="font-size:0.73rem;margin-top:3px">${s.duration} min</div>
    </div>
  `).join('');
}

function selectBookingService(id) {
  selectedService = SERVICES.find(s => s.id === id);
  if (!selectedService) return;
  document.querySelectorAll('.book-svc-card').forEach(c => c.classList.remove('selected'));
  const el = document.getElementById('bsc-' + id);
  if (el) el.classList.add('selected');
  updateSidebar();
  goStep(2);
}

// ── STEP NAVIGATION ─────────────────────────────────────────
function goStep(n) {
  for (let i = 1; i <= 4; i++) {
    const content = document.getElementById('bookingStep' + i);
    const ind     = document.getElementById('step' + i + 'Ind');
    if (content) content.classList.toggle('hidden', i !== n);
    if (ind) {
      ind.classList.remove('active', 'done');
      if (i === n) ind.classList.add('active');
      if (i < n)  ind.classList.add('done');
    }
  }
  if (n === 2) initCalendar();
  if (n === 4) renderOrderSummary();
  window.scrollTo({ top: 200, behavior: 'smooth' });
}

// ── CALENDAR ────────────────────────────────────────────────
function initCalendar() {
  const now = new Date();
  calYear  = now.getFullYear();
  calMonth = now.getMonth();
  renderCalendar();
}

function prevMonth() {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
}

function nextMonth() {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
}

function renderCalendar() {
  const days  = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const months= ['January','February','March','April','May','June',
                 'July','August','September','October','November','December'];
  const label = document.getElementById('calMonthLabel');
  const grid  = document.getElementById('calGrid');
  if (!label || !grid) return;

  label.textContent = `${months[calMonth]} ${calYear}`;

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();
  today.setHours(0,0,0,0);

  let html = days.map(d => `<div class="cal-day-label">${d}</div>`).join('');

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) html += `<div class="cal-day other-month"></div>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(calYear, calMonth, d);
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isPast  = date < today;
    const isSunday = date.getDay() === 0;
    const isToday = date.toDateString() === today.toDateString();
    const isSelected = dateStr === selectedDate;

    let cls = 'cal-day';
    if (isPast || isSunday) cls += ' disabled';
    if (isToday) cls += ' today';
    if (isSelected) cls += ' selected';

    const onclick = (!isPast && !isSunday) ? `onclick="selectDate('${dateStr}')"` : '';
    html += `<div class="${cls}" ${onclick}>${d}</div>`;
  }

  grid.innerHTML = html;
  if (selectedDate) renderTimeSlots();
}

function selectDate(dateStr) {
  selectedDate = dateStr;
  selectedTime = null;
  renderCalendar();
  renderTimeSlots();
  document.getElementById('step2Next').disabled = true;
  updateSidebar();
}

// Time slot generation — uses existing bookings to mark unavailable
function renderTimeSlots() {
  const container = document.getElementById('timeSlots');
  if (!container || !selectedDate) return;

  const slots = ['09:00','09:30','10:00','10:30','11:00','11:30',
                 '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'];

  // Get booked slots for this date using filter O(n)
  const bookedSlots = BOOKINGS
    .filter(b => b.date === selectedDate && b.status !== 'cancelled')
    .map(b => b.time);

  container.innerHTML = slots.map(t => {
    const isBooked   = bookedSlots.includes(t);
    const isSelected = t === selectedTime;
    let cls = 'time-slot';
    if (isBooked)   cls += ' booked';
    if (isSelected) cls += ' selected';
    const onclick = !isBooked ? `onclick="selectTime('${t}')"` : '';
    return `<div class="${cls}" ${onclick}>${t}</div>`;
  }).join('');
}

function selectTime(time) {
  selectedTime = time;
  renderTimeSlots();
  document.getElementById('step2Next').disabled = false;
  updateSidebar();
}

// ── SIDEBAR ──────────────────────────────────────────────────
function updateSidebar() {
  const content = document.getElementById('sidebarContent');
  if (!content) return;
  if (!selectedService) {
    content.innerHTML = '<p class="muted">No service selected yet</p>';
    return;
  }
  let html = `
    <div class="sidebar-item"><span>${selectedService.icon} ${selectedService.name}</span><span>₹${selectedService.price.toLocaleString('en-IN')}</span></div>
  `;
  if (selectedDate) html += `<div class="sidebar-item"><span>📅 Date</span><span>${formatDate(selectedDate)}</span></div>`;
  if (selectedTime) html += `<div class="sidebar-item"><span>🕐 Time</span><span>${selectedTime}</span></div>`;
  html += `<div class="sidebar-total"><span>Total</span><span>₹${selectedService.price.toLocaleString('en-IN')}</span></div>`;

  // Show recommendations via Graph traversal
  const recs = getRecommendations(selectedService.id, 2);
  if (recs.length) {
    html += `<div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border)">
      <p class="muted" style="margin-bottom:0.5rem">You might also like:</p>
      ${recs.map(r => `<div class="sidebar-item" style="cursor:pointer" onclick="selectBookingService('${r.id}')">
        <span>${r.icon} ${r.name}</span><span style="color:var(--rose)">₹${r.price}</span>
      </div>`).join('')}
    </div>`;
  }
  content.innerHTML = html;
}

// ── ORDER SUMMARY ─────────────────────────────────────────── 
function renderOrderSummary() {
  const content = document.getElementById('orderSummaryContent');
  if (!content || !selectedService) return;
  const tax = Math.round(selectedService.price * 0.18);
  const total = selectedService.price + tax;
  content.innerHTML = `
    <div class="order-row"><span>${selectedService.name}</span><span>₹${selectedService.price.toLocaleString('en-IN')}</span></div>
    <div class="order-row"><span>📅 ${formatDate(selectedDate)} at ${selectedTime}</span></div>
    <div class="order-row"><span>GST (18%)</span><span>₹${tax.toLocaleString('en-IN')}</span></div>
    <div class="order-row total"><span>Total</span><span>₹${total.toLocaleString('en-IN')}</span></div>
  `;

  // Listen for payment method change
  document.querySelectorAll('input[name="pay"]').forEach(r =>
    r.addEventListener('change', () => {
      document.getElementById('cardForm').style.display = r.value === 'card' ? 'flex' : 'none';
    })
  );
}

// ── CONFIRM BOOKING ──────────────────────────────────────────
function confirmBooking() {
  const name  = document.getElementById('custName')?.value.trim();
  const email = document.getElementById('custEmail')?.value.trim();
  const phone = document.getElementById('custPhone')?.value.trim();
  const notes = document.getElementById('custNotes')?.value.trim();
  const pay   = document.querySelector('input[name="pay"]:checked')?.value;

  if (!name || !email || !phone) { alert('Please fill in all required fields.'); return; }
  if (!selectedService || !selectedDate || !selectedTime) { alert('Please complete all booking steps.'); return; }

  const tax   = Math.round(selectedService.price * 0.18);
  const total = selectedService.price + tax;

  const booking = {
    id:          generateId(),
    clientName:  name,
    clientEmail: email,
    phone,
    serviceId:   selectedService.id,
    date:        selectedDate,
    time:        selectedTime,
    status:      'confirmed',
    payment:     pay,
    amount:      total,
    notes,
    createdAt:   new Date().toISOString()
  };

  // Insert into all DSA structures
  BOOKINGS.push(booking);
  bookingQueue.push(booking);   // Min-Heap insert O(log n)
  if (!clientHistories[email]) clientHistories[email] = new BookingHistory();
  clientHistories[email].prepend(booking);  // Linked List prepend O(1)

  // Link to user
  const user = UserHashMap.get(email);
  if (user) user.bookings.push(booking.id);

  // Show confirmation
  document.getElementById('confirmMessage').textContent =
    `${name}, your ${selectedService.name} is booked for ${formatDate(selectedDate)} at ${selectedTime}. Booking ID: ${booking.id}`;
  document.getElementById('confirmModal').classList.remove('hidden');

  // Reset
  selectedService = selectedDate = selectedTime = null;
  updateSidebar();
}

function closeConfirmModal() {
  document.getElementById('confirmModal').classList.add('hidden');
  goStep(1);
  renderBookingServices();
}

// ── PAYMENT HELPERS ──────────────────────────────────────────
function formatCard(input) {
  let val = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = val.match(/.{1,4}/g)?.join(' ') || val;
}

// ── DATE FORMATTER ────────────────────────────────────────────
function formatDate(str) {
  if (!str) return '';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}
