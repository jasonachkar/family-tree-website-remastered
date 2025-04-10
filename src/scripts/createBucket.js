// This script initializes the Supabase storage bucket with correct permissions
// Run with: node createBucket.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY; // Use service key for admin operations
const BUCKET_NAME = 'family-images';

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL and Service Key must be provided in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
    try {
        console.log('Checking if bucket exists...');
        const { data: buckets } = await supabase.storage.listBuckets();

        const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);

        if (bucketExists) {
            console.log(`Bucket '${BUCKET_NAME}' already exists.`);
        } else {
            console.log(`Creating bucket '${BUCKET_NAME}'...`);
            const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
                public: true, // Make bucket public
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
                fileSizeLimit: 5242880, // 5MB
            });

            if (error) {
                console.error('Error creating bucket:', error);
                process.exit(1);
            }

            console.log(`Bucket '${BUCKET_NAME}' created successfully.`);
        }

        // Set up storage policies (these need to be run in SQL editor for complete setup)
        console.log('Storage policies to add in SQL Editor:');
        console.log(`
-- Enable Row Level Security
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for anyone to read objects in the family-images bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = '${BUCKET_NAME}');

-- Policy for authenticated users to upload objects
CREATE POLICY "Authenticated Upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = '${BUCKET_NAME}');

-- Policy for users to update their own objects
CREATE POLICY "Users Can Update Own Objects" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = '${BUCKET_NAME}');

-- Policy for users to delete their own objects
CREATE POLICY "Users Can Delete Own Objects" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = '${BUCKET_NAME}');
`);

        console.log('Done. Copy and paste these policies into your Supabase SQL Editor.');

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createBucket(); 