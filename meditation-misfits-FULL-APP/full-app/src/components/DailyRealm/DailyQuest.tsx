import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { invokeEdgeFunction } from '@/lib/edgeFunctionHelper';
import { Loader2, CheckCircle, Target, Flame } from 'lucide-react';
import { toast } from 'sonner';
import { StreakRewardModal } from '@/components/Streak/StreakRewardModal';

export function DailyQuest() {
  const [quest, setQuest] = useState<any>(null);
  const [streak, setStreak] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rewardModal, setRewardModal] = useState<any>(null);

  useEffect(() => {
    loadQuest();
    loadStreak();
  }, []);

  const loadQuest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await invokeEdgeFunction('get-daily-quest', { user_id: user.id });
      if (!error && data) {
        setQuest(data);
      }
    } catch (err) {
      console.error('Error loading quest:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('quest_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setStreak(data);
      }
    } catch (err) {
      console.error('Error loading streak:', err);
    }
  };

  const completeQuest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await invokeEdgeFunction('get-daily-quest', { user_id: user.id, action: 'complete' });
      if (!error && data) {
        setQuest({ ...quest, completed: true });
        
        if (data.unlockedRewards && data.unlockedRewards.length > 0) {
          setRewardModal(data.unlockedRewards[0]);
          toast.success(`${data.newStreak} day streak! Reward unlocked!`);
        } else {
          toast.success('Quest completed!');
        }
        
        loadStreak();
      } else if (error) {
        toast.error(error);
      }
    } catch (err) {
      console.error('Error completing quest:', err);
      toast.error('Failed to complete quest');
    }
  };

  const handleUseReward = (reward: any) => {
    if (reward.reward_type === 'frequency' && reward.reward_data) {
      const params = new URLSearchParams(reward.reward_data);
      window.open(`https://app.samanthabushika.com/freq?${params.toString()}`, '_blank');
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-orange-900/20 to-red-900/20">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </Card>
    );
  }

  if (!quest) return null;

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-400" />
            <h3 className="text-xl font-bold text-orange-300">Quest of the Day</h3>
          </div>
          {streak && (
            <div className="flex items-center gap-1 text-sm">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-bold">{streak.current_streak}</span>
              <span className="text-gray-400">day streak</span>
            </div>
          )}
        </div>
        <h4 className="font-semibold mb-2">{quest.quest_title}</h4>
        <p className="text-sm text-gray-300 mb-4">{quest.quest_description}</p>
        <Button 
          onClick={completeQuest}
          disabled={quest.completed}
          className={quest.completed ? 'bg-green-600' : 'bg-orange-600 hover:bg-orange-700'}
        >
          {quest.completed ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Completed
            </>
          ) : (
            'Mark as Done'
          )}
        </Button>
      </Card>

      <StreakRewardModal
        reward={rewardModal}
        open={!!rewardModal}
        onClose={() => setRewardModal(null)}
        onUseReward={handleUseReward}
      />
    </>
  );
}
