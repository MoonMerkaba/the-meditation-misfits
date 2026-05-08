import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Clock, Sun, Moon, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Recommendation {
  type: string;
  duration: number;
  reason: string;
  timeOfDay: string;
}

const AIRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);

  const generateRecommendations = async () => {
    setLoading(true);
    
    // Mock AI recommendations - in production, call Supabase edge function
    setTimeout(() => {
      setRecommendations([
        {
          type: 'Shadow Work',
          duration: 15,
          reason: 'Your recent sessions show readiness for deeper emotional processing',
          timeOfDay: 'Evening'
        },
        {
          type: 'Focus Boost',
          duration: 10,
          reason: 'Morning sessions have been most effective for you',
          timeOfDay: 'Morning'
        },
        {
          type: 'Calm & Release',
          duration: 20,
          reason: 'Your stress patterns suggest need for extended relaxation',
          timeOfDay: 'Night'
        }
      ]);
      setInsight('You\'re making incredible progress! Your consistency is building real neural pathways. Keep showing up. #ProveThemAllWrong');
      setLoading(false);
    }, 1500);
  };

  useEffect(() => {
    generateRecommendations();
  }, []);

  const getTimeIcon = (time: string) => {
    if (time === 'Morning') return <Sun className="w-5 h-5" />;
    if (time === 'Evening') return <Moon className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#FF00BF]" />
          AI Personalized For You
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <Zap className="w-8 h-8 text-[#FF00BF] animate-pulse mx-auto mb-2" />
            <p className="text-white/70">Analyzing your journey...</p>
          </div>
        ) : (
          <>
            {insight && (
              <div className="bg-[#FF00BF]/20 border border-[#FF00BF]/50 rounded-lg p-4 mb-4">
                <p className="text-white text-sm italic">{insight}</p>
              </div>
            )}
            
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-bold">{rec.type}</h3>
                    <div className="flex items-center gap-1 text-[#6683a0] text-sm">
                      {getTimeIcon(rec.timeOfDay)}
                      <span>{rec.timeOfDay}</span>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm mb-2">{rec.reason}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#FF00BF] text-sm font-medium">{rec.duration} min</span>
                    <Button size="sm" className="bg-gradient-to-r from-[#FF00BF] to-[#6683a0]">
                      Start
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              onClick={generateRecommendations}
              variant="outline"
              className="w-full mt-4 border-white/20 text-white hover:bg-white/10"
            >
              Refresh Recommendations
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRecommendations;
