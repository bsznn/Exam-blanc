// gateway/routes/notifi.js
const express = require('express');
const proxy = require('express-http-proxy');
require('dotenv').config();

const router = express.Router();

router.use('/', (req, res, next) => {
  const NOTIFI_SERVICE_URL = process.env.NOTIFI_SERVICE_URL;
  
  if (!NOTIFI_SERVICE_URL) {
    return res.status(503).json({ error: 'NOTIFI_SERVICE_URL not configured' });
  }

  proxy(NOTIFI_SERVICE_URL, {
    proxyReqPathResolver: (req) => req.originalUrl,
  })(req, res, next);
});

module.exports = router;