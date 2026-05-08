import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, firstName, lastName } = await req.json()

    // Get stored access token from Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: tokenData, error: tokenError } = await supabase
      .from('constant_contact_tokens')
      .select('*')
      .eq('id', 1)
      .single()

    if (tokenError || !tokenData) {
      throw new Error('No Constant Contact authorization found')
    }

    // Check if token is expired and refresh if needed
    let accessToken = tokenData.access_token
    if (new Date(tokenData.expires_at) <= new Date()) {
      // Refresh token logic here
      const clientId = Deno.env.get('CONSTANT_CONTACT_CLIENT_ID')
      const clientSecret = Deno.env.get('CONSTANT_CONTACT_CLIENT_SECRET')
      
      const refreshResponse = await fetch('https://authz.constantcontact.com/oauth2/default/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
        },
        body: new URLSearchParams({
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token'
        })
      })

      const newTokenData = await refreshResponse.json()
      accessToken = newTokenData.access_token

      // Update stored tokens
      await supabase
        .from('constant_contact_tokens')
        .update({
          access_token: newTokenData.access_token,
          expires_at: new Date(Date.now() + newTokenData.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', 1)
    }

    // Add contact to Constant Contact
    const response = await fetch('https://api.cc.email/v3/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email_address: { address: email, permission_to_send: 'implicit' },
        first_name: firstName,
        last_name: lastName,
        create_source: 'Account'
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to add contact: ${error}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
