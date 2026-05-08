import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Brain, BookOpen, Users, Trophy, Flame, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const iconMap: any = { Brain, BookOpen, Users, Trophy };

export function QuestTypeStats() {
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('quest_type_streaks')
        .select('*, quest_types(*)')
        .eq('user_id', user.id);

      if (data) setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/30">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Target className="w-5 h-5" />
        Quest Type Progress
      </h3>
      
      <div className="space-y-4">
        {stats.map((stat) => {
          const Icon = iconMap[stat.quest_types?.icon] || Trophy;
          const nextMilestone = [3, 7, 14, 30].find(m => m > stat.current_streak) || 30;
          const progress = (stat.current_streak / nextMilestone) * 100;
          
          return (
            <div key={stat.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="font-semibold text-sm">{stat.quest_types?.display_name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500" />
                    <span>{stat.current_streak}</span>
                  </div>
                  <span className="text-gray-500">|</span>
                  <span className="text-gray-400">{stat.total_completed} total</span>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {nextMilestone - stat.current_streak} more to unlock next reward
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}