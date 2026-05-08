import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lock, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StreakReward {
  id: string;
  streak_days: number;
  badge_name: string;
  badge_icon: string;
  badge_color: string;
  title: string;
  description: string;
}

interface UnlockedReward extends StreakReward {
  unlocked_at: string;
  viewed: boolean;
}

export function AchievementBadges() {
  const [allRewards, setAllRewards] = useState<StreakReward[]>([]);
  const [unlockedRewards, setUnlockedRewards] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: rewards } = await supabase
        .from('streak_rewards')
        .select('*')
        .order('streak_days', { ascending: true });

      const { data: unlocked } = await supabase
        .from('user_streak_rewards')
        .select('reward_id')
        .eq('user_id', user.id);

      if (rewards) setAllRewards(rewards);
      if (unlocked) {
        setUnlockedRewards(new Set(unlocked.map(u => u.reward_id)));
      }
    } catch (error: any) {
      toast({
        title: 'Error loading achievements',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Streak Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {allRewards.map((reward) => {
            const isUnlocked = unlockedRewards.has(reward.id);
            
            return (
              <div
                key={reward.id}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  isUnlocked
                    ? 'border-primary bg-primary/5'
                    : 'border-muted bg-muted/20 opacity-60'
                }`}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <div
                    className={`text-4xl w-16 h-16 rounded-full flex items-center justify-center ${
                      isUnlocked ? '' : 'grayscale'
                    }`}
                    style={isUnlocked ? { backgroundColor: `${reward.badge_color}20` } : {}}
                  >
                    {isUnlocked ? reward.badge_icon : <Lock className="w-6 h-6" />}
                  </div>
                  
                  <div>
                    <p className="font-semibold text-sm">{reward.badge_name}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {reward.streak_days} days
                    </Badge>
                  </div>
                  
                  {isUnlocked && (
                    <p className="text-xs text-muted-foreground">
                      Unlocked!
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
