# Nginx SPA Routing for Namecheap Hosting

## The Problem
Your app is hosted on Namecheap with Nginx, but `.htaccess` files only work with Apache servers. This means when someone visits a direct URL like `/the-meditation-misfits/verify?code=xxx`, Nginx doesn't know to serve your React app and returns a 404.

## The Solution: 404.html Fallback

We've implemented a 404.html fallback system that works on Nginx:

1. **404.html** - When Nginx can't find a file, it serves this page
2. **404.html** stores the original URL and redirects to the main app
3. **main.tsx** reads the stored URL and navigates to the correct route

## Setup Instructions for Namecheap

### Option 1: Configure Custom 404 Page (Recommended)

1. Log into your **Namecheap cPanel**
2. Go to **File Manager** or use FTP
3. Navigate to your website's root directory (usually `public_html`)
4. Look for a file called `.htaccess` in the ROOT of your website (not in the-meditation-misfits folder)
5. Add this line to handle 404s for your subdirectory:

```apache
ErrorDocument 404 /the-meditation-misfits/404.html
```

### Option 2: Namecheap Error Pages Setting

1. Log into **cPanel**
2. Find **Error Pages** in the Advanced section
3. Select your domain
4. Click on **404 (Not Found)**
5. Set the custom error page to: `/the-meditation-misfits/404.html`

### Option 3: Contact Namecheap Support

If you have Nginx hosting (not Apache), ask Namecheap support to add this to your nginx configuration:

```nginx
location /the-meditation-misfits {
    try_files $uri $uri/ /the-meditation-misfits/index.html;
}
```

## Testing

After deploying, visit these URLs to test:

1. `https://www.samanthabushika.com/the-meditation-misfits/test.html` - Should show test page
2. `https://www.samanthabushika.com/the-meditation-misfits/` - Should show main app
3. `https://www.samanthabushika.com/the-meditation-misfits/verify?code=test` - Should load app and handle the route

## Alternative: Hash-Based Routing

If the 404 fallback doesn't work, we can switch to hash-based routing which doesn't require server configuration:

- Current: `/the-meditation-misfits/verify?code=xxx`
- Hash-based: `/the-meditation-misfits/#/verify?code=xxx`

Let me know if you'd like to switch to hash-based routing instead.

## Constant Contact Redirect URI

Once routing is working, your Constant Contact redirect URI should be:
```
https://www.samanthabushika.com/the-meditation-misfits/verify
```

This will receive the OAuth callback and exchange the code for tokens.
