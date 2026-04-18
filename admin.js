const API = 'https://gaminghub-1-be7i.onrender.com/api';
let token = localStorage.getItem('adminToken');

document.addEventListener('DOMContentLoaded', () => {
  if (token) showDashboard();
});

// ===== AUTH =====
async function adminLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) {
      token = data.token;
      localStorage.setItem('adminToken', token);
      showDashboard();
    } else {
      document.getElementById('loginError').textContent = data.message || 'Invalid credentials';
    }
  } catch {
    document.getElementById('loginError').textContent = 'Server error. Try again.';
  }
}

function adminLogout() {
  localStorage.removeItem('adminToken');
  token = null;
  document.getElementById('adminDashboard').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
}

function showDashboard() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('adminDashboard').classList.remove('hidden');
  loadStats();
  loadAdminProducts();
}

// ===== STATS =====
async function loadStats() {
  try {
    const res = await fetch(`${API}/bookings/stats`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    document.getElementById('statRevenue').textContent = `₹${data.revenue || 0}`;
    document.getElementById('statBookings').textContent = data.total || 0;
    document.getElementById('statPending').textContent = data.pending || 0;
  } catch {}
  try {
    const res = await fetch(`${API}/products`);
    const products = await res.json();
    document.getElementById('statProducts').textContent = products.length;
  } catch {}
}

// ===== TABS =====
function switchTab(btn, tab) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
  document.getElementById('tab-' + tab).classList.remove('hidden');
  if (tab === 'bookings') loadAdminBookings();
}

// ===== PRODUCTS =====
async function loadAdminProducts() {
  try {
    const res = await fetch(`${API}/products`);
    const products = await res.json();
    document.getElementById('adminProductsList').innerHTML = products.map(p => `
      <div class="admin-product-row">
        <img src="${p.image || 'assets/placeholder.png'}" alt="${p.name}" onerror="this.src='assets/placeholder.png'" />
        <div class="admin-product-info">
          <div class="admin-product-name">${p.name}</div>
          <div class="admin-product-meta">${p.category} · ₹${p.price}/day ${p.trending ? '· 🔥 Trending' : ''}</div>
        </div>
        <div class="row-actions">
          <button class="btn-edit" onclick='openProductModal(${JSON.stringify(p)})'>Edit</button>
          <button class="btn-delete" onclick="deleteProduct('${p._id}')">Delete</button>
        </div>
      </div>
    `).join('');
  } catch {
    document.getElementById('adminProductsList').innerHTML = '<p style="color:#888;font-size:0.85rem;padding:10px">Could not load products</p>';
  }
}

function openProductModal(product) {
  document.getElementById('productModal').classList.remove('hidden');
  if (product) {
    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('editProductId').value = product._id;
    document.getElementById('pName').value = product.name;
    document.getElementById('pCategory').value = product.category;
    document.getElementById('pPrice').value = product.price;
    document.getElementById('pDesc').value = product.description || '';
    document.getElementById('pImage').value = product.image || '';
    document.getElementById('pTrending').checked = product.trending || false;
  } else {
    document.getElementById('modalTitle').textContent = 'Add Product';
    document.getElementById('editProductId').value = '';
    document.getElementById('pName').value = '';
    document.getElementById('pPrice').value = '';
    document.getElementById('pDesc').value = '';
    document.getElementById('pImage').value = '';
    document.getElementById('pTrending').checked = false;
  }
}

function closeProductModal() { document.getElementById('productModal').classList.add('hidden'); }

async function saveProduct() {
  const id = document.getElementById('editProductId').value;
  const fileInput = document.getElementById('pImageFile');
  let imageUrl = document.getElementById('pImage').value;

  if (fileInput.files[0]) {
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    try {
      const uploadRes = await fetch(`${API}/upload`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData
      });
      const uploadData = await uploadRes.json();
      if (uploadData.url) imageUrl = uploadData.url;
    } catch {}
  }

  const payload = {
    name: document.getElementById('pName').value,
    category: document.getElementById('pCategory').value,
    price: Number(document.getElementById('pPrice').value),
    description: document.getElementById('pDesc').value,
    image: imageUrl,
    trending: document.getElementById('pTrending').checked
  };

  const url = id ? `${API}/products/${id}` : `${API}/products`;
  const method = id ? 'PUT' : 'POST';

  try {
    await fetch(url, {
      method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    closeProductModal();
    loadAdminProducts();
    loadStats();
    showAdminToast(id ? 'Product updated!' : 'Product added!');
  } catch {
    showAdminToast('Error saving product');
  }
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try {
    await fetch(`${API}/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    loadAdminProducts();
    loadStats();
    showAdminToast('Product deleted');
  } catch { showAdminToast('Error deleting product'); }
}

// ===== BOOKINGS =====
async function loadAdminBookings() {
  try {
    const res = await fetch(`${API}/bookings`, { headers: { Authorization: `Bearer ${token}` } });
    const bookings = await res.json();
    document.getElementById('adminBookingsList').innerHTML = bookings.map(b => `
      <div class="admin-booking-row">
        <div class="booking-row-header">
          <span class="booking-row-id">ID: ${b._id?.slice(-8).toUpperCase()}</span>
          <span class="status-badge status-${b.status || 'pending'}">${(b.status || 'pending').toUpperCase()}</span>
        </div>
        <div class="booking-row-info">
          👤 ${b.name || 'N/A'} · 📞 ${b.phone} ${b.email ? '· ✉️ '+b.email : ''}<br>
          ${b.items?.map(i => i.name).join(', ') || ''}<br>
          📅 ${b.startDate?.slice(0,16).replace('T',' ')} → ${b.endDate?.slice(0,16).replace('T',' ')} · ₹${b.total}
        </div>
        <div class="booking-row-actions">
          <button class="btn-confirm" onclick="updateBookingStatus('${b._id}','confirmed')">✓ Confirm</button>
          <button class="btn-cancel" onclick="updateBookingStatus('${b._id}','cancelled')">✗ Cancel</button>
        </div>
      </div>
    `).join('');
  } catch {
    document.getElementById('adminBookingsList').innerHTML = '<p style="color:#888;font-size:0.85rem;padding:10px">Could not load bookings</p>';
  }
}

async function updateBookingStatus(id, status) {
  try {
    await fetch(`${API}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    loadAdminBookings();
    loadStats();
    showAdminToast(`Booking ${status}`);
  } catch { showAdminToast('Error updating booking'); }
}

function showAdminToast(msg) {
  let t = document.querySelector('.admin-toast');
  if (!t) { t = document.createElement('div'); t.className = 'admin-toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}
