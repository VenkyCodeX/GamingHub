const API = 'https://gaminghub-5kpu.onrender.com/api';

const ALL_SIDEBAR = [
  { key: 'all', label: 'All', icon: '😊' },
  { key: 'PS5 Console', label: 'PS5 Console', icon: '🎮' },
  { key: 'Xbox Console', label: 'Xbox Console', icon: '🕹️' },
  { key: 'VR', label: 'VR', icon: '🥽' },
  { key: 'Racing Wheel', label: 'Racing Wheel', icon: '🏎️' },
  { key: 'PS5 Games', label: 'PS5 Games', icon: '💿' },
  { key: 'Projectors', label: 'Projectors', icon: '📽️' },
  { key: 'Speakers', label: 'Speakers', icon: '🔊' },
  { key: 'Mics', label: 'Mics', icon: '🎙️' },
  { key: 'Trekking Gear', label: 'Trekking Gear', icon: '🎒' },
  { key: 'Riding Gear', label: 'Riding Gear', icon: '🧥' },
  { key: 'Camping Gear', label: 'Camping Gear', icon: '⛺' },
  { key: 'Trekking Shoes', label: 'Trekking Shoes', icon: '👟' },
  { key: 'Snow Boots', label: 'Snow Boots', icon: '🥾' },
];

let allProducts = [];
let currentSub = 'all';
let searchQuery = '';
let searchTimer;
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderSidebar();
  loadProducts();
  const dates = JSON.parse(localStorage.getItem('rentalDates') || 'null');
  if (dates) document.getElementById('dateDisplay').textContent = `${dates.start} → ${dates.end}`;
  if (new URLSearchParams(location.search).get('search')) {
    document.getElementById('searchInput').focus();
  }
});

function renderSidebar() {
  document.getElementById('sidebar').innerHTML = ALL_SIDEBAR.map((item, i) => `
    <div class="sidebar-item ${i === 0 ? 'active' : ''}" onclick="selectSub(this,'${item.key}')">
      <div class="sb-icon">${item.icon}</div>
      <span>${item.label}</span>
    </div>
  `).join('');
}

function selectSub(el, key) {
  document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  currentSub = key;
  filterAndRender();
}

async function loadProducts() {
  try {
    const res = await fetch(`${API}/products`);
    allProducts = await res.json();
  } catch {
    allProducts = getSampleProducts();
  }
  filterAndRender();
}

function filterAndRender() {
  let filtered = allProducts.filter(p => {
    const subMatch = currentSub === 'all' || p.category === currentSub;
    const searchMatch = !searchQuery || p.name.toLowerCase().includes(searchQuery);
    return subMatch && searchMatch;
  });
  document.getElementById('itemCount').textContent = filtered.length + ' items';
  document.getElementById('sectionTitle').textContent = currentSub === 'all' ? 'All Products' : currentSub;
  renderProducts(filtered);
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  if (!products.length) {
    grid.innerHTML = '<div class="loading-spinner" style="color:#888;font-size:0.9rem">No products found</div>';
    return;
  }
  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <div class="card-img-wrap">
        ${p.trending ? '<span class="trending-badge">Trending</span>' : ''}
        <img src="${p.image || 'assets/placeholder.png'}" alt="${p.name}" onerror="this.src='assets/placeholder.png'" />
        <button class="wishlist-btn" onclick="toggleWishlist(this)"><i class="fa-regular fa-heart"></i></button>
      </div>
      <div class="card-body">
        <div class="card-title">${p.name}</div>
        <div class="card-stats"><i class="fa-solid fa-arrow-trend-up"></i> ${p.bookingCount || 0} booked this month</div>
        <div class="card-price">Select Dates to view price<br><strong>₹ ${p.price || '---'}</strong> /month</div>
        <button class="add-cart-btn" onclick="addToCart('${p._id}','${p.name}',${p.price},'${p.image || ''}',this)">Add to Cart</button>
      </div>
    </div>
  `).join('');
}

function debounceSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();
    filterAndRender();
  }, 300);
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  searchQuery = '';
  filterAndRender();
}

function addToCart(id, name, price, image, btn) {
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty++;
  else cart.push({ id, name, price, image, qty: 1 });
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  btn.textContent = 'Added ✓';
  btn.classList.add('added');
  showToast(`${name} added to cart`);
  setTimeout(() => { btn.textContent = 'Add to Cart'; btn.classList.remove('added'); }, 1500);
}

function updateCartBadge() {
  const total = cart.reduce((s, c) => s + c.qty, 0);
  document.getElementById('cartBadge').textContent = total;
}

function toggleWishlist(btn) {
  btn.classList.toggle('active');
  btn.innerHTML = btn.classList.contains('active')
    ? '<i class="fa-solid fa-heart"></i>'
    : '<i class="fa-regular fa-heart"></i>';
}

function openDateModal() { document.getElementById('dateModal').classList.remove('hidden'); }
function closeDateModal() { document.getElementById('dateModal').classList.add('hidden'); }
function saveDates() {
  const s = document.getElementById('startDate').value;
  const e = document.getElementById('endDate').value;
  if (s && e) {
    document.getElementById('dateDisplay').textContent = `${s} → ${e}`;
    localStorage.setItem('rentalDates', JSON.stringify({ start: s, end: e }));
  }
  closeDateModal();
}

function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

function getSampleProducts() {
  return [
    { _id:'1', name:'PS5 + Games (100+) + 1 Controller', category:'PS5 Console', price:2999, trending:true, bookingCount:271 },
    { _id:'2', name:'PS5 All in one Combo + 2 Controllers', category:'PS5 Console', price:3499, trending:true, bookingCount:364 },
    { _id:'3', name:'PS5 + Games (100+) + 2 Controllers', category:'PS5 Console', price:3299, trending:true, bookingCount:198 },
    { _id:'4', name:'PS5 + Spider-Man + 1 Controller', category:'PS5 Games', price:2799, trending:false, bookingCount:145 },
    { _id:'5', name:'Xbox Series X + 2 Controllers', category:'Xbox Console', price:2499, trending:true, bookingCount:189 },
    { _id:'6', name:'Oculus Quest 3S', category:'VR', price:1999, trending:true, bookingCount:239 },
    { _id:'7', name:'Sony SRS-XP500 Wireless Speaker', category:'Speakers', price:999, trending:true, bookingCount:339 },
    { _id:'8', name:'Women Riding Jacket - Level 2', category:'Riding Gear', price:599, trending:true, bookingCount:230 },
    { _id:'9', name:'TREK 100 Trekking Shoes - Women\'s', category:'Trekking Shoes', price:399, trending:true, bookingCount:184 },
    { _id:'10', name:'Speaker & Mic Combo', category:'Speakers', price:1299, trending:true, bookingCount:308 },
    { _id:'11', name:'Oculus Quest 2', category:'VR', price:1499, trending:true, bookingCount:276 },
    { _id:'12', name:'Logitech G29 Racing Wheel', category:'Racing Wheel', price:1799, trending:true, bookingCount:156 },
    { _id:'13', name:'Trek100 Trekking Shoes - Men', category:'Trekking Shoes', price:399, trending:true, bookingCount:201 },
    { _id:'14', name:'Riding Pant for Men and Women', category:'Riding Gear', price:299, trending:true, bookingCount:167 },
    { _id:'15', name:'Epson EB-X51 Projector', category:'Projectors', price:1499, trending:true, bookingCount:112 },
    { _id:'16', name:'Blue Yeti USB Microphone', category:'Mics', price:799, trending:false, bookingCount:98 },
    { _id:'17', name:'Camping Tent - 4 Person', category:'Camping Gear', price:499, trending:false, bookingCount:134 },
    { _id:'18', name:'Nintendo Switch + 2 Games', category:'Xbox Console', price:1999, trending:true, bookingCount:221 },
  ];
}
