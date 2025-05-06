import { NextResponse } from 'next/server';
import { supabaseAdmin, removeNotificationToken } from '../../../lib/supabase';

// Type definitions for webhook data
interface WebhookData {
  type?: string;
  event?: string;
  event_type?: string;
  [key: string]: unknown;
}

interface UserCreatedData extends WebhookData {
  user?: {
    fid?: number;
    [key: string]: unknown;
  };
}

interface FrameAddedData extends WebhookData {
  fid?: number;
  frame_id?: string;
  notificationDetails?: {
    url: string;
    token: string;
  };
}

interface FrameRemovedData extends WebhookData {
  fid?: number;
  frame_id?: string;
  event: 'frame_removed' | 'frame-removed';
}

interface NotificationData extends WebhookData {
  notification_id?: string;
  fid?: number;
  success?: boolean;
}

// Helper to verify webhook signature
function verifySignature(signature: string | null, body: WebhookData, secret: string): boolean {
  // In a production app, you would implement proper signature validation here
  // This is a placeholder for demonstration purposes
  if (!signature) return false;
  
  // Example implementation:
  // 1. Generate a signature using the request body and your secret
  // 2. Compare with the provided signature in a time-constant manner
  
  // Using crypto to create a signature (simplified example)
  // const crypto = require('crypto');
  // const expectedSignature = crypto
  //   .createHmac('sha256', secret)
  //   .update(JSON.stringify(body))
  //   .digest('hex');
  // return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  
  console.log('Webhook signature verification called with:', { 
    signature, 
    bodyLength: JSON.stringify(body).length,
    secretLength: secret.length
  });
  
  return true; // For testing purposes, always return true
}

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json() as WebhookData;
    
    // Get signature from headers (if your webhook provider uses signatures)
    const signature = request.headers.get('x-webhook-signature');
    const webhookSecret = process.env.WEBHOOK_SECRET || '';
    
    console.log('Received webhook:', {
      headers: Object.fromEntries(request.headers),
      body: JSON.stringify(body).substring(0, 200) + '...' // Log truncated body
    });
    
    // Verify signature if needed
    if (webhookSecret && !verifySignature(signature, body, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // Process different event types
    const eventType = body.type || body.event || body.event_type;
    console.log(`Processing webhook event: ${eventType}`);
    
    switch (eventType) {
      case 'user.created':
        // Handle user creation event
        await handleUserCreated(body as UserCreatedData);
        break;
        
      case 'frame.added':
      case 'frame_added':
        // Handle frame added event
        await handleFrameAdded(body as FrameAddedData);
        break;
        
      case 'frame.removed':
      case 'frame_removed':
        // Handle frame removed event - delete notification tokens
        await handleFrameRemoved(body as FrameRemovedData);
        break;
        
      case 'notifications.disabled':
      case 'notifications_disabled':
        // Handle notifications disabled - delete notification tokens
        await handleNotificationsDisabled(body as FrameRemovedData);
        break;
        
      case 'notification.sent':
        // Log notification delivery
        await logNotificationSent(body as NotificationData);
        break;
        
      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
        // Store the raw event for future analysis
        await storeRawWebhookEvent(eventType?.toString() || 'unknown', body);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' }, 
      { status: 500 }
    );
  }
}

// Handler for user created events
async function handleUserCreated(data: UserCreatedData) {
  try {
    const { user } = data;
    if (!user || !user.fid) {
      console.error('Invalid user data in webhook:', data);
      return;
    }
    
    // Log the event
    console.log(`User created webhook for FID: ${user.fid}`);
    
    // Store in your database
    await supabaseAdmin
      .from('webhook_events')
      .insert({
        event_type: 'user.created',
        fid: user.fid,
        data: data,
        processed: true
      });
  } catch (error) {
    console.error('Error handling user.created webhook:', error);
  }
}

// Handler for frame added events
async function handleFrameAdded(data: FrameAddedData) {
  try {
    const { fid, frame_id, notificationDetails } = data;
    if (!fid) {
      console.error('Missing FID in frame.added webhook:', data);
      return;
    }
    
    console.log(`Frame added webhook for FID: ${fid}, frame: ${frame_id}`);
    
    // If notification details are available, store the token
    if (notificationDetails && notificationDetails.token && notificationDetails.url) {
      try {
        console.log(`Storing notification token for FID ${fid}:`, notificationDetails);
        
        const { data: tokenData, error: tokenError } = await supabaseAdmin
          .from('notification_tokens')
          .upsert({
            fid: fid,
            token: notificationDetails.token,
            url: notificationDetails.url,
            updated_at: new Date().toISOString()
          })
          .select();
          
        if (tokenError) {
          console.error('Error storing notification token:', tokenError);
        } else {
          console.log('Successfully stored notification token:', tokenData);
        }
      } catch (tokenError) {
        console.error('Error processing notification token:', tokenError);
      }
    }
    
    // Store in your database
    await supabaseAdmin
      .from('webhook_events')
      .insert({
        event_type: 'frame.added',
        fid: fid,
        data: data,
        processed: true
      });
  } catch (error) {
    console.error('Error handling frame.added webhook:', error);
  }
}

// Handler for frame removed events
async function handleFrameRemoved(data: FrameRemovedData) {
  try {
    const { fid } = data;
    if (!fid) {
      console.error('Missing FID in frame.removed webhook:', data);
      return;
    }
    
    console.log(`Frame removed webhook for FID: ${fid}. Deleting notification tokens...`);
    
    // Delete all notification tokens for this user
    const { data: deletedData, error: deleteError } = await removeNotificationToken(fid);
    
    if (deleteError) {
      console.error(`Error deleting notification tokens for FID ${fid}:`, deleteError);
    } else {
      const deletedCount = deletedData ? deletedData.length : 0;
      console.log(`Successfully deleted ${deletedCount} notification tokens for FID ${fid}`);
    }
    
    // Store the event
    await supabaseAdmin
      .from('webhook_events')
      .insert({
        event_type: 'frame.removed',
        fid: fid,
        data: data,
        processed: true
      });
  } catch (error) {
    console.error('Error handling frame.removed webhook:', error);
  }
}

// Handler for notifications disabled events
async function handleNotificationsDisabled(data: FrameRemovedData) {
  try {
    const { fid } = data;
    if (!fid) {
      console.error('Missing FID in notifications.disabled webhook:', data);
      return;
    }
    
    console.log(`Notifications disabled webhook for FID: ${fid}. Deleting notification tokens...`);
    
    // Delete all notification tokens for this user
    const { data: deletedData, error: deleteError } = await removeNotificationToken(fid);
    
    if (deleteError) {
      console.error(`Error deleting notification tokens for FID ${fid}:`, deleteError);
    } else {
      const deletedCount = deletedData ? deletedData.length : 0;
      console.log(`Successfully deleted ${deletedCount} notification tokens for FID ${fid}`);
    }
    
    // Store the event
    await supabaseAdmin
      .from('webhook_events')
      .insert({
        event_type: 'notifications.disabled',
        fid: fid,
        data: data,
        processed: true
      });
  } catch (error) {
    console.error('Error handling notifications.disabled webhook:', error);
  }
}

// Log notification sent events
async function logNotificationSent(data: NotificationData) {
  try {
    const { notification_id, fid, success } = data;
    
    console.log(`Notification sent webhook: ID ${notification_id}, FID: ${fid}, success: ${success}`);
    
    // Store notification delivery status
    await supabaseAdmin
      .from('notification_logs')
      .insert({
        notification_id: notification_id || 'unknown',
        fid: fid,
        success: !!success,
        data: data
      });
  } catch (error) {
    console.error('Error logging notification webhook:', error);
  }
}

// Store raw webhook events for future analysis
async function storeRawWebhookEvent(eventType: string, data: WebhookData) {
  try {
    // Extract FID if available in the data
    let fid: number | null = null;
    if (data.fid && typeof data.fid === 'number') {
      fid = data.fid;
    } else if (data.user && typeof data.user === 'object' && 'fid' in data.user && typeof data.user.fid === 'number') {
      fid = data.user.fid;
    }
    
    // Store the event
    await supabaseAdmin
      .from('webhook_events')
      .insert({
        event_type: eventType,
        fid: fid,
        data: data,
        processed: false
      });
  } catch (error) {
    console.error('Error storing raw webhook event:', error);
  }
} 