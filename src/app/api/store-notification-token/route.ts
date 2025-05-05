import { NextResponse } from 'next/server';
import { saveNotificationToken } from '../../../lib/supabase';

export async function POST(request: Request) {
  try {
    const { fid, token, url } = await request.json();
    
    if (!fid || !token || !url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Save to Supabase using your existing function
    const result = await saveNotificationToken(fid, token, url);
    
    console.log(`Saved notification token for FID ${fid} from client`);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error storing notification token:', error);
    return NextResponse.json(
      { error: 'Failed to store token' },
      { status: 500 }
    );
  }
} 