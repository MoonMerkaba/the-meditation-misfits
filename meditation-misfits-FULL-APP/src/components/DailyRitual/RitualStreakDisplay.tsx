import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Flame, Trophy, Star, Crown, Gem, Sparkles, Lock, Gift, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface Reward {
  id: string;
  name: string;
  description: string;
  milestone_days: number;
  reward_type: string;
  reward_data: any;
  icon: string;
  gradient: string;
  unlocked_at?: string;
}

interface StreakData {
  current_streak: number;
  best_streak: number;
  total_completions: number;
  completed_today: boolean;
  unlocked_rewards: Reward[];
  locked_rewards: Reward[];
  next_reward: Reward | null;
  days_to_next_reward: number | null;
}

export function RitualStreakDisplay() {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  useEffect(() => {
    if (user) {
      fetchStreakData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchStreakData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-ritual-streak');
      if (error) throw error;
      if (data?.ok) {
        setStreakData(data);
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      seedling: <Sparkles className="w-6 h-6" />,
      flame: <Flame className="w-6 h-6" />,
      moon: <Star className="w-6 h-6" />,
      star: <Star className="w-6 h-6" />,
      crown: <Crown className="w-6 h-6" />,
      gem: <Gem className="w-6 h-6" />,
      sparkles: <Sparkles className="w-6 h-6" />,
      sun: <Sparkles className="w-6 h-6" />,
      infinity: <Sparkles className="w-6 h-6" />,
      eye: <Sparkles className="w-6 h-6" />,
      brain: <Sparkles className="w-6 h-6" />
    };
    return icons[iconName] || <Star className="w-6 h-6" />;
  };

  if (loading) {
    return (
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 animate-pulse">
        <div className="h-20 bg-white/10 rounded-lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <p className="text-white/60 text-sm">Sign in to track your ritual streak</p>
            <p className="text-white/40 text-xs">Unlock rewards and exclusive content</p>
          </div>
        </div>
      </div>
    );
  }

  const currentStreak = streakData?.current_streak || 0;
  const bestStreak = streakData?.best_streak || 0;

  return (
    <>
      <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center ${streakData?.completed_today ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-slate-900' : ''}`}>
              <Flame className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{currentStreak}</span>
                <span className="text-white/60 text-sm">day streak</span>
              </div>
              <p className="text-white/40 text-xs">Best: {bestStreak} days</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRewardsModal(true)}
            className="text-purple-300 hover:text-purple-200"
          >
            <Trophy className="w-4 h-4 mr-1" />
            Rewards
          </Button>
        </div>

        {streakData?.next_reward && (
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white/80">Next: {streakData.next_reward.name}</span>
              </div>
              <span className="text-xs text-white/40">{streakData.days_to_next_reward} days away</span>
            </div>
            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (currentStreak / streakData.next_reward.milestone_days) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {streakData?.completed_today && (
          <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Today's ritual complete!</span>
          </div>
        )}
      </div>

      <Dialog open={showRewardsModal} onOpenChange={setShowRewardsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Ritual Rewards
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Unlocked Rewards */}
            {streakData?.unlocked_rewards && streakData.unlocked_rewards.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Unlocked ({streakData.unlocked_rewards.length})
                </h3>
                <div className="grid gap-3">
                  {streakData.unlocked_rewards.map((reward) => (
                    <button
                      key={reward.id}
                      onClick={() => setSelectedReward(reward)}
                      className={`p-4 rounded-xl bg-gradient-to-r ${reward.gradient} border border-white/20 text-left hover:scale-[1.02] transition-transform`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            {getIconComponent(reward.icon)}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{reward.name}</p>
                            <p className="text-sm text-white/70">{reward.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/50" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Locked Rewards */}
            {streakData?.locked_rewards && streakData.locked_rewards.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-white/40" />
                  Locked ({streakData.locked_rewards.length})
                </h3>
                <div className="grid gap-3">
                  {streakData.locked_rewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 opacity-60"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-white/40" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{reward.name}</p>
                            <p className="text-sm text-white/50">{reward.description}</p>
                          </div>
                        </div>
                        <span className="text-sm text-white/40">{reward.milestone_days} days</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reward Detail Modal */}
      <Dialog open={!!selectedReward} onOpenChange={() => setSelectedReward(null)}>
        <DialogContent className="bg-slate-900 border-white/10">
          {selectedReward && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white">{selectedReward.name}</DialogTitle>
              </DialogHeader>
              <div className={`p-6 rounded-xl bg-gradient-to-r ${selectedReward.gradient}`}>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    {getIconComponent(selectedReward.icon)}
                  </div>
                </div>
                <p className="text-center text-white/90 mb-4">{selectedReward.description}</p>
                
                {selectedReward.reward_type === 'content' && selectedReward.reward_data && (
                  <div className="mt-4 p-4 rounded-lg bg-black/20">
                    <p className="text-sm text-white/70 mb-2">Unlocked Content:</p>
                    {selectedReward.reward_data.prompts && (
                      <ul className="space-y-2">
                        {selectedReward.reward_data.prompts.map((prompt: string, i: number) => (
                          <li key={i} className="text-sm text-white/80 italic">"{prompt}"</li>
                        ))}
                      </ul>
                    )}
                    {selectedReward.reward_data.crystals && (
                      <div className="space-y-3">
                        {selectedReward.reward_data.crystals.map((crystal: any, i: number) => (
                          <div key={i} className="p-2 rounded bg-white/10">
                            <p className="font-medium text-white">{crystal.name}</p>
                            <p className="text-xs text-white/60">{crystal.origin}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedReward.reward_data.scripts && (
                      <ul className="space-y-1">
                        {selectedReward.reward_data.scripts.map((script: string, i: number) => (
                          <li key={i} className="text-sm text-white/80">{script}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
