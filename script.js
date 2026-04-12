const API = 'https://gaminghub-7s66.onrender.com/api';

const CATEGORIES = {
  gaming: {
    title: 'Gaming Gadgets On Rent',
    heroTheme: '',
    tabTheme: '',
    sliderKey: 'Gaming',
    cats: ['PS5 Console','Xbox Console','VR','Racing Wheel','PS5 Games'],
    sidebar: [
      { key: 'all', label: 'All', icon: '😊' },
      { key: 'PS5 Console', label: 'PS5 Console', icon: '🎮' },
      { key: 'Xbox Console', label: 'Xbox Console', icon: '🕹️' },
      { key: 'VR', label: 'VR', icon: '🥽' },
      { key: 'Racing Wheel', label: 'Racing Wheel', icon: '🏎️' },
      { key: 'PS5 Games', label: 'PS5 Games', icon: '💿' },
    ]
  },
  outdoor: {
    title: 'Outdoor Gears On Rent',
    heroTheme: 'outdoor-active',
    tabTheme: 'outdoor-active',
    sliderKey: 'Outdoor',
    cats: ['Trekking Gear','Riding Gear','Camping Gear','Trekking Shoes','Snow Boots'],
    sidebar: [
      { key: 'all', label: 'All', icon: '😊' },
      { key: 'Trekking Gear', label: 'Trekking Gear', icon: '🎒' },
      { key: 'Riding Gear', label: 'Riding Gear', icon: '🧥' },
      { key: 'Camping Gear', label: 'Camping Gear', icon: '⛺' },
      { key: 'Trekking Shoes', label: 'Trekking Shoes', icon: '👟' },
      { key: 'Snow Boots', label: 'Snow Boots', icon: '🥾' },
    ]
  },
  entertainment: {
    title: 'Entertainment On Rent',
    heroTheme: 'entertainment-active',
    tabTheme: 'entertainment-active',
    sliderKey: 'Entertainment',
    cats: ['Projectors','Speakers','Mics','VR'],
    sidebar: [
      { key: 'all', label: 'All', icon: '😊' },
      { key: 'Projectors', label: 'Projectors', icon: '📽️' },
      { key: 'Speakers', label: 'Speakers', icon: '🔊' },
      { key: 'Mics', label: 'Mics', icon: '🎙️' },
      { key: 'VR', label: 'VR', icon: '🥽' },
    ]
  }
};

let currentCat = 'gaming';
let currentSub = 'all';
let allProducts = [];
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// Slider state per category
const sliderState = { Gaming: 0, Outdoor: 0, Entertainment: 0 };
const sliderTimers = {};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  loadProducts();
  renderSidebar('gaming');
  const dates = JSON.parse(localStorage.getItem('rentalDates') || 'null');
  if (dates) document.getElementById('dateDisplay').textContent = `${dates.start} → ${dates.end}`;
  window.addEventListener('resize', () => {
    ['Gaming','Outdoor','Entertainment'].forEach(key => {
      const cat = Object.keys(CATEGORIES).find(c => CATEGORIES[c].sliderKey === key);
      if (!cat) return;
      const items = allProducts.filter(p => CATEGORIES[cat].cats.includes(p.category));
      positionCards(key, 'slider'+key, 'dots'+key, items.length);
    });
  }, { passive: true });
});

// ===== HERO SWITCH =====
function switchHero(btn, cat) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.hero-section').forEach(h => h.classList.add('hidden'));
  document.getElementById('hero-' + cat).classList.remove('hidden');

  const catTabs = document.querySelector('.category-tabs');
  catTabs.className = 'category-tabs ' + (CATEGORIES[cat].tabTheme || '');

  currentCat = cat;
  currentSub = 'all';
  document.getElementById('sectionTitle').textContent = CATEGORIES[cat].title;
  renderSidebar(cat);
  filterAndRender();
}

function scrollTabs(dir) {
  document.getElementById('tabsWrapper').scrollBy({ left: dir * 100, behavior: 'smooth' });
}

// ===== SIDEBAR =====
function renderSidebar(cat) {
  const sidebar = document.getElementById('sidebar');
  sidebar.innerHTML = CATEGORIES[cat].sidebar.map((item, i) => `
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

// ===== PRODUCTS =====
async function loadProducts() {
  try {
    const res = await fetch(`${API}/products`);
    allProducts = await res.json();
  } catch {
    allProducts = getSampleProducts();
  }
  filterAndRender();
  buildAllSliders();
}

function filterAndRender() {
  const cats = CATEGORIES[currentCat].cats;
  let filtered = allProducts.filter(p => {
    const catMatch = cats.includes(p.category);
    const subMatch = currentSub === 'all' || p.category === currentSub;
    return catMatch && subMatch;
  });
  document.getElementById('itemCount').textContent = filtered.length + ' items';
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
        <div class="card-price">Select Dates to view price<br><strong>₹ ${p.price || '---'}</strong> /day</div>
        <button class="add-cart-btn" onclick="addToCart('${p._id}','${p.name}',${p.price},'${p.image || ''}',this)">Add to Cart</button>
      </div>
    </div>
  `).join('');
}

// ===== HERO SLIDER — COVERFLOW =====
function buildAllSliders() {
  buildSlider('Gaming',        ['PS5 Console','Xbox Console','VR','Racing Wheel','PS5 Games'],        'sliderGaming',        'dotsGaming');
  buildSlider('Outdoor',       ['Trekking Gear','Riding Gear','Camping Gear','Trekking Shoes','Snow Boots'], 'sliderOutdoor',  'dotsOutdoor');
  buildSlider('Entertainment', ['Projectors','Speakers','Mics','VR'],                                  'sliderEntertainment', 'dotsEntertainment');
}

function buildSlider(key, cats, sliderId, dotsId) {
  const items = allProducts.filter(p => cats.includes(p.category)).slice(0, 8);
  if (!items.length) return;

  const sliderEl = document.getElementById(sliderId);
  const dotsEl   = document.getElementById(dotsId);

  // Create card elements
  sliderEl.innerHTML = items.map((p, i) => `
    <div class="hero-card" data-idx="${i}"
      onclick="addToCart('${p._id}','${p.name}',${p.price},'${p.image||''}',this)">
      <img src="${p.image || 'assets/placeholder.png'}" alt="${p.name}"
           onerror="this.src='assets/placeholder.png'" />
      <div class="hero-card-name">${p.name}</div>
      <div class="hero-card-price">₹${p.price}/day</div>
    </div>
  `).join('');

  // Build dots
  dotsEl.innerHTML = items.map((_, i) =>
    `<div class="slider-dot" onclick="goToSlide('${key}',${i})"></div>`
  ).join('');

  // Position cards
  positionCards(key, sliderId, dotsId, items.length);

  // Auto-slide
  clearInterval(sliderTimers[key]);
  sliderTimers[key] = setInterval(() => {
    sliderState[key] = (sliderState[key] + 1) % items.length;
    positionCards(key, sliderId, dotsId, items.length);
  }, 2500);
}

function positionCards(key, sliderId, dotsId, total) {
  const sliderEl = document.getElementById(sliderId);
  const dotsEl   = document.getElementById(dotsId);
  if (!sliderEl) return;

  const cards = sliderEl.querySelectorAll('.hero-card');
  const active = sliderState[key];
  const isDesktop = window.innerWidth >= 1024;

  // Gap between cards
  const gap = isDesktop ? 16 : 10;
  // Side card width (must match CSS)
  const sideW  = isDesktop ? 120 : 90;
  const centerW = isDesktop ? 180 : 130;

  // offset from center: center card at 0, side-1 at ±(centerW/2 + gap + sideW/2)
  const offset1 = Math.round(centerW / 2 + gap + sideW / 2);
  const offset2 = Math.round(offset1 + gap + sideW);

  cards.forEach((card, i) => {
    let d = i - active;
    // Wrap around
    if (d > total / 2)  d -= total;
    if (d < -total / 2) d += total;

    card.className = 'hero-card';
    let tx = 0;

    if (d === 0) {
      card.classList.add('center');
      tx = 0;
    } else if (d === 1 || d === -1) {
      card.classList.add('side-1');
      tx = d > 0 ? offset1 : -offset1;
    } else if (Math.abs(d) === 2) {
      card.classList.add('side-2');
      tx = d > 0 ? offset2 : -offset2;
    } else {
      card.style.opacity = '0';
      card.style.transform = `translate(calc(-50% + ${d > 0 ? offset2 * 1.5 : -offset2 * 1.5}px), -50%)`;
      card.style.zIndex = '0';
      return;
    }
    card.style.opacity = '';
    card.style.transform = `translate(calc(-50% + ${tx}px), -50%)`;
    card.style.zIndex = '';
  });

  // Update dots
  dotsEl.querySelectorAll('.slider-dot').forEach((d, i) =>
    d.classList.toggle('active', i === active)
  );
}

function goToSlide(key, idx) {
  sliderState[key] = idx;
  const cat = Object.keys(CATEGORIES).find(c => CATEGORIES[c].sliderKey === key);
  const sliderId = 'slider' + key;
  const dotsId   = 'dots'   + key;
  const items = allProducts.filter(p => CATEGORIES[cat]?.cats.includes(p.category));
  positionCards(key, sliderId, dotsId, items.length);
  clearInterval(sliderTimers[key]);
}

// ===== CART =====
function addToCart(id, name, price, image, btn) {
  const existing = cart.find(c => c.id === id);
  if (existing) { existing.qty++; }
  else { cart.push({ id, name, price, image, qty: 1 }); }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  if (btn.classList.contains('add-cart-btn')) {
    btn.textContent = 'Added ✓';
    btn.classList.add('added');
    setTimeout(() => { btn.textContent = 'Add to Cart'; btn.classList.remove('added'); }, 1500);
  }
  showToast(`${name} added to cart`);
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

// ===== DATE MODAL =====
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

// ===== TOAST =====
function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

// ===== SAMPLE DATA (fallback) =====
function getSampleProducts() {
  return [
    { _id:'1', name:'PS5 + Games (100+) + 1 Controller', category:'PS5 Console', price:2999, trending:true, bookingCount:271, image:'' },
    { _id:'2', name:'PS5 All in one Combo + 2 Controllers', category:'PS5 Console', price:3499, trending:true, bookingCount:364, image:'' },
    { _id:'3', name:'PS5 + Games (100+) + 2 Controllers', category:'PS5 Console', price:3299, trending:true, bookingCount:198, image:'' },
    { _id:'4', name:'PS5 + Spider-Man + 1 Controller', category:'PS5 Games', price:2799, trending:false, bookingCount:145, image:'' },
    { _id:'5', name:'Xbox Series X + 2 Controllers', category:'Xbox Console', price:2499, trending:true, bookingCount:189, image:'' },
    { _id:'6', name:'Oculus Quest 3S', category:'VR', price:1999, trending:true, bookingCount:239, image:'' },
    { _id:'7', name:'Sony SRS-XP500 Wireless Speaker', category:'Speakers', price:999, trending:true, bookingCount:339, image:'' },
    { _id:'8', name:'Women Riding Jacket - Level 2', category:'Riding Gear', price:599, trending:true, bookingCount:230, image:'' },
    { _id:'9', name:'TREK 100 Trekking Shoes - Women\'s', category:'Trekking Shoes', price:399, trending:true, bookingCount:184, image:'' },
    { _id:'10', name:'Speaker & Mic Combo', category:'Speakers', price:1299, trending:true, bookingCount:308, image:'' },
    { _id:'11', name:'Oculus Quest 2', category:'VR', price:1499, trending:true, bookingCount:276, image:'' },
    { _id:'12', name:'Logitech G29 Racing Wheel', category:'Racing Wheel', price:1799, trending:true, bookingCount:156, image:'' },
    { _id:'13', name:'Trek100 Trekking Shoes - Men', category:'Trekking Shoes', price:399, trending:true, bookingCount:201, image:'' },
    { _id:'14', name:'Riding Pant for Men and Women', category:'Riding Gear', price:299, trending:true, bookingCount:167, image:'' },
  ];
}
