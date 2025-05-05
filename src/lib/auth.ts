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
    const signInResult = await sdk.actions.signIn({ nonce });
    
    console.log("SignIn result:", JSON.stringify(signInResult, null, 2));
    
    if (!signInResult) {
      console.log("No sign in result returned");
      return null;
    }
    
    // Get user data from SDK context instead of parsing from message
    const context = await sdk.context;
    console.log("SDK context:", JSON.stringify(context, null, 2));
    
    if (!context || !context.user || !context.user.fid) {
      console.error("Missing user data in SDK context");
      throw new Error("Missing user data in SDK context");
    }
    
    // Get user info from context
    const fid = context.user.fid;
    const username = context.user.username || 'unknown';
    const displayName = context.user.displayName;
    const pfpUrl = context.user.pfpUrl;
    
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
    const context = await sdk.context;
    const isAlreadyAdded = context.client?.added || false;
    const existingNotificationDetails = context.client?.notificationDetails;
    
    if (isAlreadyAdded && existingNotificationDetails) {
      console.log("Frame is already added with notifications, skipping prompt");
      return {
        added: true,
        notificationDetails: existingNotificationDetails
      };
    }
    
    // Debug current URL and window location for domain validation insights
    const currentUrl = window.location.href;
    const currentHostname = window.location.hostname;
    console.log("Current page URL:", currentUrl);
    console.log("Current hostname:", currentHostname);
    
    // Additional pre-flight checks
    try {
      // Check manifest before attempting to add frame
      console.log("Checking manifest accessibility...");
      const manifestResponse = await fetch('/.well-known/farcaster.json');
      console.log("Manifest response status:", manifestResponse.status);
      if (manifestResponse.ok) {
        const manifest = await manifestResponse.json();
        console.log("Manifest domain from payload:", Buffer.from(manifest.accountAssociation.payload, 'base64').toString());
      }
    } catch (manifestError) {
      console.warn("Failed to pre-check manifest:", manifestError);
      // Continue anyway
    }
    
    // Only prompt if not already added
    console.log("Calling sdk.actions.addFrame()...");
    try {
      // Decode the payload from farcaster.json for debugging
      console.log("Current window location:", window.location.toString());
      console.log("Current hostname:", window.location.hostname);
      
      try {
        const manifestResponse = await fetch('/.well-known/farcaster.json');
        if (manifestResponse.ok) {
          const manifestText = await manifestResponse.text();
          console.log("Raw manifest content:", manifestText);
          
          // Check for any trailing whitespace
          if (manifestText.trim() !== manifestText) {
            console.warn("WARNING: Manifest file contains trailing whitespace which may cause validation errors");
          }
          
          try {
            const manifest = JSON.parse(manifestText);
            const payloadBase64 = manifest.accountAssociation.payload;
            const decodedPayload = atob(payloadBase64);
            console.log("Decoded manifest payload:", decodedPayload);
            
            // Compare with current hostname
            try {
              const payloadObj = JSON.parse(decodedPayload);
              console.log("Manifest domain:", payloadObj.domain);
              console.log("Current hostname:", window.location.hostname);
              if (payloadObj.domain !== window.location.hostname) {
                console.error("Domain mismatch between manifest and current hostname!");
                console.error(`Manifest domain: ${payloadObj.domain}, Current hostname: ${window.location.hostname}`);
              }
            } catch (jsonError) {
              console.error("Error parsing payload JSON:", jsonError);
            }
          } catch (parseError) {
            console.error("Error parsing manifest JSON:", parseError);
          }
        }
      } catch (manifestError) {
        console.error("Error fetching manifest:", manifestError);
      }
      
      await sdk.actions.addFrame();
      console.log("sdk.actions.addFrame() completed successfully");
    } catch (error) {
      console.error("Error in sdk.actions.addFrame():", error);
      // Check error message as a string to avoid type issues
      const errorString = String(error);
      if (errorString.includes("InvalidDomainManifest")) {
        console.error("Domain manifest validation failed - check your farcaster.json and ensure URLs match verified domain");
        console.error("Full error:", errorString);
      }
      throw error;
    }
    
    // Get updated context
    console.log("Getting SDK context...");
    const updatedContext = await sdk.context;
    console.log("SDK context received:", JSON.stringify(updatedContext, null, 2));
    
    const isAdded = updatedContext.client?.added || false;
    const notificationDetails = updatedContext.client?.notificationDetails;
    console.log("Frame status:", { isAdded, notificationDetails });
    
    // Update the user state if successful
    if (currentUser) {
      currentUser.hasAddedApp = isAdded;
      currentUser.hasEnabledNotifications = !!notificationDetails;
      console.log("Updated currentUser:", JSON.stringify(currentUser, null, 2));
    }
    
    // If notification details are available, store them in our database
    if (isAdded && notificationDetails && updatedContext.user?.fid) {
      console.log("Frame added successfully with notification details. Storing token...");
      try {
        // Send to your backend API
        console.log("Storing notification token for FID:", updatedContext.user.fid);
        const response = await fetch('/api/store-notification-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            fid: updatedContext.user.fid, 
            token: notificationDetails.token, 
            url: notificationDetails.url 
          })
        });
        
        const data = await response.json();
        console.log("Token storage response:", data);

        // Send welcome notification
        console.log("Sending welcome notification...");
        try {
          const notificationResponse = await fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetFids: [updatedContext.user.fid],
              category: 'welcome'
            })
          });
          console.log("Welcome notification response:", await notificationResponse.json());
        } catch (notificationError) {
          console.error("Error sending welcome notification:", notificationError);
          // Continue even if notification fails
        }
      } catch (tokenError) {
        console.error("Error storing notification token:", tokenError);
        // Continue even if token storage fails
      }
    } else {
      console.log("Frame not added or missing notification details:", {
        isAdded,
        hasFid: !!updatedContext.user?.fid,
        hasNotificationDetails: !!notificationDetails
      });
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