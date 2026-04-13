/* === ANOINTED HANDS · APP.JS === */

// ── Cloudinary Config
// ✏️ Replace these with your Cloudinary credentials
const CLOUDINARY_CLOUD_NAME   = 'drg56xfyc';
const CLOUDINARY_UPLOAD_PRESET = 'anointed_hands';

// ── Storage Keys
const KEYS = {
  products: 'ah_products',
  settings: 'ah_settings',
  orders:   'ah_orders',
};

// ── Defaults
const DEFAULT_SETTINGS = {
  cashApp:    '',
  zelle:      '',
  email:      '',
  formspree:  '',
  password:   'ouch2024',
};

// ── Storage helpers
function getStorage(key, fallback = null) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function setStorage(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

// ── Init
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  applySettings();
  renderProducts();
  initNav();
});

// ── Nav
function initNav() {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  toggle?.addEventListener('click', () => links.classList.toggle('open'));
  links?.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => links.classList.remove('open'))
  );
}

// ── Settings
function getSettings() { return getStorage(KEYS.settings, DEFAULT_SETTINGS); }

function applySettings() {
  const s = getSettings();
  const cashEl  = document.getElementById('cashAppHandle');
  const zelleEl = document.getElementById('zelleHandle');
  const emailEl = document.getElementById('contactEmail');
  if (cashEl  && s.cashApp) cashEl.textContent  = s.cashApp;
  if (zelleEl && s.zelle)   zelleEl.textContent  = s.zelle;
  if (emailEl && s.email)   emailEl.href         = `mailto:${s.email}`;
}

// ── Products
function getProducts() { return getStorage(KEYS.products, []); }

function renderProducts() {
  const products   = getProducts();
  const grid       = document.getElementById('productsGrid');
  const filtersEl  = document.getElementById('shopFilters');
  if (!grid) return;

  const activeFilter = document.querySelector('.filter-btn.active')?.dataset.cat || 'all';
  const cats = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  filtersEl.innerHTML = cats.map(c =>
    `<button class="filter-btn${c === activeFilter ? ' active' : ''}" data-cat="${c}"
      onclick="filterProducts('${c}')">${c === 'all' ? 'All Items' : c}</button>`
  ).join('');

  const filtered = activeFilter === 'all' ? products : products.filter(p => p.category === activeFilter);

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-shop">
      <span class="script" style="font-size:2rem;color:var(--gold-light)">Coming Soon</span>
      <p>New creations are being added. Check back soon or place a custom order.</p>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="product-card" onclick="openProduct(${p.id})">
      <div class="product-card-img">
        ${p.image
          ? `<img src="${p.image}" alt="${p.name}" />`
          : `<span>✦</span>`}
      </div>
      ${p.available === false ? '<div class="sold-overlay">Sold Out</div>' : ''}
      <div class="product-card-body">
        <div class="product-card-cat">${p.category || 'Handmade'}</div>
        <div class="product-card-name">${p.name}</div>
        <div class="product-card-footer">
          <span class="product-card-price">${p.price || 'Custom'}</span>
          ${p.stripeLink && p.available !== false
            ? `<a href="${p.stripeLink}" target="_blank" rel="noopener" class="btn-buy"
                onclick="event.stopPropagation()">Buy Now</a>`
            : p.available === false
              ? `<span class="badge sold">Sold Out</span>`
              : `<span class="badge">Available</span>`}
        </div>
      </div>
    </div>
  `).join('');
}

function filterProducts(cat) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-cat="${cat}"]`)?.classList.add('active');
  renderProducts();
}

// ── Product Detail Modal
function openProduct(id) {
  const p = getProducts().find(x => x.id === id);
  if (!p) return;

  document.getElementById('productModalCat').textContent  = p.category || 'Handmade';
  document.getElementById('productModalName').textContent = p.name;
  document.getElementById('productModalPrice').textContent = p.price || 'Price on request';
  document.getElementById('productModalDesc').textContent  = p.description || '';

  const imgEl = document.getElementById('productModalImg');
  imgEl.innerHTML = p.image
    ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover" />`
    : `<span style="font-family:'Great Vibes',cursive;font-size:2.5rem;color:var(--gold)">✦</span>`;

  // Actions
  const actions = document.getElementById('productModalActions');
  if (p.available === false) {
    actions.innerHTML = `
      <div class="sold-notice">This item has sold. Every piece is one of a kind — but we can make something just for you.</div>
      <a href="#custom" class="btn-primary" onclick="closeProductModal();document.getElementById('custom').scrollIntoView({{behavior:'smooth'}})">Request a Custom Order</a>`;
  } else if (p.stripeLink) {
    actions.innerHTML = `
      <a href="${p.stripeLink}" target="_blank" rel="noopener" class="btn-primary">Buy Now — Secure Checkout</a>
      <p style="font-size:.75rem;color:var(--text-light);text-align:center">Pay securely with card, Apple Pay, or Google Pay via Stripe.</p>
      <a href="#custom" class="btn-ghost" onclick="closeProductModal();document.getElementById('custom').scrollIntoView({{behavior:'smooth'}})">Request a Custom Version</a>`;
  } else {
    actions.innerHTML = `
      <a href="#custom" class="btn-primary" onclick="closeProductModal();document.getElementById('custom').scrollIntoView({{behavior:'smooth'}})">Request This Item</a>`;
  }

  document.getElementById('productModal').style.display = 'flex';
}

function closeProductModal(e) {
  if (!e || e.target === document.getElementById('productModal'))
    document.getElementById('productModal').style.display = 'none';
}

// ── Custom Order Form + Formspree
async function submitCustomOrder(e) {
  e.preventDefault();
  const form = e.target;
  const btn  = form.querySelector('button[type="submit"]');
  const data = Object.fromEntries(new FormData(form));

  // Save locally
  data.id   = Date.now();
  data.date = new Date().toLocaleDateString();
  const orders = getStorage(KEYS.orders, []);
  orders.unshift(data);
  setStorage(KEYS.orders, orders);

  // Send via Formspree if configured
  const formspreeUrl = getSettings().formspree;
  if (formspreeUrl) {
    btn.textContent = 'Sending...';
    btn.disabled = true;
    try {
      await fetch(formspreeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch(err) {
      console.warn('Formspree error:', err);
    }
  }

  form.style.display = 'none';
  document.getElementById('formSuccess').style.display = 'block';
}

// ── Admin Modal
function openAdminModal(e) {
  e?.preventDefault();
  document.getElementById('adminModal').style.display   = 'flex';
  document.getElementById('adminLogin').style.display    = 'block';
  document.getElementById('adminDashboard').style.display = 'none';
  document.getElementById('loginError').style.display    = 'none';
  document.getElementById('adminPassword').value         = '';
  setTimeout(() => document.getElementById('adminPassword').focus(), 100);
}
function closeAdminModal(e) {
  if (!e || e.target === document.getElementById('adminModal'))
    document.getElementById('adminModal').style.display = 'none';
}
function adminLogin() {
  const pw      = document.getElementById('adminPassword').value;
  const correct = getSettings().password || DEFAULT_SETTINGS.password;
  if (pw === correct) {
    document.getElementById('adminLogin').style.display     = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    renderAdminProducts();
    renderAdminOrders();
  } else {
    document.getElementById('loginError').style.display = 'block';
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminPassword').focus();
  }
}
function adminLogout() {
  document.getElementById('adminDashboard').style.display = 'none';
  document.getElementById('adminLogin').style.display      = 'block';
}
function showAdminTab(tab, btn) {
  document.querySelectorAll('.admin-tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${tab}`).style.display = 'block';
  btn.classList.add('active');
  if (tab === 'products') renderAdminProducts();
  if (tab === 'orders')   renderAdminOrders();
  if (tab === 'settings') loadAdminSettings();
}

// ── Cloudinary Upload
let pendingImageUrl = null;

function triggerImageUpload() {
  if (CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME') {
    alert('⚠️ Cloudinary is not set up yet.\n\nOpen app.js and replace YOUR_CLOUD_NAME and YOUR_UPLOAD_PRESET with your Cloudinary credentials.');
    return;
  }
  const widget = cloudinary.createUploadWidget({
    cloudName:    CLOUDINARY_CLOUD_NAME,
    uploadPreset: CLOUDINARY_UPLOAD_PRESET,
    sources:      ['local', 'camera'],
    multiple:     false,
    maxFileSize:  10000000,
    clientAllowedFormats: ['jpg','jpeg','png','webp','gif'],
    styles: {
      palette: {
        window: '#fdfaf5', windowBorder: '#c9b8e8', tabIcon: '#c8882a',
        menuIcons: '#7b6aaa', textDark: '#3a2e52', textLight: '#ffffff',
        link: '#c8882a', action: '#c8882a', inactiveTabIcon: '#b09fd4',
        error: '#c0392b', inProgress: '#c8882a', complete: '#2ecc71', sourceBg: '#f5f0ff',
      },
    },
  }, (error, result) => {
    if (!error && result?.event === 'success') {
      pendingImageUrl = result.info.secure_url;
      document.getElementById('imagePreview').innerHTML = `
        <img src="${pendingImageUrl}" alt="Preview"
          style="width:100%;height:130px;object-fit:cover;border-radius:10px;margin-top:.5rem;border:1.5px solid var(--lavender)" />
        <p style="font-size:.72rem;color:var(--lavender-dark);margin-top:.35rem;text-align:center">✦ Photo uploaded successfully</p>`;
      widget.close();
    }
  });
  widget.open();
}

// ── Add Product
function addProduct() {
  const name = document.getElementById('prodName').value.trim();
  if (!name) { alert('Please enter a product name.'); return; }

  const product = {
    id:          Date.now(),
    name,
    category:    document.getElementById('prodCategory').value.trim() || 'Handmade',
    price:       document.getElementById('prodPrice').value.trim(),
    description: document.getElementById('prodDesc').value.trim(),
    stripeLink:  document.getElementById('prodStripeLink').value.trim(),
    available:   document.getElementById('prodAvailable').value === 'true',
    image:       pendingImageUrl || null,
    date:        new Date().toLocaleDateString(),
  };

  const products = getProducts();
  products.unshift(product);
  setStorage(KEYS.products, products);
  renderProducts();
  renderAdminProducts();

  // Reset
  ['prodName','prodCategory','prodPrice','prodDesc','prodStripeLink'].forEach(id =>
    document.getElementById(id).value = '');
  document.getElementById('prodAvailable').value = 'true';
  document.getElementById('imagePreview').innerHTML = '';
  pendingImageUrl = null;
}

function deleteProduct(id) {
  if (!confirm('Remove this product from the shop?')) return;
  setStorage(KEYS.products, getProducts().filter(p => p.id !== id));
  renderProducts();
  renderAdminProducts();
}

function renderAdminProducts() {
  const products = getProducts();
  const list     = document.getElementById('adminProductList');
  if (!list) return;
  if (products.length === 0) {
    list.innerHTML = '<p style="color:var(--text-light);font-style:italic;margin-top:.5rem">No products yet. Add one above.</p>';
    return;
  }
  list.innerHTML = products.map(p => `
    <div class="admin-product-item">
      ${p.image
        ? `<img src="${p.image}" style="width:52px;height:52px;object-fit:cover;border-radius:8px;flex-shrink:0;border:1px solid var(--lavender)" />`
        : `<div style="width:52px;height:52px;border-radius:8px;background:var(--lavender-light);display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0">✦</div>`}
      <div style="flex:1;min-width:0">
        <strong style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</strong>
        <span style="font-size:.75rem;color:var(--text-light)">
          ${p.category} · ${p.price || 'No price'} · ${p.available !== false ? '✅ Available' : '❌ Sold Out'}
          ${p.stripeLink ? ' · 💳 Stripe ✓' : ' · ⚠️ No Stripe link'}
        </span>
      </div>
      <button class="delete-btn" onclick="deleteProduct(${p.id})" title="Remove product">✕</button>
    </div>
  `).join('');
}

// ── Settings
function loadAdminSettings() {
  const s = getSettings();
  document.getElementById('setCashApp').value    = s.cashApp   || '';
  document.getElementById('setZelle').value      = s.zelle     || '';
  document.getElementById('setEmail').value      = s.email     || '';
  document.getElementById('setFormspree').value  = s.formspree || '';
  document.getElementById('setPassword').value   = '';
}
function saveSettings() {
  const current = getSettings();
  const newPw   = document.getElementById('setPassword').value.trim();
  const s = {
    cashApp:   document.getElementById('setCashApp').value.trim(),
    zelle:     document.getElementById('setZelle').value.trim(),
    email:     document.getElementById('setEmail').value.trim(),
    formspree: document.getElementById('setFormspree').value.trim(),
    password:  newPw || current.password || DEFAULT_SETTINGS.password,
  };
  setStorage(KEYS.settings, s);
  applySettings();
  const msg = document.getElementById('settingsSaved');
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 3000);
}

// ── Orders
function renderAdminOrders() {
  const orders = getStorage(KEYS.orders, []);
  const list   = document.getElementById('adminOrderList');
  if (!list) return;
  if (orders.length === 0) {
    list.innerHTML = '<p style="color:var(--text-light);font-style:italic;margin-top:.5rem">No custom orders yet.</p>';
    return;
  }
  list.innerHTML = orders.map(o => `
    <div class="admin-product-item" style="flex-direction:column;align-items:flex-start;gap:.5rem">
      <div style="display:flex;justify-content:space-between;width:100%;align-items:center">
        <strong>${o.firstName || ''} ${o.lastName || ''}</strong>
        <span style="font-size:.72rem;color:var(--text-light);background:var(--lavender-light);padding:.2rem .6rem;border-radius:100px">${o.date}</span>
      </div>
      <div style="font-size:.82rem;color:var(--text-light)">
        📧 ${o.email}${o.phone ? ' &nbsp;·&nbsp; 📱 ' + o.phone : ''} &nbsp;·&nbsp; 💳 ${o.payment || 'Not specified'}
      </div>
      <div style="font-size:.85rem">🧶 <strong>${o.itemType}</strong></div>
      <div style="font-size:.88rem;font-style:italic;border-left:2px solid var(--lavender);padding-left:.75rem;color:var(--text);line-height:1.6">${o.description}</div>
    </div>
  `).join('');
}
