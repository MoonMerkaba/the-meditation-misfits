import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile, Zap, Brain, Heart, Sparkles } from 'lucide-react';

interface MoodData {
  mood: string;
  count: number;
}

const moodIcons: Record<string, any> = {
  Calm: Heart,
  Energized: Zap,
  Focused: Brain,
  Peaceful: Smile,
  Balanced: Sparkles
};

const MoodTracker: React.FC<{ data: MoodData[] }> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-xl font-bold">Mood Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, idx) => {
            const Icon = moodIcons[item.mood] || Heart;
            const percentage = (item.count / maxCount) * 100;
            
            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-[#FF00BF]" />
                    <span className="text-white font-medium">{item.mood}</span>
                  </div>
                  <span className="text-[#6683a0] font-bold">{item.count}x</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-[#FF00BF] to-[#6683a0] h-3 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodTracker;
