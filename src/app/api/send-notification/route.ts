import { NextResponse } from 'next/server';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';

// Initialize Neynar client with API key
const neynarClient = new NeynarAPIClient({ 
  apiKey: process.env.NEYNAR_API_KEY!
});

// Log the API key (masked for security) to ensure it's set
console.log("Neynar API Key configured:", process.env.NEYNAR_API_KEY 
  ? `${process.env.NEYNAR_API_KEY.substring(0, 4)}...${process.env.NEYNAR_API_KEY.substring(process.env.NEYNAR_API_KEY.length - 4)}` 
  : "NOT SET");

export async function POST(request: Request) {
  try {
    console.log("🔔 Notification request received");
    
    const { targetFids, category }: { 
      targetFids: number[]; 
      category: 'nearby_users' | 'events' | 'welcome' 
    } = await request.json();

    console.log(`📋 Notification details: category=${category}, targetFids=${JSON.stringify(targetFids)}`);

    if (!targetFids || !targetFids.length || !category) {
      console.error("❌ Missing targetFids or category");
      return NextResponse.json({ error: 'Missing targetFids or category' }, { status: 400 });
    }

    // Create notification content based on category
    let notification;
    switch (category) {
      case 'welcome':
        notification = {
          title: 'Congrats! 🎉',
          body: 'Welcome notifications are working!',
          target_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
        };
        break;
      case 'nearby_users':
        notification = {
          title: '👥 Community Update!',
          body: 'Connect with the Farcaster community on Minimap!',
          target_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
        };
        break;
      case 'events':
        notification = {
          title: '🗓️ Local Events!',
          body: 'Discover events on Minimap!',
          target_url: `${process.env.NEXT_PUBLIC_APP_URL}/events`,
        };
        break;
      default:
        console.error(`❌ Invalid category: ${category}`);
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    console.log(`📤 Sending notification: ${JSON.stringify(notification)}`);
    console.log(`🔑 Using Neynar API Key: ${process.env.NEYNAR_API_KEY ? "✅ Set" : "❌ Not Set"}`);
    console.log(`🌐 APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || "Not set"}`);

    // Attempt to send with retry logic
    let attempts = 0;
    const maxAttempts = 2;
    let lastError = null;
    
    while (attempts < maxAttempts) {
      attempts++;
      try {
        // Send notifications directly via Neynar API
        // Neynar will handle filtering out users who have disabled notifications
        console.log(`📞 Calling Neynar API (attempt ${attempts}/${maxAttempts}) with params:`, {
          targetFids,
          notification
        });
        
        const response = await neynarClient.publishFrameNotifications({
          targetFids,
          notification,
        });
        
        console.log(`✅ Notification sent successfully (attempt ${attempts}): ${JSON.stringify(response)}`);
        
        return NextResponse.json({ 
          success: true, 
          sentTo: targetFids.length,
          response,
          attempt: attempts
        });
      } catch (apiError: unknown) {
        lastError = apiError;
        const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown API error';
        console.error(`❌ Neynar API error (attempt ${attempts}/${maxAttempts}): ${errorMessage}`, apiError);
        
        // Only retry if not the last attempt
        if (attempts < maxAttempts) {
          console.log(`⏱️ Retrying in 1 second...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // If we got here, all attempts failed
    const errorMessage = lastError instanceof Error ? lastError.message : 'Unknown API error after retries';
    return NextResponse.json(
      { error: `Neynar API error after ${maxAttempts} attempts: ${errorMessage}` }, 
      { status: 500 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Error sending notification: ${errorMessage}`, error);
    return NextResponse.json(
      { error: `Failed to send notification: ${errorMessage}` }, 
      { status: 500 }
    );
  }
} 