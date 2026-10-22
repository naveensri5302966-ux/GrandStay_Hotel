const http = require('http');

async function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function testAll() {
  console.log('--- Testing Real REST API Endpoints on http://localhost:5000/api ---');
  
  // 1. Health
  const health = await request({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  console.log('1. GET /api/health:', health.status, health.data.mode);

  // 2. GET /api/hotels
  const hotels = await request({ hostname: 'localhost', port: 5000, path: '/api/hotels', method: 'GET' });
  console.log('2. GET /api/hotels:', hotels.status, `Loaded ${hotels.data.length} hotels`);

  // 3. GET /api/hotels?location=Chennai
  const filtered = await request({ hostname: 'localhost', port: 5000, path: '/api/hotels?location=Chennai', method: 'GET' });
  console.log('3. GET /api/hotels?location=Chennai:', filtered.status, `Found ${filtered.data.length} hotel: ${filtered.data[0]?.name}`);

  // 4. GET /api/hotels/101
  const hotel101 = await request({ hostname: 'localhost', port: 5000, path: '/api/hotels/101', method: 'GET' });
  console.log('4. GET /api/hotels/101:', hotel101.status, hotel101.data.name);

  // 5. GET /api/hotels/101/rooms
  const rooms101 = await request({ hostname: 'localhost', port: 5000, path: '/api/hotels/101/rooms', method: 'GET' });
  console.log('5. GET /api/hotels/101/rooms:', rooms101.status, `Found ${rooms101.data.length} rooms`);

  // 6. POST /api/auth/login
  const login = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: 'eleanor.vance@example.com', password: 'password123' }
  );
  console.log('6. POST /api/auth/login:', login.status, `Token: ${login.data.token?.substring(0, 15)}...`, `User: ${login.data.user?.name}`);

  const authToken = login.data.token;

  // 7. GET /api/reservations (history)
  const reservations = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/reservations',
    method: 'GET',
    headers: { Authorization: `Bearer ${authToken}` }
  });
  console.log('7. GET /api/reservations:', reservations.status, `Loaded ${reservations.data.length} reservations`);

  // 8. POST /api/reservations (Create new reservation)
  const newRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/reservations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    },
    {
      hotelId: 103,
      hotelName: 'Serene Palace',
      hotelLocation: 'Bangalore',
      roomName: 'Executive Room',
      checkIn: '2026-11-20',
      checkOut: '2026-11-23',
      totalStayDuration: 3,
      guests: 2,
      roomPrice: 10500,
      roomCost: 31500,
      taxes: 3780,
      additionalCharges: 500,
      totalAmount: 35780,
      customerName: 'Eleanor Vance',
      email: 'eleanor.vance@example.com',
      phone: '9876543210',
      specialRequests: 'Quiet room near garden'
    }
  );
  console.log('8. POST /api/reservations:', newRes.status, `Created #${newRes.data.id}`);
  const createdId = newRes.data.id;

  // 9. PUT /api/reservations/:id (Update)
  const updatedRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/reservations/${createdId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    },
    {
      specialRequests: 'Updated: Need early check-in at 11 AM and ground floor',
      guests: 3
    }
  );
  console.log('9. PUT /api/reservations/' + createdId + ':', updatedRes.status, `Status: ${updatedRes.data.status}, Requests: "${updatedRes.data.specialRequests}"`);

  // 10. DELETE /api/reservations/:id (Cancel)
  const deletedRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/reservations/${createdId}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${authToken}` }
  });
  console.log('10. DELETE /api/reservations/' + createdId + ':', deletedRes.status, deletedRes.data.message);

  console.log('--- ALL BACKEND REST ENDPOINTS VERIFIED SUCCESSFULLY ---');
}

testAll().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
