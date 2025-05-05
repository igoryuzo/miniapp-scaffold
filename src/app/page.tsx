'use client';

import { useState, useEffect } from 'react';
import { signIn, getUser, isSignedIn, AuthUser, promptAddFrameAndNotifications } from '@/lib/auth';

export default function Home() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

          // If the app is not added, automatically prompt to add it
          if (!currentUser.hasAddedApp) {
            console.log("App not added, prompting automatically...");
            try {
              const result = await promptAddFrameAndNotifications();
              console.log("Add frame result:", JSON.stringify(result, null, 2));

              if (result.added) {
                console.log("App successfully added!");
                if (currentUser) {
                  currentUser.hasAddedApp = true;
                  currentUser.hasEnabledNotifications = !!result.notificationDetails;
                  setUser({...currentUser});
                }
              } else {
                console.log("Failed to add app automatically");
              }
            } catch (addError) {
              console.error("Error adding frame:", addError);
            }
          }
        }
      } catch (error) {
        console.error("Error initializing app:", error);
      } finally {
        if (mounted) {
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          MiniApp Scaffold
        </p>
      </div>

      <div className="relative flex place-items-center">
        {isLoading ? (
          <div className="text-2xl font-semibold">Loading...</div>
        ) : (
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Hello, {user?.username || 'Guest'}!</h1>
            <p className="text-xl mb-8">
              {user 
                ? `Welcome to the MiniApp Scaffold!` 
                : `Please sign in with Farcaster to continue`
              }
            </p>
            {user && (
              <div className="mt-4 p-4 bg-green-100 rounded-lg text-green-800">
                <p>
                  Successfully authenticated with Farcaster!
                </p>
                <p className="mt-2 text-sm">
                  FID: {user.fid}
                </p>
                <p className="text-sm">
                  App Added: {user.hasAddedApp ? 'Yes' : 'No'}
                </p>
                <p className="text-sm">
                  Notifications: {user.hasEnabledNotifications ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-8 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-2 lg:text-left">
        <a
          href="https://docs.farcaster.xyz/frames"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Farcaster Docs{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Learn about Farcaster Frames and authentication
          </p>
        </a>

        <a
          href="https://docs.neynar.com/"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Neynar Docs{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Learn about Neynar notifications and APIs
          </p>
        </a>
      </div>
    </main>
  );
}
