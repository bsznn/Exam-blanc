// gateway/routes/stock.js
const express = require('express');
const lazyProxy = require('../utils/lazyProxy');
const router = express.Router();

router.use('/', lazyProxy('STOCK_SERVICE_URL', {
  proxyReqPathResolver: (req) => req.originalUrl,
}));

module.exports = router;