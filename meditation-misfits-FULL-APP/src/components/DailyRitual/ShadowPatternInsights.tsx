import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Eye, Moon, Heart, TrendingUp, Sparkles, RefreshCw, Loader2 } from 'lucide-react';

interface Pattern {
  type: string;
  title: string;
  description: string;
  frequency: string;
  moonPhases: string[];
  insight: string;
  suggestion: string;
}

interface Analysis {
  patterns: Pattern[];
  growthCycles: { name: string; description: string; progress: string }[];
  strengths: string[];
  compassionateMessage: string;
}

export function ShadowPatternInsights() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [dataPoints, setDataPoints] = useState<{ energyCheckins: number; ritualDays: number; reflections: number } | null>(null);
  const [storedPatterns, setStoredPatterns] = useState<any[]>([]);

  useEffect(() => {
    if (open && user) {
      loadStoredPatterns();
    }
  }, [open, user]);

  const loadStoredPatterns = async () => {
    try {
      const { data } = await supabase.functions.invoke('analyze-shadow-patterns', {
        body: { action: 'get_patterns' }
      });
      if (data?.patterns) {
        setStoredPatterns(data.patterns);
      }
    } catch (error) {
      console.error('Error loading patterns:', error);
    }
  };

  const runAnalysis = async () => {
    if (!user) {
      toast.error('Please sign in to analyze patterns');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-shadow-patterns', {
        body: { action: 'analyze' }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      setDataPoints(data.dataPoints);
      loadStoredPatterns();
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze patterns');
    } finally {
      setLoading(false);
    }
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'emotional': return <Heart className="w-5 h-5 text-pink-400" />;
      case 'cyclical': return <Moon className="w-5 h-5 text-indigo-400" />;
      case 'growth': return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      default: return <Eye className="w-5 h-5 text-purple-400" />;
    }
  };

  const getPatternGradient = (type: string) => {
    switch (type) {
      case 'emotional': return 'from-pink-500/20 to-rose-500/20 border-pink-500/30';
      case 'cyclical': return 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30';
      case 'growth': return 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30';
      default: return 'from-purple-500/20 to-violet-500/20 border-purple-500/30';
    }
  };

  const hasEnoughData = dataPoints && (dataPoints.energyCheckins > 3 || dataPoints.ritualDays > 3 || dataPoints.reflections > 2);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-gradient-to-r from-slate-600/20 to-slate-800/20 border-slate-500/30 text-white hover:bg-slate-600/30"
        >
          <Eye className="w-4 h-4 mr-2" />
          See My Patterns
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-slate-500/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-slate-400" />
            Shadow Pattern Insight
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Intro Copy */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-slate-700/20 to-slate-800/20 border border-slate-500/20">
            <p className="text-white/80 leading-relaxed">
              As you move through rituals, reflections, and check-ins, patterns naturally emerge.
            </p>
            <p className="text-white/60 mt-3">
              Not flaws.
              <br />
              Not failures.
              <br />
              <span className="text-purple-300 font-medium">Patterns.</span>
            </p>
            <p className="text-white/70 mt-4">
              This space exists to help you notice them — without judgment.
            </p>
          </div>

          {/* What you might see */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/70 text-sm mb-3">You may begin to see:</p>
            <ul className="space-y-2 text-white/60 text-sm">
              <li className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                themes that surface during certain moon phases
              </li>
              <li className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400" />
                emotions that repeat during stress
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                growth cycles you didn't realize you were completing
              </li>
            </ul>
          </div>

          {/* Empty State */}
          {!analysis && storedPatterns.length === 0 && (
            <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
              <Eye className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
              <p className="text-white/80 mb-2">
                There are no patterns to show yet.
              </p>
              <p className="text-white/60 text-sm">
                Not because nothing is happening — but because you've just begun observing.
              </p>
              <p className="text-purple-300 text-sm mt-4 italic">
                Insight takes time. Keep showing up.
              </p>
            </div>
          )}

          {/* Analyze Button */}
          {user && (
            <Button
              onClick={runAnalysis}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing your journey...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {analysis ? 'Refresh Analysis' : 'Analyze My Patterns'}
                </>
              )}
            </Button>
          )}

          {/* Data Points */}
          {dataPoints && (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xl font-bold text-white">{dataPoints.energyCheckins}</p>
                <p className="text-xs text-white/50">Check-ins</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xl font-bold text-white">{dataPoints.ritualDays}</p>
                <p className="text-xs text-white/50">Ritual Days</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xl font-bold text-white">{dataPoints.reflections}</p>
                <p className="text-xs text-white/50">Reflections</p>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-6">
              {/* Patterns */}
              {analysis.patterns && analysis.patterns.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-400" />
                    Observed Patterns
                  </h3>
                  {analysis.patterns.map((pattern, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl bg-gradient-to-br border ${getPatternGradient(pattern.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        {getPatternIcon(pattern.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{pattern.title}</h4>
                          <p className="text-white/70 text-sm mt-1">{pattern.description}</p>
                          {pattern.moonPhases && pattern.moonPhases.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {pattern.moonPhases.map((phase, j) => (
                                <span key={j} className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-white/60">
                                  {phase}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-purple-300 text-sm mt-3 italic">
                            {pattern.insight}
                          </p>
                          {pattern.suggestion && (
                            <p className="text-white/60 text-sm mt-2">
                              <span className="text-emerald-400">Suggestion:</span> {pattern.suggestion}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Growth Cycles */}
              {analysis.growthCycles && analysis.growthCycles.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Growth Cycles
                  </h3>
                  {analysis.growthCycles.map((cycle, i) => (
                    <div key={i} className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <h4 className="font-medium text-white">{cycle.name}</h4>
                      <p className="text-white/70 text-sm mt-1">{cycle.description}</p>
                      <p className="text-emerald-400 text-sm mt-2">Progress: {cycle.progress}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Strengths */}
              {analysis.strengths && analysis.strengths.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Observed Strengths
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.strengths.map((strength, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-sm">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Compassionate Message */}
              {analysis.compassionateMessage && (
                <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-center">
                  <Heart className="w-8 h-8 text-pink-400 mx-auto mb-3" />
                  <p className="text-white/90 italic leading-relaxed">
                    {analysis.compassionateMessage}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Stored Patterns (from previous analyses) */}
          {storedPatterns.length > 0 && !analysis && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Previously Detected Patterns</h3>
              {storedPatterns.slice(0, 5).map((pattern, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex justify-between items-start">
                    <p className="text-white/80 text-sm">{pattern.description}</p>
                    <span className="text-xs text-white/40">Seen {pattern.frequency}x</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Closing Copy */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-white/70 text-sm">
              <span className="text-purple-300">Awareness is power</span> — especially when it's compassionate.
            </p>
            <p className="text-white/60 text-sm mt-3">
              Nothing here is used to label you.
              <br />
              Everything here is meant to <span className="text-purple-300">liberate</span> you.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
