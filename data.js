/**
 * DATA STORE — DSA Concepts Used:
 * 1. Hash Map (Object) — O(1) user lookup by email
 * 2. Min-Heap Priority Queue — booking priority (urgent first)
 * 3. Binary Search Tree (BST) — service search by price
 * 4. Linked List — booking history chain
 * 5. Trie — autocomplete for service search
 * 6. Graph — service recommendation based on bookings
 * 7. Queue — waitlist management
 */

// ════════════════════════════════════════════════
// 1. HASH MAP — O(1) user lookup
// ════════════════════════════════════════════════
const UserHashMap = {
  _map: {},
  set(email, user) { this._map[email.toLowerCase()] = user; },
  get(email)       { return this._map[email.toLowerCase()] || null; },
  has(email)       { return email.toLowerCase() in this._map; },
  getAll()         { return Object.values(this._map); }
};

// Seed users
[
  { id:'u1', name:'Admin User',  email:'admin@luxenails.com',   password:'admin123',  role:'admin',  joinDate:'2024-01-15', bookings:[] },
  { id:'u2', name:'Priya Sharma', email:'client@luxenails.com', password:'client123', role:'client', joinDate:'2024-03-10', bookings:[] },
  { id:'u3', name:'Meera Patel',  email:'meera@example.com',    password:'meera123',  role:'client', joinDate:'2024-05-22', bookings:[] },
  { id:'u4', name:'Anita Desai',  email:'anita@example.com',    password:'anita123',  role:'client', joinDate:'2024-07-01', bookings:[] },
].forEach(u => UserHashMap.set(u.email, u));


// ════════════════════════════════════════════════
// 2. SERVICES DATA + BST for price search
// ════════════════════════════════════════════════
const SERVICES = [
  { id:'s1',  name:'Classic Manicure',       category:'Manicure', price:499,  duration:45,  icon:'💅', desc:'Shape, buff and polish for natural, beautiful nails.', featured:true },
  { id:'s2',  name:'Gel Manicure',           category:'Gel Nails', price:899,  duration:60,  icon:'✨', desc:'Long-lasting gel colour with a high-shine finish that lasts 2-3 weeks.', featured:true },
  { id:'s3',  name:'Acrylic Full Set',       category:'Gel Nails', price:1499, duration:90,  icon:'💎', desc:'Full set of acrylic nails customised to your desired length and shape.', featured:true },
  { id:'s4',  name:'Classic Pedicure',       category:'Pedicure',  price:599,  duration:50,  icon:'🦶', desc:'Relaxing foot soak, scrub, massage and nail polish.', featured:false },
  { id:'s5',  name:'Spa Pedicure',           category:'Pedicure',  price:999,  duration:75,  icon:'🧖', desc:'Premium pedicure with paraffin wax treatment and extended massage.', featured:false },
  { id:'s6',  name:'Nail Art Design',        category:'Nail Art',  price:699,  duration:60,  icon:'🎨', desc:'Intricate hand-painted designs, stamping, decals and gems.', featured:true },
  { id:'s7',  name:'Nail Extension',         category:'Gel Nails', price:1299, duration:80,  icon:'🌸', desc:'Builder gel extensions for natural-looking length and strength.', featured:false },
  { id:'s8',  name:'French Manicure',        category:'Manicure',  price:749,  duration:55,  icon:'🤍', desc:'Timeless white-tip French polish for elegant, classic nails.', featured:false },
  { id:'s9',  name:'Luxury Spa Manicure',    category:'Spa',       price:1199, duration:70,  icon:'🌹', desc:'Ultimate pampering with mask, hot towels and argan oil treatment.', featured:false },
  { id:'s10', name:'Nail Repair',            category:'Manicure',  price:299,  duration:20,  icon:'🔧', desc:'Fix broken or chipped nails quickly with professional care.', featured:false },
  { id:'s11', name:'Chrome Powder Nails',    category:'Nail Art',  price:849,  duration:65,  icon:'🪞', desc:'Stunning mirror-effect chrome powder over gel base coat.', featured:false },
  { id:'s12', name:'Paraffin Wax Treatment', category:'Spa',       price:449,  duration:30,  icon:'🕯️', desc:'Deep moisturising paraffin dip for silky soft hands and feet.', featured:false },
];

// BST Node for price-sorted service lookup
class BSTNode {
  constructor(service) {
    this.service = service;
    this.left  = null;
    this.right = null;
  }
}
class ServiceBST {
  constructor() { this.root = null; }
  insert(service) {
    const node = new BSTNode(service);
    if (!this.root) { this.root = node; return; }
    let cur = this.root;
    while (true) {
      if (service.price <= cur.service.price) {
        if (!cur.left)  { cur.left  = node; return; }
        cur = cur.left;
      } else {
        if (!cur.right) { cur.right = node; return; }
        cur = cur.right;
      }
    }
  }
  // In-order traversal → sorted by price
  inOrder(node = this.root, result = []) {
    if (!node) return result;
    this.inOrder(node.left, result);
    result.push(node.service);
    this.inOrder(node.right, result);
    return result;
  }
  // Range query: services priced between min and max
  rangeQuery(min, max, node = this.root, result = []) {
    if (!node) return result;
    if (node.service.price > min) this.rangeQuery(min, max, node.left, result);
    if (node.service.price >= min && node.service.price <= max) result.push(node.service);
    if (node.service.price < max) this.rangeQuery(min, max, node.right, result);
    return result;
  }
}
const serviceBST = new ServiceBST();
SERVICES.forEach(s => serviceBST.insert(s));


// ════════════════════════════════════════════════
// 3. TRIE — Autocomplete for service search
// ════════════════════════════════════════════════
class TrieNode {
  constructor() { this.children = {}; this.isEnd = false; this.serviceIds = []; }
}
class Trie {
  constructor() { this.root = new TrieNode(); }
  insert(word, serviceId) {
    let node = this.root;
    for (const ch of word.toLowerCase()) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
      if (!node.serviceIds.includes(serviceId)) node.serviceIds.push(serviceId);
    }
    node.isEnd = true;
  }
  search(prefix) {
    let node = this.root;
    for (const ch of prefix.toLowerCase()) {
      if (!node.children[ch]) return [];
      node = node.children[ch];
    }
    return node.serviceIds;
  }
}
const serviceTrie = new Trie();
SERVICES.forEach(s => {
  s.name.split(' ').forEach(word => serviceTrie.insert(word, s.id));
  serviceTrie.insert(s.category, s.id);
});


// ════════════════════════════════════════════════
// 4. MIN-HEAP PRIORITY QUEUE — Booking scheduling
//    Priority: earlier date = higher priority
// ════════════════════════════════════════════════
class MinHeap {
  constructor() { this.heap = []; }
  _key(b) { return new Date(b.date + 'T' + b.time).getTime(); }
  push(booking) {
    this.heap.push(booking);
    this._bubbleUp(this.heap.length - 1);
  }
  pop() {
    if (!this.heap.length) return null;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length) { this.heap[0] = last; this._sinkDown(0); }
    return top;
  }
  peek() { return this.heap[0] || null; }
  _bubbleUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this._key(this.heap[parent]) > this._key(this.heap[i])) {
        [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
        i = parent;
      } else break;
    }
  }
  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let min = i, l = 2*i+1, r = 2*i+2;
      if (l < n && this._key(this.heap[l]) < this._key(this.heap[min])) min = l;
      if (r < n && this._key(this.heap[r]) < this._key(this.heap[min])) min = r;
      if (min !== i) { [this.heap[min], this.heap[i]] = [this.heap[i], this.heap[min]]; i = min; }
      else break;
    }
  }
  toSortedArray() {
    const copy = new MinHeap();
    copy.heap = [...this.heap];
    const result = [];
    while (copy.heap.length) result.push(copy.pop());
    return result;
  }
  size() { return this.heap.length; }
}
const bookingQueue = new MinHeap();


// ════════════════════════════════════════════════
// 5. LINKED LIST — Booking history per client
// ════════════════════════════════════════════════
class ListNode {
  constructor(booking) { this.booking = booking; this.next = null; }
}
class BookingHistory {
  constructor() { this.head = null; this.size = 0; }
  prepend(booking) {
    const node = new ListNode(booking);
    node.next = this.head;
    this.head = node;
    this.size++;
  }
  toArray() {
    const arr = [];
    let cur = this.head;
    while (cur) { arr.push(cur.booking); cur = cur.next; }
    return arr;
  }
}
const clientHistories = {};  // clientId → BookingHistory


// ════════════════════════════════════════════════
// 6. GRAPH — Service recommendation
//    Nodes = services; Edges = "often booked together"
// ════════════════════════════════════════════════
const serviceGraph = {};
SERVICES.forEach(s => { serviceGraph[s.id] = []; });
// Predefined affinity edges
const affinityEdges = [
  ['s1','s4'],['s1','s8'],['s2','s6'],['s2','s11'],
  ['s3','s6'],['s3','s7'],['s4','s5'],['s5','s12'],
  ['s6','s11'],['s9','s12'],['s8','s2'],
];
affinityEdges.forEach(([a,b]) => {
  serviceGraph[a].push(b);
  serviceGraph[b].push(a);
});
function getRecommendations(serviceId, count = 3) {
  const neighbours = serviceGraph[serviceId] || [];
  return neighbours.slice(0, count).map(id => SERVICES.find(s => s.id === id)).filter(Boolean);
}


// ════════════════════════════════════════════════
// 7. QUEUE — Waitlist management
// ════════════════════════════════════════════════
class Queue {
  constructor() { this._data = []; }
  enqueue(item) { this._data.push(item); }
  dequeue()     { return this._data.shift(); }
  peek()        { return this._data[0]; }
  size()        { return this._data.length; }
  isEmpty()     { return this._data.length === 0; }
  toArray()     { return [...this._data]; }
}
const waitlistQueue = new Queue();


// ════════════════════════════════════════════════
// BOOKINGS STORE
// ════════════════════════════════════════════════
const BOOKINGS = [];
let bookingCounter = 1000;

function generateId() { return 'B' + (++bookingCounter); }

// Seed some bookings
const seedBookings = [
  { id:'B1001', clientName:'Priya Sharma',  clientEmail:'client@luxenails.com', serviceId:'s2', date:'2025-01-20', time:'10:00', status:'completed', payment:'card',  amount:899,  notes:'' },
  { id:'B1002', clientName:'Meera Patel',   clientEmail:'meera@example.com',    serviceId:'s3', date:'2025-01-22', time:'14:00', status:'completed', payment:'upi',   amount:1499, notes:'French tips please' },
  { id:'B1003', clientName:'Anita Desai',   clientEmail:'anita@example.com',    serviceId:'s6', date:'2025-01-25', time:'11:30', status:'confirmed', payment:'card',  amount:699,  notes:'' },
  { id:'B1004', clientName:'Priya Sharma',  clientEmail:'client@luxenails.com', serviceId:'s1', date:'2025-01-28', time:'09:00', status:'confirmed', payment:'cash',  amount:499,  notes:'' },
  { id:'B1005', clientName:'Meera Patel',   clientEmail:'meera@example.com',    serviceId:'s5', date:'2025-01-30', time:'15:00', status:'pending',   payment:'card',  amount:999,  notes:'First visit' },
  { id:'B1006', clientName:'Anita Desai',   clientEmail:'anita@example.com',    serviceId:'s9', date:'2025-02-02', time:'12:00', status:'completed', payment:'upi',   amount:1199, notes:'' },
  { id:'B1007', clientName:'Priya Sharma',  clientEmail:'client@luxenails.com', serviceId:'s11',date:'2025-02-05', time:'10:30', status:'cancelled', payment:'card',  amount:849,  notes:'' },
  { id:'B1008', clientName:'New Client',    clientEmail:'new@example.com',      serviceId:'s4', date:'2025-02-08', time:'13:00', status:'pending',   payment:'cash',  amount:599,  notes:'' },
];
seedBookings.forEach(b => {
  BOOKINGS.push(b);
  bookingQueue.push(b);
  if (!clientHistories[b.clientEmail]) clientHistories[b.clientEmail] = new BookingHistory();
  clientHistories[b.clientEmail].prepend(b);
});

// Helper getters
function getServiceById(id)    { return SERVICES.find(s => s.id === id); }
function getBookingsByEmail(e) { return BOOKINGS.filter(b => b.clientEmail === e); }
function searchServices(query) {
  if (!query.trim()) return SERVICES;
  const ids = serviceTrie.search(query.trim());
  if (ids.length) return SERVICES.filter(s => ids.includes(s.id));
  return SERVICES.filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.category.toLowerCase().includes(query.toLowerCase()));
}

// Gallery items
const GALLERY = [
  { color:'#f4a5a0', label:'French Ombre', icon:'🌸' },
  { color:'#c9847a', label:'Burgundy Gel', icon:'🍷' },
  { color:'#c5a45e', label:'Gold Chrome',  icon:'✨' },
  { color:'#a8c5da', label:'Baby Blue Art', icon:'💙' },
  { color:'#d4a5c9', label:'Lavender Gel', icon:'💜' },
  { color:'#f0c980', label:'Nude & Gold',  icon:'🤍' },
  { color:'#8b4a43', label:'Dark Cherry',  icon:'🍒' },
  { color:'#9bd4c8', label:'Mint Swirl',   icon:'🌿' },
  { color:'#f7d6e0', label:'Rose Quartz',  icon:'💗' },
  { color:'#2c2c2a', label:'Black Stiletto', icon:'🖤' },
  { color:'#e8d5a3', label:'Holographic',  icon:'🌈' },
  { color:'#c8e6c9', label:'Nature Bloom', icon:'🌺' },
];
