import { sdk } from '@farcaster/frame-sdk';

export interface AuthUser {
  fid: number;
  username: string;
  displayName?: string;
  pfp?: string;
  hasAddedApp: boolean;
  hasEnabledNotifications: boolean;
}

export interface NotificationDetails {
  granted: boolean;
  token?: string;
}

// Check if the user is signed in 
export const isSignedIn = (): boolean => {
  try {
    // Check if we have stored auth state
    const authState = localStorage.getItem('farcaster_auth');
    return !!authState;
  } catch (error) {
    // In case of any errors (e.g., localStorage not available)
    console.error('Error checking auth state:', error);
    return false;
  }
};

// Get the current authenticated user
export const getUser = (): AuthUser | null => {
  try {
    const authStateStr = localStorage.getItem('farcaster_auth');
    if (!authStateStr) return null;
    
    const authState = JSON.parse(authStateStr);
    return authState.user || null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// Sign in the user with Farcaster
export const signIn = async (): Promise<AuthUser | null> => {
  try {
    // Try to get existing auth information
    if (isSignedIn()) {
      const user = getUser();
      if (user) return user;
    }
    
    // Initialize Frame SDK if needed
    await sdk.actions.ready();
    
    // We'll use a simplified approach since getUserInfo isn't directly available
    // This is a placeholder - in a real app, you'd need to implement this based on the specific SDK version
    // For example, you might use auth-kit's signIn method instead
    console.warn('This is a placeholder implementation - replace with actual SDK usage');
    
    // For demo purposes, create a dummy user
    const user: AuthUser = {
      fid: 12345, // This would come from actual authentication
      username: 'demouser',
      displayName: 'Demo User',
      pfp: '',
      hasAddedApp: false,
      hasEnabledNotifications: false
    };
    
    // Store auth state
    localStorage.setItem('farcaster_auth', JSON.stringify({ user }));
    
    return user;
  } catch (error) {
    console.error('Error during authentication:', error);
    return null;
  }
};

// Prompt user to add Frame and enable notifications
export const promptAddFrameAndNotifications = async (): Promise<{
  added: boolean;
  notificationDetails?: NotificationDetails;
}> => {
  try {
    // Add the frame to the user's Farcaster client
    const addResult = await sdk.actions.addFrame();
    
    // In the current SDK version, we need to check for success differently
    const frameAdded = addResult && true; // Replace with proper check based on SDK
    
    // If frame was successfully added, try to get notification permissions
    // Note: requestNotificationPermission might not be available directly
    if (frameAdded) {
      try {
        // This is a placeholder - implement proper notification request based on SDK version
        console.warn('Notification permission request is a placeholder - implement properly');
        
        return {
          added: true,
          notificationDetails: { granted: true }
        };
      } catch (notifError) {
        console.error('Error requesting notifications:', notifError);
        return { added: true };
      }
    }
    
    return { added: frameAdded };
  } catch (error) {
    console.error('Error prompting to add frame:', error);
    return { added: false };
  }
}; 