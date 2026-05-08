import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Book } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UnlockedReward {
  id: string;
  unlocked_at: string;
  reward: {
    badge_name: string;
    badge_icon: string;
    badge_color: string;
    reward_type: string;
    reward_data: any;
    title: string;
    description: string;
  };
}

export function UnlockedRewards() {
  const [rewards, setRewards] = useState<UnlockedReward[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUnlockedRewards();
  }, []);

  const loadUnlockedRewards = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_streak_rewards')
        .select('*, reward:streak_rewards(*)')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      if (data) setRewards(data as any);
    } catch (error: any) {
      toast({
        title: 'Error loading rewards',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const useReward = (reward: any) => {
    if (reward.reward_type === 'frequency' && reward.reward_data) {
      const params = new URLSearchParams(reward.reward_data);
      window.open(`https://app.samanthabushika.com/freq?${params.toString()}`, '_blank');
      toast({ title: 'Opening frequency mix...' });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (rewards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Unlocked Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Complete daily quests to unlock rewards!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unlocked Rewards</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rewards.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                <div
                  className="text-3xl w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${item.reward.badge_color}20` }}
                >
                  {item.reward.badge_icon}
                </div>
                <div>
                  <p className="font-semibold">{item.reward.badge_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.reward.description}
                  </p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {new Date(item.unlocked_at).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
              
              {item.reward.reward_type === 'frequency' && (
                <Button
                  size="sm"
                  onClick={() => useReward(item.reward)}
                  className="ml-2"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Use
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
