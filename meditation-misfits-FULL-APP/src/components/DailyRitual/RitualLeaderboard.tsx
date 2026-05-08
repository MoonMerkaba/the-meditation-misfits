import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { invokeEdgeFunction } from '@/lib/edgeFunctionHelper';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Trophy, Crown, Medal, Flame, Heart, Star, Users, 
  TrendingUp, Sparkles, Quote, Bookmark, Eye
} from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  weeklyCompletions: number;
  monthlyCompletions: number;
  resonanceReceived: number;
  badges: { name: string; badge_icon: string; gradient: string }[];
  isCurrentUser: boolean;
}

interface FeaturedInsight {
  id: string;
  type: string;
  text: string;
  resonanceCount: number;
  savesCount: number;
  createdAt: string;
  isAnonymous: boolean;
  author?: {
    username: string;
    avatarUrl?: string;
  };
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  featuredInsight: FeaturedInsight | null;
  userRank: {
    rank: number;
    current_streak: number;
    total_completions: number;
    show_on_leaderboard: boolean;
  } | null;
}

const contentTypeLabels: Record<string, string> = {
  shadow_work: 'Shadow Work',
  recovery: 'Recovery',
  intention: 'Intention',
  journal: 'Journal'
};

export function RitualLeaderboard() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [leaderboardType, setLeaderboardType] = useState<'streak' | 'completions' | 'resonance'>('streak');
  const [period, setPeriod] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);

  useEffect(() => {
    if (open) {
      loadLeaderboard();
    }
  }, [open, leaderboardType, period]);

  useEffect(() => {
    if (data?.userRank) {
      setShowOnLeaderboard(data.userRank.show_on_leaderboard);
    }
  }, [data?.userRank]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await invokeEdgeFunction('get-ritual-leaderboard', { type: leaderboardType, period });
      if (error) throw error;
      setData(result);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };



  const toggleLeaderboardVisibility = async () => {
    if (!user) return;
    setUpdatingVisibility(true);
    try {
      const { error } = await supabase
        .from('ritual_streaks')
        .update({ show_on_leaderboard: !showOnLeaderboard })
        .eq('user_id', user.id);

      if (error) throw error;
      setShowOnLeaderboard(!showOnLeaderboard);
      toast.success(showOnLeaderboard ? 'Removed from leaderboard' : 'Added to leaderboard');
      loadLeaderboard();
    } catch (error) {
      toast.error('Failed to update visibility');
    } finally {
      setUpdatingVisibility(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-white/40 text-sm">{rank}</span>;
  };

  const getStatValue = (entry: LeaderboardEntry) => {
    if (leaderboardType === 'streak') return entry.currentStreak;
    if (leaderboardType === 'resonance') return entry.resonanceReceived;
    if (period === 'weekly') return entry.weeklyCompletions;
    if (period === 'monthly') return entry.monthlyCompletions;
    return entry.totalCompletions;
  };

  const getStatLabel = () => {
    if (leaderboardType === 'streak') return 'day streak';
    if (leaderboardType === 'resonance') return 'resonance';
    if (period === 'weekly') return 'this week';
    if (period === 'monthly') return 'this month';
    return 'total';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
          <Trophy className="w-4 h-4 mr-2" />
          Leaderboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Community Leaderboard
          </DialogTitle>
        </DialogHeader>

        {/* User Visibility Toggle */}
        {user && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-white">Show me on leaderboard</span>
            </div>
            <Switch
              checked={showOnLeaderboard}
              onCheckedChange={toggleLeaderboardVisibility}
              disabled={updatingVisibility}
            />
          </div>
        )}

        {/* Leaderboard Type Tabs */}
        <Tabs value={leaderboardType} onValueChange={(v) => setLeaderboardType(v as any)}>
          <TabsList className="grid grid-cols-3 bg-white/5">
            <TabsTrigger value="streak" className="data-[state=active]:bg-purple-500/20">
              <Flame className="w-4 h-4 mr-1" />
              Streak
            </TabsTrigger>
            <TabsTrigger value="completions" className="data-[state=active]:bg-purple-500/20">
              <TrendingUp className="w-4 h-4 mr-1" />
              Completions
            </TabsTrigger>
            <TabsTrigger value="resonance" className="data-[state=active]:bg-purple-500/20">
              <Heart className="w-4 h-4 mr-1" />
              Resonance
            </TabsTrigger>
          </TabsList>

          {/* Period Filter for Completions */}
          {leaderboardType === 'completions' && (
            <div className="flex gap-2 mt-3">
              {(['all', 'monthly', 'weekly'] as const).map(p => (
                <Button
                  key={p}
                  variant={period === p ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPeriod(p)}
                  className={period === p ? 'bg-purple-500/30' : 'text-white/60'}
                >
                  {p === 'all' ? 'All Time' : p === 'monthly' ? 'Monthly' : 'Weekly'}
                </Button>
              ))}
            </div>
          )}

          <TabsContent value={leaderboardType} className="mt-4">
            {loading ? (
              <div className="py-12 text-center text-white/60">
                <Sparkles className="w-8 h-8 animate-pulse mx-auto mb-2" />
                Loading leaderboard...
              </div>
            ) : (
              <div className="space-y-4">
                {/* Featured Insight */}
                {data?.featuredInsight && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-400">Featured Insight</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Quote className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="text-white/90 italic mb-2">"{data.featuredInsight.text}"</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/50">
                            {data.featuredInsight.isAnonymous 
                              ? 'Anonymous' 
                              : `@${data.featuredInsight.author?.username}`}
                          </span>
                          <div className="flex items-center gap-3 text-white/40">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {data.featuredInsight.resonanceCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bookmark className="w-3 h-3" />
                              {data.featuredInsight.savesCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* User's Rank Card */}
                {data?.userRank && !data.userRank.show_on_leaderboard && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          #{data.userRank.rank}
                        </div>
                        <div>
                          <p className="text-white font-medium">Your Rank (Hidden)</p>
                          <p className="text-sm text-white/60">Enable visibility to appear on leaderboard</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{data.userRank.current_streak}</p>
                        <p className="text-xs text-white/40">day streak</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Leaderboard List */}
                <div className="space-y-2">
                  {data?.leaderboard.map((entry, index) => (
                    <div
                      key={entry.userId}
                      className={`p-3 rounded-xl border transition-all ${
                        entry.isCurrentUser
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Rank */}
                        <div className="w-8 flex justify-center">
                          {getRankIcon(entry.rank)}
                        </div>

                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                          {entry.avatarUrl ? (
                            <img src={entry.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-bold">
                              {entry.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Name & Badges */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium truncate ${entry.isCurrentUser ? 'text-purple-300' : 'text-white'}`}>
                              {entry.username}
                              {entry.isCurrentUser && <span className="text-xs text-purple-400 ml-1">(You)</span>}
                            </span>
                          </div>
                          {entry.badges.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {entry.badges.slice(0, 3).map((badge, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-white/70"
                                  title={badge.name}
                                >
                                  {badge.badge_icon}
                                </span>
                              ))}
                              {entry.badges.length > 3 && (
                                <span className="text-xs text-white/40">+{entry.badges.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Stat */}
                        <div className="text-right">
                          <p className={`text-xl font-bold ${
                            entry.rank === 1 ? 'text-yellow-400' :
                            entry.rank === 2 ? 'text-gray-300' :
                            entry.rank === 3 ? 'text-amber-600' :
                            'text-white'
                          }`}>
                            {leaderboardType === 'streak' && <Flame className="w-4 h-4 inline mr-1" />}
                            {leaderboardType === 'resonance' && <Heart className="w-4 h-4 inline mr-1" />}
                            {getStatValue(entry)}
                          </p>
                          <p className="text-xs text-white/40">{getStatLabel()}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!data?.leaderboard || data.leaderboard.length === 0) && (
                    <div className="py-8 text-center text-white/60">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No practitioners on the leaderboard yet.</p>
                      <p className="text-sm mt-1">Be the first to join!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
