import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)
const BUCKET_NAME = 'family-images'

/**
 * Uploads an image to Supabase storage
 * @param imageData Base64 encoded image data
 * @returns URL of the uploaded image
 */
export async function uploadImageToSupabase(imageData: string): Promise<string> {
    try {
        // Validate imageData
        if (!imageData.startsWith('data:')) {
            throw new Error('Invalid image data format')
        }

        // Extract MIME type and base64 data
        const match = imageData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/)
        if (!match) {
            throw new Error('Invalid image data format')
        }

        const mimeType = match[1]
        const base64Data = match[2]

        // Get file extension from MIME type
        const extension = mimeType.split('/')[1] || 'jpg'

        // Convert base64 to blob using a browser-compatible method
        // First convert base64 to binary
        const binary = atob(base64Data)
        // Create array buffer
        const arrayBuffer = new ArrayBuffer(binary.length)
        // Create Uint8Array from array buffer
        const array = new Uint8Array(arrayBuffer)

        // Fill array with binary data
        for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i)
        }

        // Create blob with correct MIME type
        const blob = new Blob([array], { type: mimeType })

        // Generate unique filename with timestamp and random string to avoid collisions
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${extension}`

        // Upload to Supabase
        console.log(`Uploading image to Supabase bucket '${BUCKET_NAME}' with filename: ${filename}`)
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filename, blob, {
                contentType: mimeType,
                upsert: false // Don't overwrite existing files with same name
            })

        if (error) {
            console.error('Supabase storage upload error:', error)
            throw new Error(`Upload failed: ${error.message}`)
        }

        if (!data) {
            throw new Error('Upload failed with no data returned from Supabase')
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(data.path)

        console.log(`Successfully uploaded image to Supabase: ${publicUrl}`)
        return publicUrl
    } catch (error: any) {
        console.error('Error uploading image to Supabase:', error)
        throw new Error(`Upload failed: ${error.message || 'Unknown error'}`)
    }
}

/**
 * Deletes an image from Supabase storage
 * @param url URL of the image to delete
 */
export async function deleteImageFromSupabase(url: string): Promise<void> {
    try {
        if (!url) {
            console.log('No URL provided for deletion')
            return
        }

        if (!url.includes(BUCKET_NAME)) {
            // Not a Supabase URL or nothing to delete
            console.log('Not deleting image, not a Supabase URL:', url)
            return
        }

        // Extract path from URL
        const urlObj = new URL(url)
        const pathParts = urlObj.pathname.split('/')
        const filename = pathParts[pathParts.length - 1]

        console.log(`Attempting to delete file '${filename}' from Supabase bucket '${BUCKET_NAME}'`)

        // Delete from Supabase
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filename])

        if (error) {
            console.error('Error deleting image from Supabase:', error)
            throw new Error(`Delete failed: ${error.message}`)
        }

        console.log('Successfully deleted image from Supabase:', filename)
    } catch (error: any) {
        console.error('Error deleting image from Supabase:', error.message, error.stack)
        throw new Error(`Delete failed: ${error.message || 'Unknown error'}`)
    }
} 