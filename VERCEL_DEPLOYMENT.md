# Vercel Deployment Guide

This guide provides detailed instructions for deploying your Mini App scaffold to Vercel.

## Prerequisites

- A Vercel account
- Your project pushed to a Git repository (GitHub, GitLab, BitBucket)

## Deployment Steps

### 1. Connect Your Repository

1. Log in to your Vercel account
2. Click "Add New" > "Project"
3. Import your Git repository
4. Select the repository containing your Mini App scaffold

### 2. Configure Project

1. Keep the default build settings:
   - Framework Preset: Next.js
   - Build Command: `yarn build` (or `npm run build`)
   - Output Directory: `.next`

2. Expand the "Environment Variables" section

### 3. Add Environment Variables

Add all the variables from your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEYNAR_API_KEY=your_neynar_api_key
```

### 4. Set Production URL

For the `NEXT_PUBLIC_APP_URL` variable, use your production URL:

```
NEXT_PUBLIC_APP_URL=https://miniapp-scaffold.vercel.app
```

**Important:** If you've set up a custom domain, use that instead.

### 5. Deploy

Click "Deploy" and wait for the build to complete.

### 6. Custom Domain (Optional)

If you want to use a custom domain:

1. Go to your project in the Vercel dashboard
2. Navigate to "Settings" > "Domains"
3. Add your custom domain
4. Update the `NEXT_PUBLIC_APP_URL` environment variable to match your custom domain

## Troubleshooting

- If notifications aren't working, check that your `NEXT_PUBLIC_APP_URL` is set correctly
- Verify all environment variables are properly set
- Check build logs for any errors

## Updating Your Deployment

After making changes to your codebase:

1. Push changes to your Git repository
2. Vercel will automatically trigger a new deployment
3. If you've updated environment variables, make sure to update them in the Vercel dashboard as well 