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

// Save Farcaster user notification token
export async function saveNotificationToken(fid: number, token: string, url: string) {
  return supabaseAdmin
    .from('notification_tokens')
    .upsert({
      fid,
      token,
      url,
    }, {
      onConflict: 'fid'
    })
    .select();
}

// Remove notification token
export async function removeNotificationToken(fid: number, token: string) {
  return supabaseAdmin
    .from('notification_tokens')
    .delete()
    .match({ fid, token });
}

// Get notification tokens for a user
export async function getNotificationTokens(fid: number) {
  return supabaseAdmin
    .from('notification_tokens')
    .select('*')
    .eq('fid', fid);
}

// Get all tokens for multiple users
export async function getNotificationTokensForUsers(fids: number[]) {
  return supabaseAdmin
    .from('notification_tokens')
    .select('*')
    .in('fid', fids);
}

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