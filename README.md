# Anointed Hands · O.U.C.H.

**Original · Unique · Created · Handmade**

---

## First-Time Setup Checklist

Before going live, complete these 3 services. All are free to start.

---

## 1. Cloudinary — Product Photo Hosting (Free)

Lets her upload product photos from the admin panel, visible to all visitors.

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Copy your **Cloud Name** from the dashboard
3. Go to **Settings → Upload → Upload Presets → Add upload preset**
4. Set **Signing Mode** to **Unsigned**, name it `anointed_hands`, click Save
5. Open `app.js` and update the top two lines:

```js
const CLOUDINARY_CLOUD_NAME = "your_cloud_name_here";
const CLOUDINARY_UPLOAD_PRESET = "anointed_hands";
```

---

## 2. Stripe — Ready-Made Product Payments

Handles secure card payments (no Zelle needed for shop items).

1. Sign up at [stripe.com](https://stripe.com)
2. For each ready-made product, go to **Products → Add Product**
3. Fill in name, price, photo
4. Click **Create payment link** → copy the URL (looks like `https://buy.stripe.com/...`)
5. In the site's admin panel, paste that URL into the **Stripe Payment Link** field when adding a product

Stripe deposits money directly to her bank account. 2.9% + 30¢ per transaction.

---

## 3. Formspree — Custom Order Email Notifications (Free)

Emails her instantly when a customer submits a custom order request.

1. Sign up at [formspree.io](https://formspree.io)
2. Click **New Form**, name it `Anointed Hands Custom Orders`
3. Copy the endpoint URL (looks like `https://formspree.io/f/xxxxxxxx`)
4. In the site's admin panel → **Settings → Formspree Endpoint**, paste it in and Save

She'll get an email to whatever address she registered with on Formspree.

---

## Deploying to GitHub Pages

1. Create a free account at [github.com](https://github.com)
2. Click **+** → **New repository** → name it `anointed-hands` → **Public** → Create
3. Click **uploading an existing file** and drag in all 5 files
4. Go to **Settings → Pages** → Source: `main` branch, `/ (root)` → Save

Live at: `https://YOUR-USERNAME.github.io/anointed-hands/`

---

## Admin Panel Guide

Click the **⚙** button (bottom-right corner of the site).

**Default password:** `ouch2024` — change it immediately in Settings.

### Adding a Ready-Made Product

1. Admin → **Products** tab
2. Fill in name, category, price, description
3. Click **📷 Upload Photo** → pick photo from device (goes to Cloudinary)
4. Paste Stripe payment link
5. Set availability → **Add Product**

Customers see a **Buy Now** button that takes them to Stripe checkout.

### Custom Orders Flow

- Customer fills out the form → she gets an email (Formspree)
- She contacts them, agrees on price
- Customer pays via **Zelle**
- She makes it and ships it

### Settings to Fill In

- Zelle phone or email (shown on custom orders section)
- Contact email (mailto link in footer)
- Formspree endpoint (for order email notifications)
- Admin password (change from default!)

---

## Files

| File         | Purpose                                |
| ------------ | -------------------------------------- |
| `index.html` | Full website                           |
| `style.css`  | All styling                            |
| `app.js`     | Admin, products, Cloudinary, Formspree |
| `logo.png`   | Brand logo                             |
| `README.md`  | This guide                             |

---

_Made with love. Every stitch, every pixel._
