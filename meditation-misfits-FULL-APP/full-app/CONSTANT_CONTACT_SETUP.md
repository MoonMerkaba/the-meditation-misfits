# Constant Contact Integration Setup

## Overview
This app integrates with Constant Contact to automatically add new users to your email list when they sign up.

## Setup Steps

### 1. Run Database Migration
Execute the migration file to create the tokens table:
```bash
supabase db push
```

### 2. Configure Constant Contact App
1. Go to https://app.constantcontact.com/pages/dma/portal/
2. Create a new app or use existing one
3. Set the **Redirect URI** to:
   - Production: `https://www.samanthabushika.com/the-meditation-misfits/verify`
   - Development: `http://localhost:5173/verify`

### 3. Set Environment Variables
Add these to your `.env` file and Supabase:

```env
CONSTANT_CONTACT_CLIENT_ID=your_client_id
CONSTANT_CONTACT_CLIENT_SECRET=your_client_secret
CONSTANT_CONTACT_REDIRECT_URI=https://www.samanthabushika.com/the-meditation-misfits/verify
```

### 4. Authorize Your App
1. Visit this URL (replace YOUR_CLIENT_ID):
```
https://authz.constantcontact.com/oauth2/default/v1/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=https://www.samanthabushika.com/the-meditation-misfits/verify&response_type=code&scope=contact_data
```

2. Log in with your Constant Contact account
3. Authorize the app
4. You'll be redirected to `/verify` which will exchange the code for tokens and store them

### 5. Test the Integration
- Sign up a new user in your app
- Check your Constant Contact account to verify the contact was added

## How It Works

1. **Initial Authorization**: You (the app owner) authorize the app once using OAuth
2. **Token Storage**: Access and refresh tokens are stored in Supabase
3. **Auto-Sync**: When users sign up, the app automatically adds them to your Constant Contact list
4. **Token Refresh**: Expired tokens are automatically refreshed when needed

## Troubleshooting

### "No authorization code received"
- Make sure the redirect URI in Constant Contact matches exactly
- Check that you're using the correct authorization URL

### "No Constant Contact authorization found"
- Complete the authorization flow first (step 4)
- Verify the database migration ran successfully

### Users not being added
- Check Supabase function logs: `supabase functions logs add-to-constant-contact`
- Verify your access token hasn't expired
- Ensure the email address is valid
