# Edge Function Security Updates

## Summary

This document outlines the security improvements needed for edge functions that access the `constant_contact_tokens` table (also referred to as `cc_tokens`).

## Current Status

All three edge functions already use the `SUPABASE_SERVICE_ROLE_KEY` correctly:
- ✅ `add-to-constant-contact/index.ts` - Uses service role key
- ✅ `constant-contact-oauth/index.ts` - Uses service role key  
- ✅ `constant-contact-callback/index.ts` - Redirect handler (no direct DB access)

## Required Improvements

### 1. Create Security Audit Log Table

Run this migration to create a security audit log table:

```sql
-- Migration: 006_security_audit_log.sql
CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL DEFAULT 'general',
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  source_function TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_security_audit_event_type ON security_audit_log(event_type);
CREATE INDEX idx_security_audit_category ON security_audit_log(event_category);
CREATE INDEX idx_security_audit_severity ON security_audit_log(severity);
CREATE INDEX idx_security_audit_created_at ON security_audit_log(created_at DESC);

-- Enable RLS and restrict access
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage audit logs" ON security_audit_log
  FOR ALL
  USING (auth.role() = 'service_role');

REVOKE ALL ON security_audit_log FROM anon, authenticated;
GRANT INSERT, SELECT ON security_audit_log TO service_role;
```

### 2. Updated `add-to-constant-contact/index.ts`

Replace the entire file with:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Security event types
const SecurityEvents = {
  TOKEN_REFRESH_SUCCESS: 'cc_token_refresh_success',
  TOKEN_REFRESH_FAILURE: 'cc_token_refresh_failure',
  TOKEN_FETCH_FAILURE: 'cc_token_fetch_failure',
  CONTACT_ADD_SUCCESS: 'cc_contact_add_success',
  CONTACT_ADD_FAILURE: 'cc_contact_add_failure',
  INVALID_REQUEST: 'cc_invalid_request',
  MISSING_CREDENTIALS: 'cc_missing_credentials',
} as const

// Initialize Supabase client with service role key
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration')
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Log security events to audit table
async function logSecurityEvent(
  supabase: ReturnType<typeof createClient>,
  eventType: string,
  severity: 'debug' | 'info' | 'warning' | 'error' | 'critical',
  details: Record<string, unknown>,
  errorMessage?: string,
  req?: Request
) {
  try {
    const ipAddress = req?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                      req?.headers.get('x-real-ip') || 
                      null
    const userAgent = req?.headers.get('user-agent') || null

    await supabase.from('security_audit_log').insert({
      event_type: eventType,
      event_category: 'constant_contact',
      severity,
      source_function: 'add-to-constant-contact',
      ip_address: ipAddress,
      user_agent: userAgent,
      details,
      error_message: errorMessage,
    })
  } catch (logError) {
    console.error('Failed to log security event:', logError)
  }
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Sanitize string input
function sanitizeString(input: string | undefined | null, maxLength = 100): string {
  if (!input) return ''
  return String(input).trim().slice(0, maxLength)
}

// Refresh the access token
async function refreshAccessToken(
  supabase: ReturnType<typeof createClient>,
  refreshToken: string,
  req?: Request
): Promise<{ success: boolean; accessToken?: string; error?: string }> {
  const clientId = Deno.env.get('CONSTANT_CONTACT_CLIENT_ID')
  const clientSecret = Deno.env.get('CONSTANT_CONTACT_CLIENT_SECRET')

  if (!clientId || !clientSecret) {
    await logSecurityEvent(
      supabase,
      SecurityEvents.MISSING_CREDENTIALS,
      'critical',
      { reason: 'Missing API credentials' },
      'Missing CONSTANT_CONTACT_CLIENT_ID or CONSTANT_CONTACT_CLIENT_SECRET',
      req
    )
    return { success: false, error: 'Missing API credentials' }
  }

  try {
    const refreshResponse = await fetch('https://authz.constantcontact.com/oauth2/default/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    })

    if (!refreshResponse.ok) {
      const errorText = await refreshResponse.text()
      await logSecurityEvent(
        supabase,
        SecurityEvents.TOKEN_REFRESH_FAILURE,
        'error',
        { statusCode: refreshResponse.status },
        `Token refresh failed: ${errorText}`,
        req
      )
      return { success: false, error: `Token refresh failed: ${refreshResponse.status}` }
    }

    const newTokenData = await refreshResponse.json()

    if (!newTokenData.access_token) {
      await logSecurityEvent(
        supabase,
        SecurityEvents.TOKEN_REFRESH_FAILURE,
        'error',
        { reason: 'Missing access_token in response' },
        'Invalid token refresh response',
        req
      )
      return { success: false, error: 'Invalid token refresh response' }
    }

    // Update stored tokens
    const expiresAt = new Date(Date.now() + (newTokenData.expires_in || 7200) * 1000).toISOString()
    
    const { error: updateError } = await supabase
      .from('constant_contact_tokens')
      .update({
        access_token: newTokenData.access_token,
        refresh_token: newTokenData.refresh_token || refreshToken,
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)

    if (updateError) {
      await logSecurityEvent(
        supabase,
        SecurityEvents.TOKEN_REFRESH_FAILURE,
        'error',
        { reason: 'Database update failed' },
        updateError.message,
        req
      )
      return { success: false, error: 'Failed to store refreshed token' }
    }

    await logSecurityEvent(
      supabase,
      SecurityEvents.TOKEN_REFRESH_SUCCESS,
      'info',
      { expiresAt },
      undefined,
      req
    )

    return { success: true, accessToken: newTokenData.access_token }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await logSecurityEvent(
      supabase,
      SecurityEvents.TOKEN_REFRESH_FAILURE,
      'critical',
      { reason: 'Exception during token refresh' },
      errorMessage,
      req
    )
    return { success: false, error: errorMessage }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let supabase: ReturnType<typeof createClient>

  try {
    supabase = getSupabaseClient()
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Service configuration error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  try {
    // Parse request body
    let requestBody: { email?: string; firstName?: string; lastName?: string }
    try {
      requestBody = await req.json()
    } catch {
      await logSecurityEvent(supabase, SecurityEvents.INVALID_REQUEST, 'warning', 
        { reason: 'Invalid JSON body' }, 'Failed to parse request body', req)
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { email, firstName, lastName } = requestBody

    // Validate email
    if (!email || !isValidEmail(email)) {
      await logSecurityEvent(supabase, SecurityEvents.INVALID_REQUEST, 'warning',
        { reason: 'Invalid email' }, 'Email validation failed', req)
      return new Response(
        JSON.stringify({ success: false, error: 'Valid email address is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedEmail = email.toLowerCase().trim()
    const sanitizedFirstName = sanitizeString(firstName)
    const sanitizedLastName = sanitizeString(lastName)

    // Get stored access token
    const { data: tokenData, error: tokenError } = await supabase
      .from('constant_contact_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('id', 1)
      .single()

    if (tokenError || !tokenData) {
      await logSecurityEvent(supabase, SecurityEvents.TOKEN_FETCH_FAILURE, 'error',
        { reason: 'No token record found' }, tokenError?.message || 'No authorization found', req)
      return new Response(
        JSON.stringify({ success: false, error: 'Constant Contact not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 503 }
      )
    }

    // Check if token needs refresh (expired or expiring within 5 minutes)
    let accessToken = tokenData.access_token
    const tokenExpiry = new Date(tokenData.expires_at)
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000)
    
    if (tokenExpiry <= fiveMinutesFromNow) {
      const refreshResult = await refreshAccessToken(supabase, tokenData.refresh_token, req)
      
      if (!refreshResult.success) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Authentication expired. Please re-authorize.',
            requiresReauth: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }
      accessToken = refreshResult.accessToken!
    }

    // Add contact to Constant Contact
    const response = await fetch('https://api.cc.email/v3/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email_address: { address: sanitizedEmail, permission_to_send: 'implicit' },
        first_name: sanitizedFirstName || undefined,
        last_name: sanitizedLastName || undefined,
        create_source: 'Account'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      
      // Handle duplicate contact (409)
      if (response.status === 409) {
        await logSecurityEvent(supabase, SecurityEvents.CONTACT_ADD_SUCCESS, 'info',
          { email: sanitizedEmail, duplicate: true }, undefined, req)
        return new Response(
          JSON.stringify({ success: true, message: 'Contact already exists' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Handle unauthorized (401)
      if (response.status === 401) {
        await logSecurityEvent(supabase, SecurityEvents.CONTACT_ADD_FAILURE, 'error',
          { email: sanitizedEmail, statusCode: 401 }, 'Token rejected', req)
        return new Response(
          JSON.stringify({ success: false, error: 'Authentication failed', requiresReauth: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      await logSecurityEvent(supabase, SecurityEvents.CONTACT_ADD_FAILURE, 'error',
        { email: sanitizedEmail, statusCode: response.status }, errorText, req)
      
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to add contact' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      )
    }

    await logSecurityEvent(supabase, SecurityEvents.CONTACT_ADD_SUCCESS, 'info',
      { email: sanitizedEmail }, undefined, req)

    return new Response(
      JSON.stringify({ success: true, message: 'Contact added successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Unexpected error:', errorMessage)
    
    if (supabase) {
      await logSecurityEvent(supabase, SecurityEvents.CONTACT_ADD_FAILURE, 'critical',
        { reason: 'Unhandled exception' }, errorMessage, req)
    }
    
    return new Response(
      JSON.stringify({ success: false, error: 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
```

### 3. Updated `constant-contact-oauth/index.ts`

Replace the entire file with:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SecurityEvents = {
  OAUTH_SUCCESS: 'cc_oauth_success',
  OAUTH_FAILURE: 'cc_oauth_failure',
  MISSING_CREDENTIALS: 'cc_missing_credentials',
  TOKEN_STORE_FAILURE: 'cc_token_store_failure',
} as const

function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration')
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

async function logSecurityEvent(
  supabase: ReturnType<typeof createClient>,
  eventType: string,
  severity: 'debug' | 'info' | 'warning' | 'error' | 'critical',
  details: Record<string, unknown>,
  errorMessage?: string,
  req?: Request
) {
  try {
    const ipAddress = req?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                      req?.headers.get('x-real-ip') || null
    const userAgent = req?.headers.get('user-agent') || null

    await supabase.from('security_audit_log').insert({
      event_type: eventType,
      event_category: 'constant_contact',
      severity,
      source_function: 'constant-contact-oauth',
      ip_address: ipAddress,
      user_agent: userAgent,
      details,
      error_message: errorMessage,
    })
  } catch (logError) {
    console.error('Failed to log security event:', logError)
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let supabase: ReturnType<typeof createClient>

  try {
    supabase = getSupabaseClient()
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Service configuration error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  try {
    let requestBody: { code?: string }
    try {
      requestBody = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { code } = requestBody

    if (!code || typeof code !== 'string' || code.length > 2000) {
      await logSecurityEvent(supabase, SecurityEvents.OAUTH_FAILURE, 'warning',
        { reason: 'Invalid or missing authorization code' }, 'Code validation failed', req)
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authorization code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const clientId = Deno.env.get('CONSTANT_CONTACT_CLIENT_ID')
    const clientSecret = Deno.env.get('CONSTANT_CONTACT_CLIENT_SECRET')
    const redirectUri = Deno.env.get('CONSTANT_CONTACT_REDIRECT_URI')

    if (!clientId || !clientSecret || !redirectUri) {
      await logSecurityEvent(supabase, SecurityEvents.MISSING_CREDENTIALS, 'critical',
        { reason: 'Missing environment variables' }, 'Missing Constant Contact credentials', req)
      return new Response(
        JSON.stringify({ success: false, error: 'Service not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://authz.constantcontact.com/oauth2/default/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
      },
      body: new URLSearchParams({
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      await logSecurityEvent(supabase, SecurityEvents.OAUTH_FAILURE, 'error',
        { statusCode: tokenResponse.status }, `Token exchange failed: ${errorText}`, req)
      return new Response(
        JSON.stringify({ success: false, error: 'Token exchange failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const tokenData = await tokenResponse.json()

    // Validate token response
    if (!tokenData.access_token || !tokenData.refresh_token) {
      await logSecurityEvent(supabase, SecurityEvents.OAUTH_FAILURE, 'error',
        { reason: 'Invalid token response' }, 'Missing tokens in response', req)
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token response' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Store tokens in Supabase
    const expiresAt = new Date(Date.now() + (tokenData.expires_in || 7200) * 1000).toISOString()
    
    const { error: dbError } = await supabase
      .from('constant_contact_tokens')
      .upsert({
        id: 1,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      })

    if (dbError) {
      await logSecurityEvent(supabase, SecurityEvents.TOKEN_STORE_FAILURE, 'critical',
        { reason: 'Database error' }, dbError.message, req)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to store tokens' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    await logSecurityEvent(supabase, SecurityEvents.OAUTH_SUCCESS, 'info',
      { expiresAt }, undefined, req)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Unexpected error:', errorMessage)
    
    if (supabase) {
      await logSecurityEvent(supabase, SecurityEvents.OAUTH_FAILURE, 'critical',
        { reason: 'Unhandled exception' }, errorMessage, req)
    }
    
    return new Response(
      JSON.stringify({ success: false, error: 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
```

### 4. Updated `constant-contact-callback/index.ts`

Replace the entire file with:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  
  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

async function logSecurityEvent(
  eventType: string,
  severity: string,
  details: Record<string, unknown>,
  errorMessage?: string,
  req?: Request
) {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) return

    const ipAddress = req?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                      req?.headers.get('x-real-ip') || null
    const userAgent = req?.headers.get('user-agent') || null

    await supabase.from('security_audit_log').insert({
      event_type: eventType,
      event_category: 'constant_contact',
      severity,
      source_function: 'constant-contact-callback',
      ip_address: ipAddress,
      user_agent: userAgent,
      details,
      error_message: errorMessage,
    })
  } catch (logError) {
    console.error('Failed to log security event:', logError)
  }
}

serve(async (req) => {
  const appUrl = Deno.env.get('APP_URL') || 'https://www.samanthabushika.com/the-meditation-misfits'
  
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error')
    const errorDescription = url.searchParams.get('error_description')
    
    if (error) {
      await logSecurityEvent('cc_callback_error', 'warning',
        { error, errorDescription }, errorDescription || error, req)
      return Response.redirect(`${appUrl}/verify?error=${encodeURIComponent(error)}`, 302)
    }
    
    if (!code) {
      await logSecurityEvent('cc_callback_error', 'warning',
        { reason: 'No authorization code' }, 'Missing code parameter', req)
      return Response.redirect(`${appUrl}/verify?error=no_code`, 302)
    }

    // Validate code format (basic sanity check)
    if (code.length > 2000 || !/^[a-zA-Z0-9_-]+$/.test(code)) {
      await logSecurityEvent('cc_callback_error', 'warning',
        { reason: 'Invalid code format' }, 'Code validation failed', req)
      return Response.redirect(`${appUrl}/verify?error=invalid_code`, 302)
    }

    // Exchange code for token
    const oauthUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/constant-contact-oauth`
    
    const tokenResponse = await fetch(oauthUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({ code })
    })

    const result = await tokenResponse.json()

    if (result.success) {
      await logSecurityEvent('cc_callback_success', 'info', {}, undefined, req)
      return Response.redirect(`${appUrl}/verify?success=true`, 302)
    } else {
      await logSecurityEvent('cc_callback_error', 'error',
        { reason: 'OAuth exchange failed' }, result.error || 'Unknown error', req)
      return Response.redirect(`${appUrl}/verify?error=${encodeURIComponent(result.error || 'unknown')}`, 302)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Callback error:', errorMessage)
    
    await logSecurityEvent('cc_callback_error', 'critical',
      { reason: 'Unhandled exception' }, errorMessage, req)
    
    return Response.redirect(`${appUrl}/verify?error=${encodeURIComponent('server_error')}`, 302)
  }
})
```

## Security Improvements Summary

### ✅ Service Role Key Usage
All functions now properly use `SUPABASE_SERVICE_ROLE_KEY` with explicit configuration:
```typescript
createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})
```

### ✅ Error Handling
- Try-catch blocks around all operations
- Graceful fallbacks for all error scenarios
- User-friendly error messages (no sensitive data exposed)
- Proper HTTP status codes

### ✅ Security Event Logging
All functions now log to `security_audit_log` table:
- Token refresh success/failure
- OAuth authorization success/failure
- Contact add success/failure
- Invalid requests
- Missing credentials
- Unhandled exceptions

### ✅ Input Validation
- Email format validation
- String sanitization with length limits
- Authorization code validation
- JSON parsing error handling

### ✅ Token Refresh Improvements
- Proactive refresh (5 minutes before expiry)
- Proper error handling if refresh fails
- `requiresReauth` flag in response for client handling
- Fallback to existing refresh token if new one not provided

## Monitoring Queries

### View Recent Security Events
```sql
SELECT * FROM security_audit_log 
WHERE event_category = 'constant_contact'
ORDER BY created_at DESC 
LIMIT 100;
```

### View Token Refresh Failures
```sql
SELECT * FROM security_audit_log 
WHERE event_type = 'cc_token_refresh_failure'
ORDER BY created_at DESC;
```

### View Critical Events (Last 24 Hours)
```sql
SELECT * FROM security_audit_log 
WHERE severity = 'critical'
AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### Event Summary by Type
```sql
SELECT 
  event_type,
  severity,
  COUNT(*) as count,
  MAX(created_at) as last_occurrence
FROM security_audit_log 
WHERE event_category = 'constant_contact'
GROUP BY event_type, severity
ORDER BY count DESC;
```

## Deployment Steps

1. Run the security audit log migration in Supabase SQL editor
2. Update each edge function via Supabase Dashboard or CLI:
   ```bash
   supabase functions deploy add-to-constant-contact
   supabase functions deploy constant-contact-oauth
   supabase functions deploy constant-contact-callback
   ```
3. Test the integration by adding a contact
4. Verify security events are being logged

## Notes

- The `cc_tokens` table mentioned in the lint warning is the same as `constant_contact_tokens`
- All sensitive operations now have audit trails
- Token refresh failures will be logged with full context for debugging
- IP addresses and user agents are captured for security analysis
