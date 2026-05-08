import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface Subscription {
  id: string;
  user_id: string;
  status: string;
  plan_type: 'monthly' | 'yearly';
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_start_date?: string;
  trial_end_date?: string;
  trial_status?: 'none' | 'active' | 'ended' | 'converted';
  trial_reminder_sent?: boolean;
}


export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setIsPremium(false);
      setLoading(false);
      setIsLoading(false);
      return;
    }

    fetchSubscription();
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      setSubscription(data);
      setIsPremium(data?.status === 'active' || data?.status === 'trialing');
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  return { subscription, isPremium, loading, isLoading, refetch: fetchSubscription };
};

