import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Crown, Flame, Star } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  streak: number;
  sessions: number;
}

const Leaderboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<'points' | 'streak' | 'sessions'>('points');

  useEffect(() => {
    // Mock data - in production, fetch from Supabase
    const mockEntries: LeaderboardEntry[] = [
      { rank: 1, username: 'ZenMaster', points: 2450, streak: 45, sessions: 120 },
      { rank: 2, username: 'MindfulWarrior', points: 2100, streak: 30, sessions: 95 },
      { rank: 3, username: 'ChaosCalmer', points: 1890, streak: 28, sessions: 87 },
      { rank: 4, username: 'FreqExplorer', points: 1650, streak: 22, sessions: 76 },
      { rank: 5, username: 'ShadowDiver', points: 1420, streak: 18, sessions: 65 },
      { rank: 6, username: 'ResonanceSeeker', points: 1280, streak: 15, sessions: 58 },
      { rank: 7, username: 'VibeShifter', points: 1150, streak: 12, sessions: 52 },
      { rank: 8, username: 'MisfitHero', points: 980, streak: 10, sessions: 45 },
    ];
    setEntries(mockEntries);
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-400" />;
    return <Star className="w-5 h-5 text-[#6683a0]" />;
  };

  return (
    <div className="min-h-screen p-6" style={{
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0b2e 50%, #0a0a0f 100%)'
    }}>
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-magenta to-brand-blue-gray">Leaderboard</span>
          </h1>
          <p className="text-gray-300">Top Meditation Misfits</p>
        </div>

        <div className="flex gap-2 mb-6 justify-center">
          <button onClick={() => setFilter('points')} className={`px-4 py-2 rounded-full ${filter === 'points' ? 'bg-[#FF00BF]' : 'bg-white/10'} text-white`}>
            Points
          </button>
          <button onClick={() => setFilter('streak')} className={`px-4 py-2 rounded-full ${filter === 'streak' ? 'bg-[#FF00BF]' : 'bg-white/10'} text-white`}>
            Streak
          </button>
          <button onClick={() => setFilter('sessions')} className={`px-4 py-2 rounded-full ${filter === 'sessions' ? 'bg-[#FF00BF]' : 'bg-white/10'} text-white`}>
            Sessions
          </button>
        </div>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.rank} className={`flex items-center gap-4 p-4 rounded-lg ${entry.rank <= 3 ? 'bg-white/20' : 'bg-white/5'}`}>
                  <div className="flex items-center gap-3 flex-1">
                    {getRankIcon(entry.rank)}
                    <Avatar className="w-10 h-10 border-2 border-[#FF00BF]">
                      <AvatarFallback className="bg-gradient-to-r from-[#FF00BF] to-[#6683a0] text-white">
                        {entry.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-white font-bold">{entry.username}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[#FF00BF] font-bold text-lg">{entry[filter]}</div>
                    <div className="text-white/60 text-xs">{filter}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <button onClick={onClose} className="mt-8 w-full bg-gradient-to-r from-[#FF00BF] to-[#6683a0] text-white font-bold px-8 py-3 rounded-full">
          Back
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;
