const express = require('express');
const router = express.Router();
const multer = require('multer');
const { processAndUploadImage } = require('../services/storage');
const { requireAuth } = require('../middleware/auth');

// In-memory buffer storage for fast Sharp processing and direct Cloudflare upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WebP) are allowed!'), false);
    }
  },
});

/**
 * POST /api/upload
 * Protected route: Uploads image to Cloudflare, returns 50x50 and 200x200 URLs
 */
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const folder = req.query.folder || req.query.table || 'tamil';

  try {
    const result = await processAndUploadImage(req.file.buffer, folder);
    return res.json({
      image_xs: result.image_xs,
      image_m: result.image_m,
      provider: result.provider,
    });
  } catch (err) {
    console.error('[Upload Error]', err);
    return res.status(500).json({
      error: 'Failed to process and upload image to Cloudflare',
      details: err.message,
    });
  }
});

module.exports = router;
