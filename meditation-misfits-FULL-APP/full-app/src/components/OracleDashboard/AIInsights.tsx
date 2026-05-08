import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Calendar, Target } from 'lucide-react';

interface AIInsightsProps {
  readings: any[];
}

export function AIInsights({ readings }: AIInsightsProps) {
  // Analyze recurring themes
  const analyzeThemes = () => {
    const themeCount: Record<string, number> = {};
    readings.forEach(r => {
      r.themes?.forEach((theme: string) => {
        themeCount[theme] = (themeCount[theme] || 0) + 1;
      });
    });
    return Object.entries(themeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([theme, count]) => ({ theme, count }));
  };

  // Analyze archetype patterns
  const analyzeArchetypes = () => {
    const archetypeCount: Record<string, number> = {};
    readings.forEach(r => {
      r.archetypes?.forEach((arch: string) => {
        archetypeCount[arch] = (archetypeCount[arch] || 0) + 1;
      });
    });
    return Object.entries(archetypeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
  };

  // Analyze frequency trends
  const analyzeTrends = () => {
    if (readings.length < 2) return 'stable';
    const recent = readings.slice(-3).reduce((sum, r) => sum + r.resonance, 0) / 3;
    const older = readings.slice(0, -3).reduce((sum, r) => sum + r.resonance, 0) / Math.max(1, readings.length - 3);
    return recent > older + 5 ? 'increasing' : recent < older - 5 ? 'decreasing' : 'stable';
  };

  // Suggest optimal times
  const suggestOptimalTimes = () => {
    const hourCounts: Record<number, { total: number; sum: number }> = {};
    readings.forEach(r => {
      const hour = new Date(r.date).getHours();
      if (!hourCounts[hour]) hourCounts[hour] = { total: 0, sum: 0 };
      hourCounts[hour].total++;
      hourCounts[hour].sum += r.resonance;
    });
    
    return Object.entries(hourCounts)
      .map(([hour, data]) => ({ hour: parseInt(hour), avg: data.sum / data.total }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 2);
  };

  const themes = analyzeThemes();
  const archetypes = analyzeArchetypes();
  const trend = analyzeTrends();
  const optimalTimes = suggestOptimalTimes();

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/30">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-purple-100">AI-Powered Insights</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-purple-300">
              <Target className="w-4 h-4" />
              <span className="font-medium">Recurring Themes</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {themes.map(({ theme, count }) => (
                <Badge key={theme} variant="secondary" className="bg-purple-500/20">
                  {theme} ({count}x)
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-indigo-300">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">Resonance Trend</span>
            </div>
            <Badge variant={trend === 'increasing' ? 'default' : 'secondary'}>
              {trend === 'increasing' ? '📈 Increasing' : trend === 'decreasing' ? '📉 Decreasing' : '➡️ Stable'}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-violet-300">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Optimal Reading Times</span>
            </div>
            <div className="text-sm text-gray-300">
              {optimalTimes.map(({ hour }) => (
                <span key={hour} className="mr-2">{hour}:00</span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}