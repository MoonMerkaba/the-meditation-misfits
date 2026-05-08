import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SubscriptionPlans } from './SubscriptionPlans';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubscriptionModal = ({ open, onOpenChange }: SubscriptionModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async (planType: 'monthly' | 'yearly') => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to subscribe',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Get price IDs from environment variables
      const monthlyPriceId = import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID;
      const yearlyPriceId = import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID;

      if (!monthlyPriceId || !yearlyPriceId) {
        toast({
          title: 'Configuration Error',
          description: 'Stripe price IDs are not configured. Please check your .env file.',
          variant: 'destructive'
        });
        return;
      }

      const priceId = planType === 'monthly' ? monthlyPriceId : yearlyPriceId;


      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          userId: user.id,
          email: user.email
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to start checkout',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-3xl text-center">Upgrade to Premium</DialogTitle>
          <p className="text-center text-gray-400 mt-2">Start your 7-day free trial today!</p>
        </DialogHeader>
        <SubscriptionPlans onSelectPlan={handleSelectPlan} loading={loading} />

      </DialogContent>
    </Dialog>
  );
};
