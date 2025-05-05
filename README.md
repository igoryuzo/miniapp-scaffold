# MiniApp Scaffold

A quick-start scaffold for Farcaster Frame applications with user authentication, notifications, and data persistence using Supabase.

## Features

- ✅ Farcaster Frame SDK integration
- ✅ User authentication flow
- ✅ Push notifications
- ✅ Supabase for data storage
- ✅ Next.js 15 with App Router

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
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

In your Supabase project, create the following tables:

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

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## How It Works

### Authentication

The scaffold uses Farcaster Frame SDK for authentication. The main authentication flow is in `src/lib/auth.ts`. Key features:

- In-memory user state (not using localStorage for better security)
- Secure nonce generation for auth
- User profile storage in Supabase
- Frame addition & notification permission handling

### Notifications

The notification system is built using Neynar. The main notification logic is in:

- `src/lib/neynar.ts` - Client-side notification helpers
- `src/app/api/send-notification/route.ts` - API route for sending notifications
- `src/app/api/store-notification-token/route.ts` - API route for storing notification tokens

### Data Storage

Supabase is used for data persistence. The main database operations are in:

- `src/lib/supabase.ts` - Core Supabase client configuration
- `src/app/api/users/save/route.ts` - API route for saving user data

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
npm run build

# Deploy with Vercel
vercel
```

## License

MIT

## References

- [Farcaster Documentation](https://docs.farcaster.xyz/frames)
- [Neynar Documentation](https://docs.neynar.com/)
