/* === ANOINTED HANDS · APP.JS === */

// ── Firebase Config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithCredential, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2LTIVS9qOS_K4JC1EkCXRiATvmnqWbD0",
  authDomain: "anointedhandsshop.com",
  projectId: "anointed-hands-c87c6",
  storageBucket: "anointed-hands-c87c6.firebasestorage.app",
  messagingSenderId: "674554963797",
  appId: "1:674554963797:web:74528fa0398b3be90931dc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const ADMIN_EMAIL = 'jvonne8@gmail.com';

// ── Keep modal sizing in sync with the actual visible area (so the on-screen
// keyboard doesn't cover fields — mobile browsers shrink the visual viewport
// without shrinking the fixed-position layout viewport to match).
function syncViewportVars() {
  const vv = window.visualViewport;
  if (!vv) return;
  document.documentElement.style.setProperty('--vv-height', `${vv.height}px`);
  document.documentElement.style.setProperty('--vv-top', `${vv.offsetTop}px`);
}
if (window.visualViewport) {
  syncViewportVars();
  window.visualViewport.addEventListener('resize', syncViewportVars);
  window.visualViewport.addEventListener('scroll', syncViewportVars);
}

// Force the focused field into view once the keyboard finishes animating in —
// on a short/landscape screen, whatever sliver of space remains above the
// keyboard may not contain the field the browser scrolled to by default.
document.addEventListener('focusin', (e) => {
  if (!e.target.matches('input, textarea, select')) return;
  const el = e.target;
  setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300);
});

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

// ── Admin Modal (Google Sign-In, restricted to ADMIN_EMAIL)
window.openAdminModal = function(e) {
  e?.preventDefault();
  document.getElementById('adminModal').style.display = 'flex';
  document.getElementById('loginError').style.display = 'none';
  if (auth.currentUser?.email === ADMIN_EMAIL) {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    renderAdminProducts();
    renderAdminOrders();
  } else {
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
  }
}

window.closeAdminModal = function(e) {
  if (!e || e.target === document.getElementById('adminModal'))
    document.getElementById('adminModal').style.display = 'none';
}

function handleSignedInUser(user) {
  document.getElementById('adminModal').style.display = 'flex';
  if (user.email !== ADMIN_EMAIL) {
    signOut(auth);
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('loginError').textContent = 'This Google account is not authorized for admin access.';
    document.getElementById('loginError').style.display = 'block';
    return;
  }
  document.getElementById('adminLogin').style.display = 'none';
  document.getElementById('adminDashboard').style.display = 'block';
  renderAdminProducts();
  renderAdminOrders();
}

// Google Identity Services renders its own sign-in button and hands back a
// credential via this callback directly (no popup window, no full-page
// redirect) — sidesteps the cross-domain storage issues that broke both
// popup and redirect sign-in on some devices.
async function handleGoogleCredentialResponse(response) {
  document.getElementById('loginError').style.display = 'none';
  try {
    const credential = GoogleAuthProvider.credential(response.credential);
    const result = await signInWithCredential(auth, credential);
    handleSignedInUser(result.user);
  } catch (err) {
    console.error('Google sign-in error:', err);
    document.getElementById('loginError').textContent = 'Sign-in failed. Please try again.';
    document.getElementById('loginError').style.display = 'block';
  }
}

const GOOGLE_CLIENT_ID = '674554963797-k4n03qtrbfauotukr6o4bs49406lt48a.apps.googleusercontent.com';

function initGoogleSignInButton() {
  if (!window.google?.accounts?.id) { setTimeout(initGoogleSignInButton, 300); return; }
  google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleCredentialResponse });
  google.accounts.id.renderButton(document.getElementById('googleSignInBtn'), { theme: 'outline', size: 'large', text: 'signin_with', width: 280 });
}
initGoogleSignInButton();

window.adminLogout = async function() {
  await signOut(auth);
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
  const name = document.getElementById('setFeaturedName').value.trim() || 'Custom Crochet Creation';
  const price = document.getElementById('setFeaturedPrice').value.trim() || 'From $35';
  const image = pendingFeaturedImageUrl || settingsCache.featured?.image || '';
  let stripeLink = document.getElementById('setFeaturedStripeLink').value.trim();

  const btn = document.querySelector('#tab-featured .btn-primary');
  btn.disabled = true;

  if (!stripeLink) {
    btn.textContent = 'Creating payment link...';
    try {
      stripeLink = await createStripePaymentLink({ name, description: document.getElementById('setFeaturedSub').value.trim(), price, image });
    } catch (err) {
      console.error('Stripe payment link error:', err);
      if (!confirm(`Could not create a Stripe payment link automatically (${err.message}).\n\nSave without one for now? You can paste a link in later.`)) {
        btn.textContent = 'Save Featured Piece';
        btn.disabled = false;
        return;
      }
    }
  }

  const featured = {
    name,
    price,
    sub: document.getElementById('setFeaturedSub').value.trim() || '',
    available: document.getElementById('setFeaturedAvailable').value === 'true',
    stripeLink,
    image,
  };

  btn.textContent = 'Saving...';

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

// ── Image Upload (resized/compressed client-side before upload, for faster uploads on slow connections)
let pendingImageUrl = null;
let pendingFeaturedImageUrl = null;

function compressImage(file, maxDimension = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not read image'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) { height = Math.round(height * maxDimension / width); width = maxDimension; }
          else { width = Math.round(width * maxDimension / height); height = maxDimension; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Compression failed')), 'image/jpeg', quality);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function uploadToCloudinary(blob) {
  const formData = new FormData();
  formData.append('file', blob);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return data.secure_url;
}

window.triggerImageUpload = function() {
  document.getElementById('productImageInput').click();
}

window.triggerFeaturedImageUpload = function() {
  document.getElementById('featuredImageInput').click();
}

window.handleImageFile = async function(e, target) {
  const file = e.target.files[0];
  if (!file) return;
  const previewId = target === 'featured' ? 'featuredImagePreview' : 'imagePreview';
  const preview = document.getElementById(previewId);
  preview.innerHTML = `<p style="font-size:.72rem;color:var(--lavender-dark);margin-top:.35rem;text-align:center">Uploading…</p>`;
  try {
    const compressed = await compressImage(file);
    const url = await uploadToCloudinary(compressed);
    if (target === 'featured') pendingFeaturedImageUrl = url; else pendingImageUrl = url;
    preview.innerHTML = `
      <img src="${url}" alt="Preview"
        style="width:100%;height:130px;object-fit:cover;border-radius:10px;margin-top:.5rem;border:1.5px solid var(--lavender)" />
      <p style="font-size:.72rem;color:var(--lavender-dark);margin-top:.35rem;text-align:center">✦ Photo uploaded successfully</p>`;
  } catch (err) {
    console.error('Image upload error:', err);
    preview.innerHTML = `<p style="font-size:.72rem;color:#c0392b;margin-top:.35rem;text-align:center">Upload failed. Please try again.</p>`;
  }
  e.target.value = '';
}

// ── Stripe Payment Links (created automatically via the server-side Worker)
async function createStripePaymentLink({ name, description, price, image }) {
  const idToken = await auth.currentUser.getIdToken();
  const res = await fetch('/api/create-payment-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ name, description, price, image }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create payment link');
  return data.url;
}

// ── Add Product
window.addProduct = async function() {
  const name = document.getElementById('prodName').value.trim();
  if (!name) { alert('Please enter a product name.'); return; }

  const category = document.getElementById('prodCategory').value.trim() || 'Handmade';
  const price = document.getElementById('prodPrice').value.trim();
  const description = document.getElementById('prodDesc').value.trim();
  let stripeLink = document.getElementById('prodStripeLink').value.trim();

  const btn = document.querySelector('#tab-products .btn-primary');
  btn.disabled = true;

  if (!stripeLink) {
    btn.textContent = 'Creating payment link...';
    try {
      stripeLink = await createStripePaymentLink({ name, description, price, image: pendingImageUrl });
    } catch (err) {
      console.error('Stripe payment link error:', err);
      if (!confirm(`Could not create a Stripe payment link automatically (${err.message}).\n\nAdd the product without one for now? You can paste a link in later.`)) {
        btn.textContent = 'Add Product to Shop';
        btn.disabled = false;
        return;
      }
    }
  }

  const product = {
    name,
    category,
    price,
    description,
    stripeLink,
    available: document.getElementById('prodAvailable').value === 'true',
    image: pendingImageUrl || null,
    date: new Date().toLocaleDateString(),
  };

  btn.textContent = 'Adding...';

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
}

window.saveSettingsForm = async function() {
  const s = {
    ...settingsCache,
    email: document.getElementById('setEmail').value.trim(),
    formspree: document.getElementById('setFormspree').value.trim(),
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
      <div style="width:100%;border-top:1px solid var(--lavender-light);margin-top:.5rem;padding-top:.75rem">
        ${!o.depositLink ? `
          <div style="display:flex;gap:.5rem;align-items:flex-end;flex-wrap:wrap">
            <div style="flex:1;min-width:120px"><label style="font-size:.75rem">Agreed Total Price ($)</label><input type="text" id="orderPrice-${o.id}" class="admin-input" placeholder="e.g. 75.00" /></div>
            <button class="btn-primary" style="font-size:.75rem;padding:.6rem 1rem;white-space:nowrap" onclick="createDepositLink('${o.id}')">Set Price & Create Deposit Link</button>
          </div>
          <p style="font-size:.7rem;color:var(--text-light);margin-top:.3rem;font-style:italic">Creates a 50% deposit payment link to send her customer. Come back once the piece is finished to create the balance link for the other 50%.</p>
        ` : `
          <div style="font-size:.8rem;margin-bottom:.4rem">💰 Total agreed: $${o.totalPrice}</div>
          <div style="font-size:.8rem;margin-bottom:.4rem;word-break:break-all">✅ Deposit link: <a href="${o.depositLink}" target="_blank" rel="noopener">${o.depositLink}</a></div>
          ${o.balanceLink
            ? `<div style="font-size:.8rem;word-break:break-all">✅ Balance link: <a href="${o.balanceLink}" target="_blank" rel="noopener">${o.balanceLink}</a></div>`
            : `<button class="btn-ghost" style="font-size:.75rem;padding:.5rem 1rem" onclick="createBalanceLink('${o.id}')">Item Finished — Create Balance Payment Link</button>`}
        `}
      </div>
    </div>
  `).join('');
}

window.createDepositLink = async function(orderId) {
  const priceInput = document.getElementById(`orderPrice-${orderId}`);
  const totalPrice = parseFloat(priceInput.value);
  if (!totalPrice || totalPrice <= 0) { alert('Enter a valid total price first.'); return; }

  const order = ordersCache.find(o => o.id === orderId);
  if (!order) return;

  try {
    const depositLink = await createStripePaymentLink({
      name: `Custom Order Deposit — ${order.itemType || 'Crochet Item'}`,
      description: `50% deposit for ${order.firstName || ''} ${order.lastName || ''}'s custom order. Total agreed price: $${totalPrice.toFixed(2)}.`,
      price: (totalPrice / 2).toFixed(2),
    });
    await setDoc(doc(db, 'orders', orderId), { totalPrice: totalPrice.toFixed(2), depositLink }, { merge: true });
    order.totalPrice = totalPrice.toFixed(2);
    order.depositLink = depositLink;
    renderAdminOrders();
  } catch (err) {
    console.error('Deposit link error:', err);
    alert('Could not create the deposit payment link: ' + err.message);
  }
}

window.createBalanceLink = async function(orderId) {
  const order = ordersCache.find(o => o.id === orderId);
  if (!order || !order.totalPrice) return;

  try {
    const balanceLink = await createStripePaymentLink({
      name: `Custom Order Balance — ${order.itemType || 'Crochet Item'}`,
      description: `Remaining 50% balance for ${order.firstName || ''} ${order.lastName || ''}'s custom order. Total agreed price: $${order.totalPrice}.`,
      price: (parseFloat(order.totalPrice) / 2).toFixed(2),
    });
    await setDoc(doc(db, 'orders', orderId), { balanceLink }, { merge: true });
    order.balanceLink = balanceLink;
    renderAdminOrders();
  } catch (err) {
    console.error('Balance link error:', err);
    alert('Could not create the balance payment link: ' + err.message);
  }
}