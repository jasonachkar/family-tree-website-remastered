import { put, del, list } from '@vercel/blob';
import { nanoid } from 'nanoid';

const BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_E6sRqy8NS8CHDfm2_sSNH5rIbRlagP6C9K78OcxOAOmoD5e';

export async function uploadImageToBlob(imageData: string): Promise<string> {
  try {
    const blob = await fetch(imageData).then(r => r.blob());
    const filename = `${nanoid()}.${blob.type.split('/')[1]}`;
    const { url } = await put(filename, blob, {
      access: 'public',
      token: BLOB_READ_WRITE_TOKEN,
    });
    return url;
  } catch (error) {
    console.error('Error uploading image to Blob Storage:', error);
    throw error;
  }
}

export async function deleteImageFromBlob(url: string): Promise<void> {
  try {
    await del(url, {
      token: BLOB_READ_WRITE_TOKEN,
    });
  } catch (error) {
    console.error('Error deleting image from Blob Storage:', error);
    throw error;
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
