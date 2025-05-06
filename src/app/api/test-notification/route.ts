import { NextResponse } from 'next/server';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';

// Initialize Neynar client with API key
const neynarClient = new NeynarAPIClient({ 
  apiKey: process.env.NEYNAR_API_KEY!
});

export async function GET(request: Request) {
  try {
    // Get the FID from query parameters or use a default test FID
    const { searchParams } = new URL(request.url);
    const fid = parseInt(searchParams.get('fid') || '0', 10);
    
    if (!fid) {
      return NextResponse.json({ error: 'Missing FID parameter in query' }, { status: 400 });
    }
    
    // Create a test notification
    const notification = {
      title: 'Test Notification 🧪',
      body: 'This is a test notification from the test endpoint',
      target_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
    };
    
    console.log(`📤 TEST: Sending notification to FID ${fid}`);
    console.log(`🔑 Using Neynar API Key: ${process.env.NEYNAR_API_KEY ? "✅ Set" : "❌ Not Set"}`);
    
    // Send the notification
    const response = await neynarClient.publishFrameNotifications({
      targetFids: [fid],
      notification,
    });
    
    console.log(`✅ Test notification sent:`, response);
    
    return NextResponse.json({ 
      success: true, 
      sentTo: fid,
      response 
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Error sending test notification: ${errorMessage}`, error);
    return NextResponse.json(
      { error: `Failed to send test notification: ${errorMessage}` }, 
      { status: 500 }
    );
  }
} 