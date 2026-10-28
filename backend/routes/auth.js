const express = require('express');
const router = express.Router();
const {
  verifyGoogleCredential,
  verifySupabaseToken,
  isEmailAllowed,
  issueJwtToken,
  getAllowedAdmins,
  addAllowedAdmin,
  removeAllowedAdmin,
} = require('../services/auth');
const { requireAuth } = require('../middleware/auth');

/**
 * POST /api/auth/google
 * Authenticates user via Google OAuth credential or Supabase Auth token.
 * Strictly verifies against allowed admin list in Supabase / env.
 * No registration allowed.
 */
router.post('/google', async (req, res) => {
  const { credential, supabaseToken } = req.body;

  if (!credential && !supabaseToken) {
    return res.status(400).json({ error: 'Missing authentication credentials (credential or supabaseToken required)' });
  }

  try {
    // 1. Verify token (either from Supabase Google Auth or direct Google Identity)
    let googleUser;
    if (supabaseToken) {
      googleUser = await verifySupabaseToken(supabaseToken);
    } else {
      googleUser = await verifyGoogleCredential(credential);
    }

    // 2. Check if email is in the allowed admin list
    const allowed = await isEmailAllowed(googleUser.email);
    if (!allowed) {
      console.warn(`[Auth] Denied unauthorized login attempt from: ${googleUser.email}`);
      return res.status(403).json({
        error: `Access Denied: The account (${googleUser.email}) is not authorized to access FM Admin. Only emails registered in Supabase can log in.`,
        email: googleUser.email,
      });
    }

    // 3. Issue JWT session token
    const token = issueJwtToken(googleUser);

    // 4. Set HttpOnly Cookie (cannot be inspected or read by browser scripts!)
    const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
    res.cookie('admin_session_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-domain cookie delivery on Vercel
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log(`[Auth] Admin successfully authenticated: ${googleUser.email}`);

    return res.json({
      success: true,
      user: {
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
      },
      token, // Also provided for API / mobile clients
    });
  } catch (err) {
    console.error('[Auth Error]', err.message);
    return res.status(401).json({ error: err.message || 'Authentication failed' });
  }
});

/**
 * GET /api/auth/me
 * Retrieves profile of currently authenticated admin
 */
router.get('/me', requireAuth, (req, res) => {
  return res.json({
    user: req.user,
  });
});

/**
 * POST /api/auth/logout
 * Clears authentication session cookie
 */
router.post('/logout', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  res.clearCookie('admin_session_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });
  return res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * GET /api/auth/admins
 * List authorized admin emails (Protected)
 */
router.get('/admins', requireAuth, async (req, res) => {
  try {
    const list = await getAllowedAdmins();
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch admins list' });
  }
});

/**
 * POST /api/auth/admins
 * Add a new authorized admin email (Protected)
 */
router.post('/admins', requireAuth, async (req, res) => {
  const { email, name } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  try {
    const created = await addAllowedAdmin(email, name);
    return res.status(201).json({ success: true, admin: created });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/auth/admins/:email
 * Remove an admin email (Protected)
 */
router.delete('/admins/:email', requireAuth, async (req, res) => {
  try {
    await removeAllowedAdmin(req.params.email);
    return res.json({ success: true, message: 'Admin removed successfully' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
