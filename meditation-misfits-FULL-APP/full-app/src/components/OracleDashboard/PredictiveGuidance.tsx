import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Lightbulb, Clock, TrendingUp } from 'lucide-react';

interface PredictiveGuidanceProps {
  readings: any[];
}

export function PredictiveGuidance({ readings }: PredictiveGuidanceProps) {
  const generatePredictions = () => {
    if (readings.length < 3) {
      return {
        nextTheme: 'Balance',
        confidence: 65,
        suggestion: 'Continue exploring your current path',
        timing: 'Evening hours show strongest resonance'
      };
    }

    const recentThemes = readings.slice(-3).flatMap(r => r.themes);
    const themeFreq: Record<string, number> = {};
    recentThemes.forEach(t => {
      themeFreq[t] = (themeFreq[t] || 0) + 1;
    });

    const topTheme = Object.entries(themeFreq).sort(([,a], [,b]) => b - a)[0];
    const avgResonance = readings.reduce((sum, r) => sum + r.resonance, 0) / readings.length;

    return {
      nextTheme: topTheme ? topTheme[0] : 'Transformation',
      confidence: Math.min(95, 60 + (topTheme?.[1] || 0) * 10),
      suggestion: avgResonance > 80 
        ? 'Your energy is peaking - ideal time for major decisions'
        : 'Focus on grounding practices to strengthen your foundation',
      timing: avgResonance > 80 ? 'Morning (6-9 AM)' : 'Evening (7-10 PM)'
    };
  };

  const predictions = generatePredictions();

  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-indigo-500/30">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-semibold text-indigo-100">Predictive Guidance</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-purple-400 mt-1" />
          <div>
            <p className="text-sm text-gray-400">Next Likely Theme</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-purple-500/20 text-purple-200">{predictions.nextTheme}</Badge>
              <span className="text-xs text-gray-500">{predictions.confidence}% confidence</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-yellow-400 mt-1" />
          <div>
            <p className="text-sm text-gray-400">Personalized Suggestion</p>
            <p className="text-sm text-gray-200 mt-1">{predictions.suggestion}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-400 mt-1" />
          <div>
            <p className="text-sm text-gray-400">Optimal Reading Time</p>
            <p className="text-sm text-blue-200 mt-1">{predictions.timing}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}