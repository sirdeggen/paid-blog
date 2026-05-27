/**
 * Paid Blog - Custom Middleware Layer
 *
 * This is YOUR Node.js application.
 * You have full control here to add any middleware you want
 * before requests reach Ghost.
 *
 * Common use cases:
 * - Subscription / payment verification
 * - Custom authentication
 * - Request logging & analytics
 * - Feature flags
 * - Rate limiting
 * - Custom API routes
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;
const GHOST_UPSTREAM = process.env.GHOST_UPSTREAM || 'http://localhost:2368';

console.log('Starting Paid Blog custom middleware layer...');
console.log(`Proxying to Ghost at ${GHOST_UPSTREAM}`);

// ============================================================
// CUSTOM MIDDLEWARE - ADD YOUR CODE HERE
// ============================================================

// 1. Request logging (example)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[Middleware] ${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// 2. Custom health endpoint for the middleware layer itself
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    layer: 'custom-middleware',
    upstream: GHOST_UPSTREAM,
    timestamp: new Date().toISOString()
  });
});

// 3. Example: Future payment / subscription check middleware
// app.use('/members', async (req, res, next) => {
//   const hasActiveSubscription = await checkUserSubscription(req);
//   if (!hasActiveSubscription) {
//     return res.status(403).json({ error: 'Active subscription required' });
//   }
//   next();
// });

// 4. You can add completely custom routes that don't touch Ghost at all
// app.get('/api/custom', customBusinessLogic);

// ============================================================
// PROXY EVERYTHING ELSE TO GHOST
// ============================================================

app.use('/', createProxyMiddleware({
  target: GHOST_UPSTREAM,
  changeOrigin: true,
  ws: true, // support websockets if Ghost needs them
  onProxyReq: (proxyReq, req) => {
    // You can add custom headers here (e.g. user info after payment check)
    // proxyReq.setHeader('X-Paid-Blog-User', req.user?.id || 'anonymous');
  }
}));

// ============================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Custom middleware layer listening on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} (all traffic goes through your middleware first)`);
});
