import { NeynarAPIClient } from '@neynar/nodejs-sdk';

// Initialize the Neynar client with API key
export const getNeynarClient = (): NeynarAPIClient | null => {
  try {
    const apiKey = process.env.NEYNAR_API_KEY;
    
    if (!apiKey) {
      console.error('Neynar API key is missing');
      return null;
    }
    
    return new NeynarAPIClient({ apiKey });
  } catch (error) {
    console.error('Failed to initialize Neynar client:', error);
    return null;
  }
};

// Send a notification to a single user
export const sendNotification = async (
  fid: number,
  title: string,
  body: string,
  targetUrl?: string
): Promise<boolean> => {
  try {
    const client = getNeynarClient();
    if (!client) {
      console.error('Neynar client not initialized');
      return false;
    }
    
    const notification = {
      title,
      body,
      target_url: targetUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000',
    };

    const response = await client.publishFrameNotifications({
      targetFids: [fid],
      notification,
    });
    
    console.log(`Notification sent to FID ${fid}:`, response);
    return true;
  } catch (error) {
    console.error(`Error sending notification to FID ${fid}:`, error);
    return false;
  }
};

// Send a notification to multiple users
export const sendBulkNotifications = async (
  fids: number[],
  title: string,
  body: string,
  targetUrl?: string
): Promise<boolean> => {
  try {
    if (!fids.length) {
      console.warn('No FIDs provided for bulk notification');
      return false;
    }

    const client = getNeynarClient();
    if (!client) {
      console.error('Neynar client not initialized');
      return false;
    }

    const notification = {
      title,
      body,
      target_url: targetUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000',
    };

    const response = await client.publishFrameNotifications({
      targetFids: fids,
      notification,
    });
    
    console.log(`Bulk notification sent to ${fids.length} users:`, response);
    return true;
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    return false;
  }
};

// Get user profile information via direct API call
export const getUserProfile = async (fid: number) => {
  try {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      console.error('Neynar API key is missing');
      return null;
    }
    
    // Direct fetch to the Neynar API
    const response = await fetch(`https://api.neynar.com/v2/farcaster/user?fid=${fid}`, {
      headers: {
        'accept': 'application/json',
        'api_key': apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.status}`);
    }
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error(`Error fetching user profile for FID ${fid}:`, error);
    return null;
  }
}; 