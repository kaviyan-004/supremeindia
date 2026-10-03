/**
 * Automated Security & Access Control Test Suite
 * Verifies that users can ONLY access and modify their own records across all routes.
 */

const crypto = require('crypto');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

// Dynamically load JWT_SECRET from environment or .env.local
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const match = fs.readFileSync(envPath, 'utf8').match(/JWT_SECRET=([^\r\n]+)/);
    if (match) JWT_SECRET = match[1].trim();
  }
}
if (!JWT_SECRET) {
  console.error('JWT_SECRET is not set. Set it in your environment before running this script.');
  process.exit(1);
}

function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = Buffer.from(JSON.stringify({ ...payload, iat: now, exp: now + 3600 }))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const data = `${header}.${fullPayload}`;
  const sig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${data}.${sig}`;
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, options);
  let json = null;
  try {
    json = await res.json();
  } catch (e) {}
  return { status: res.status, json, headers: res.headers };
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING ROUTE OWNERSHIP & ACCESS CONTROL TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Create tokens for two distinct users: User A and User B
  const userAToken = signToken({
    sub: '6aa8ce8cc0d31ca63228ec11',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '9111111111',
    role: 'customer',
  });

  const userBToken = signToken({
    sub: '6aa8ce8cc0d31ca63228ec22',
    name: 'Bob Smith',
    email: 'bob@example.com',
    phone: '9222222222',
    role: 'customer',
  });

  const adminToken = signToken({
    sub: 'admin_1',
    name: 'Store Owner',
    email: 'admin@supremeindia.com',
    phone: '+91 9876543210',
    role: 'admin',
  });

  // 2. User A creates an order
  const orderRes = await request('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `si_session=${userAToken}`,
    },
    body: JSON.stringify({
      items: [
        {
          productId: '6aa8cd116b00b11de89d858c',
          name: 'Supreme Graphic Tee',
          price: 799,
          quantity: 1,
          size: 'L',
          color: 'Black',
        },
      ],
      subtotal: 799,
      total: 799,
      shippingAddress: {
        line1: '123 Test St',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        phone: '9111111111',
      },
      paymentMethod: 'cod',
    }),
  });

  assert(orderRes.status === 200, 'User A can create an order successfully');
  const userAOrderNumber = orderRes.json?.orderNumber;
  console.log(`   Order created: ${userAOrderNumber}\n`);

  // TEST 1: IDOR Protection — User B attempts to read User A's order by orderNumber
  const idorAttempt = await request(`/api/orders?orderNumber=${userAOrderNumber}`, {
    headers: {
      Cookie: `si_session=${userBToken}`,
    },
  });
  assert(
    idorAttempt.status === 403,
    `User B reading User A's order blocked with 403 Forbidden (got ${idorAttempt.status})`
  );

  // TEST 2: Guest Snooping Protection — Unauthenticated request without verification parameter
  const guestSnoop = await request(`/api/orders?orderNumber=${userAOrderNumber}`);
  assert(
    guestSnoop.status === 403,
    `Unauthenticated guest snooping blocked without verification parameter (got ${guestSnoop.status})`
  );

  // TEST 3: Guest with WRONG verification parameter
  const guestWrongVerify = await request(
    `/api/orders?orderNumber=${userAOrderNumber}&verify=wrong@random.com`
  );
  assert(
    guestWrongVerify.status === 403,
    `Guest with incorrect verification phone/email blocked with 403 Forbidden (got ${guestWrongVerify.status})`
  );

  // TEST 4: Guest with CORRECT phone/email verification parameter
  const guestValidVerify = await request(
    `/api/orders?orderNumber=${userAOrderNumber}&verify=alice@example.com`
  );
  assert(
    guestValidVerify.status === 200,
    `Guest with matching phone/email verification CAN view order (got ${guestValidVerify.status})`
  );

  // TEST 5: Legitimate Owner Access — User A reads their own order
  const ownerRead = await request(`/api/orders?orderNumber=${userAOrderNumber}`, {
    headers: {
      Cookie: `si_session=${userAToken}`,
    },
  });
  assert(
    ownerRead.status === 200,
    `User A can read their own order (got ${ownerRead.status})`
  );

  // TEST 6: Store Owner / Admin Access — Admin can read any order for fulfillment
  const adminRead = await request(`/api/orders?orderNumber=${userAOrderNumber}`, {
    headers: {
      Cookie: `si_session=${adminToken}`,
    },
  });
  assert(
    adminRead.status === 200,
    `Admin can read any order for fulfillment (got ${adminRead.status})`
  );

  // TEST 7: Customer B blocked from Admin endpoints
  const adminEndpoints = [
    '/api/admin/orders',
    '/api/admin/customers',
    '/api/admin/custom-orders',
    '/api/admin/bulk-orders',
  ];

  for (const ep of adminEndpoints) {
    const custOnAdmin = await request(ep, {
      headers: {
        Cookie: `si_session=${userBToken}`,
      },
    });
    assert(
      custOnAdmin.status === 401,
      `Non-admin customer blocked from ${ep} with 401 Unauthorized (got ${custOnAdmin.status})`
    );
  }

  // TEST 8: Admin allowed on Admin endpoints
  const adminOrders = await request('/api/admin/orders', {
    headers: {
      Cookie: `si_session=${adminToken}`,
    },
  });
  assert(
    adminOrders.status === 200,
    `Admin successfully authorized on /api/admin/orders (got ${adminOrders.status})`
  );

  console.log('\n====================================================');
  console.log(`🏁 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
