const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const channelRoutes = require('./routes/channels');
const categoryRoutes = require('./routes/categories');
const versionRoutes = require('./routes/version');
const uploadRoutes = require('./routes/upload');
const reportRoutes = require('./routes/reports');
const { LOCAL_UPLOADS_DIR } = require('./services/storage');

const app = express();
const PORT = process.env.PORT || 5000;

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process Warning] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Process Error] Uncaught Exception:', err);
});

// Enable CORS with credentials for cookie-based JWT authentication
const allowedOrigins = [
  'https://lazypanda-admin.vercel.app',
  'https://lazyPanda-admin.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const lowerOrigin = origin.toLowerCase();
      if (
        allowedOrigins.some(o => o.toLowerCase() === lowerOrigin) ||
        lowerOrigin.includes('lazypanda-admin.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local fallback uploads if needed
app.use('/uploads', express.static(LOCAL_UPLOADS_DIR));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/version', versionRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reports', reportRoutes);

// --- Health / Status ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'FM Admin Secure Backend',
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend if production build exists in ../frontend/dist
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global safe error handler - prevents leaking internal stack traces or DB details to browser
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error occurred',
  });
});

if (require.main === module && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`🚀 FM Admin Secure Backend running on port ${PORT}`);
    console.log(`🔒 Authentication: Google Auth + JWT Protected`);
    console.log(`☁️ Storage: Cloudflare (R2/Images)`);
    console.log(`=================================================\n`);
  });
}

module.exports = app;
