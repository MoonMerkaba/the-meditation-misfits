import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, TrendingUp, TrendingDown, Minus, Loader2, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

interface EmotionalTrendChartProps {
  reflections: any[];
}

export function EmotionalTrendChart({ reflections }: EmotionalTrendChartProps) {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const loadAnalysis = async () => {
    if (!isPremium) return;
    
    if (reflections.length < 3) {
      toast.info('Add at least 3 reflections to see emotional trends');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-reflection-sentiment', {
        body: { reflections }
      });

      if (error) throw error;
      setAnalysis(data);
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze emotional trends');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPremium && reflections.length >= 3) {
      loadAnalysis();
    }
  }, [isPremium, reflections.length]);

  if (!isPremium) {
    return (
      <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold">Emotional Trend Analysis</h3>
          </div>
          <Lock className="w-5 h-5 text-purple-400" />
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Track your emotional patterns over time with AI-powered sentiment analysis, theme detection, and personalized insights.
        </p>
        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
          Upgrade to Premium
        </Button>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6 bg-black/40 border-purple-500/30">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  const getTrendIcon = () => {
    if (analysis.overallTrend === 'improving') return <TrendingUp className="w-5 h-5 text-green-400" />;
    if (analysis.overallTrend === 'declining') return <TrendingDown className="w-5 h-5 text-orange-400" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  return (
    <Card className="p-6 bg-black/40 border-purple-500/30">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold">Emotional Trend Analysis</h3>
        {getTrendIcon()}
      </div>

      {/* Insight */}
      <div className="mb-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
        <p className="text-sm italic text-purple-200">{analysis.insight}</p>
      </div>

      {/* Sentiment Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3 text-gray-300">Sentiment Over Time</h4>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={analysis.sentimentScores}>
            <defs>
              <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="#9ca3af" domain={[-1, 1]} tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '8px' }}
              labelFormatter={(date) => new Date(date).toLocaleDateString()}
              formatter={(value: number) => [value.toFixed(2), 'Sentiment']}
            />
            <Area type="monotone" dataKey="score" stroke="#a855f7" fillOpacity={1} fill="url(#sentimentGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Word Cloud / Themes */}
      <div>
        <h4 className="text-sm font-medium mb-3 text-gray-300">Common Themes</h4>
        <div className="flex flex-wrap gap-2">
          {analysis.themes?.map((theme: any, idx: number) => (
            <span 
              key={idx}
              className="px-3 py-1 bg-purple-900/30 border border-purple-500/30 rounded-full text-sm"
              style={{ fontSize: `${Math.max(12, Math.min(18, 12 + theme.count))}px` }}
            >
              {theme.word}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}