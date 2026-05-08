import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error')
    
    // Get the app URL from environment or construct it
    const appUrl = Deno.env.get('APP_URL') || 'https://www.samanthabushika.com/the-meditation-misfits'
    
    if (error) {
      // Redirect to app with error
      return Response.redirect(`${appUrl}/verify?error=${encodeURIComponent(error)}`, 302)
    }
    
    if (!code) {
      return Response.redirect(`${appUrl}/verify?error=no_code`, 302)
    }

    // Exchange code for token by calling the oauth function
    const oauthUrl = new URL(req.url)
    oauthUrl.pathname = '/functions/v1/constant-contact-oauth'
    
    const tokenResponse = await fetch(oauthUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code })
    })

    const result = await tokenResponse.json()

    if (result.success) {
      // Redirect to app with success
      return Response.redirect(`${appUrl}/verify?success=true`, 302)
    } else {
      // Redirect to app with error
      return Response.redirect(`${appUrl}/verify?error=${encodeURIComponent(result.error || 'unknown')}`, 302)
    }
  } catch (error) {
    const appUrl = Deno.env.get('APP_URL') || 'https://www.samanthabushika.com/the-meditation-misfits'
    return Response.redirect(`${appUrl}/verify?error=${encodeURIComponent(error.message)}`, 302)
  }
})
