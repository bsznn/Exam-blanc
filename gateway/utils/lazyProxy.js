// gateway/utils/lazyProxy.js
const proxy = require('express-http-proxy');

const lazyProxy = (envVar, options = {}) => (req, res, next) => {
  const host = process.env[envVar];
  if (!host) {
    return res.status(503).json({ error: `${envVar} not configured` });
  }
  proxy(host, options)(req, res, next);
};

module.exports = lazyProxy;