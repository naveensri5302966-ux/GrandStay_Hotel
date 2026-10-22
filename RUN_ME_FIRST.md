# Grand Stay — Hotel Booking Experiments 1 & 2

## Requirements
Install Node.js 22.12+ and npm. Open a terminal inside this folder.

## First run
1. Run `npm install` (requires internet; installs Jest and React Testing Library).
2. Copy `.env.example` to `.env`.
3. In `.env`, set `NODE_ENV=development`, `CLIENT_URL=http://localhost:5173`, `ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173` and set `JWT_SECRET` to a new random value of at least 32 characters. Keep it private.
4. Run `npm run dev`. This starts the backend on port 5000 and the frontend on port 5173.
5. Open `http://localhost:5173` in your browser. Create an account or log in, browse hotels, choose a room and dates, enter guest details, confirm, and visit bookings to cancel.

## Tests
Run `npm run test:components` for real Jest + React Testing Library component tests. Run `npm test` for component and existing security/calculation/booking suites. Run `npm run build` for the production bundle.

## Experiment 2 checks
Open browser DevTools > Network and navigate between hotel details and booking routes to see lazy-loaded JS chunks. DevTools > Application shows manifest/service worker; service workers work on localhost or HTTPS. Use keyboard Tab/Enter to inspect booking controls.

## Notes
The provided source already includes route-level lazy loading, static asset caching, responsive images, API services, and input/authentication validation. This is a demonstration application; do not treat its JSON-file backend as production-ready storage.
