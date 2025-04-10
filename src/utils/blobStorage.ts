import { put, del, list } from '@vercel/blob';
import { nanoid } from 'nanoid';

const BLOB_READ_WRITE_TOKEN = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN || 'vercel_blob_rw_E6sRqy8NS8CHDfm2_sSNH5rIbRlagP6C9K78OcxOAOmoD5e';

/**
 * Simple local storage implementation for images using browser's localStorage
 * This is a simple alternative to cloud storage for demonstration purposes
 */

// Prefix for localStorage keys to avoid conflicts
const STORAGE_PREFIX = 'family_tree_image_';
const STORAGE_INDEX_KEY = 'family_tree_image_index';

/**
 * Get the current image index from localStorage
 * This helps us keep track of all stored images
 */
function getImageIndex(): string[] {
  const indexStr = localStorage.getItem(STORAGE_INDEX_KEY);
  if (!indexStr) return [];
  try {
    return JSON.parse(indexStr);
  } catch (e) {
    console.error('Error parsing image index:', e);
    return [];
  }
}

/**
 * Save the image index to localStorage
 */
function saveImageIndex(index: string[]): void {
  localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(index));
}

/**
 * Add an image ID to the index
 */
function addImageToIndex(imageId: string): void {
  const index = getImageIndex();
  if (!index.includes(imageId)) {
    index.push(imageId);
    saveImageIndex(index);
  }
}

/**
 * Remove an image ID from the index
 */
function removeImageFromIndex(imageId: string): void {
  const index = getImageIndex();
  const newIndex = index.filter(id => id !== imageId);
  saveImageIndex(newIndex);
}

/**
 * Uploads an image to local storage and returns a data URL
 * @param imageData Base64 encoded image data
 * @returns URL of the stored image (data URL)
 */
export async function uploadImageToBlob(imageData: string): Promise<string> {
  try {
    // Validate imageData
    if (!imageData.startsWith('data:')) {
      throw new Error('Invalid image data format');
    }

    // Generate a unique ID for the image
    const imageId = `${STORAGE_PREFIX}${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    // Store the image data directly
    localStorage.setItem(imageId, imageData);

    // Add to our image index for tracking
    addImageToIndex(imageId);

    // Return a reference URL instead of the full data URL
    // This makes the tree data much smaller and prevents KV storage issues
    return `img-ref:${imageId}`;
  } catch (error: any) {
    console.error('Error storing image:', error);
    throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Gets the actual image data URL from a reference
 * @param reference The image reference (img-ref:id)
 * @returns The full image data URL
 */
export function getImageFromReference(reference: string): string | null {
  if (!reference || !reference.startsWith('img-ref:')) {
    // If it's already a data URL or other format, return as is
    return reference;
  }

  const imageId = reference.substring(8); // Remove 'img-ref:' prefix
  const imageData = localStorage.getItem(imageId);
  return imageData;
}

/**
 * Deletes an image from local storage
 * @param url URL or ID of the image to delete
 */
export async function deleteImageFromBlob(url: string): Promise<void> {
  try {
    // Check if it's a reference URL format
    if (url && url.startsWith('img-ref:')) {
      const imageId = url.substring(8); // Remove 'img-ref:' prefix
      localStorage.removeItem(imageId);
      removeImageFromIndex(imageId);
      console.log('Successfully deleted image by reference:', imageId);
      return;
    }

    // Legacy format checking - ID extracted from hash
    const idMatch = url.match(/#id=(family_tree_image_.*?)($|&)/);
    if (idMatch && idMatch[1]) {
      const imageId = idMatch[1];
      localStorage.removeItem(imageId);
      removeImageFromIndex(imageId);
      console.log('Successfully deleted image by hash ID:', imageId);
      return;
    }

    // If it's a direct data URL, search through storage by content
    if (url.startsWith('data:')) {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(STORAGE_PREFIX) && localStorage.getItem(key) === url) {
          localStorage.removeItem(key);
          removeImageFromIndex(key);
          console.log('Successfully deleted image by content matching:', key);
          return;
        }
      }
    }

    // If we didn't find the image or it's not a data URL, log it but don't throw
    console.log('Image not found or not managed by this storage:', url);
  } catch (error: any) {
    console.error('Error deleting image:', error);
    throw new Error(`Delete failed: ${error.message || 'Unknown error'}`);
  }
}

export async function getBackgroundImage(): Promise<string | null> {
  try {
    const { blobs } = await list({
      token: BLOB_READ_WRITE_TOKEN,
      prefix: 'background-',
    });

    if (blobs.length > 0) {
      // Return the URL of the most recently uploaded background image
      return blobs[0].url;
    }

    return null;
  } catch (error) {
    console.error('Error fetching background image from Blob Storage:', error);
    throw error;
  }
}
