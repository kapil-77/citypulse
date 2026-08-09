import cloudinary from '../config/cloudinary.js';

const UPLOAD_FOLDER = 'citypulse';

/**
 * Upload a single image buffer to Cloudinary.
 * Returns the photo object in the exact shape the frontend expects.
 */
export async function uploadToCloudinary(buffer, { uploadedBy = 'anonymous', isBefore = true } = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: UPLOAD_FOLDER,
        resource_type: 'image',
        transformation: [{ width: 1600, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result) {
          return reject(new Error('Cloudinary upload returned no result'));
        }

        const now = new Date().toISOString();
        // Generate a thumbnail URL using Cloudinary's image transformation API
        const thumbnailUrl = cloudinary.url(result.public_id, {
          transformation: [
            { width: 400, height: 400, crop: 'fill', quality: 'auto:good' },
          ],
        });

        resolve({
          id: `photo-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
          url: result.secure_url,
          thumbnailUrl,
          public_id: result.public_id,
          uploadedAt: now,
          uploadedBy,
          isBefore,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Upload multiple image buffers to Cloudinary.
 * Returns an array of photo objects.
 */
export async function uploadMultipleToCloudinary(buffers, options = {}) {
  const results = [];
  for (let i = 0; i < buffers.length; i++) {
    const photo = await uploadToCloudinary(buffers[i], {
      uploadedBy: options.uploadedBy || 'anonymous',
      isBefore: options.isBefore ?? true,
    });
    results.push(photo);
  }
  return results;
}

/**
 * Delete an image from Cloudinary by public_id.
 * Used for rollback when a database save fails after upload succeeds.
 */
export async function deleteFromCloudinary(publicId) {
  if (!publicId) {
    return { result: 'skipped', reason: 'no public_id provided' };
  }
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (err) {
    console.error(`[Cloudinary] Failed to delete ${publicId}:`, err.message);
    // Non-blocking: log the failure but don't throw, since the caller
    // is already in an error-handling path.
    return { result: 'error', error: err.message };
  }
}

/**
 * Delete multiple images from Cloudinary (best-effort).
 * Used for batch rollback when a DB write fails after multiple uploads.
 */
export async function deleteMultipleFromCloudinary(publicIds = []) {
  const results = [];
  for (const publicId of publicIds) {
    if (publicId) {
      results.push(await deleteFromCloudinary(publicId));
    }
  }
  return results;
}