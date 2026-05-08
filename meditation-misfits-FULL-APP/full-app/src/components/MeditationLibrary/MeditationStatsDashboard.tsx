import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserMeditationStats } from '@/lib/meditation';
import { MeditationStats } from '@/types/meditation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Flame, 
  Clock, 
  Target, 
  Trophy, 
  Calendar, 
  TrendingUp,
  Heart,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  PieChart
} from 'lucide-react';

interface MeditationStatsDashboardProps {
  onClose?: () => void;
}

export const MeditationStatsDashboard: React.FC<MeditationStatsDashboardProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<MeditationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    try {
      const data = await getUserMeditationStats(user.id);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const motivationalMessage = useMemo(() => {
    if (!stats) return "Start your meditation journey today!";
    
    const { totalCompleted, currentStreak, totalMinutes } = stats;
    
    if (totalCompleted === 0) {
      return "Your meditation journey awaits! Complete your first session to begin tracking your progress.";
    }
    if (currentStreak >= 30) {
      return "Incredible! 30+ day streak! You've mastered the art of consistency. You're an inspiration!";
    }
    if (currentStreak >= 14) {
      return "Two weeks strong! Your dedication is transforming your mind and spirit. Keep going!";
    }
    if (currentStreak >= 7) {
      return "A full week of mindfulness! You're building a powerful habit. The universe is taking notice!";
    }
    if (currentStreak >= 3) {
      return "Three days in a row! You're building momentum. Each session strengthens your practice.";
    }
    if (totalMinutes >= 500) {
      return "Over 500 minutes of peace! You're a meditation master in the making!";
    }
    if (totalMinutes >= 100) {
      return "100+ minutes of mindfulness achieved! Your inner peace is growing stronger.";
    }
    if (totalCompleted >= 10) {
      return "10 meditations completed! You're developing a beautiful practice. Keep nurturing your soul.";
    }
    if (currentStreak === 0 && totalCompleted > 0) {
      return "Welcome back! Every moment is a fresh start. Let's rebuild your streak together.";
    }
    return "You're on your way! Each meditation brings you closer to inner peace.";
  }, [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-400" />
          <h3 className="text-xl font-semibold text-white mb-2">Sign In to Track Your Journey</h3>
          <p className="text-white/70">Create an account to track your meditation progress and unlock insights.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Motivational Message */}
      <Card className="bg-gradient-to-r from-purple-600/30 to-indigo-600/30 backdrop-blur-lg border-white/20 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAyMGMtNC40MTggMC04LTMuNTgyLTgtOHMzLjU4Mi04IDgtOCA4IDMuNTgyIDggOC0zLjU4MiA4LTggOHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <CardContent className="p-6 relative">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">Your Meditation Journey</h2>
              <p className="text-white/80 text-lg">{motivationalMessage}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-4 text-center">
            <div className="p-3 bg-purple-500/20 rounded-full w-fit mx-auto mb-2">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalCompleted || 0}</p>
            <p className="text-white/60 text-sm">Sessions Completed</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-4 text-center">
            <div className="p-3 bg-blue-500/20 rounded-full w-fit mx-auto mb-2">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalMinutes || 0}</p>
            <p className="text-white/60 text-sm">Minutes Meditated</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-4 text-center">
            <div className="p-3 bg-orange-500/20 rounded-full w-fit mx-auto mb-2">
              <Flame className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.currentStreak || 0}</p>
            <p className="text-white/60 text-sm">Day Streak</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-4 text-center">
            <div className="p-3 bg-yellow-500/20 rounded-full w-fit mx-auto mb-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.longestStreak || 0}</p>
            <p className="text-white/60 text-sm">Best Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Different Views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/10 border-white/20">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
            <Calendar className="w-4 h-4 mr-2" />
            Streak
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-purple-600">
            <PieChart className="w-4 h-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-purple-600">
            <BarChart3 className="w-4 h-4 mr-2" />
            Progress
          </TabsTrigger>
        </TabsList>

        {/* Streak Calendar Tab */}
        <TabsContent value="overview" className="mt-4">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                30-Day Streak Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-10 gap-2">
                {stats?.streakCalendar.map((day, index) => {
                  const date = new Date(day.date);
                  const dayNum = date.getDate();
                  const isToday = day.date === new Date().toISOString().split('T')[0];
                  
                  return (
                    <div
                      key={day.date}
                      className={`
                        aspect-square rounded-lg flex items-center justify-center text-xs font-medium
                        transition-all duration-200 cursor-default
                        ${day.completed 
                          ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30' 
                          : 'bg-white/5 text-white/40'}
                        ${isToday ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-transparent' : ''}
                      `}
                      title={`${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}${day.completed ? ' - Completed!' : ''}`}
                    >
                      {dayNum}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-purple-500 to-indigo-600"></div>
                  <span className="text-white/70">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-white/5"></div>
                  <span className="text-white/70">Missed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-white/5 ring-2 ring-yellow-400"></div>
                  <span className="text-white/70">Today</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="mt-4">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                Category Breakdown
                {stats?.favoriteCategory && (
                  <span className="ml-auto text-sm font-normal text-white/60">
                    Favorite: {stats.favoriteCategory}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {/* Pie Chart Visualization */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative w-48 h-48">
                      <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                        {(() => {
                          const total = stats.categoryBreakdown.reduce((sum, cat) => sum + cat.count, 0);
                          let currentAngle = 0;
                          
                          return stats.categoryBreakdown.map((category, index) => {
                            const percentage = (category.count / total) * 100;
                            const angle = (percentage / 100) * 360;
                            const startAngle = currentAngle;
                            currentAngle += angle;
                            
                            // Calculate arc path
                            const startX = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                            const startY = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                            const endX = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                            const endY = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);
                            const largeArc = angle > 180 ? 1 : 0;
                            
                            return (
                              <path
                                key={category.category}
                                d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`}
                                fill={category.color}
                                className="transition-all duration-300 hover:opacity-80"
                              />
                            );
                          });
                        })()}
                        <circle cx="50" cy="50" r="25" fill="rgba(0,0,0,0.3)" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-white">{stats.totalCompleted}</p>
                          <p className="text-xs text-white/60">Total</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category List */}
                  <div className="space-y-3">
                    {stats.categoryBreakdown.map((category) => {
                      const total = stats.categoryBreakdown.reduce((sum, cat) => sum + cat.count, 0);
                      const percentage = total > 0 ? Math.round((category.count / total) * 100) : 0;
                      
                      return (
                        <div key={category.category} className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-white text-sm font-medium">{category.category}</span>
                              <span className="text-white/60 text-xs">
                                {category.count} sessions • {category.minutes} min
                              </span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${percentage}%`,
                                  backgroundColor: category.color 
                                }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-white/80 text-sm font-medium w-12 text-right">
                            {percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <PieChart className="w-12 h-12 mx-auto mb-3 text-white/30" />
                  <p className="text-white/60">Complete meditations to see your category breakdown</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="mt-4 space-y-4">
          {/* Weekly Progress */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Weekly Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2 h-40">
                {stats?.weeklyProgress.map((day, index) => {
                  const maxMinutes = Math.max(...(stats?.weeklyProgress.map(d => d.minutes) || [1]), 1);
                  const height = day.minutes > 0 ? Math.max((day.minutes / maxMinutes) * 100, 10) : 5;
                  
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center justify-end h-32">
                        {day.minutes > 0 && (
                          <span className="text-xs text-white/60 mb-1">{day.minutes}m</span>
                        )}
                        <div 
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            day.minutes > 0 
                              ? 'bg-gradient-to-t from-purple-600 to-purple-400' 
                              : 'bg-white/10'
                          }`}
                          style={{ height: `${height}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-white/60">{day.date}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Progress */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Monthly Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-3 h-40">
                {stats?.monthlyProgress.map((month, index) => {
                  const maxMinutes = Math.max(...(stats?.monthlyProgress.map(m => m.minutes) || [1]), 1);
                  const height = month.minutes > 0 ? Math.max((month.minutes / maxMinutes) * 100, 10) : 5;
                  
                  return (
                    <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center justify-end h-32">
                        {month.minutes > 0 && (
                          <span className="text-xs text-white/60 mb-1">{month.minutes}m</span>
                        )}
                        <div 
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            month.minutes > 0 
                              ? 'bg-gradient-to-t from-blue-600 to-blue-400' 
                              : 'bg-white/10'
                          }`}
                          style={{ height: `${height}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-white/60">{month.month}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Meditations */}
          {stats?.recentMeditations && stats.recentMeditations.length > 0 && (
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentMeditations.map((meditation, index) => (
                    <div 
                      key={`${meditation.meditationId}-${index}`}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div>
                        <p className="text-white font-medium">{meditation.title}</p>
                        <p className="text-white/60 text-sm">
                          {new Date(meditation.completedAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-purple-400 font-medium">{meditation.duration} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
