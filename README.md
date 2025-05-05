# Mini App Scaffold

A quick-start scaffold for Farcaster Mini Apps with user authentication, notifications, and data persistence using Supabase.

## Features

- ✅ Farcaster Mini App SDK integration
- ✅ User authentication flow
- ✅ Push notifications
- ✅ Supabase for data storage
- ✅ Next.js 15 with App Router

## Getting Started

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
NEXT_PUBLIC_APP_URL=https://scaffold.wiki
```

### Database Setup

In your Supabase project, create the following tables by going to the **SQL Editor** in your Supabase dashboard and executing the following SQL commands:

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Create a "New Query"
4. Paste the SQL below and click "Run"

#### 1. `users` table

```sql
create table users (
  fid bigint primary key,
  username text not null,
  avatar_url text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
```

#### 2. `notification_tokens` table

```sql
create table notification_tokens (
  id uuid primary key default uuid_generate_v4(),
  fid bigint not null references users(fid) on delete cascade,
  token text not null,
  url text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  unique (fid)
);
```

You can also run both commands together in a single query in the SQL Editor.

### Installation

```bash
# Install dependencies
yarn install

# Run the development server
yarn dev
```

## How It Works

### Authentication

The scaffold uses Farcaster Mini App SDK for authentication. The main authentication flow is in `src/lib/auth.ts`. Key features:

- In-memory user state (not using localStorage for better security)
- Secure nonce generation for auth
- User profile storage in Supabase
- Mini App addition & notification permission handling

### Notifications

The notification system is built using Neynar. The main notification logic is in:

- `src/lib/neynar.ts` - Client-side notification helpers
- `src/app/api/send-notification/route.ts` - API route for sending notifications
- `src/app/api/store-notification-token/route.ts` - API route for storing notification tokens

#### Neynar Webhook Configuration

This scaffold uses Neynar for handling notifications, which requires a specific webhook URL configuration in your manifest file:

1. Create a Neynar account and create a new Mini App at [https://neynar.com](https://neynar.com)
2. Get your app-specific webhook URL from Neynar's dashboard (format: `https://api.neynar.com/f/app/{app-id}/event`)
3. Update the `webhookUrl` in your `public/.well-known/farcaster.json` manifest file to use this Neynar endpoint:

```json
"webhookUrl": "https://api.neynar.com/f/app/YOUR-APP-ID-HERE/event"
```

This webhook URL is required for proper domain validation when users add your app in Warpcast.

### Data Storage

Supabase is used for data persistence. The main database operations are in:

- `src/lib/supabase.ts` - Core Supabase client configuration
- `src/app/api/users/save/route.ts` - API route for saving user data

### Manifest File

The scaffold includes a manifest file at `public/.well-known/farcaster.json` that follows the [Farcaster Mini App Specification](https://miniapps.farcaster.xyz/docs/specification#manifest). This file is required for publishing your Mini App and enabling features like notifications.

The manifest contains:

1. Information about your app (name, description, icons)
2. URLs for important resources (home, webhook)
3. Appearance settings (splash screen)

#### Setting Up Account Association

Before your Mini App can be published, you need to claim ownership by setting up the account association in your manifest file. This associates your domain with your Farcaster account.

Follow these steps:

1. Deploy your Mini App to your production domain (e.g., scaffold.wiki)
2. Go to your domain in Warpcast's [Mini App Developer Tools](https://warpcast.com/~/developers/mini-apps)
3. Click "Claim Ownership" and scan the QR code with your Warpcast mobile app
4. Once signed, you'll receive the account association data
5. Replace the placeholder values in your `farcaster.json` file:

```json
"accountAssociation": {
  "header": "REPLACE_WITH_HEADER_FROM_WARPCAST_TOOL",
  "payload": "REPLACE_WITH_PAYLOAD_FROM_WARPCAST_TOOL",
  "signature": "REPLACE_WITH_SIGNATURE_FROM_WARPCAST_TOOL"
}
```

6. Deploy your updated manifest file
7. Verify your ownership is properly established in Warpcast's developer tools

This step is critical for:
- Enabling the "Add App" functionality
- Allowing notifications to work
- Showing your app in Warpcast's Mini App directory
- Being eligible for developer rewards

When deploying your app, you'll need to:

1. Update the manifest with your app's information
2. Verify ownership by adding an `accountAssociation` field (use the [Mini App Manifest Tool](https://warpcast.com/~/developers/new) to generate this)

Example manifest:
```json
{
  "accountAssociation": {
    "header": "eyJmaWQiOjkxNTIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgwMmVmNzkwRGQ3OTkzQTM1ZkQ4NDdDMDUzRURkQUU5NDBEMDU1NTk2In0",
    "payload": "eyJkb21haW4iOiJzY2FmZm9sZC53aWtpIn0",
    "signature": "MHgxMGQwZGU4ZGYwZDUwZTdmMGIxN2YxMTU2NDI1MjRmZTY0MTUyZGU4ZGU1MWU0MThiYjU4ZjVmZmQxYjRjNDBiNGVlZTRhNDcwNmVmNjhlMzQ0ZGQ5MDBkYmQyMmNlMmVlZGY5ZGQ0N2JlNWRmNzMwYzUxNjE4OWVjZDJjY2Y0MDFj"
  },
  "frame": {
    "version": "1",
    "name": "Mini App Scaffold",
    "iconUrl": "https://scaffold.wiki/images/scaffolding-icon.png",
    "homeUrl": "https://scaffold.wiki/",
    "imageUrl": "https://scaffold.wiki/images/miniapp-scaffolding.png",
    "buttonTitle": "Start Building",
    "splashImageUrl": "https://scaffold.wiki/images/scaffolding-icon.png",
    "splashBackgroundColor": "#0f172a",
    "webhookUrl": "https://api.neynar.com/f/app/YOUR-APP-ID-HERE/event",
    "subtitle": "Farcaster Mini App Starter Kit",
    "description": "Build Farcaster apps with auth and storage",
    "primaryCategory": "developer-tools",
    "tags": [
      "scaffold",
      "boilerplate",
      "auth",
      "notifications",
      "supabase"
    ],
    "tagline": "Mini App Scaffolding.",
    "ogTitle": "Mini App Scaffold",
    "ogDescription": "Build Farcaster apps with auth and storage",
    "ogImageUrl": "https://scaffold.wiki/images/miniapp-scaffolding.png",
    "noindex": false
  }
}
```

### Meta Tags for Sharing

The scaffold includes proper meta tags in the root layout file (`src/app/layout.tsx`) to make your Mini App shareable in Farcaster feeds. When someone shares your app's URL, Farcaster clients will display a rich embed with an image and a button to launch your app.

The meta tags use the Next.js metadata API with the custom `fc:frame` tag required by Farcaster:

```typescript
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';

const frameEmbed = {
  version: "next",
  imageUrl: `${baseUrl}/images/miniapp-scaffolding.png`,
  button: {
    title: "Start Building",
    action: {
      type: "launch_frame",
      name: "Mini App Scaffold",
      url: `${baseUrl}/`,
      splashImageUrl: `${baseUrl}/images/scaffolding-icon.png`,
      splashBackgroundColor: "#0f172a",
    },
  },
};

export const metadata: Metadata = {
  title: "Mini App Scaffold",
  description: "Quick-start scaffold for Farcaster Mini Apps with authentication, notifications, and data persistence",
  icons: {
    icon: "/images/scaffolding-icon.png",
    apple: "/images/scaffolding-icon.png",
  },
  other: {
    "fc:frame": JSON.stringify(frameEmbed),
  },
};
```

When customizing your app:
1. Update the `title`, `description`, and `icons` to match your app's branding
2. Modify the `frameEmbed` object with your own image and button text
3. Make sure the image URLs match the actual files in your `public` directory
4. Ensure the `NEXT_PUBLIC_APP_URL` environment variable is set correctly in production

You can add similar meta tags to other pages in your app to make specific pages shareable with custom images and actions.

## Customization

### Changing App Name

1. Update the `name` in `package.json`
2. Change the app name in `src/app/page.tsx`
3. Update the notification text in `src/app/api/send-notification/route.ts`

### Adding Custom Data Models

1. Create new tables in your Supabase project
2. Add corresponding TypeScript interfaces
3. Create helper functions in `src/lib/supabase.ts`
4. Add API routes in `src/app/api/`

## Deployment

Deploy your app with Vercel:

```bash
# Build for production
yarn build

# Deploy with Vercel
yarn global add vercel
vercel
```

**Important:** Make sure to add all environment variables from your `.env.local` file to your Vercel project settings:

1. Go to your project dashboard on Vercel
2. Navigate to Settings > Environment Variables
3. Add each variable from your `.env.local` file
4. Update `NEXT_PUBLIC_APP_URL` to your production URL (e.g., `https://scaffold.wiki`)

## License

MIT

## References

- [Farcaster Mini App Docs](https://miniapps.farcaster.xyz/)
- [Neynar Documentation](https://docs.neynar.com/)

## Troubleshooting

### InvalidDomainManifest Error

If you encounter the `AddFrame.InvalidDomainManifest: Invalid domain manifest` error when users try to add your app, check these common issues:

1. **Domain Mismatch**: Ensure that the domain in your accountAssociation payload matches exactly with the domain your app is running on. For example, if your payload has `www.domain.com`, your app must run on `www.domain.com` (not just `domain.com`).

2. **Webhook URL**: Make sure you're using the correct Neynar webhook URL in your manifest's `webhookUrl` field. It should be in the format:
   ```
   https://api.neynar.com/f/app/YOUR-APP-ID-HERE/event
   ```

3. **Manifest Formatting**: Ensure your farcaster.json file has no trailing whitespace or formatting issues.

4. **Permissions**: Verify the `permissions` field in your manifest contains the required permissions.

5. **Domain Verification**: Complete the domain verification process in Warpcast's developer tools to properly associate your domain with your Farcaster account.

6. **Required Fields**: Make sure your manifest includes all required fields: version, permissions, notifications configuration, etc.

### Notification Issues

If notifications aren't working:

1. Verify your Neynar API key is correctly set in your environment variables
2. Ensure users have successfully added your app with notification permissions
3. Check that the notification tokens are being properly stored in your database
4. Review the Neynar dashboard for any API errors or rate limiting issues

### Notification Token Cleanup

The scaffold includes cleanup functionality to remove notification tokens when users remove the Mini App. This prevents sending notifications to users who have uninstalled your app:

1. The SDK provides context about whether the app is added for each user session
2. When a previously added app is detected as no longer added, the notification token is automatically removed from the database
3. You can verify this behavior in the `src/lib/auth.ts` file where app status changes are monitored

For manual cleanup, you can add a scheduled job to periodically verify tokens with Neynar and remove any that are no longer valid.

## Webhooks Handler

This project includes a webhook handler endpoint at `/api/webhook` that can process incoming webhook requests from external services. The handler supports:

1. Processing different event types:
   - `user.created` - When a new user is created
   - `frame.added` - When a user adds your Frame/Mini App
   - `notification.sent` - Notification delivery events

2. Signature verification (when implemented with your webhook provider)

3. Event logging to Supabase

### Database Tables Required

Create the following tables in your Supabase project to support webhooks:

```sql
-- Table for storing webhook events
CREATE TABLE webhook_events (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  fid INT,
  data JSONB,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for logging notification delivery
CREATE TABLE notification_logs (
  id SERIAL PRIMARY KEY,
  notification_id TEXT,
  fid INT,
  success BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX webhook_events_event_type_idx ON webhook_events (event_type);
CREATE INDEX webhook_events_fid_idx ON webhook_events (fid);
CREATE INDEX notification_logs_fid_idx ON notification_logs (fid);
```