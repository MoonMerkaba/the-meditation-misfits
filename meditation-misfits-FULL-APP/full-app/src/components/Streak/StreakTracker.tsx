import { useStreak } from '@/hooks/useStreak';
import { Card } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const StreakTracker = () => {
  const { streak, loading } = useStreak();

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
        <div className="animate-pulse flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full" />
          <div className="flex-1">
            <div className="h-6 bg-orange-500/20 rounded w-24 mb-2" />
            <div className="h-4 bg-orange-500/20 rounded w-32" />
          </div>
        </div>
      </Card>
    );
  }

  if (!streak) return null;

  const { current_streak, best_streak, today_done, next_reward_at } = streak;
  const isActive = today_done;

  return (
    <Card className={`p-6 bg-gradient-to-br ${
      isActive 
        ? 'from-orange-500/20 to-red-500/20 border-orange-500/30' 
        : 'from-gray-500/10 to-gray-600/10 border-gray-500/20'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`relative ${isActive ? 'animate-pulse' : 'opacity-50'}`}>
          <Flame className={`w-16 h-16 ${
            isActive ? 'text-orange-500' : 'text-gray-400'
          }`} />
          {current_streak > 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white drop-shadow-lg">
                {current_streak}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-1">
            {current_streak === 0 ? 'Start Your Streak' : `${current_streak} Day Streak`}
          </h3>
          <p className="text-sm text-gray-300">
            Best: {best_streak} {best_streak === 1 ? 'day' : 'days'}
          </p>
          {next_reward_at && (
            <p className="text-xs text-orange-300 mt-1">
              Next reward in {next_reward_at - current_streak} days
            </p>
          )}
        </div>

        {!today_done && (
          <Button 
            variant="outline" 
            className="border-orange-500/50 text-orange-400 hover:bg-orange-500/20"
          >
            Listen Now
          </Button>
        )}
      </div>
    </Card>
  );
};
