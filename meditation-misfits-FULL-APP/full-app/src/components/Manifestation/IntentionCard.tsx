import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Sparkles, Loader2, Share2, TrendingUp, CheckCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { SocialShareButtons } from '@/components/Social/SocialShareButtons';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IntentionTimeline } from './IntentionTimeline';
import { ResonanceChart } from './ResonanceChart';
import { CompletionModal } from './CompletionModal';

interface IntentionCardProps {
  intention: any;
  onLogAction: () => void;
  onLogWin: () => void;
  onViewDetails: () => void;
  onComplete: () => void;
}


const areaColors: Record<string, string> = {
  abundance: 'bg-yellow-500',
  love: 'bg-pink-500',
  health: 'bg-green-500',
  purpose: 'bg-purple-500',
  custom: 'bg-blue-500'
};

export function IntentionCard({ intention, onLogAction, onLogWin, onViewDetails, onComplete }: IntentionCardProps) {
  const { isPremium } = useSubscription();
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const progress = Math.min(100, intention.resonance_score / 10);

  const loadInsights = async () => {
    if (!isPremium) return;
    setLoadingInsights(true);
    try {
      const { data } = await supabase.functions.invoke('get-manifestation-insights', {
        body: { intentionId: intention.id }
      });
      if (data?.insights) setInsights(data.insights);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsights(false);
    }
  };


  return (
    <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold">{intention.title}</h3>
            <Badge className={areaColors[intention.area]}>{intention.area}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{intention.north_star}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Resonance Score</span>
          <span className="font-bold text-purple-600">{intention.resonance_score}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {isPremium && (
        <div className="space-y-2">
          <Button onClick={loadInsights} size="sm" variant="ghost" disabled={loadingInsights}>
            {loadingInsights ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span className="ml-2">AI Insights</span>
          </Button>
          {insights.length > 0 && (
            <div className="bg-purple-50 p-3 rounded-lg space-y-2">
              {insights.map((insight, i) => (
                <p key={i} className="text-sm text-purple-900">{insight}</p>
              ))}
            </div>
          )}
        </div>
      )}


      <div className="flex gap-2">
        <Button onClick={onLogAction} size="sm" variant="outline" className="flex-1">
          Log Action
        </Button>
        <Button onClick={onLogWin} size="sm" variant="outline" className="flex-1">
          Mark Win
        </Button>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => setShowTimeline(true)} size="sm" variant="ghost" className="flex-1">
          <TrendingUp className="w-4 h-4 mr-2" />
          View Timeline
        </Button>
        <Button onClick={() => setShowCompletion(true)} size="sm" variant="ghost" className="flex-1">
          <CheckCircle className="w-4 h-4 mr-2" />
          Complete
        </Button>
      </div>
      
      <div className="pt-2 border-t">
        <SocialShareButtons 
          text={`Working on my ${intention.area} intention: ${intention.title}. Current Resonance Score: ${intention.resonance_score}`} 
          type="win" 
        />
      </div>

      <Dialog open={showTimeline} onOpenChange={setShowTimeline}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Intention Journey</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <ResonanceChart intentionId={intention.id} />
            <IntentionTimeline intentionId={intention.id} />
          </div>
        </DialogContent>
      </Dialog>

      <CompletionModal
        open={showCompletion}
        onClose={() => setShowCompletion(false)}
        intentionId={intention.id}
        intentionTitle={intention.title}
        onComplete={onComplete}
      />
    </Card>
  );
}

