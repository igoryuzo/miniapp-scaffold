import { NextResponse } from 'next/server';
import { removeNotificationToken } from '../../../lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fid, token } = body;

    if (!fid) {
      return NextResponse.json({ error: 'Missing required FID' }, { status: 400 });
    }

    console.log(`Deleting notification tokens for FID ${fid}`);
    
    // Delete the notification token(s) for this user
    // If token is provided, delete that specific token, otherwise delete all tokens for the user
    const { data, error } = await removeNotificationToken(fid, token);

    if (error) {
      console.error('Error deleting notification token:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const deletedCount = data ? data.length : 0;
    console.log(`Successfully deleted notification tokens for FID ${fid}. Rows affected: ${deletedCount}`);
    
    return NextResponse.json({ 
      success: true,
      deleted: deletedCount
    });
  } catch (error) {
    console.error('Error in delete-notification-token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 