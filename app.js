/* === ANOINTED HANDS · APP.JS === */

// ── Firebase Config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAXFXyjWERCOLyABnNgVDxPu58CvXrtP9w",
  authDomain: "anointed-hands-8bfd5.firebaseapp.com",
  projectId: "anointed-hands-8bfd5",
  storageBucket: "anointed-hands-8bfd5.firebasestorage.app",
  messagingSenderId: "891266608638",
  appId: "1:891266608638:web:8d739371a6b63dc86be4af"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── Cloudinary Config
const CLOUDINARY_CLOUD_NAME = 'drg56xfyc';
const CLOUDINARY_UPLOAD_PRESET = 'anointed_hands';

// ── Demo Placeholder Products (shown until client adds real ones)
const DEMO_PRODUCTS = [
  {
    id: 'demo1',
    name: 'Decorative Tissue Box Cover',
    category: 'Tissue Boxes',
    price: '$28.00',
    description: 'Elegant crocheted tissue box cover that adds a handmade touch to any room. Fits standard rectangular tissue boxes.',
    image: 'https://images.unsplash.com/photo-1600369672770-985fd30004eb?w=400&h=400&fit=crop',
    stripeLink: '#demo',
    available: true,
    date: 'Demo'
  },
  {
    id: 'demo2',
    name: 'Handmade Keychain',
    category: 'Key Chains',
    price: '$12.00',
    description: 'Cute crocheted keychain to brighten your keys. Available in various colors and designs. Great as gifts!',
    image: 'https://images.unsplash.com/photo-1623998022290-a74f8cc36563?w=400&h=400&fit=crop',
    stripeLink: '#demo',
    available: true,
    date: 'Demo'
  },
  {
    id: 'demo3',
    name: 'Cozy Cup Holder Sleeve',
    category: 'Cup Holders',
    price: '$15.00',
    description: 'Keep your drinks warm and your hands cool with this reusable crocheted cup sleeve. Eco-friendly alternative to paper sleeves.',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
    stripeLink: '#demo',
    available: true,
    date: 'Demo'
  },
  {
    id: 'demo4',
    name: 'Boho Crochet Purse',
    category: 'Purses',
    price: '$55.00',
    description: 'Stylish handmade purse with secure closure and interior pocket. Perfect for everyday use or special occasions.',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop',
    stripeLink: '#demo',
    available: true,
    date: 'Demo'
  },
  {
    id: 'demo5',
    name: 'Inspirational Wall Plaque',
    category: 'Wall Plaques',
    price: '$35.00',
    description: 'Beautiful crocheted wall hanging with inspirational message. Adds warmth and character to any space.',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=400&h=400&fit=crop',
    stripeLink: '#demo',
    available: true,
    date: 'Demo'
  },
  {
    id: 'demo6',
    name: 'Soft Baby Blanket',
    category: 'Baby Blankets',
    price: '$65.00',
    description: 'Ultra-soft baby blanket made with hypoallergenic yarn. Machine washable. Custom colors and personalization available.',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=400&fit=crop',
    stripeLink: '#demo',
    available: true,
    date: 'Demo'
  },
  {
    id: 'demo7',
    name: 'Chunky Knit Beanie',
    category: 'Hats',
    price: '$32.00',
    description: 'Warm and cozy handcrafted beanie perfect for chilly days. One size fits most. Available in multiple colors.',
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&h=400&fit=crop',
    stripeLink: '#demo',
    available: true,
    date: 'Demo'
  },
  {
    id: 'demo8',
    name: 'Infinity Scarf',
    category: 'Scarves',
    price: '$40.00',
    description: 'Elegant infinity scarf in a classic stitch pattern. Lightweight yet warm. A timeless accessory.',
    image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400&h=400&fit=crop',
    stripeLink: '#demo',
    available: false,
    date: 'Demo'
  }
];

// ── Defaults
const DEFAULT_SETTINGS = {
  email: '',
  formspree: '',
  password: 'ouch2024',
  featured: {
    name: 'Custom Crochet Creation',
    price: 'From $35',
    sub: 'Personalized · One of a Kind · Spirit-Led',
    image: '',
    available: true,
    stripeLink: '',
  },
};

// ── Global state
let productsCache = [];
let settingsCache = DEFAULT_SETTINGS;
let ordersCache = [];

// ── Firebase helpers
async function loadProducts() {
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    productsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Error loading products:', err);
    productsCache = [];
  }
  return productsCache.length > 0 ? productsCache : DEMO_PRODUCTS;
}

async function loadSettings() {
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'main'));
    if (docSnap.exists()) {
      settingsCache = { ...DEFAULT_SETTINGS, ...docSnap.data() };
    }
  } catch (err) {
    console.error('Error loading settings:', err);
  }
  return settingsCache;
}

async function loadOrders() {
  try {
    const snapshot = await getDocs(collection(db, 'orders'));
    ordersCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    ordersCache.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  } catch (err) {
    console.error('Error loading orders:', err);
    ordersCache = [];
  }
  return ordersCache;
}

async function saveProduct(product) {
  try {
    const docRef = await addDoc(collection(db, 'products'), product);
    product.id = docRef.id;
    productsCache.unshift(product);
    return true;
  } catch (err) {
    console.error('Error saving product:', err);
    alert('Error saving product. Please try again.');
    return false;
  }
}

async function removeProduct(id) {
  try {
    await deleteDoc(doc(db, 'products', id));
    productsCache = productsCache.filter(p => p.id !== id);
    return true;
  } catch (err) {
    console.error('Error deleting product:', err);
    alert('Error deleting product. Please try again.');
    return false;
  }
}

async function saveSettings(settings) {
  try {
    await setDoc(doc(db, 'settings', 'main'), settings);
    settingsCache = settings;
    return true;
  } catch (err) {
    console.error('Error saving settings:', err);
    alert('Error saving settings. Please try again.');
    return false;
  }
}

async function saveOrder(order) {
  try {
    order.timestamp = Date.now();
    const docRef = await addDoc(collection(db, 'orders'), order);
    order.id = docRef.id;
    ordersCache.unshift(order);
    return true;
  } catch (err) {
    console.error('Error saving order:', err);
    return false;
  }
}

// ── Init
document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  
  // Load data from Firebase
  await loadSettings();
  applySettings();
  
  await loadProducts();
  renderProducts();
  renderFeaturedPiece();

  initNav();
});

// ── Nav
function initNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  toggle?.addEventListener('click', () => links.classList.toggle('open'));
  links?.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => links.classList.remove('open'))
  );
}

// ── Settings
function applySettings() {
  const s = settingsCache;
  const emailEl = document.getElementById('contactEmail');
  if (emailEl && s.email) emailEl.href = `mailto:${s.email}`;
}

// ── Products
function getProducts() {
  return productsCache.length > 0 ? productsCache : DEMO_PRODUCTS;
}

function renderProducts() {
  const products = getProducts();
  const grid = document.getElementById('productsGrid');
  const filtersEl = document.getElementById('shopFilters');
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

  grid.innerHTML = filtered.map(p => {
    const isDemo = p.date === 'Demo';
    const buyAction = isDemo
      ? `onclick="event.stopPropagation(); alert('🛍️ Demo Mode\\n\\nThis is a placeholder item. When your real products are added, customers will be redirected to Stripe checkout.')"`
      : `href="${p.stripeLink}" target="_blank" rel="noopener" onclick="event.stopPropagation()"`;

    return `
    <div class="product-card" onclick="openProduct('${p.id}')">
      <div class="product-card-img">
        ${p.image
          ? `<img src="${p.image}" alt="${p.name}" />`
          : `<span>✦</span>`}
      </div>
      ${isDemo ? '<div class="demo-overlay">Demo</div>' : ''}
      ${p.available === false ? '<div class="sold-overlay">Sold Out</div>' : ''}
      <div class="product-card-body">
        <div class="product-card-cat">${p.category || 'Handmade'}</div>
        <div class="product-card-name">${p.name}</div>
        <div class="product-card-footer">
          <span class="product-card-price">${p.price || 'Custom'}</span>
          ${p.stripeLink && p.available !== false
            ? `<a ${buyAction} class="btn-buy">Buy Now</a>`
            : p.available === false
              ? `<span class="badge sold">Sold Out</span>`
              : `<span class="badge">Available</span>`}
        </div>
      </div>
    </div>
  `}).join('');
}

window.filterProducts = function(cat) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-cat="${cat}"]`)?.classList.add('active');
  renderProducts();
}

// ── Product Detail Modal
window.openProduct = function(id) {
  const products = getProducts();
  const p = products.find(x => x.id === id || x.id === String(id));
  if (!p) return;

  const isDemo = p.date === 'Demo';

  document.getElementById('productModalCat').textContent = p.category || 'Handmade';
  document.getElementById('productModalName').textContent = p.name;
  document.getElementById('productModalPrice').textContent = p.price || 'Price on request';
  document.getElementById('productModalDesc').textContent = p.description || '';

  const imgEl = document.getElementById('productModalImg');
  imgEl.innerHTML = p.image
    ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover" />`
    : `<span style="font-family:'Great Vibes',cursive;font-size:2.5rem;color:var(--gold)">✦</span>`;

  const actions = document.getElementById('productModalActions');
  if (p.available === false) {
    actions.innerHTML = `
      <div class="sold-notice">This item has sold. Every piece is one of a kind — but we can make something just for you.</div>
      <a href="#custom" class="btn-primary" onclick="closeProductModal();document.getElementById('custom').scrollIntoView({behavior:'smooth'})">Request a Custom Order</a>`;
  } else if (isDemo) {
    actions.innerHTML = `
      <div class="demo-notice" style="background:var(--lavender-light);padding:1rem;border-radius:8px;margin-bottom:1rem;text-align:center">
        <strong style="color:var(--lavender-dark)">✨ Demo Item</strong>
        <p style="font-size:.85rem;color:var(--text-light);margin-top:.5rem">This is a placeholder. Real products will link to Stripe checkout.</p>
      </div>
      <button class="btn-primary" onclick="alert('🛍️ Demo Mode\\n\\nWhen real products are added, this button will redirect to Stripe for secure payment.')">Buy Now — Secure Checkout</button>
      <p style="font-size:.75rem;color:var(--text-light);text-align:center">Pay securely with card, Apple Pay, or Google Pay via Stripe.</p>`;
  } else if (p.stripeLink) {
    actions.innerHTML = `
      <a href="${p.stripeLink}" target="_blank" rel="noopener" class="btn-primary">Buy Now — Secure Checkout</a>
      <p style="font-size:.75rem;color:var(--text-light);text-align:center">Pay securely with card, Apple Pay, or Google Pay via Stripe.</p>
      <a href="#custom" class="btn-ghost" onclick="closeProductModal();document.getElementById('custom').scrollIntoView({behavior:'smooth'})">Request a Custom Version</a>`;
  } else {
    actions.innerHTML = `
      <a href="#custom" class="btn-primary" onclick="closeProductModal();document.getElementById('custom').scrollIntoView({behavior:'smooth'})">Request This Item</a>`;
  }

  document.getElementById('productModal').style.display = 'flex';
}

window.closeProductModal = function(e) {
  if (!e || e.target === document.getElementById('productModal'))
    document.getElementById('productModal').style.display = 'none';
}

// ── Custom Order Form
window.submitCustomOrder = async function(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const data = Object.fromEntries(new FormData(form));

  data.date = new Date().toLocaleDateString();
  btn.textContent = 'Sending...';
  btn.disabled = true;

  // Save to Firebase
  await saveOrder(data);

  // Send via Formspree if configured
  const formspreeUrl = settingsCache.formspree;
  if (formspreeUrl) {
    try {
      await fetch(formspreeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.warn('Formspree error:', err);
    }
  }

  form.style.display = 'none';
  document.getElementById('formSuccess').style.display = 'block';
}

// ── Admin Modal
window.openAdminModal = function(e) {
  e?.preventDefault();
  document.getElementById('adminModal').style.display = 'flex';
  document.getElementById('adminLogin').style.display = 'block';
  document.getElementById('adminDashboard').style.display = 'none';
  document.getElementById('loginError').style.display = 'none';
  document.getElementById('adminPassword').value = '';
  setTimeout(() => document.getElementById('adminPassword').focus(), 100);
}

window.closeAdminModal = function(e) {
  if (!e || e.target === document.getElementById('adminModal'))
    document.getElementById('adminModal').style.display = 'none';
}

window.adminLogin = function() {
  const pw = document.getElementById('adminPassword').value;
  const correct = settingsCache.password || DEFAULT_SETTINGS.password;
  if (pw === correct) {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    renderAdminProducts();
    renderAdminOrders();
  } else {
    document.getElementById('loginError').style.display = 'block';
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminPassword').focus();
  }
}

window.adminLogout = function() {
  document.getElementById('adminDashboard').style.display = 'none';
  document.getElementById('adminLogin').style.display = 'block';
}

window.showAdminTab = async function(tab, btn) {
  document.querySelectorAll('.admin-tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${tab}`).style.display = 'block';
  btn.classList.add('active');
  if (tab === 'products') renderAdminProducts();
  if (tab === 'orders') {
    await loadOrders();
    renderAdminOrders();
  }
  if (tab === 'featured') loadAdminFeatured();
  if (tab === 'settings') loadAdminSettings();
}

// ── Featured Piece
function renderFeaturedPiece() {
  const f = settingsCache.featured || DEFAULT_SETTINGS.featured;

  const imgEl = document.getElementById('featuredImg');
  if (imgEl) {
    imgEl.innerHTML = f.image
      ? `<img src="${f.image}" alt="${f.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit" />`
      : `<span style="font-family:'Great Vibes',cursive;font-size:4rem;color:var(--gold)">✦</span>`;
  }

  const badgeEl = document.getElementById('featuredBadge');
  if (badgeEl) badgeEl.textContent = f.available !== false ? '✦ Available' : 'Sold Out';

  const nameEl = document.getElementById('featuredName');
  if (nameEl) nameEl.textContent = f.name || 'Custom Crochet Creation';

  const priceEl = document.getElementById('featuredPrice');
  if (priceEl) priceEl.textContent = f.price || 'From $35';

  const subEl = document.getElementById('featuredSub');
  if (subEl) subEl.textContent = f.sub || '';

  const actionEl = document.getElementById('featuredAction');
  if (actionEl) {
    if (f.available === false) {
      actionEl.innerHTML = `<a href="#custom" class="btn-primary" style="display:block;text-align:center;font-size:.65rem;padding:.7rem 1.5rem;margin-top:1rem;">Request a Custom Version</a>`;
    } else if (f.stripeLink) {
      actionEl.innerHTML = `<a href="${f.stripeLink}" target="_blank" rel="noopener" class="btn-primary" style="display:block;text-align:center;font-size:.65rem;padding:.7rem 1.5rem;margin-top:1rem;">Buy Now</a>`;
    } else {
      actionEl.innerHTML = `<a href="#custom" class="btn-primary" style="display:block;text-align:center;font-size:.65rem;padding:.7rem 1.5rem;margin-top:1rem;">Request This Item</a>`;
    }
  }
}

function loadAdminFeatured() {
  const f = settingsCache.featured || DEFAULT_SETTINGS.featured;
  document.getElementById('setFeaturedName').value = f.name || '';
  document.getElementById('setFeaturedPrice').value = f.price || '';
  document.getElementById('setFeaturedSub').value = f.sub || '';
  document.getElementById('setFeaturedAvailable').value = f.available !== false ? 'true' : 'false';
  document.getElementById('setFeaturedStripeLink').value = f.stripeLink || '';
  const preview = document.getElementById('featuredImagePreview');
  if (f.image) {
    preview.innerHTML = `
      <img src="${f.image}" alt="Current featured"
        style="width:100%;height:130px;object-fit:cover;border-radius:10px;margin-top:.5rem;border:1.5px solid var(--lavender)" />
      <p style="font-size:.72rem;color:var(--lavender-dark);margin-top:.35rem;text-align:center">Current photo</p>`;
  } else {
    preview.innerHTML = '';
  }
  pendingFeaturedImageUrl = null;
}

window.saveFeaturedForm = async function() {
  const featured = {
    name: document.getElementById('setFeaturedName').value.trim() || 'Custom Crochet Creation',
    price: document.getElementById('setFeaturedPrice').value.trim() || 'From $35',
    sub: document.getElementById('setFeaturedSub').value.trim() || '',
    available: document.getElementById('setFeaturedAvailable').value === 'true',
    stripeLink: document.getElementById('setFeaturedStripeLink').value.trim(),
    image: pendingFeaturedImageUrl || settingsCache.featured?.image || '',
  };

  const btn = document.querySelector('#tab-featured .btn-primary');
  btn.textContent = 'Saving...';
  btn.disabled = true;

  const success = await saveSettings({ ...settingsCache, featured });

  btn.textContent = 'Save Featured Piece';
  btn.disabled = false;

  if (success) {
    renderFeaturedPiece();
    pendingFeaturedImageUrl = null;
    const msg = document.getElementById('featuredSaved');
    msg.style.display = 'block';
    setTimeout(() => msg.style.display = 'none', 3000);
  }
}

// ── Cloudinary Upload
let pendingImageUrl = null;
let pendingFeaturedImageUrl = null;

window.triggerImageUpload = function() {
  if (CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME') {
    alert('⚠️ Cloudinary is not set up yet.\n\nOpen app.js and replace YOUR_CLOUD_NAME and YOUR_UPLOAD_PRESET with your Cloudinary credentials.');
    return;
  }
  const widget = cloudinary.createUploadWidget({
    cloudName: CLOUDINARY_CLOUD_NAME,
    uploadPreset: CLOUDINARY_UPLOAD_PRESET,
    sources: ['local', 'camera'],
    multiple: false,
    maxFileSize: 10000000,
    clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
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

window.triggerFeaturedImageUpload = function() {
  if (CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME') {
    alert('⚠️ Cloudinary is not set up yet.\n\nOpen app.js and replace YOUR_CLOUD_NAME and YOUR_UPLOAD_PRESET with your Cloudinary credentials.');
    return;
  }
  const widget = cloudinary.createUploadWidget({
    cloudName: CLOUDINARY_CLOUD_NAME,
    uploadPreset: CLOUDINARY_UPLOAD_PRESET,
    sources: ['local', 'camera'],
    multiple: false,
    maxFileSize: 10000000,
    clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
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
      pendingFeaturedImageUrl = result.info.secure_url;
      document.getElementById('featuredImagePreview').innerHTML = `
        <img src="${pendingFeaturedImageUrl}" alt="Preview"
          style="width:100%;height:130px;object-fit:cover;border-radius:10px;margin-top:.5rem;border:1.5px solid var(--lavender)" />
        <p style="font-size:.72rem;color:var(--lavender-dark);margin-top:.35rem;text-align:center">✦ Photo uploaded successfully</p>`;
      widget.close();
    }
  });
  widget.open();
}

// ── Add Product
window.addProduct = async function() {
  const name = document.getElementById('prodName').value.trim();
  if (!name) { alert('Please enter a product name.'); return; }

  const product = {
    name,
    category: document.getElementById('prodCategory').value.trim() || 'Handmade',
    price: document.getElementById('prodPrice').value.trim(),
    description: document.getElementById('prodDesc').value.trim(),
    stripeLink: document.getElementById('prodStripeLink').value.trim(),
    available: document.getElementById('prodAvailable').value === 'true',
    image: pendingImageUrl || null,
    date: new Date().toLocaleDateString(),
  };

  const btn = document.querySelector('#tab-products .btn-primary');
  btn.textContent = 'Adding...';
  btn.disabled = true;

  const success = await saveProduct(product);
  
  btn.textContent = 'Add Product to Shop';
  btn.disabled = false;

  if (success) {
    renderProducts();
    renderAdminProducts();

    // Reset form
    ['prodName', 'prodCategory', 'prodPrice', 'prodDesc', 'prodStripeLink'].forEach(id =>
      document.getElementById(id).value = '');
    document.getElementById('prodAvailable').value = 'true';
    document.getElementById('imagePreview').innerHTML = '';
    pendingImageUrl = null;
  }
}

window.deleteProduct = async function(id) {
  if (!confirm('Remove this product from the shop?')) return;
  
  const success = await removeProduct(id);
  if (success) {
    renderProducts();
    renderAdminProducts();
  }
}

function renderAdminProducts() {
  const products = productsCache;
  const list = document.getElementById('adminProductList');
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
      <button class="delete-btn" onclick="deleteProduct('${p.id}')" title="Remove product">✕</button>
    </div>
  `).join('');
}

// ── Settings
function loadAdminSettings() {
  const s = settingsCache;
  document.getElementById('setEmail').value = s.email || '';
  document.getElementById('setFormspree').value = s.formspree || '';
  document.getElementById('setPassword').value = '';
}

window.saveSettingsForm = async function() {
  const current = settingsCache;
  const newPw = document.getElementById('setPassword').value.trim();
  const s = {
    email: document.getElementById('setEmail').value.trim(),
    formspree: document.getElementById('setFormspree').value.trim(),
    password: newPw || current.password || DEFAULT_SETTINGS.password,
  };
  
  const btn = document.querySelector('#tab-settings .btn-primary');
  btn.textContent = 'Saving...';
  btn.disabled = true;

  const success = await saveSettings(s);
  
  btn.textContent = 'Save Settings';
  btn.disabled = false;

  if (success) {
    applySettings();
    const msg = document.getElementById('settingsSaved');
    msg.style.display = 'block';
    setTimeout(() => msg.style.display = 'none', 3000);
  }
}

// ── Orders
function renderAdminOrders() {
  const orders = ordersCache;
  const list = document.getElementById('adminOrderList');
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