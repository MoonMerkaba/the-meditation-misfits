import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Flame, Star, Zap, Heart, Brain } from 'lucide-react';

const badges = [
  { id: 'first-session', name: 'First Step', icon: Star, earned: true, color: 'bg-[#FF00BF]' },
  { id: 'chaos-master', name: 'Chaos Master', icon: Zap, earned: true, color: 'bg-[#6683a0]' },
  { id: 'parent-warrior', name: 'Parent Warrior', icon: Heart, earned: false, color: 'bg-[#FF00BF]' },
  { id: 'adhd-champion', name: 'ADHD Champion', icon: Brain, earned: false, color: 'bg-[#6683a0]' },
  { id: 'frequency-explorer', name: 'Frequency Explorer', icon: Trophy, earned: false, color: 'bg-black' }
];

const stats = [
  { label: 'Sessions Completed', value: 3, max: 10, color: 'from-[#FF00BF] to-[#6683a0]' },
  { label: 'Current Streak', value: 2, max: 7, color: 'from-[#6683a0] to-[#FF00BF]' },
  { label: 'Mindful Minutes', value: 47, max: 100, color: 'from-[#FF00BF] to-black' },
  { label: 'Journeys Unlocked', value: 2, max: 6, color: 'from-black to-[#6683a0]' }
];

interface ProgressDashboardProps {
  onClose: () => void;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ onClose }) => {
  return (
    <div className="min-h-screen p-6" style={{
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0b2e 50%, #0a0a0f 100%)'
    }}>

      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-magenta to-brand-blue-gray">Progress</span>
          </h1>

          <p className="text-xl text-gray-300">Every step counts, every breath matters</p>
          <p className="text-[#FF00BF] text-lg mt-2 font-medium">#ProveThemAllWrong</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.color} mb-2`}>
                    {stat.value}
                  </div>
                  <p className="text-white/80 text-sm mb-4">{stat.label}</p>
                  <Progress value={(stat.value / stat.max) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Badges Section */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#FF00BF]" />
              Misfit Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`text-center p-4 rounded-xl transition-all ${
                     badge.earned 
                       ? 'bg-white/20 border-2 border-[#FF00BF]/50' 
                       : 'bg-white/5 border border-white/10 opacity-50'
                  }`}
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full ${badge.color} flex items-center justify-center ${
                    !badge.earned && 'grayscale'
                  }`}>
                    <badge.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white text-sm font-medium">{badge.name}</p>
                  {badge.earned && (
                    <Badge className="mt-2 bg-[#FF00BF] text-white text-xs">Earned!</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Streak Section */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-2xl font-bold flex items-center gap-2">
              <Flame className="w-6 h-6 text-[#FF00BF]" />
              Current Streak: 2 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div
                  key={day}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                     day <= 2 
                       ? 'bg-gradient-to-r from-[#FF00BF] to-[#6683a0] text-white' 
                       : 'bg-white/10 text-white/50'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
            <p className="text-white/70">Keep going! You're building a powerful habit.</p>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-[#FF00BF] to-[#6683a0] hover:from-[#FF00BF]/90 hover:to-[#6683a0]/90 text-white font-bold px-8 py-3 rounded-full transition-all transform hover:scale-105"
          >
            Continue Journey
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;