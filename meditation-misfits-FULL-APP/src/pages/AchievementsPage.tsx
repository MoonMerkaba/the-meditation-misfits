import { AchievementBadges } from '@/components/Achievements/AchievementBadges';
import { UnlockedRewards } from '@/components/Achievements/UnlockedRewards';
import { AchievementShareButtons } from '@/components/Social/AchievementShareButtons';
import { QuestTypeStats } from '@/components/DailyRealm/QuestTypeStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Flame, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';



export default function AchievementsPage() {
  const [stats, setStats] = useState({ current: 0, longest: 0, total: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: streak } = await supabase
        .from('quest_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: quests } = await supabase
        .from('daily_quests')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true);

      if (streak) {
        setStats({
          current: streak.current_streak || 0,
          longest: streak.longest_streak || 0,
          total: quests?.length || 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <h1 className="text-3xl font-bold">Achievements</h1>
        </div>
        {stats.current > 0 && (
          <AchievementShareButtons
            streakCount={stats.current}
            totalQuests={stats.total}
            longestStreak={stats.longest}
            variant="default"
            size="default"
          />
        )}
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.current}</p>
            <p className="text-xs text-muted-foreground">days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Longest Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.longest}</p>
            <p className="text-xs text-muted-foreground">personal best</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              Total Quests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">completed</p>
          </CardContent>
        </Card>
      </div>

      <QuestTypeStats />
      <AchievementBadges />
      <UnlockedRewards />
    </div>
  );
}
