import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import cloudinary from '../config/cloudinary.js';
import crypto from 'crypto';

// Initialize S3 Client only if credentials exist
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
 * Upload an image buffer to S3 or Cloudinary.
 * @param {Buffer} fileBuffer - The file buffer from multer.
 * @param {string} mimeType - The mime type of the file.
 * @param {string} folder - The target folder / prefix.
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadImage = async (fileBuffer, mimeType, folder = 'octune-vintage/products') => {
  try {
    if (s3Client) {
      console.log('Uploading image to AWS S3...');
      const bucketName = process.env.AWS_BUCKET_NAME || 'octunevintagecloud';
      const region = process.env.AWS_REGION || 'eu-north-1';
      
      // Generate a unique file name
      const fileExtension = mimeType.split('/')[1] || 'jpg';
      const uniqueId = crypto.randomBytes(16).toString('hex');
      const key = `${folder}/${uniqueId}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: 'public-read', // public read access so browser can load the image
      });

      await s3Client.send(command);

      // S3 URL format
      const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
      return {
        url,
        publicId: key, // Store the Key as the publicId so we can delete it later
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
 * Delete an image from S3 or Cloudinary.
 * @param {string} publicId - The key (S3) or public_id (Cloudinary).
 * @returns {Promise<any>}
 */
export const deleteImage = async (publicId) => {
  try {
    // S3 keys have file extensions like .png, .jpg, .webp. Cloudinary publicIds do not have file extensions.
    const isS3Key = publicId.includes('.');

    if (s3Client && isS3Key) {
      console.log('Deleting image from AWS S3: %s', publicId);
      const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME || 'octunevintagecloud',
        Key: publicId,
      });
      return await s3Client.send(command);
    } else {
      console.log('Deleting image from Cloudinary: %s', publicId);
      return await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Storage Deletion Error:', error);
    throw new Error('Failed to delete image from cloud storage: ' + error.message);
  }
};
