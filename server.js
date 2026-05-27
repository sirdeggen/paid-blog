/**
 * Paid Blog - Custom Express app embedding Ghost.
 *
 * `app` is YOUR Express instance. Register middleware on it via `app.use()`
 * BEFORE Ghost's rootApp is mounted at the end of boot(). Ghost handles
 * everything that custom middleware does not.
 */

const express = require('express');
const ghost = require('/app/ghost/node_modules/ghost');

const app = express();

// ============================================================
// CUSTOM MIDDLEWARE - register here, before Ghost mounts
// ============================================================

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[Custom] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    poweredBy: 'custom-express + ghost',
    database: 'sqlite + knex'
  });
});

// Example: gate /members/api behind a subscription check
// app.use('/members/api', verifySubscription);

// ============================================================

async function boot() {
  console.log('Booting Ghost inside custom Express app...');

  const ghostServer = await ghost();

  // Mount Ghost LAST so custom middleware and routes above take priority
  app.use(ghostServer.rootApp);

  const port = process.env.PORT || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Paid Blog listening on port ${port}`);
  });
}

boot().catch((err) => {
  console.error('Failed to start custom Ghost application:', err);
  process.exit(1);
});

module.exports = app;
