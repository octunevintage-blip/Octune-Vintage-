import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import cloudinary from '../config/cloudinary.js';
import crypto from 'crypto';
import sharp from 'sharp';

// 1. Initialize Cloudflare R2 Client (Zero Data Transfer Fees - Primary Choice)
let r2Client = null;
if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
  r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

// 2. Initialize AWS S3 Client (Fallback if R2 is not configured)
let s3Client = null;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'eu-north-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Upload an image buffer to Cloudflare R2, AWS S3, or Cloudinary.
 * Automatically compresses images to high-quality WebP format (~150KB) to maximize speed and minimize storage.
 * @param {Buffer} fileBuffer - The file buffer from multer.
 * @param {string} mimeType - The mime type of the file.
 * @param {string} folder - The target folder / prefix.
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadImage = async (fileBuffer, mimeType, folder = 'octune-vintage/products') => {
  try {
    // Compress image to WebP (max width 1400px, 82% quality)
    let processedBuffer = fileBuffer;
    let targetMimeType = mimeType;
    let fileExtension = 'webp';

    try {
      processedBuffer = await sharp(fileBuffer)
        .resize({ width: 1400, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      targetMimeType = 'image/webp';
    } catch (sharpErr) {
      console.warn('Sharp compression skipped/failed, uploading original buffer:', sharpErr.message);
      fileExtension = mimeType.split('/')[1] || 'jpg';
    }

    const uniqueId = crypto.randomBytes(16).toString('hex');
    const key = `${folder}/${uniqueId}.${fileExtension}`;

    if (r2Client) {
      console.log('Uploading compressed WebP image to Cloudflare R2 (0 Data Transfer Fees)...');
      const bucketName = process.env.R2_BUCKET_NAME || 'octune-images';
      let publicUrl = process.env.R2_PUBLIC_URL || '';
      if (publicUrl.endsWith('/')) publicUrl = publicUrl.slice(0, -1);

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: processedBuffer,
        ContentType: targetMimeType,
      });

      await r2Client.send(command);

      const url = publicUrl ? `${publicUrl}/${key}` : `https://${bucketName}.r2.cloudflarestorage.com/${key}`;
      return {
        url,
        publicId: `r2:${key}`, // Prefix with r2: so deletion handler knows it's R2
      };
    } else if (s3Client) {
      console.log('Uploading compressed WebP image to AWS S3...');
      const bucketName = process.env.AWS_BUCKET_NAME || 'octunevintagecloud';
      const region = process.env.AWS_REGION || 'eu-north-1';

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: processedBuffer,
        ContentType: targetMimeType,
        ACL: 'public-read',
      });

      await s3Client.send(command);

      const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
      return {
        url,
        publicId: key,
      };
    } else {
      console.log('Uploading image to Cloudinary (Fallback)...');
      const b64 = Buffer.from(fileBuffer).toString('base64');
      const dataURI = `data:${mimeType};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, { folder });
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }
  } catch (error) {
    console.error('Storage Upload Error:', error);
    throw new Error('Failed to upload image to cloud storage: ' + error.message);
  }
};

/**
 * Delete an image from Cloudflare R2, AWS S3, or Cloudinary.
 * @param {string} publicId - The key or public_id.
 * @returns {Promise<any>}
 */
export const deleteImage = async (publicId) => {
  try {
    if (r2Client && publicId.startsWith('r2:')) {
      const key = publicId.replace(/^r2:/, '');
      console.log('Deleting image from Cloudflare R2: %s', key);
      const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || 'octune-images',
        Key: key,
      });
      return await r2Client.send(command);
    } else if (s3Client && publicId.includes('.')) {
      console.log('Deleting image from AWS S3: %s', publicId);
      const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME || 'octunevintagecloud',
        Key: publicId,
      });
      return await s3Client.send(command);
    } else {
      console.log('Deleting image from Cloudinary: %s', publicId);
      try {
        return await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryErr) {
        console.warn('Cloudinary deletion failed, ignoring error:', cloudinaryErr.message);
        return { result: 'ignored error' };
      }
    }
  } catch (error) {
    console.error('Storage Deletion Error:', error);
    throw new Error('Failed to delete image from cloud storage: ' + error.message);
  }
};

