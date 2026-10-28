const { verifySessionToken } = require('../services/auth');

/**
 * Authentication Middleware:
 * Verifies JWT token from either:
 * 1) HTTP-Only cookie ('admin_session_token') - safest, invisible to inspect tab JS
 * 2) 'Authorization: Bearer <token>' header
 */
function requireAuth(req, res, next) {
  let token = null;

  // 1. Check cookies first (httpOnly)
  if (req.cookies && req.cookies.admin_session_token) {
    token = req.cookies.admin_session_token;
  }

  // 2. Check Authorization header
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication token is required',
    });
  }

  try {
    const decoded = verifySessionToken(token);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized: Invalid or expired session token',
    });
  }
}

module.exports = {
  requireAuth,
};
