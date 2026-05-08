import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { invokeEdgeFunction } from '@/lib/edgeFunctionHelper';
import { Loader2, CheckCircle, Target, Flame, Brain, BookOpen, Users, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { StreakRewardModal } from '@/components/Streak/StreakRewardModal';

const iconMap: any = { Brain, BookOpen, Users, Trophy };

export function MultiQuestDisplay() {
  const [quests, setQuests] = useState<any[]>([]);
  const [streaks, setStreaks] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [rewardModal, setRewardModal] = useState<any>(null);

  useEffect(() => {
    loadQuests();
    loadStreaks();
  }, []);

  const loadQuests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await invokeEdgeFunction('get-daily-quest', { user_id: user.id });
      if (!error && data?.quests) {
        setQuests(data.quests);
      }
    } catch (err) {
      console.error('Error loading quests:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStreaks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('quest_type_streaks')
        .select('*')
        .eq('user_id', user.id);

      if (data) {
        const streakMap: any = {};
        data.forEach((s: any) => {
          streakMap[s.quest_type_id] = s;
        });
        setStreaks(streakMap);
      }
    } catch (err) {
      console.error('Error loading streaks:', err);
    }
  };

  const completeQuest = async (quest: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await invokeEdgeFunction('get-daily-quest', { user_id: user.id, action: 'complete', quest_type_id: quest.quest_type_id });
      if (!error && data) {
        setQuests(quests.map(q => 
          q.quest_type_id === quest.quest_type_id ? { ...q, completed: true } : q
        ));
        
        if (data.unlockedRewards && data.unlockedRewards.length > 0) {
          setRewardModal(data.unlockedRewards[0]);
          toast.success(`${data.newStreak} day ${data.questType?.display_name || ''} streak!`);
        } else {
          toast.success(`${quest.quest_type?.display_name || 'Quest'} completed!`);
        }
        
        loadStreaks();
      } else if (error) {
        toast.error(error);
      }
    } catch (err) {
      console.error('Error completing quest:', err);
      toast.error('Failed to complete quest');
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-orange-900/20 to-red-900/20">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {quests.map((quest) => {
          const Icon = iconMap[quest.quest_type?.icon] || Target;
          const streak = streaks[quest.quest_type_id];
          
          return (
            <Card 
              key={quest.quest_type_id}
              className={`p-6 bg-gradient-to-br border-${quest.quest_type?.color || 'orange'}-500/30`}
              style={{
                backgroundImage: `linear-gradient(to bottom right, var(--${quest.quest_type?.color || 'orange'}-900)/0.2, var(--${quest.quest_type?.color || 'orange'}-900)/0.2)`
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 text-${quest.quest_type?.color || 'orange'}-400`} />
                  <h3 className="text-lg font-bold">{quest.quest_type?.display_name}</h3>
                </div>
                {streak && (
                  <div className="flex items-center gap-1 text-sm">
                    <Flame className={`w-4 h-4 text-${quest.quest_type?.color || 'orange'}-500`} />
                    <span className="font-bold">{streak.current_streak}</span>
                    <span className="text-gray-400">day streak</span>
                  </div>
                )}
              </div>
              <h4 className="font-semibold mb-2">{quest.quest_title}</h4>
              <p className="text-sm text-gray-300 mb-4">{quest.quest_description}</p>
              <Button 
                onClick={() => completeQuest(quest)}
                disabled={quest.completed}
                className={quest.completed ? 'bg-green-600' : `bg-${quest.quest_type?.color || 'orange'}-600 hover:bg-${quest.quest_type?.color || 'orange'}-700`}
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
          );
        })}
      </div>

      <StreakRewardModal
        reward={rewardModal}
        open={!!rewardModal}
        onClose={() => setRewardModal(null)}
        onUseReward={(reward) => {
          if (reward.reward_type === 'frequency' && reward.reward_data) {
            const params = new URLSearchParams(reward.reward_data);
            window.open(`/freq?${params.toString()}`, '_blank');
          }
        }}
      />
    </>
  );
}
