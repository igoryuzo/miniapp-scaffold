import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

// Type definitions for webhook data
interface WebhookData {
  type?: string;
  event?: string;
  event_type?: string;
  [key: string]: unknown;
}

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json() as WebhookData;
    
    // Log the webhook for debugging
    console.log('Received webhook (redirected to Neynar):', {
      headers: Object.fromEntries(request.headers),
      body: JSON.stringify(body).substring(0, 200) + '...' // Log truncated body
    });
    
    // This endpoint is now just for logging purposes
    // All webhook processing is handled by Neynar via the webhookUrl in farcaster.json
    
    // Store the raw event for record-keeping
    try {
      await supabaseAdmin
        .from('webhook_events')
        .insert({
          event_type: body.type || body.event || body.event_type || 'unknown',
          fid: body.fid || null,
          data: body,
          processed: true
        });
    } catch (dbError) {
      console.error('Error storing webhook event:', dbError);
      // Continue even if DB storage fails
    }
    
    return NextResponse.json({ success: true, message: 'Webhook received, processing delegated to Neynar' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' }, 
      { status: 500 }
    );
  }
} 