const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load .env for JWT_SECRET
try {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(envPath);
  }
} catch (_e) {}

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

const { spawn } = require('child_process');

async function ensureServerRunning() {
  try {
    await request({ hostname: 'localhost', port: 5000, path: '/api/hotels', method: 'GET' });
    return null; // Already running
  } catch (_e) {
    const serverProc = spawn(process.execPath, [path.join(__dirname, 'server', 'server.js')], {
      stdio: 'ignore'
    });
    for (let i = 0; i < 25; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        await request({ hostname: 'localhost', port: 5000, path: '/api/hotels', method: 'GET' });
        return serverProc;
      } catch (_e) {}
    }
    return serverProc;
  }
}

async function runSecurityTestSuite() {
  const spawnedServer = await ensureServerRunning();
  try {
    console.log('================================================================');
    console.log('🛡️  PHASE 2: API AUTHENTICATION & SECURITY TEST SUITE');
    console.log('================================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(title, condition, detail = '') {
      if (condition) {
        console.log(`  ✓ PASS: ${title} ${detail ? '(' + detail + ')' : ''}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${title} ${detail ? '(' + detail + ')' : ''}`);
      failed++;
    }
  }

  // 1. Login with valid credentials
  console.log('Test 1: Login with valid credentials (Eleanor Vance)');
  const validLogin = await request(
    { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'eleanor.vance@example.com', password: 'Password@123' }
  );
  assert('Valid login returns 200 OK', validLogin.status === 200);
  assert('Signed JWT token returned', Boolean(validLogin.data.token && validLogin.data.token.split('.').length === 3));
  const eleanorToken = validLogin.data.token;
  const eleanorId = validLogin.data.user.id;

  // Login with valid credentials for John Doe
  const johnLogin = await request(
    { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'john.doe@example.com', password: 'Password@456' }
  );
  assert('Second user (John Doe) valid login returns 200 OK', johnLogin.status === 200);
  const johnToken = johnLogin.data.token;
  const johnId = johnLogin.data.user.id;

  // 2. Login with incorrect password
  console.log('\nTest 2: Login with incorrect password');
  const badPassLogin = await request(
    { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'eleanor.vance@example.com', password: 'WrongPassword!999' }
  );
  assert('Incorrect password returns 401 Unauthorized', badPassLogin.status === 401, `Status: ${badPassLogin.status}`);
  assert('Clear error message for invalid password', badPassLogin.data.code === 'INVALID_PASSWORD');

  // Login with non-existent user
  const unknownUserLogin = await request(
    { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'nonexistent.user@example.com', password: 'Password@123' }
  );
  assert('Unknown user returns 401 Unauthorized', unknownUserLogin.status === 401);

  // 2b. Login Rate Limiting and Brute Force Lockout
  console.log('\nTest 2b: Login rate limiting and brute force lockout');
  let rateLimitTriggered = false;
  let retryAfterHeader = null;
  for (let i = 0; i < 6; i++) {
    const rlRes = await request(
      { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'bruteforce.test@example.com', password: 'BadPassword!123' }
    );
    if (rlRes.status === 429) {
      rateLimitTriggered = true;
      retryAfterHeader = rlRes.headers['retry-after'];
      break;
    }
  }
  assert('Rate limiter triggers 429 Too Many Requests after 5 consecutive failures', rateLimitTriggered);
  assert('Rate limiter response includes Retry-After header', Boolean(retryAfterHeader));

  // 3. Access reservation history without a token
  console.log('\nTest 3: Access reservation history without a token');
  const noTokenHistory = await request(
    { hostname: 'localhost', port: 5000, path: '/api/reservations', method: 'GET' }
  );
  assert('GET /reservations without token returns 401 Unauthorized', noTokenHistory.status === 401, `Status: ${noTokenHistory.status}`);

  // 4. Create a reservation without a token
  console.log('\nTest 4: Create a reservation without a token');
  const noTokenCreate = await request(
    { hostname: 'localhost', port: 5000, path: '/api/reservations', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { hotelId: 101, roomId: 1, checkIn: '2026-11-20', checkOut: '2026-11-23' }
  );
  assert('POST /reservations without token returns 401 Unauthorized', noTokenCreate.status === 401, `Status: ${noTokenCreate.status}`);

  // 5. Update and delete a reservation without a token
  console.log('\nTest 5: Update and delete a reservation without a token');
  const noTokenUpdate = await request(
    { hostname: 'localhost', port: 5000, path: '/api/reservations/RES-2026-849102', method: 'PUT', headers: { 'Content-Type': 'application/json' } },
    { specialRequests: 'Hacked without auth' }
  );
  assert('PUT /reservations/:id without token returns 401 Unauthorized', noTokenUpdate.status === 401, `Status: ${noTokenUpdate.status}`);

  const noTokenDelete = await request(
    { hostname: 'localhost', port: 5000, path: '/api/reservations/RES-2026-849102', method: 'DELETE' }
  );
  assert('DELETE /reservations/:id without token returns 401 Unauthorized', noTokenDelete.status === 401, `Status: ${noTokenDelete.status}`);

  // 6. Use an expired or tampered token
  console.log('\nTest 6: Use an expired or tampered token');
  // Tampered signature
  const tamperedToken = eleanorToken.substring(0, eleanorToken.length - 6) + 'xxxxxx';
  const tamperedReq = await request(
    { hostname: 'localhost', port: 5000, path: '/api/reservations', method: 'GET', headers: { Authorization: `Bearer ${tamperedToken}` } }
  );
  assert('Tampered JWT token returns 401 Unauthorized', tamperedReq.status === 401, `Status: ${tamperedReq.status}`);

  // Malformed token
  const malformedReq = await request(
    { hostname: 'localhost', port: 5000, path: '/api/reservations', method: 'GET', headers: { Authorization: 'Bearer not-even-a-jwt' } }
  );
  assert('Malformed token returns 401 Unauthorized', malformedReq.status === 401, `Status: ${malformedReq.status}`);

  // Genuinely expired signed JWT token (HMAC-SHA256 with past exp timestamp)
  const expHeader = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const expPayload = Buffer.from(JSON.stringify({
    userId: eleanorId,
    email: "eleanor.vance@example.com",
    role: "guest",
    iss: "grandstay-api",
    aud: "grandstay-client",
    iat: Math.floor(Date.now() / 1000) - 7200,
    exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
  })).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const expSigInput = `${expHeader}.${expPayload}`;
  const expSecret = process.env.JWT_SECRET || "c8f619b0d91244e8a7194f27be177263a921d749cf10427da914b4869c97161b";
  const expSig = crypto.createHmac("sha256", expSecret).update(expSigInput).digest("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const genuinelyExpiredToken = `${expSigInput}.${expSig}`;

  const expiredTokenReq = await request(
    { hostname: 'localhost', port: 5000, path: '/api/reservations', method: 'GET', headers: { Authorization: `Bearer ${genuinelyExpiredToken}` } }
  );
  assert('Genuinely expired JWT token returns 401 Unauthorized', expiredTokenReq.status === 401, `Status: ${expiredTokenReq.status}`);
  assert('Expired token response indicates TOKEN_EXPIRED code', expiredTokenReq.data?.code === 'TOKEN_EXPIRED' || (expiredTokenReq.data?.error && expiredTokenReq.data.error.includes('expired')));

  // 7. Multi-tenant isolation: Attempt to access another user's reservation
  console.log('\nTest 7: Attempt to access another user\'s reservation (Multi-tenant security)');
  // Eleanor's reservation is RES-2026-849102, John Doe's reservation is RES-2026-902341
  const crossUserRead = await request(
    { hostname: 'localhost', port: 5000, path: '/api/reservations/RES-2026-902341', method: 'GET', headers: { Authorization: `Bearer ${eleanorToken}` } }
  );
  assert('Eleanor attempting to read John Doe\'s reservation returns 403 Forbidden', crossUserRead.status === 403, `Status: ${crossUserRead.status}`);

  const crossUserUpdate = await request(
    { hostname: 'localhost', port: 5000, path: '/api/reservations/RES-2026-902341', method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${eleanorToken}` } },
    { specialRequests: 'Malicious modification of John\'s stay' }
  );
  assert('Eleanor attempting to update John Doe\'s reservation returns 403 Forbidden', crossUserUpdate.status === 403, `Status: ${crossUserUpdate.status}`);

  const crossUserDelete = await request(
    { hostname: 'localhost', port: 5000, path: '/api/reservations/RES-2026-902341', method: 'DELETE', headers: { Authorization: `Bearer ${eleanorToken}` } }
  );
  assert('Eleanor attempting to delete John Doe\'s reservation returns 403 Forbidden', crossUserDelete.status === 403, `Status: ${crossUserDelete.status}`);

  // 8. Permitted operations with valid authenticated session
  console.log('\nTest 8: Permitted operations with valid authenticated session');
  // Eleanor reads her own history
  const eleanorHistory = await request(
    { hostname: 'localhost', port: 5000, path: '/api/reservations', method: 'GET', headers: { Authorization: `Bearer ${eleanorToken}` } }
  );
  assert('Eleanor gets 200 OK for her own reservation history', eleanorHistory.status === 200);
  assert('Eleanor sees only her reservations', eleanorHistory.data.every(r => r.userId === eleanorId));

  // Eleanor reads her own specific reservation
  const ownReservationId = eleanorHistory.data[0]?.id || 'RES-2026-512948';
  const eleanorSingle = await request(
    { hostname: 'localhost', port: 5000, path: `/api/reservations/${ownReservationId}`, method: 'GET', headers: { Authorization: `Bearer ${eleanorToken}` } }
  );
  assert(`Eleanor can read her own reservation ${ownReservationId} (200 OK)`, eleanorSingle.status === 200);

  // Eleanor creates a new reservation with valid dates
  const newRes = await request(
    { hostname: 'localhost', port: 5000, path: '/api/reservations', method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${eleanorToken}` } },
    {
      hotelId: 105,
      roomId: 1,
      checkIn: '2026-12-10',
      checkOut: '2026-12-14',
      guests: 2,
      specialRequests: 'Quiet view of tea gardens'
    }
  );
  assert('Eleanor can create valid reservation (201 Created)', newRes.status === 201, `Created #${newRes.data.id}`);
  const createdId = newRes.data.id;

  // Eleanor updates her newly created reservation (PUT)
  const updateRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/reservations/${createdId}`, method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${eleanorToken}` } },
    { specialRequests: 'Updated: Need early check-in at 10 AM' }
  );
  assert('Eleanor can update her own reservation via PUT (200 OK)', updateRes.status === 200);

  // Eleanor updates her reservation using POST method (POST /reservations/:id)
  const updatePostRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/reservations/${createdId}`, method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${eleanorToken}` } },
    { specialRequests: 'Updated via POST method: High floor with balcony' }
  );
  assert('Eleanor can update reservation via POST method (200 OK)', updatePostRes.status === 200);

  // 9. Double-booking conflict test
  console.log('\nTest 9: Double-booking & Overlapping Date Collision Prevention');
  const conflictRes = await request(
    { hostname: 'localhost', port: 5000, path: '/api/reservations', method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${johnToken}` } },
    {
      hotelId: 105,
      roomId: 1,
      checkIn: '2026-12-12', // Overlaps with Eleanor's 10-14 Dec reservation!
      checkOut: '2026-12-16',
      guests: 2
    }
  );
  assert('Conflicting booking on overlapping dates returns 409 Conflict', conflictRes.status === 409, `Status: ${conflictRes.status}`);

  // Eleanor cancels her newly created reservation
  const deleteRes = await request(
    { hostname: 'localhost', port: 5000, path: `/api/reservations/${createdId}`, method: 'DELETE', headers: { Authorization: `Bearer ${eleanorToken}` } }
  );
  assert('Eleanor can cancel her own reservation (200 OK)', deleteRes.status === 200);

  console.log('\n================================================================');
  console.log(`📊 SECURITY TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
  } finally {
    if (spawnedServer) {
      try {
        spawnedServer.kill();
      } catch (_e) {}
    }
  }
}

runSecurityTestSuite().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
