import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { Sparkles, Target, Star, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface CompletionModalProps {
  open: boolean;
  onClose: () => void;
  intentionId: string;
  intentionTitle: string;
  onComplete: () => void;
}

export function CompletionModal({ open, onClose, intentionId, intentionTitle, onComplete }: CompletionModalProps) {
  const [step, setStep] = useState<'confirm' | 'celebrate'>('confirm');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('complete-intention', {
        body: { intention_id: intentionId, completion_note: note }
      });

      if (error) throw error;

      setSummary(data.summary);
      setStep('celebrate');
      toast.success('Intention completed!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete intention');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setNote('');
    setSummary(null);
    onClose();
    if (summary) onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        {step === 'confirm' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Complete This Intention?
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You're about to mark <span className="font-semibold text-foreground">"{intentionTitle}"</span> as complete.
              </p>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Reflection (optional)
                </label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What did you learn? How did this intention transform you?"
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button onClick={handleComplete} disabled={loading}>
                  {loading ? 'Completing...' : 'Complete Intention'}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
                Celebration Time!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <p className="text-center text-muted-foreground">
                You manifested: <span className="font-semibold text-foreground">"{intentionTitle}"</span>
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                  <Target className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{summary?.totalActions || 0}</div>
                  <div className="text-xs text-muted-foreground">Actions Taken</div>
                </div>
                <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
                  <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                  <div className="text-2xl font-bold">{summary?.totalWins || 0}</div>
                  <div className="text-xs text-muted-foreground">Wins Logged</div>
                </div>
                <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">{summary?.daysActive || 0}</div>
                  <div className="text-xs text-muted-foreground">Days Active</div>
                </div>
                <div className="text-center p-4 bg-green-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{summary?.peakScore || 0}</div>
                  <div className="text-xs text-muted-foreground">Peak Resonance</div>
                </div>
              </div>
              <Button onClick={handleClose} className="w-full">Continue Your Journey</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
