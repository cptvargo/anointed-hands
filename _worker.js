const ADMIN_EMAIL = 'jvonne8@gmail.com';
const FIREBASE_API_KEY = 'AIzaSyB2LTIVS9qOS_K4JC1EkCXRiATvmnqWbD0';
const FIREBASE_AUTH_DOMAIN = 'anointed-hands-c87c6.firebaseapp.com';

// Proxies Firebase's OAuth handler pages through our own domain instead of
// firebaseapp.com. Firebase Hosting does this automatically for sites hosted
// there; since this site is on Cloudflare instead, sign-in would otherwise
// need to correlate state across two different domains — which is exactly
// what modern browsers' storage-partitioning rules break, causing sign-in
// to loop. Keeping the whole flow on one origin avoids that entirely.
async function proxyAuthHandler(request) {
  const url = new URL(request.url);
  const targetUrl = `https://${FIREBASE_AUTH_DOMAIN}${url.pathname}${url.search}`;
  const response = await fetch(new Request(targetUrl, request));

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('Location');
    if (location && location.includes(FIREBASE_AUTH_DOMAIN)) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Location', location.replace(`https://${FIREBASE_AUTH_DOMAIN}`, `https://${url.hostname}`));
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers: newHeaders });
    }
  }
  return response;
}

async function verifyAdmin(request) {
  const authHeader = request.headers.get('Authorization') || '';
  const idToken = authHeader.replace(/^Bearer\s+/i, '');
  if (!idToken) return false;

  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) return false;

  const data = await res.json();
  return data.users?.[0]?.email === ADMIN_EMAIL;
}

function parsePriceToCents(priceStr) {
  const num = parseFloat(String(priceStr || '').replace(/[^0-9.]/g, ''));
  if (!num || num <= 0) return null;
  return Math.round(num * 100);
}

async function stripeRequest(env, path, params) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Stripe request to ${path} failed`);
  return data;
}

async function createPaymentLink(env, { name, description, price, image }) {
  if (!env.STRIPE_SECRET_KEY) throw new Error('Stripe is not configured on the server yet.');
  const cents = parsePriceToCents(price);
  if (!cents) throw new Error('Enter a valid price before generating a payment link.');

  const productParams = new URLSearchParams();
  productParams.set('name', name);
  if (description) productParams.set('description', description.slice(0, 500));
  if (image) productParams.append('images[]', image);
  const product = await stripeRequest(env, 'products', productParams);

  const priceParams = new URLSearchParams();
  priceParams.set('unit_amount', String(cents));
  priceParams.set('currency', 'usd');
  priceParams.set('product', product.id);
  const priceObj = await stripeRequest(env, 'prices', priceParams);

  const linkParams = new URLSearchParams();
  linkParams.set('line_items[0][price]', priceObj.id);
  linkParams.set('line_items[0][quantity]', '1');
  const link = await stripeRequest(env, 'payment_links', linkParams);

  return link.url;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/__/auth/')) {
      return proxyAuthHandler(request);
    }

    if (url.pathname === '/api/create-payment-link' && request.method === 'POST') {
      try {
        if (!(await verifyAdmin(request))) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body = await request.json();
        const paymentLinkUrl = await createPaymentLink(env, body);
        return Response.json({ url: paymentLinkUrl });
      } catch (err) {
        return Response.json({ error: err.message || 'Server error' }, { status: 500 });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
