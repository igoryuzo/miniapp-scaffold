# Mini App Scaffold (For Prompt Engineers)

A quick-start scaffold for Farcaster Mini Apps with user authentication, notifications, and data persistence using Supabase.

```
# Environment Variables for .env.local and Vercel

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Neynar API Key for notifications
NEYNAR_API_KEY=your_neynar_api_key

# Application URL (used for notification links)
# Use localhost for development, your actual domain for production
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
```

```
# Farcaster Mini App Creation Prompt

## Task
Create a Hello World Farcaster Mini App using Next.js and TypeScript, following the documentation below. The app should include:
1. User authentication with Farcaster
2. Push notification functionality via Neynar
3. Database integration with Supabase
4. Proper manifest configuration
5. Simple UI that shows the authenticated user's information

## Requirements
- Use Next.js 15+ with the App Router
- Create a clean, minimal UI (Tailwind recommended but optional)
- Implement secure authentication flow with proper error handling
- Set up the Supabase database tables as described below
- Configure webhooks for notification handling through Neynar
- Include proper environment configuration

## Deliverables
1. Complete codebase with all required files
2. Instructions for setting up environment variables
3. Database setup SQL commands
4. Deployment guidance

Use the detailed documentation below to understand the technical requirements, architecture, and implementation strategies for building the mini app.

---

# Farcaster Mini App Scaffold - Complete Documentation

## Introduction

The Mini App Scaffold is a comprehensive starter template designed to accelerate the development of Farcaster Mini Apps. It provides developers with a ready-to-use foundation that includes essential features such as user authentication, notification management, and data persistence through Supabase. The scaffold is built using Next.js 15 with the App Router and integrates seamlessly with the Farcaster Frame SDK.

## Purpose and Benefits

### Why This Scaffold Exists

Developing Farcaster Mini Apps involves several repetitive setup steps and integration with various APIs. This scaffold aims to eliminate boilerplate work by providing:

1. **Ready-to-use authentication flow** - Handles Farcaster sign-in, user session management, and secure authentication
2. **Notification system** - Complete integration with Neynar's API for sending and managing notifications
3. **Database integration** - Pre-configured Supabase setup for storing user data
4. **Error handling** - Robust error handling for authentication and notification processes
5. **Frame integration** - Proper setup for app addition/removal within Farcaster clients

### Key Features

- ✅ Farcaster Mini App SDK integration
- ✅ User authentication flow with secure nonce generation
- ✅ Push notifications with welcome messages
- ✅ Notification permission management
- ✅ Supabase for data storage
- ✅ Next.js 15 with App Router
- ✅ Proper manifest configuration
- ✅ Webhook handling for frame events

## Project Structure

```
/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/                # API routes
│   │   │   ├── send-notification/      # Send notifications to users
│   │   │   ├── test-notification/      # Test notification endpoint
│   │   │   ├── users/                  # User management endpoints
│   │   │   ├── webhook/                # Webhook receiver endpoint
│   │   │   └── delete-notification-token/ # Remove notification tokens
│   │   │
│   │   ├── page.tsx            # Main application page
│   │   ├── layout.tsx          # Root layout with meta tags
│   │   └── globals.css         # Global styles
│   │
│   └── lib/                    # Shared libraries
│       ├── auth.ts             # Authentication logic
│       ├── supabase.ts         # Supabase client and helpers
│       ├── notifications.ts    # Notification helpers
│       └── neynar.ts           # Neynar API client
│
├── public/                     # Static assets
│   ├── .well-known/
│   │   └── farcaster.json      # Farcaster manifest file
│   └── images/                 # Images for the app
│
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies
└── README.md                   # Project documentation
```

## Core Components

### 1. Authentication System

The authentication system is implemented in `src/lib/auth.ts` and handles:

- User sign-in with Farcaster
- Secure nonce generation for authentication
- In-memory user state management (avoiding localStorage for better security)
- User profile retrieval and storage in Supabase
- Frame addition and notification permission handling

Key functions include:
- `signIn()`: Authenticates a user with Farcaster
- `getUser()`: Retrieves the current user
- `isSignedIn()`: Checks if a user is signed in
- `promptAddFrameAndNotifications()`: Prompts user to add frame and enable notifications

### 2. Notification System

The notification system is designed to reliably deliver notifications to users who have added the Mini App. It uses Neynar's API for notification delivery and token management.

Key components:
- `src/lib/notifications.ts`: Helper functions for working with notifications
- `src/app/api/send-notification/route.ts`: API route for sending notifications
- `src/app/api/delete-notification-token/route.ts`: Removes notification tokens

The notification flow works as follows:
1. When a user adds the Mini App, a notification token is generated by the Farcaster client
2. The token is sent to Neynar via the webhook URL specified in `farcaster.json`
3. When sending notifications, the app calls the Neynar API with the user's FID
4. Neynar handles delivery and token management

The scaffold includes a welcome notification feature that triggers when a user adds the Mini App.

### 3. Database Integration

Supabase is used for data persistence, with the main database operations defined in `src/lib/supabase.ts`. The scaffold creates a database table:

`users`: Stores user information (FID, username, avatar URL)

Key database functions:
- `saveUser()`: Saves or updates a user's profile

### 4. Webhook Handling

The scaffold is configured to use Neynar for handling webhooks through the `webhookUrl` property in `farcaster.json`. This approach delegates the complexity of webhook processing to Neynar while still maintaining a backup webhook endpoint for logging in `src/app/api/webhook/route.ts`.

The webhook handler processes these events:
- `frame_added`: User adds the Mini App
- `frame_removed`: User removes the Mini App
- `notifications_enabled`: User enables notifications
- `notifications_disabled`: User disables notifications

### 5. Main Application UI

The main application UI in `src/app/page.tsx` provides:
- Automatic authentication
- App addition prompting
- Notification permission management
- Status display
- Welcome notification sending

## Technical Implementation Details

### Authentication Flow

```javascript
// Authentication flow overview from src/lib/auth.ts
export async function signIn(): Promise<AuthUser | null> {
  try {
    // 1. Generate secure nonce for authentication
    const nonce = generateNonce();
    
    // 2. Authenticate with Farcaster
    let signInResult;
    try {
      signInResult = await sdk.actions.signIn({ nonce });
    } catch (signInError) {
      // Handle sign-in errors
    }
    
    // 3. Get user context from SDK
    const context = await sdk.context;
    if (!context || !context.user || !context.user.fid) {
      throw new Error("Missing user data in SDK context");
    }
    
    // 4. Extract user information
    const fid = context.user.fid;
    const username = context.user.username || 'unknown';
    const displayName = context.user.displayName;
    const pfpUrl = context.user.pfpUrl;
    
    // 5. Check app status
    const wasAppAdded = currentUser?.hasAddedApp || false;
    const isNowAdded = context.client?.added || false;
    
    // 6. Handle app removal if needed
    if (wasAppAdded && !isNowAdded) {
      await handleFrameRemoved(fid);
    }
    
    // 7. Save user to Supabase
    await fetch('/api/users/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fid, username, avatar_url: pfpUrl }),
    });
    
    // 8. Create auth user object
    const authUser: AuthUser = {
      fid,
      username,
      displayName,
      pfpUrl,
      sessionToken: tempToken,
      hasAddedApp: context.client?.added || false,
      hasEnabledNotifications: !!context.client?.notificationDetails
    };
    
    // 9. Store in memory (not localStorage)
    currentUser = authUser;
    
    return authUser;
  } catch (error) {
    throw error;
  }
}
```

### Notification Sending

```javascript
// Notification sending from src/app/api/send-notification/route.ts
export async function POST(request: Request) {
  try {
    // 1. Parse request data
    const { targetFids, category } = await request.json();

    // 2. Create notification content based on category
    let notification;
    switch (category) {
      case 'welcome':
        notification = {
          title: 'Congrats! 🎉',
          body: 'Welcome notifications are working!',
          target_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
        };
        break;
      // Other categories...
    }

    // 3. Send notification with retry logic
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      attempts++;
      try {
        // 4. Call Neynar API to send notification
        const response = await neynarClient.publishFrameNotifications({
          targetFids,
          notification,
        });
        
        // 5. Return success response
        return NextResponse.json({ 
          success: true, 
          sentTo: targetFids.length,
          response,
          attempt: attempts
        });
      } catch (apiError) {
        // Handle error and retry if needed
      }
    }
  } catch (error) {
    // Handle general errors
  }
}
```

### Supabase Integration

```javascript
// Supabase helpers from src/lib/supabase.ts
// Regular client for user-level operations
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Admin client for privileged operations (server-side only)
export const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || ''
);

// Save or update user
export async function saveUser(userData: {
  fid: number;
  username: string;
  avatar_url?: string;
}) {
  return supabaseAdmin
    .from('users')
    .upsert({
      ...userData,
      updated_at: new Date().toISOString(),
    })
    .select();
}
```

### Manifest Configuration

```json
// Example farcaster.json
{
  "accountAssociation": {
    "header": "REPLACE_WITH_YOUR_HEADER_FROM_WARPCAST_TOOL",
    "payload": "REPLACE_WITH_YOUR_PAYLOAD_FROM_WARPCAST_TOOL",
    "signature": "REPLACE_WITH_YOUR_SIGNATURE_FROM_WARPCAST_TOOL"
  },
  "frame": {
    "version": "1",
    "name": "Mini App Scaffold",
    "iconUrl": "https://your-domain.com/images/icon.png",
    "homeUrl": "https://your-domain.com/",
    "imageUrl": "https://your-domain.com/images/cover.png",
    "buttonTitle": "Start Building",
    "splashImageUrl": "https://your-domain.com/images/icon.png",
    "splashBackgroundColor": "#0f172a",
    "webhookUrl": "https://api.neynar.com/f/app/YOUR_APP_ID_HERE/event",
    "subtitle": "Farcaster Mini App Starter Kit",
    "description": "Build Farcaster apps with auth storage",
    "primaryCategory": "developer-tools",
    "tags": ["scaffold", "boilerplate", "auth", "notifications", "supabase"],
    "tagline": "Mini App Scaffolding."
  }
}
```

## Common Challenges and Solutions

### 1. Authentication in Iframe Environments

Farcaster Mini Apps run in iframes, which can cause security challenges with cookies and localStorage. The scaffold addresses this by:
- Using in-memory state management instead of localStorage
- Implementing secure nonce generation for authentication
- Handling authentication errors gracefully

### 2. Notification Token Management

Notification tokens need to be correctly managed. The scaffold:
- Implements token cleanup when users remove the app
- Uses Neynar for webhook processing to ensure tokens are valid

### 3. Webhook Handling

Webhook events must be properly processed to manage frame addition/removal. The scaffold:
- Configures Neynar to handle webhook processing
- Maintains a backup webhook endpoint for logging and debugging
- Implements proper error handling for webhook events

### 4. Welcome Notifications

Welcome notifications should be sent reliably when users add the app. The scaffold:
- Implements retry logic for notification sending
- Checks app status when a user opens the app
- Sends welcome notifications when a user adds the app

## Getting Started with the Scaffold

### Prerequisites

- Node.js 18+ and yarn
- [Supabase](https://supabase.com) account & project
- [Neynar](https://neynar.com) API key for notifications

### Environment Setup

Create a `.env.local` file in the root of your project with the following variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Neynar API Key for notifications
NEYNAR_API_KEY=your_neynar_api_key

# Application URL (used for notification links)
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
```

### Database Setup

In your Supabase project, create this table:

```sql
-- Users table
create table users (
  fid bigint primary key,
  username text not null,
  avatar_url text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
```

### Setting Up Neynar

1. Create a Neynar account and set up a Mini App at [https://neynar.com](https://neynar.com)
2. Get your app-specific webhook URL from Neynar's dashboard (format: `https://api.neynar.com/f/app/{app-id}/event`)
3. Set the `webhookUrl` in your `public/.well-known/farcaster.json` manifest file to this Neynar endpoint
4. Set your `NEYNAR_API_KEY` in your environment variables

### Publishing Your App

Before your Mini App can be officially published, you need to:

1. Deploy to your production domain
2. Set up account association in the manifest file
3. Configure app details in the manifest file
4. Verify the app works with authentication and notifications

## Extending the Scaffold

This scaffold provides the foundation - here are some ways to extend it:

1. **Add custom features**: Build on top of the scaffold with your unique Mini App features
2. **Add more notification types**: Create different notification categories beyond welcome messages
3. **Enhance user profiles**: Store additional user data in Supabase
4. **Add analytics**: Track user engagement and notification effectiveness
5. **Implement custom UI**: Replace the starter UI with your own design

## Conclusion

The Mini App Scaffold provides a robust foundation for building Farcaster Mini Apps with authentication, notifications, and data persistence. By handling the integration complexities and boilerplate code, it allows developers to focus on building unique features and experiences for their users.

This scaffold is designed to evolve along with the Farcaster ecosystem, incorporating best practices and new features as they become available.

```
