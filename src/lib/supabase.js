import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// TODO: Replace these with your actual Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table: valentine_experiences
// Schema:
// - id: uuid (primary key)
// - unique_code: text (unique, indexed) - for shareable links
// - partner_name: text
// - creator_name: text (optional)
// - image_urls: text[] (array of image URLs in storage)
// - created_at: timestamp
// - expires_at: timestamp (optional, for cleanup)
// - view_count: integer (track how many times link was opened)

// Storage bucket: valentine-images
// Public access for viewing images
