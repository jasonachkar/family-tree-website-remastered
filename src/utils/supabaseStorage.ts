import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)
const BUCKET_NAME = 'family-images'

export async function uploadImageToSupabase(imageData: string): Promise<string> {
    try {
        // Convert base64 to blob
        const base64Data = imageData.split(',')[1]
        const blob = Buffer.from(base64Data, 'base64')

        // Generate unique filename
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`

        // Upload to Supabase
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filename, blob, {
                contentType: 'image/jpeg',
                cacheControl: '3600'
            })

        if (error) throw error

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filename)

        return publicUrl
    } catch (error) {
        console.error('Error uploading image:', error)
        throw error
    }
}

export async function deleteImageFromSupabase(url: string): Promise<void> {
    try {
        // Extract filename from URL
        const filename = url.split('/').pop()
        if (!filename) return

        // Delete from Supabase
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filename])

        if (error) throw error
    } catch (error) {
        console.error('Error deleting image:', error)
        throw error
    }
} 