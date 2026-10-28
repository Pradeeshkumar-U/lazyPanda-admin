const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || '';
const R2_PUBLIC_URL = (process.env.CLOUDFLARE_R2_PUBLIC_URL || '').replace(/\/$/, '');

// Cloudflare Images API Alternative
const IMAGES_API_TOKEN = process.env.CLOUDFLARE_IMAGES_API_TOKEN || '';
const IMAGES_ACCOUNT_HASH = process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH || '';

// Local uploads directory for fallback before credentials are added
const LOCAL_UPLOADS_DIR = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '..', 'uploads');

try {
  if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
    fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
  }
} catch (e) {
  // Ignore in read-only serverless environments
}

let s3Client = null;
if (ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Upload an image buffer to Cloudflare R2
 */
async function uploadToR2(key, buffer, contentType) {
  if (!s3Client || !R2_BUCKET_NAME) {
    throw new Error('Cloudflare R2 is not fully configured (check ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME in .env)');
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Return public URL or fallback
  const basePublicUrl = R2_PUBLIC_URL || `https://${R2_BUCKET_NAME}.${ACCOUNT_ID}.r2.cloudflarestorage.com`;
  return `${basePublicUrl}/${key}`;
}

/**
 * Process and upload channel image:
 * Generates:
 *  1) xs (50x50, cover)
 *  2) m (200x200, cover)
 * Uploads both to Cloudflare, returns { image_xs, image_m }
 */
async function processAndUploadImage(fileBuffer, folder = 'tamil') {
  const fileId = uuidv4();
  const xsKey = `${folder}/${fileId}_xs.jpg`;
  const mKey = `${folder}/${fileId}_m.jpg`;

  // 1. Process with Sharp
  // XS: 50x50 cover
  const xsBuffer = await sharp(fileBuffer)
    .rotate() // auto-orient
    .resize(50, 50, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();

  // M: 200x200 cover
  const mBuffer = await sharp(fileBuffer)
    .rotate()
    .resize(200, 200, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();

  // 2. Check if Cloudflare R2 credentials are available
  if (s3Client && R2_BUCKET_NAME) {
    try {
      const [xsUrl, mUrl] = await Promise.all([
        uploadToR2(xsKey, xsBuffer, 'image/jpeg'),
        uploadToR2(mKey, mBuffer, 'image/jpeg'),
      ]);

      return {
        image_xs: xsUrl,
        image_m: mUrl,
        provider: 'cloudflare-r2',
      };
    } catch (err) {
      console.error('[Storage] Error uploading to Cloudflare R2:', err);
      throw err;
    }
  }

  // 3. Fallback: Save locally if Cloudflare credentials are not provided yet
  console.warn('[Storage] Cloudflare credentials not detected in .env. Saving locally as fallback until you pass creds.');
  
  const xsLocalPath = path.join(LOCAL_UPLOADS_DIR, `${fileId}_xs.jpg`);
  const mLocalPath = path.join(LOCAL_UPLOADS_DIR, `${fileId}_m.jpg`);

  await Promise.all([
    fs.promises.writeFile(xsLocalPath, xsBuffer),
    fs.promises.writeFile(mLocalPath, mBuffer),
  ]);

  const port = process.env.PORT || 5000;
  return {
    image_xs: `http://localhost:${port}/uploads/${fileId}_xs.jpg`,
    image_m: `http://localhost:${port}/uploads/${fileId}_m.jpg`,
    provider: 'local-fallback (configure Cloudflare in backend/.env)',
  };
}

module.exports = {
  processAndUploadImage,
  LOCAL_UPLOADS_DIR,
};
