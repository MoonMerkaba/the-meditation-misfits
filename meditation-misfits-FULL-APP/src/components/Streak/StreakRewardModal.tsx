import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Play } from 'lucide-react';
import { AchievementShareButtons } from '@/components/Social/AchievementShareButtons';

interface StreakReward {
  id: string;
  streak_days: number;
  badge_name: string;
  badge_icon: string;
  badge_color: string;
  reward_type: string;
  reward_data: any;
  title: string;
  description: string;
}

interface StreakRewardModalProps {
  reward: StreakReward | null;
  open: boolean;
  onClose: () => void;
  onUseReward?: (reward: StreakReward) => void;
  totalQuests?: number;
  longestStreak?: number;
}

export function StreakRewardModal({ reward, open, onClose, onUseReward, totalQuests = 0, longestStreak = 0 }: StreakRewardModalProps) {
  if (!reward) return null;

  const handleUse = () => {
    if (onUseReward) {
      onUseReward(reward);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            <Sparkles className="inline-block w-6 h-6 text-yellow-500 mb-1" />
            {' '}Milestone Unlocked!
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-4">
          <div 
            className="text-6xl w-24 h-24 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${reward.badge_color}20` }}
          >
            {reward.badge_icon}
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-bold mb-1">{reward.title}</h3>
            <Badge variant="secondary" className="mb-2">
              {reward.streak_days} Day Streak
            </Badge>
            <p className="text-sm text-muted-foreground">{reward.description}</p>
          </div>

          <div className="w-full bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm font-medium mb-1">Reward Unlocked:</p>
            <p className="text-lg font-bold" style={{ color: reward.badge_color }}>
              {reward.badge_name}
            </p>
          </div>

          <div className="w-full">
            <AchievementShareButtons
              streakCount={reward.streak_days}
              milestoneName={reward.badge_name}
              totalQuests={totalQuests}
              longestStreak={longestStreak}
              badgeEmoji={reward.badge_icon}
              variant="outline"
              size="default"
            />
          </div>

          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={onClose} className="flex-1">
              View Later
            </Button>
            {reward.reward_type === 'frequency' && (
              <Button onClick={handleUse} className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Use Now
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
