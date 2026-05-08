import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';

export function ConstantContactSettings() {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [redirectUri] = useState(window.location.origin + '/verify');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveCredentials = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Save to localStorage for now (in production, use secure backend)
      localStorage.setItem('cc_client_id', clientId);
      localStorage.setItem('cc_client_secret', clientSecret);
      
      setMessage({ type: 'success', text: 'Credentials saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save credentials' });
    } finally {
      setLoading(false);
    }
  };

  const handleExchangeCode = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('https://authz.constantcontact.com/oauth2/default/v1/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: accessCode,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      const data = await response.json();

      if (data.access_token) {
        const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
        
        await supabase.from('constant_contact_tokens').upsert({
          id: 1,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: expiresAt,
        });

        setMessage({ type: 'success', text: 'Access token saved! Integration active.' });
        setAccessCode('');
      } else {
        throw new Error(data.error_description || 'Failed to exchange code');
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Constant Contact API Settings</CardTitle>
          <CardDescription>Configure your Constant Contact integration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Enter your Constant Contact Client ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientSecret">Client Secret</Label>
            <Input
              id="clientSecret"
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Enter your Client Secret"
            />
          </div>

          <div className="space-y-2">
            <Label>Redirect URI</Label>
            <Input value={redirectUri} disabled className="bg-gray-50" />
            <p className="text-xs text-gray-500">Use this in your Constant Contact app settings</p>
          </div>

          <Button onClick={handleSaveCredentials} disabled={loading || !clientId || !clientSecret}>
            Save Credentials
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Authorization Code</CardTitle>
          <CardDescription>Paste the access code from Constant Contact</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accessCode">Access Code</Label>
            <Input
              id="accessCode"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Paste authorization code here"
            />
          </div>

          <Button onClick={handleExchangeCode} disabled={loading || !accessCode || !clientId}>
            Exchange Code for Token
          </Button>

          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
