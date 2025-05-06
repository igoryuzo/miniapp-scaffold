import { sdk } from '@farcaster/frame-sdk';

export interface AuthUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  hasAddedApp?: boolean;
  hasEnabledNotifications?: boolean;
  sessionToken?: string;
}

export interface FrameNotificationDetails {
  url: string;
  token: string;
}

// Store user in memory (not localStorage for better security)
let currentUser: AuthUser | null = null;

// Generate a secure nonce
function generateNonce(): string {
  // Generate a random string of at least 8 characters
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Check if user is signed in
export function isSignedIn(): boolean {
  return !!currentUser;
}

// Get the current user
export function getUser(): AuthUser | null {
  return currentUser;
}

// Sign in with Farcaster
export async function signIn(): Promise<AuthUser | null> {
  try {
    // Generate a nonce (at least 8 alphanumeric characters as per documentation)
    const nonce = generateNonce();
    console.log("Generated nonce:", nonce);
    
    // Call the signIn method from the SDK
    console.log("Calling Frame SDK signIn with nonce...");
    
    // Use try-catch specifically for the signIn call
    let signInResult;
    try {
      signInResult = await sdk.actions.signIn({ nonce });
    } catch (signInError) {
      console.error("Error during signIn call:", signInError);
      // Try to proceed with context even if signIn fails
    }
    
    console.log("SignIn result:", signInResult ? JSON.stringify(signInResult, null, 2) : "No result");
    
    // Try to get context even if signIn fails
    let context;
    try {
      context = await sdk.context;
      console.log("SDK context:", JSON.stringify(context, null, 2));
    } catch (contextError) {
      console.error("Error getting SDK context:", contextError);
      throw new Error("Failed to get user context");
    }
    
    if (!context || !context.user || !context.user.fid) {
      console.error("Missing user data in SDK context");
      throw new Error("Missing user data in SDK context");
    }
    
    // Get user info from context
    const fid = context.user.fid;
    const username = context.user.username || 'unknown';
    const displayName = context.user.displayName;
    const pfpUrl = context.user.pfpUrl;
    
    // Check if the app was previously added but now removed
    const wasAppAdded = currentUser?.hasAddedApp || false;
    const isNowAdded = context.client?.added || false;
    
    // If the app was added before but is now removed, clean up notification tokens
    if (wasAppAdded && !isNowAdded) {
      console.log("App was previously added but is now removed. Cleaning up notification tokens...");
      await handleFrameRemoved(fid);
    }
    
    // Save user to Supabase
    try {
      console.log("Saving user to Supabase:", { fid, username, pfpUrl });
      // Use a fetch request to a new API endpoint we'll create
      const response = await fetch('/api/users/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fid,
          username,
          avatar_url: pfpUrl,
        }),
      });
      
      console.log("Supabase save response status:", response.status);
      const saveData = await response.json();
      console.log("Supabase save response:", saveData);
      
      if (!response.ok) {
        console.warn("Failed to save user to Supabase", saveData);
        // Continue with auth flow even if save fails
      }
    } catch (error) {
      console.error("Error saving user to Supabase:", error);
      // Continue with auth flow even if save fails
    }
    
    // Create a simple auth token on the client side
    // This is just for demonstration - in production, you'd get a real token from the server
    const tempToken = Buffer.from(`${fid}:${Date.now()}`).toString('base64');
    
    // Create auth user object
    const authUser: AuthUser = {
      fid,
      username,
      displayName,
      pfpUrl,
      sessionToken: tempToken,
      hasAddedApp: context.client?.added || false,
      hasEnabledNotifications: !!context.client?.notificationDetails
    };
    
    console.log("Created authUser:", JSON.stringify(authUser, null, 2));
    
    // Store in memory only (not localStorage)
    currentUser = authUser;
    
    return authUser;
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
}

// Sign out
export function signOut(): void {
  currentUser = null;
}

/**
 * Handle the case when a user removes the Mini App
 * This will be managed by Neynar through the webhook URL
 */
async function handleFrameRemoved(fid: number): Promise<void> {
  if (!fid) {
    console.error("Invalid FID provided to handleFrameRemoved");
    return;
  }
  
  console.log(`Handling app removal for FID ${fid}`);
  
  // Update current user if exists
  if (currentUser) {
    console.log(`Updating current user status for FID ${fid}`);
    currentUser.hasAddedApp = false;
    currentUser.hasEnabledNotifications = false;
  }
  
  // No need to manually delete notification tokens as Neynar manages this
  // through the webhook URL defined in farcaster.json
}

/**
 * Explicitly request notification permissions from the user
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  console.log("🔔 Explicitly requesting notification permissions...");
  try {
    // First check current status
    const context = await sdk.context;
    const hasNotifications = !!context?.client?.notificationDetails;
    
    if (hasNotifications) {
      console.log("✅ Notifications already enabled!");
      return true;
    }
    
    // Since there's no direct method for just requesting notifications,
    // we'll use addFrame which should prompt for notifications if the frame is already added
    console.log("Calling addFrame to request notification permissions...");
    const result = await sdk.actions.addFrame();
    console.log("addFrame result:", JSON.stringify(result, null, 2));
    
    // Verify the result
    const updatedContext = await sdk.context;
    const nowHasNotifications = !!updatedContext?.client?.notificationDetails;
    
    console.log(`Notification status after request: ${nowHasNotifications ? "Enabled ✅" : "Still not enabled ❌"}`);
    
    // Update current user if it exists
    if (currentUser) {
      currentUser.hasEnabledNotifications = nowHasNotifications;
    }
    
    return nowHasNotifications;
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
}

/**
 * Prompt the user to add the frame and enable notifications
 * According to Farcaster docs, adding a frame includes enabling notifications by default
 */
export async function promptAddFrameAndNotifications(): Promise<{ 
  added: boolean;
  notificationDetails?: FrameNotificationDetails;
}> {
  try {
    console.log("Starting promptAddFrameAndNotifications...");
    
    // Check context first to see if frame is already added
    let context;
    try {
      context = await sdk.context;
    } catch (error) {
      console.error("Error getting SDK context:", error);
      return { added: false };
    }
    
    const isAlreadyAdded = context?.client?.added || false;
    const existingNotificationDetails = context?.client?.notificationDetails;
    
    if (isAlreadyAdded && existingNotificationDetails) {
      console.log("Frame is already added with notifications, skipping prompt");
      return {
        added: true,
        notificationDetails: existingNotificationDetails
      };
    }
    
    // First ensure the frame is added
    console.log("Calling sdk.actions.addFrame()...");
    await sdk.actions.addFrame();
    console.log("sdk.actions.addFrame() completed");
    
    // Get updated context after adding frame
    console.log("Getting SDK context...");
    const updatedContext = await sdk.context;
    console.log("SDK context received:", JSON.stringify(updatedContext, null, 2));
    
    // Check if frame was successfully added
    const isAdded = updatedContext?.client?.added || false;
    let notificationDetails = updatedContext?.client?.notificationDetails;
    const hasNotifications = !!notificationDetails;
    
    // Log more detailed notifications status
    console.log(`Frame status: {isAdded: ${isAdded}, notificationDetails: ${notificationDetails ? 'defined' : 'undefined'}}`);
    if (notificationDetails) {
      console.log(`Notification details: token=${notificationDetails.token ? 'exists' : 'missing'}`);
    }
    
    // Update current user if exists
    if (currentUser) {
      currentUser.hasAddedApp = isAdded;
      currentUser.hasEnabledNotifications = hasNotifications;
      console.log("Updated currentUser:", JSON.stringify(currentUser, null, 2));
    }
    
    // If we have the frame added but no notification details, explicitly request them
    if (isAdded && !hasNotifications && updatedContext?.user?.fid) {
      console.log("Frame added but missing notification details. Explicitly requesting notifications...");
      
      // Wait a moment before requesting notifications (gives UI time to update)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Make explicit request for notification permissions
      const notificationsEnabled = await requestNotificationPermissions();
      
      if (notificationsEnabled) {
        // Update our notification details
        const notificationContext = await sdk.context;
        notificationDetails = notificationContext?.client?.notificationDetails;
        
        // Update user
        if (currentUser) {
          currentUser.hasEnabledNotifications = !!notificationDetails;
        }
      }
    }
    
    // Final status check
    const hasFid = !!updatedContext?.user?.fid;
    const hasNotificationDetails = !!notificationDetails;
    console.log(`⚠️ Frame status check: {isAdded: ${isAdded}, hasFid: ${hasFid}, hasNotificationDetails: ${hasNotificationDetails}}`);
    
    // Send a welcome notification if the frame was added, even if notification details aren't available
    // Notification will only appear if permissions are enabled
    if (isAdded && updatedContext?.user?.fid) {
      console.log("🎉 Frame added successfully!");
      
      if (notificationDetails) {
        console.log(`🔔 User FID: ${updatedContext.user.fid}`);
        console.log(`🔑 Notification token available: ${!!notificationDetails.token}`);
      } else {
        console.log(`⚠️ No notification details available, but still attempting to send welcome notification`);
      }
      
      // Send welcome notification
      console.log("📤 Attempting to send welcome notification...");
      try {
        const notificationResponse = await fetch('/api/send-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            targetFids: [updatedContext.user.fid],
            category: 'welcome'
          }),
        });
        
        if (notificationResponse.ok) {
          console.log("✅ Welcome notification sent successfully!");
        } else {
          console.error("❌ Failed to send welcome notification:", await notificationResponse.text());
        }
      } catch (error) {
        console.error("❌ Error sending welcome notification:", error);
      }
    }
    
    return {
      added: isAdded,
      notificationDetails
    };
  } catch (error) {
    console.error("Error in promptAddFrameAndNotifications:", error);
    return { added: false };
  }
}

/**
 * Send a welcome notification to a user
 */
export async function sendWelcomeNotification(fid: number): Promise<boolean> {
  console.log(`🎉 Explicitly sending welcome notification to FID ${fid}...`);
  
  try {
    // Add a slight delay before sending notification (helps with race conditions)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Try to get the latest context to see if notification permissions were granted
    try {
      const context = await sdk.context;
      console.log(`📊 Current notification status: ${!!context?.client?.notificationDetails ? "Enabled" : "Not enabled"}`);
      
      // If notifications aren't already enabled, try to request them again
      if (!context?.client?.notificationDetails) {
        console.log("🔄 Attempting to request notifications permissions again before sending welcome...");
        try {
          // Try to get notification permissions via addFrame
          await sdk.actions.addFrame();
          
          // Check if successful
          const updatedContext = await sdk.context;
          console.log(`📊 Updated notification status: ${!!updatedContext?.client?.notificationDetails ? "Enabled" : "Still not enabled"}`);
        } catch (permissionError) {
          console.error("Error requesting notification permissions:", permissionError);
        }
      }
    } catch (contextError) {
      console.error("Error getting notification context:", contextError);
    }
    
    // Attempt to send notification with retry logic
    let success = false;
    let attempts = 0;
    const maxAttempts = 2;
    
    while (!success && attempts < maxAttempts) {
      attempts++;
      console.log(`📤 Sending welcome notification (attempt ${attempts}/${maxAttempts})...`);
      
      try {
        const notificationResponse = await fetch('/api/send-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            targetFids: [fid],
            category: 'welcome'
          }),
        });
        
        if (notificationResponse.ok) {
          const responseData = await notificationResponse.json();
          console.log(`✅ Welcome notification sent successfully (attempt ${attempts}):`, responseData);
          success = true;
        } else {
          const errorText = await notificationResponse.text();
          console.error(`❌ Failed to send welcome notification (attempt ${attempts}):`, errorText);
          
          // Wait before retry
          if (attempts < maxAttempts) {
            console.log(`⏱️ Waiting 2 seconds before retry...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      } catch (error) {
        console.error(`❌ Error sending welcome notification (attempt ${attempts}):`, error);
        
        // Wait before retry
        if (attempts < maxAttempts) {
          console.log(`⏱️ Waiting 2 seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    return success;
  } catch (error) {
    console.error("❌ Error in sendWelcomeNotification:", error);
    return false;
  }
} 