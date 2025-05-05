import { NextResponse } from 'next/server';
import { saveUser } from '../../../../lib/supabase';

export async function POST(request: Request) {
  try {
    const { fid, username, avatar_url } = await request.json();
    
    if (!fid || !username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Save to Supabase
    const result = await saveUser({
      fid,
      username,
      avatar_url
    });
    
    console.log(`Saved user ${username} (FID: ${fid}) to Supabase`);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error saving user:', error);
    return NextResponse.json(
      { error: 'Failed to save user' },
      { status: 500 }
    );
  }
} 