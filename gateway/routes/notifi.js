// gateway/routes/notifi.js
const express = require('express');
const lazyProxy = require('../utils/lazyProxy');
const router = express.Router();

router.use('/', lazyProxy('NOTIFI_SERVICE_URL', {
  proxyReqPathResolver: (req) => req.originalUrl,
}));

module.exports = router;