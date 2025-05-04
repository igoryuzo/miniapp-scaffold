import { NeynarAPIClient } from '@neynar/nodejs-sdk';

let neynarClient: NeynarAPIClient | null = null;

// Initialize the Neynar client
export const initializeNeynar = () => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_NEYNAR_API_KEY;
    
    if (!apiKey) {
      console.error('Neynar API key is missing');
      return null;
    }
    
    neynarClient = new NeynarAPIClient({ apiKey });
    return neynarClient;
  } catch (error) {
    console.error('Failed to initialize Neynar client:', error);
    return null;
  }
};

// Get the Neynar client (initialize if needed)
export const getNeynarClient = (): NeynarAPIClient | null => {
  if (!neynarClient) {
    return initializeNeynar();
  }
  return neynarClient;
};

// Register a notification token
export const registerNotificationToken = async (
  fid: number,
  token: string
): Promise<boolean> => {
  try {
    const client = getNeynarClient();
    if (!client) {
      console.error('Neynar client not initialized');
      return false;
    }
    
    // This is a placeholder - in a real app, you'd use Neynar's API
    // to register the notification token for the user
    console.log(`Registering notification token for FID ${fid}: ${token}`);
    
    // Store token in database (server-side code would handle this)
    // For this demo, we'll simulate success
    return true;
  } catch (error) {
    console.error('Error registering notification token:', error);
    return false;
  }
};

// Send a notification to a user
export const sendNotification = async (
  fid: number,
  title: string,
  body: string,
  url?: string
): Promise<boolean> => {
  try {
    const client = getNeynarClient();
    if (!client) {
      console.error('Neynar client not initialized');
      return false;
    }
    
    // This is a placeholder - in a real app, you'd use Neynar's API
    // to send a notification to the user
    console.log(`Sending notification to FID ${fid}:`, { title, body, url });
    
    // For this demo, we'll simulate success
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

// Delete a notification token
export const deleteNotificationToken = async (fid: number): Promise<boolean> => {
  try {
    const client = getNeynarClient();
    if (!client) {
      console.error('Neynar client not initialized');
      return false;
    }
    
    // This is a placeholder - in a real app, you'd use Neynar's API
    // to delete the notification token for the user
    console.log(`Deleting notification token for FID ${fid}`);
    
    // For this demo, we'll simulate success
    return true;
  } catch (error) {
    console.error('Error deleting notification token:', error);
    return false;
  }
}; 