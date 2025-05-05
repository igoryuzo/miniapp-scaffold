import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fid } = body;

    if (!fid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Delete the notification token for this user
    const { error } = await supabase
      .from('notification_tokens')
      .delete()
      .eq('fid', fid);

    if (error) {
      console.error('Error deleting notification token:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in delete-notification-token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 