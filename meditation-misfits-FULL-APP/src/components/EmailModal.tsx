import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { storage, verificationStorage } from '../lib/storage';
import { sendVerificationEmail } from '../lib/verification';
import { Mail } from 'lucide-react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailModal({ isOpen, onClose }: EmailModalProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('');
    
    const endpoint = import.meta.env.VITE_CONTACT_POST_URL;
    
    if (endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, subscribed })
        });

        if (res.ok) {
          storage.set('mm.lead.email', email);
          
          // Send verification email
          const verifyResult = await sendVerificationEmail(email);
          if (verifyResult.success) {
            setStatus('Success! Check your email for verification link.');
          } else {
            setStatus('Subscribed! Verification email failed to send.');
          }
        } else {
          setStatus('Error. Try again.');
        }
      } catch {
        setStatus('Error. Try again.');
      }
    } else {
      storage.set('mm.lead.email', email);
      
      // Send verification email (local mode)
      const verifyResult = await sendVerificationEmail(email);
      if (verifyResult.success) {
        setStatus('Success! Check console for verification link (dev mode).');
      }
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Claim Your Free Gift
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="newsletter"
              checked={subscribed}
              onChange={(e) => setSubscribed(e.target.checked)}
              required
              className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="newsletter" className="text-sm text-gray-300">
              I agree to subscribe to the Progressing Not Perfecting newsletter to receive my free gift and future updates.
            </label>

          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Get My Freebie'}
          </Button>
          {status && (
            <p className={`text-sm text-center ${status.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
              {status}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
