import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ConstantContactCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Connecting to Constant Contact...');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const success = searchParams.get('success');
    
    if (error) {
      setStatus('error');
      setMessage(`Authorization failed: ${error}`);
      return;
    }
    
    if (success === 'true') {
      setStatus('success');
      setMessage('Successfully connected to Constant Contact!');
      return;
    }
    
    if (!code) {
      setStatus('error');
      setMessage('No authorization code received');
      return;
    }

    // Exchange code for access token
    exchangeCodeForToken(code);
  }, [searchParams]);


  const exchangeCodeForToken = async (code: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('constant-contact-oauth', {
        body: { code }
      });

      if (error) throw error;

      if (data.success) {
        setStatus('success');
        setMessage('Successfully connected to Constant Contact!');
      } else {
        throw new Error(data.error || 'Failed to connect');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Failed to complete authorization');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-center">
            {status === 'processing' && <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-6 w-6 text-green-500" />}
            {status === 'error' && <XCircle className="h-6 w-6 text-red-500" />}
            Constant Contact Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-300">{message}</p>
          {status !== 'processing' && (
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
