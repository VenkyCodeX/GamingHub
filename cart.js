const API = 'https://gaminghub-7s66.onrender.com/api';
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let paymentMethod = 'upi';
let discount = 0;

const COUPONS = { 'GAME10': 10, 'RENT20': 20, 'FIRST50': 50 };

document.addEventListener('DOMContentLoaded', () => {
  const dates = JSON.parse(localStorage.getItem('rentalDates') || 'null');
  if (dates) {
    document.getElementById('startDate').value = dates.start;
    document.getElementById('endDate').value = dates.end;
  }
  renderCart();
});

function renderCart() {
  const container = document.getElementById('cartItems');
  if (!cart.length) {
    container.innerHTML = `
      <div class="cart-empty">
        <i class="fa-solid fa-cart-shopping"></i>
        <p>Your cart is empty</p>
        <a href="products.html"><button class="checkout-btn" style="margin-top:16px;width:auto;padding:10px 24px">Browse Products</button></a>
      </div>`;
    document.getElementById('datesSection').style.display = 'none';
    return;
  }
  container.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <img src="${item.image || 'assets/placeholder.png'}" alt="${item.name}" onerror="this.src='assets/placeholder.png'" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price}/day</div>
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

function selectPayment(method) {
  paymentMethod = method;
  document.getElementById('payUPI').classList.toggle('selected', method === 'upi');
  document.getElementById('payCash').classList.toggle('selected', method === 'cash');
}

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

function recalcTotal() {
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const insurance = document.getElementById('insuranceCheck')?.checked ? 99 : 0;
  const platform = 49;
  const total = subtotal + insurance + platform - discount;

  document.getElementById('summaryRows').innerHTML = cart.map(c =>
    `<div class="summary-row"><span>${c.name} x${c.qty}</span><span>₹${c.price * c.qty}</span></div>`
  ).join('') + (discount ? `<div class="summary-row" style="color:#27ae60"><span>Discount</span><span>-₹${discount}</span></div>` : '');

  document.getElementById('totalAmount').textContent = `₹${total}`;
}

async function placeOrder() {
  if (!cart.length) return showToast('Cart is empty');
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;
  if (!start || !end) return showToast('Please select rental dates');

  const phone = prompt('Enter your phone number for booking confirmation:');
  if (!phone || phone.length < 10) return showToast('Valid phone number required');

  const insurance = document.getElementById('insuranceCheck').checked;
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const total = subtotal + (insurance ? 99 : 0) + 49 - discount;

  const payload = {
    items: cart.map(c => ({ product: c.id, name: c.name, qty: c.qty, price: c.price })),
    phone, startDate: start, endDate: end,
    paymentMethod, insurance, total
  };

  let bookingId = 'BK' + Date.now();
  try {
    const res = await fetch(`${API}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data._id) bookingId = data._id.slice(-8).toUpperCase();
  } catch { /* use local ID */ }

  if (paymentMethod === 'cash') {
    window.open(`https://wa.me/919999999999?text=New Booking: ${bookingId}%0APhone: ${phone}%0AItems: ${cart.map(c=>c.name).join(', ')}%0ADates: ${start} to ${end}%0ATotal: ₹${total}`, '_blank');
  }

  localStorage.removeItem('cart');
  cart = [];
  document.getElementById('cartContent').style.display = 'none';
  document.getElementById('successScreen').classList.add('show');
  document.getElementById('bookingIdDisplay').textContent = bookingId;
}

function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}
