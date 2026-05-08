# OAuth Provider Setup Guide

This guide explains how to enable Google, Facebook, and GitHub OAuth authentication in your Supabase project.

## Prerequisites
- Access to your Supabase Dashboard
- Admin permissions for your Supabase project

## Step-by-Step Setup

### 1. Access Supabase Authentication Settings

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Providers** in the left sidebar

### 2. Enable Google OAuth

1. Find **Google** in the providers list
2. Toggle it to **Enabled**
3. You'll need to create a Google OAuth application:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Set application type to **Web application**
   - Add authorized redirect URI: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret**
4. Paste the credentials into Supabase:
   - **Client ID (for OAuth)**: Your Google Client ID
   - **Client Secret (for OAuth)**: Your Google Client Secret
5. Click **Save**

### 3. Enable Facebook OAuth

1. Find **Facebook** in the providers list
2. Toggle it to **Enabled**
3. Create a Facebook App:
   - Go to [Facebook Developers](https://developers.facebook.com)
   - Click **Create App**
   - Select **Consumer** as app type
   - Add **Facebook Login** product
   - Go to **Settings** → **Basic**
   - Copy **App ID** and **App Secret**
   - In **Facebook Login Settings**, add redirect URI: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
4. Paste credentials into Supabase:
   - **Facebook client ID**: Your App ID
   - **Facebook secret**: Your App Secret
5. Click **Save**

### 4. Enable GitHub OAuth

1. Find **GitHub** in the providers list
2. Toggle it to **Enabled**
3. Create a GitHub OAuth App:
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click **New OAuth App**
   - Fill in application details
   - Set **Authorization callback URL**: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
   - Click **Register application**
   - Copy the **Client ID**
   - Generate and copy the **Client Secret**
4. Paste credentials into Supabase:
   - **Client ID**: Your GitHub Client ID
   - **Client Secret**: Your GitHub Client Secret
5. Click **Save**

## Testing OAuth Providers

After enabling the providers:

1. The social auth buttons will automatically appear in your login modal
2. Test each provider by clicking the respective button
3. You should be redirected to the provider's login page
4. After successful authentication, you'll be redirected back to your app

## Troubleshooting

### "Unsupported provider" Error
- Ensure the provider is **enabled** in Supabase Dashboard
- Verify credentials are correctly entered
- Check that redirect URIs match exactly

### Redirect URI Mismatch
- Ensure the redirect URI in provider settings matches: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
- Replace `[YOUR-PROJECT-REF]` with your actual Supabase project reference

### Provider-Specific Issues

**Google:**
- Ensure Google+ API is enabled
- Verify OAuth consent screen is configured

**Facebook:**
- App must be in "Live" mode for production
- Ensure Facebook Login product is added

**GitHub:**
- Verify OAuth App is not suspended
- Check that the app has correct permissions

## Security Notes

- Never commit OAuth credentials to version control
- Use environment variables for sensitive data
- Regularly rotate OAuth secrets
- Monitor authentication logs in Supabase Dashboard

## Support

For additional help:
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Discord Community](https://discord.supabase.com)
