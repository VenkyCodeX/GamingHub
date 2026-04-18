const API = 'https://gaminghub-1-be7i.onrender.com/api';
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let paymentMethod = 'upi';
let discount = 0;
let pendingBookingId = null;

const COUPONS = { 'GAME10': 10, 'RENT20': 20, 'FIRST50': 50 };

document.addEventListener('DOMContentLoaded', () => {
  const dates = JSON.parse(localStorage.getItem('rentalDates') || 'null');
  if (dates) {
    document.getElementById('startDate').value = dates.start;
    document.getElementById('endDate').value = dates.end;
  }
  renderCart();
});

// ===== RENDER CART =====
function renderCart() {
  const container = document.getElementById('cartItems');
  if (!cart.length) {
    container.innerHTML = `
      <div class="cart-empty">
        <i class="fa-solid fa-cart-shopping"></i>
        <p style="font-size:1rem;font-weight:600;margin-bottom:6px">Your cart is empty</p>
        <p style="font-size:0.82rem;color:#aaa;margin-bottom:16px">Add some products to get started</p>
        <a href="products.html"><button class="checkout-btn" style="width:auto;padding:10px 24px">Browse Products</button></a>
      </div>`;
    document.getElementById('datesSection').style.display = 'none';
    document.getElementById('detailsSection').style.display = 'none';
    return;
  }
  container.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <img src="${item.image || 'assets/placeholder.png'}" alt="${item.name}" onerror="this.src='assets/placeholder.png'" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price}/month</div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeQty(${i},-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${i},1)">+</button>
        </div>
      </div>
      <button class="remove-btn" onclick="removeItem(${i})"><i class="fa-solid fa-trash"></i></button>
    </div>
  `).join('');
  recalcTotal();
}

function changeQty(i, delta) {
  cart[i].qty = Math.max(1, cart[i].qty + delta);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function removeItem(i) {
  cart.splice(i, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

// ===== PAYMENT =====
function selectPayment(method) {
  paymentMethod = method;
  document.getElementById('payUPI').classList.toggle('selected', method === 'upi');
  document.getElementById('payCash').classList.toggle('selected', method === 'cash');
}

// ===== COUPON =====
function applyCoupon() {
  const code = document.getElementById('couponInput').value.trim().toUpperCase();
  const msg = document.getElementById('couponMsg');
  if (COUPONS[code]) {
    discount = COUPONS[code];
    msg.textContent = `✓ Coupon applied! ₹${discount} off`;
    msg.style.color = '#27ae60';
  } else {
    discount = 0;
    msg.textContent = 'Invalid coupon code';
    msg.style.color = '#e74c3c';
  }
  recalcTotal();
}

// ===== TOTAL =====
function recalcTotal() {
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const insurance = document.getElementById('insuranceCheck')?.checked ? 99 : 0;
  const total = subtotal + insurance + 49 - discount;

  document.getElementById('summaryRows').innerHTML =
    cart.map(c => `<div class="summary-row"><span>${c.name} ×${c.qty}</span><span>₹${c.price * c.qty}</span></div>`).join('') +
    (discount ? `<div class="summary-row" style="color:#27ae60"><span>Discount</span><span>−₹${discount}</span></div>` : '');

  document.getElementById('totalAmount').textContent = `₹${total}`;
}

function getTotal() {
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const insurance = document.getElementById('insuranceCheck')?.checked ? 99 : 0;
  return subtotal + insurance + 49 - discount;
}

// ===== VALIDATION =====
function validate() {
  const name  = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const start = document.getElementById('startDate').value;
  const end   = document.getElementById('endDate').value;
  const sTime = document.getElementById('startTime').value;
  const eTime = document.getElementById('endTime').value;

  if (!name)              return showToast('Please enter your name');
  if (phone.length < 10)  return showToast('Enter a valid 10-digit mobile number');
  if (!start)             return showToast('Please select pickup date');
  if (!sTime)             return showToast('Please select pickup time');
  if (!end)               return showToast('Please select return date');
  if (!eTime)             return showToast('Please select return time');
  if (new Date(end) < new Date(start)) return showToast('Return date must be after pickup date');
  return true;
}

// ===== PLACE ORDER =====
async function placeOrder() {
  if (!cart.length) return showToast('Cart is empty');
  if (validate() !== true) return;

  const name  = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const email = document.getElementById('custEmail').value.trim();
  const start = document.getElementById('startDate').value;
  const end   = document.getElementById('endDate').value;
  const sTime = document.getElementById('startTime').value;
  const eTime = document.getElementById('endTime').value;
  const insurance = document.getElementById('insuranceCheck').checked;
  const total = getTotal();

  const payload = {
    items: cart.map(c => ({ product: c.id, name: c.name, qty: c.qty, price: c.price })),
    phone, name, email,
    startDate: `${start}T${sTime}`,
    endDate: `${end}T${eTime}`,
    paymentMethod, insurance, total
  };

  // Save booking to DB
  let bookingId = 'BK' + Date.now().toString().slice(-8);
  try {
    const res = await fetch(`${API}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data._id) bookingId = data._id.slice(-8).toUpperCase();
  } catch {}

  pendingBookingId = bookingId;

  if (paymentMethod === 'upi') {
    // Show UPI modal
    document.getElementById('upiAmount').textContent = `₹${total}`;
    document.getElementById('upiModal').classList.remove('hidden');
  } else {
    // Cash on Pickup — show WhatsApp + success
    const msg = `🎮 *New Booking - GamingHub*\n\n*ID:* ${bookingId}\n*Name:* ${name}\n*Phone:* ${phone}\n*Items:* ${cart.map(c=>c.name).join(', ')}\n*Pickup:* ${start} at ${sTime}\n*Return:* ${end} at ${eTime}\n*Total:* ₹${total}\n*Payment:* Cash on Pickup`;
    window.open(`https://wa.me/919391265697?text=${encodeURIComponent(msg)}`, '_blank');
    showSuccess(bookingId);
  }
}

// ===== UPI MODAL =====
function copyUPI() {
  navigator.clipboard.writeText('bikerentalhub.hyderabad@gmail.com').then(() => showToast('Email copied!'));
}

function openUPIApp(app) {
  const amount = getTotal();
  const upiId = 'bikerentalhub.hyderabad@gmail.com';
  const note = `GamingHub Booking ${pendingBookingId}`;
  const upiUrl = `upi://pay?pa=${upiId}&pn=GamingRentalHub&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
  window.location.href = upiUrl;
}

function confirmUPIPayment() {
  document.getElementById('upiModal').classList.add('hidden');
  showSuccess(pendingBookingId);
}

function closeUPIModal() {
  document.getElementById('upiModal').classList.add('hidden');
}

// ===== SUCCESS =====
function showSuccess(bookingId) {
  localStorage.removeItem('cart');
  cart = [];
  document.getElementById('cartContent').style.display = 'none';
  document.getElementById('successScreen').classList.add('show');
  document.getElementById('bookingIdDisplay').textContent = bookingId;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== TOAST =====
function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}
