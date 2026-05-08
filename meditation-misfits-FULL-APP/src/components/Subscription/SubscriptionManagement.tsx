import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { CancelSubscriptionModal } from './CancelSubscriptionModal';
import { CreditCard, Calendar, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

export const SubscriptionManagement = () => {
  const { user } = useAuth();
  const { subscription, refetch } = useSubscription();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: { 
          customerId: subscription?.stripe_customer_id,
          returnUrl: window.location.href
        }
      });

      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (reason: string, feedback: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('cancel-subscription', {
        body: { 
          subscriptionId: subscription?.stripe_subscription_id,
          reason,
          feedback
        }
      });

      if (error) throw error;
      
      toast({ title: 'Subscription Canceled', description: 'Your subscription has been canceled.' });
      setShowCancelModal(false);
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    setLoading(true);
    try {
      const priceId = subscription?.plan_name === 'Yearly Premium' 
        ? import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID 
        : import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID;

      const { error } = await supabase.functions.invoke('reactivate-subscription', {
        body: { 
          customerId: subscription?.stripe_customer_id,
          priceId
        }
      });

      if (error) throw error;
      
      toast({ title: 'Subscription Reactivated', description: 'Welcome back!' });
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!subscription) {
    return (
      <Card className="bg-gray-900 border-purple-500/30 p-6">
        <p className="text-gray-400">No active subscription found.</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Card className="bg-gray-900 border-purple-500/30 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Current Plan</h3>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-2xl font-bold text-purple-400">{subscription.plan_name || 'Premium'}</p>
              <Badge className={subscription.status === 'active' ? 'bg-green-600' : 'bg-yellow-600'}>
                {subscription.status}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-gray-400">Next billing date</p>
              <p className="text-white font-semibold">
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900 border-purple-500/30 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Manage Subscription</h3>
          <div className="space-y-3">
            <Button onClick={handleManageBilling} disabled={loading} className="w-full">
              <CreditCard className="mr-2 h-4 w-4" />
              Update Payment Method & View Billing History
            </Button>
            
            {subscription.status === 'active' && (
              <Button 
                onClick={() => setShowCancelModal(true)} 
                variant="destructive"
                className="w-full"
                disabled={loading}
              >
                Cancel Subscription
              </Button>
            )}
            
            {subscription.status === 'canceled' && (
              <Button onClick={handleReactivate} disabled={loading} className="w-full">
                Reactivate Subscription
              </Button>
            )}
          </div>
        </Card>
      </div>

      <CancelSubscriptionModal
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        onConfirm={handleCancelSubscription}
        loading={loading}
      />
    </>
  );
};
