import { NextResponse } from 'next/server';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { getNotificationTokensForUsers } from '../../../lib/supabase';

// Initialize Neynar client with API key
const neynarClient = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

export async function POST(request: Request) {
  try {
    const { targetFids, category }: { 
      targetFids: number[]; 
      category: 'nearby_users' | 'events' | 'welcome' 
    } = await request.json();

    if (!targetFids || !targetFids.length || !category) {
      return NextResponse.json({ error: 'Missing targetFids or category' }, { status: 400 });
    }

    // Fetch notification tokens from Supabase for the target FIDs
    const { data: tokens, error } = await getNotificationTokensForUsers(targetFids);

    if (error || !tokens?.length) {
      return NextResponse.json(
        { error: 'No valid notification tokens found' }, 
        { status: 400 }
      );
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
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    // Send notifications via Neynar
    const response = await neynarClient.publishFrameNotifications({
      targetFids,
      notification,
    });

    return NextResponse.json({ 
      success: true, 
      sentTo: targetFids.length,
      response 
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' }, 
      { status: 500 }
    );
  }
} 