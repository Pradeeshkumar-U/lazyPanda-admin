const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { supabase } = require('./supabase');
require('dotenv').config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const JWT_SECRET = process.env.JWT_SECRET || 'fm_admin_secure_jwt_secret_change_in_production_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Parses comma-separated allowed emails from environment variable
 */
function getEnvAllowedEmails() {
  const envEmails = process.env.ALLOWED_ADMIN_EMAILS || '';
  return envEmails
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Checks if the given email is an allowed admin
 * Queries:
 * 1) Supabase 'allowed_admins' or 'admins' table
 * 2) ALLOWED_ADMIN_EMAILS environment variable
 */
async function isEmailAllowed(email) {
  if (!email) return false;
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check environment variable list first (instant & reliable)
  const envEmails = getEnvAllowedEmails();
  if (envEmails.includes(normalizedEmail)) {
    return true;
  }

  // 2. Check Supabase 'allowed_admins' table
  try {
    const { data, error } = await supabase
      .from('allowed_admins')
      .select('email')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (!error && data && data.email) {
      return true;
    }
  } catch (err) {
    // If table doesn't exist yet, continue to fallback checks
  }

  // 3. Check Supabase 'admins' table fallback
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('email')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (!error && data && data.email) {
      return true;
    }
  } catch (err) {
    // ignore
  }

  return false;
}

/**
 * Fetches all allowed admin emails (for authorized admins to view)
 */
async function getAllowedAdmins() {
  const envEmails = getEnvAllowedEmails();
  const emailsSet = new Set(envEmails);

  try {
    const { data, error } = await supabase
      .from('allowed_admins')
      .select('id, email, name, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return {
        databaseAdmins: data,
        envAdmins: envEmails,
      };
    }
  } catch (err) {
    // table might not exist
  }

  return {
    databaseAdmins: [],
    envAdmins: envEmails,
  };
}

/**
 * Adds an allowed admin to the database
 */
async function addAllowedAdmin(email, name = '') {
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabase
    .from('allowed_admins')
    .insert([{ email: normalizedEmail, name }])
    .select();

  if (error) {
    throw new Error(error.message);
  }
  return data[0];
}

/**
 * Removes an allowed admin from the database
 */
async function removeAllowedAdmin(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const { error } = await supabase
    .from('allowed_admins')
    .delete()
    .ilike('email', normalizedEmail);

  if (error) {
    throw new Error(error.message);
  }
  return true;
}

/**
 * Verifies a Google ID token from frontend
 */
async function verifyGoogleCredential(credential) {
  if (!credential) {
    throw new Error('Missing Google credential token');
  }

  let payload;
  try {
    // Check token header algorithm
    let header = {};
    try {
      const parts = credential.split('.');
      if (parts.length >= 2) {
        const b64Header = parts[0].replace(/-/g, '+').replace(/_/g, '/');
        header = JSON.parse(Buffer.from(b64Header, 'base64').toString('utf8'));
      }
    } catch (e) {}

    // Only call googleClient.verifyIdToken for real Google tokens (RS256) when GOOGLE_CLIENT_ID is set
    if (GOOGLE_CLIENT_ID && header.alg === 'RS256') {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else {
      // Decode token for development testing or non-RS256 format
      let decoded = jwt.decode(credential);
      if (!decoded) {
        try {
          const parts = credential.split('.');
          if (parts.length >= 2) {
            const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            decoded = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
          } else {
            decoded = JSON.parse(credential);
          }
        } catch (e) {
          // ignore
        }
      }
      if (!decoded || !decoded.email) {
        throw new Error('Invalid token format');
      }
      payload = decoded;
    }
  } catch (err) {
    throw new Error(`Google authentication failed: ${err.message}`);
  }

  const email = (payload.email || '').toLowerCase();
  const name = payload.name || payload.given_name || email.split('@')[0];
  const picture = payload.picture || '';

  return {
    email,
    name,
    picture,
  };
}

/**
 * Issues a JWT token for an authorized admin
 */
function issueJwtToken(user) {
  return jwt.sign(
    {
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: 'admin',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verifies a Supabase OAuth session access token
 */
async function verifySupabaseToken(accessToken) {
  if (!accessToken) {
    throw new Error('Missing Supabase access token');
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    throw new Error('Supabase authentication failed: ' + (error?.message || 'User not found'));
  }

  const email = (user.email || '').toLowerCase();
  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    email.split('@')[0];
  const picture =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    '';

  return {
    email,
    name,
    picture,
  };
}

/**
 * Verifies a session JWT token
 */
function verifySessionToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  isEmailAllowed,
  getAllowedAdmins,
  addAllowedAdmin,
  removeAllowedAdmin,
  verifyGoogleCredential,
  verifySupabaseToken,
  issueJwtToken,
  verifySessionToken,
};
