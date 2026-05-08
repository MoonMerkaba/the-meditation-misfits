import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyToken } from '../lib/verification';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function VerificationHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    const result = verifyToken(token);
    
    if (result.success) {
      setStatus('success');
      setMessage('Email verified successfully!');
    } else {
      setStatus('error');
      setMessage(result.error || 'Verification failed');
    }
  }, [searchParams]);

  const handleContinue = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-center">
            {status === 'verifying' && <AlertCircle className="h-6 w-6 text-blue-500 animate-pulse" />}
            {status === 'success' && <CheckCircle className="h-6 w-6 text-green-500" />}
            {status === 'error' && <XCircle className="h-6 w-6 text-red-500" />}
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-300">{message}</p>
          {status !== 'verifying' && (
            <Button onClick={handleContinue} className="w-full">
              Continue to App
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
