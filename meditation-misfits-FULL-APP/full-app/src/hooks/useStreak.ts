import { useState, useEffect } from 'react';
import { invokeEdgeFunction } from '@/lib/edgeFunctionHelper';
import { useAuth } from '@/contexts/AuthContext';
import { sendMilestoneEmail, MILESTONES } from '@/lib/emailNotifications';

interface StreakData {
  current_streak: number;
  best_streak: number;
  today_done: boolean;
  next_reward_at: number | null;
}

export const useStreak = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStreak = async () => {
    if (!user) {
      setStreak(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await invokeEdgeFunction('get-streak');
      if (error) {
        console.warn('Streak fetch issue:', error);
        // Don't show toast for background fetches
      } else if (data) {
        setStreak(data);
      }
    } catch (err) {
      console.error('Error fetching streak:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async () => {
    if (!user) return null;

    try {
      const previousStreak = streak?.current_streak || 0;
      
      const { data, error } = await invokeEdgeFunction('update-streak', {});
      
      if (error) {
        console.warn('Streak update issue:', error);
        return null;
      }
      
      if (data) {
        await fetchStreak();
        
        // Check for milestone achievements and send emails
        const newStreak = data.current_streak;
        
        if (previousStreak === 0 && newStreak === 1) {
          await sendMilestoneEmail(user.id, MILESTONES.FIRST_SESSION.name, MILESTONES.FIRST_SESSION.description);
        } else if (newStreak === 7) {
          await sendMilestoneEmail(user.id, MILESTONES.STREAK_7.name, MILESTONES.STREAK_7.description);
        } else if (newStreak === 30) {
          await sendMilestoneEmail(user.id, MILESTONES.STREAK_30.name, MILESTONES.STREAK_30.description);
        }
        
        return data;
      }
    } catch (err) {
      console.error('Error updating streak:', err);
    }
    return null;
  };

  useEffect(() => {
    fetchStreak();
  }, [user]);

  return { streak, loading, updateStreak, refetch: fetchStreak };
};
