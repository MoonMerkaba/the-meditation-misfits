import React, { useState } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Mail, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const EmailVerificationBanner: React.FC = () => {
  const { user, resendVerificationEmail } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!user || user.emailVerified || dismissed) {
    return null;
  }

  const handleResend = async () => {
    setLoading(true);
    setMessage('');
    
    const result = await resendVerificationEmail();
    
    if (result.success) {
      setMessage('Verification email sent! Check your inbox.');
    } else {
      setMessage('Failed to send email. Try again later.');
    }
    
    setLoading(false);
  };

  return (
    <Alert className="border-yellow-300 bg-yellow-50 relative">
      <Mail className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800 pr-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="font-medium">Please verify your email address</p>
            {message && <p className="text-sm mt-1">{message}</p>}
          </div>
          <Button
            onClick={handleResend}
            disabled={loading}
            size="sm"
            variant="outline"
            className="border-yellow-400 hover:bg-yellow-100"
          >
            {loading ? 'Sending...' : 'Resend Email'}
          </Button>
        </div>
      </AlertDescription>
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-yellow-600 hover:text-yellow-800"
      >
        <X className="h-4 w-4" />
      </button>
    </Alert>
  );
};
