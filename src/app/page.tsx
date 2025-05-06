'use client';

import { useState, useEffect } from 'react';
import { 
  signIn, 
  getUser, 
  isSignedIn, 
  AuthUser, 
  promptAddFrameAndNotifications,
  sendWelcomeNotification
} from '@/lib/auth';
import { sdk } from '@farcaster/frame-sdk';

export default function Home() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingApp, setIsAddingApp] = useState(false);

  // Initialize Frame SDK and handle automatic authentication
  useEffect(() => {
    let mounted = true;

    const initApp = async () => {
      try {
        // Check if already signed in
        let currentUser = null;
        if (isSignedIn()) {
          currentUser = getUser();
          console.log("User already authenticated:", currentUser);
        } else {
          // Authenticate silently
          currentUser = await signIn();
          console.log("User authenticated:", currentUser);
        }

        if (mounted && currentUser) {
          setUser(currentUser);

          // Always check app status when loading
          const context = await sdk.context;
          const isCurrentlyAdded = context?.client?.added || false;
          const hasNotifications = !!context?.client?.notificationDetails;
          
          console.log("App status check:", { 
            isCurrentlyAdded, 
            hasNotifications,
            storedStatus: currentUser.hasAddedApp 
          });
          
          // Update user object with current status from context
          if (currentUser.hasAddedApp !== isCurrentlyAdded || 
              currentUser.hasEnabledNotifications !== hasNotifications) {
            currentUser.hasAddedApp = isCurrentlyAdded;
            currentUser.hasEnabledNotifications = hasNotifications;
            setUser({...currentUser});
          }

          // If the app is not added, automatically prompt to add it
          if (!isCurrentlyAdded) {
            console.log("App not added, prompting automatically...");
            try {
              if (mounted) setIsAddingApp(true);
              const result = await promptAddFrameAndNotifications();
              console.log("Add frame result:", JSON.stringify(result, null, 2));

              if (result.added) {
                console.log("App successfully added!");
                if (currentUser && mounted) {
                  currentUser.hasAddedApp = true;
                  currentUser.hasEnabledNotifications = !!result.notificationDetails;
                  setUser({...currentUser});
                  
                  // Explicitly send welcome notification when app is added
                  if (currentUser.fid) {
                    console.log("Sending explicit welcome notification...");
                    try {
                      const notificationSent = await sendWelcomeNotification(currentUser.fid);
                      console.log("Welcome notification sent result:", notificationSent);
                    } catch (notificationError) {
                      console.error("Error sending welcome notification:", notificationError);
                    }
                  }
                }
              } else {
                console.log("Failed to add app automatically");
              }
            } catch (addError) {
              console.error("Error adding frame:", addError);
            } finally {
              if (mounted) setIsAddingApp(false);
            }
          }
        }
      } catch (error) {
        console.error("Error initializing app:", error);
      } finally {
        if (mounted) {
          // Signal to Farcaster client that the app is ready, even if there were errors
          try {
            console.log("Signaling app is ready to Farcaster client...");
            await sdk.actions.ready();
            console.log("Ready signal sent successfully");
          } catch (readyError) {
            console.error("Error sending ready signal:", readyError);
          }
          
          setIsLoading(false);
        }
      }
    };

    initApp();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-2xl font-semibold">Loading...</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">Hello, {user?.username || 'Guest'}!</h1>
        
        {user?.hasAddedApp ? (
          <>
            <p className="text-xl mb-4">
              {user.hasEnabledNotifications
                ? "✅ You've added this Mini App with notifications enabled!"
                : "⚠️ You've added this Mini App but notifications aren't enabled."}
            </p>
            <p className="text-lg mt-4">
              Check Warpcast for your welcome notification!
            </p>
          </>
        ) : (
          <>
            <p className="text-xl mb-6">Adding Mini App automatically...</p>
            <div className="animate-pulse text-purple-600">
              {isAddingApp ? "Prompting to add Mini App..." : "Initializing..."}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
