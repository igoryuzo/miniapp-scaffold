import { createClient } from '@supabase/supabase-js';

// Initialize Supabase clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Regular client for user-level operations
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Admin client for privileged operations (server-side only)
export const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || ''
);

// Save or update user
export async function saveUser(userData: {
  fid: number;
  username: string;
  avatar_url?: string;
}) {
  return supabaseAdmin
    .from('users')
    .upsert({
      ...userData,
      updated_at: new Date().toISOString(),
    })
    .select();
} 