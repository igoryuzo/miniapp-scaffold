# DollarChain Mini App

A barebones Next.js TypeScript app with Farcaster authentication and Neynar notifications.

## Features

- **Farcaster Authentication**: Automatic authentication when a user opens the mini app
- **Neynar Notifications**: Ready-to-use notification functionality

## Prerequisites

- Node.js: Version 18 or higher
- Yarn: Package manager
- Neynar API key: For notification functionality

## Environment Variables

Create a `.env.local` file with the following variables:

```
# Neynar API keys
NEXT_PUBLIC_NEYNAR_API_KEY=your_neynar_api_key

# Farcaster app settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Getting Started

### Installation

```bash
# Install dependencies
yarn install
```

### Development

```bash
# Start the development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Build for Production

```bash
# Build the app
yarn build

# Start the production server
yarn start
```

## Project Structure

- `src/lib/auth.ts`: Farcaster authentication functions
- `src/lib/notifications.ts`: Neynar notification services
- `src/app/page.tsx`: Main app page with authentication flow

## References

- [Farcaster Documentation](https://docs.farcaster.xyz/frames)
- [Neynar Documentation](https://docs.neynar.com/)
