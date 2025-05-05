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
NEXT_PUBLIC_APP_URL=http://localhost:3000
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

When deploying your app, you'll need to:

1. Update the manifest with your app's information
2. Verify ownership by adding an `accountAssociation` field (use the [Mini App Manifest Tool](https://warpcast.com/~/developers/new) to generate this)

Example manifest:
```json
{
  "frame": {
    "version": "1",
    "name": "Mini App Scaffold",
    "iconUrl": "https://miniapp-scaffold.vercel.app/scaffolding-icon.png",
    "homeUrl": "https://miniapp-scaffold.vercel.app/",
    "imageUrl": "https://miniapp-scaffold.vercel.app/miniapp-scaffolding.png",
    "buttonTitle": "Start Building",
    "splashImageUrl": "https://miniapp-scaffold.vercel.app/loading-icon.png",
    "splashBackgroundColor": "#0f172a",
    "webhookUrl": "https://miniapp-scaffold.vercel.app/api/webhook",
    "subtitle": "Quick-start scaffold for Farcaster Mini Apps",
    "description": "Quickly build Farcaster Mini Apps with user authentication, notifications, and data persistence using Supabase.",
    "primaryCategory": "developer",
    "tags": [
      "scaffold",
      "boilerplate",
      "auth",
      "notifications",
      "supabase"
    ],
    "tagline": "Build your Mini App from a solid foundation"
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
  imageUrl: `${baseUrl}/miniapp-scaffolding.png`,
  button: {
    title: "Start Building",
    action: {
      type: "launch_frame",
      name: "Mini App Scaffold",
      url: `${baseUrl}/`,
      splashImageUrl: `${baseUrl}/loading-icon.png`,
      splashBackgroundColor: "#0f172a",
    },
  },
};

export const metadata: Metadata = {
  title: "Mini App Scaffold",
  description: "Quick-start scaffold for Farcaster Mini Apps with authentication, notifications, and data persistence",
  icons: {
    icon: "/scaffolding-icon.png",
    apple: "/scaffolding-icon.png",
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
4. Update `NEXT_PUBLIC_APP_URL` to your production URL (e.g., `https://miniapp-scaffold.vercel.app`)

## License

MIT

## References

- [Farcaster Mini App Docs](https://miniapps.farcaster.xyz/)
- [Neynar Documentation](https://docs.neynar.com/)
