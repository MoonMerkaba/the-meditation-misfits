import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { AlertOctagon, Heart, Wind, Sparkles, Check, Timer, Volume2 } from 'lucide-react';

interface NervousSystemRescueProps {
  onComplete?: () => void;
}

export function NervousSystemRescue({ onComplete }: NervousSystemRescueProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<'intro' | 'breathing' | 'grounding' | 'affirmation' | 'complete'>('intro');
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [breathCount, setBreathCount] = useState(0);
  const [timer, setTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [effectiveness, setEffectiveness] = useState(3);
  const [notes, setNotes] = useState('');
  const [technique, setTechnique] = useState('breathing');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showEmptyState, setShowEmptyState] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (timerActive && timer > 0) {
      const interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && timerActive) {
      setTimerActive(false);
      setPhase('complete');
    }
  }, [timerActive, timer]);

  const startBreathing = useCallback(() => {
    setPhase('breathing');
    setBreathPhase('inhale');
    setBreathCount(0);
    setStartTime(new Date());
    setTimerActive(true);

    const cycle = () => {
      setBreathPhase('inhale');
      setTimeout(() => {
        setBreathPhase('hold');
        setTimeout(() => {
          setBreathPhase('exhale');
          setTimeout(() => {
            setBreathCount(prev => {
              if (prev < 5) {
                cycle();
                return prev + 1;
              }
              setBreathPhase('idle');
              setPhase('grounding');
              return 0;
            });
          }, 6000); // 6s exhale
        }, 4000); // 4s hold
      }, 4000); // 4s inhale
    };
    cycle();
  }, []);

  const saveSession = async () => {
    if (!user || !startTime) return;

    const duration = Math.round((new Date().getTime() - startTime.getTime()) / 1000);

    try {
      await supabase.functions.invoke('save-grounding-session', {
        body: {
          action: 'save',
          trigger_reason: 'nervous_system_rescue',
          duration_seconds: duration,
          technique_used: technique,
          effectiveness_rating: effectiveness,
          notes
        }
      });
      toast.success('Session saved. You did beautifully.');
    } catch (error) {
      console.error('Error saving session:', error);
    }

    setOpen(false);
    resetState();
    onComplete?.();
  };

  const resetState = () => {
    setPhase('intro');
    setBreathPhase('idle');
    setBreathCount(0);
    setTimer(60);
    setTimerActive(false);
    setEffectiveness(3);
    setNotes('');
    setStartTime(null);
  };

  const groundingPrompts = [
    "Name 5 things you can see around you",
    "Notice 4 things you can physically feel",
    "Listen for 3 sounds in your environment",
    "Identify 2 things you can smell",
    "Acknowledge 1 thing you can taste"
  ];

  const affirmations = [
    "You are safe in this moment.",
    "Nothing is wrong with you. Your system is recalibrating.",
    "This feeling will pass. You've survived every moment until now.",
    "Your nervous system is doing its job. You can trust your body.",
    "You don't need to fix anything right now. Just breathe."
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetState(); }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/30 text-white hover:bg-red-500/30 hover:border-red-500/50"
        >
          <AlertOctagon className="w-4 h-4 mr-2" />
          Ground Me Now
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-red-500/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-400" />
            I Need Grounding — Right Now
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Intro Phase */}
          {phase === 'intro' && (
            <div className="space-y-6 text-center">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20">
                <p className="text-white/90 leading-relaxed">
                  If your thoughts are racing, your body feels tight, or emotions are spiking, 
                  <span className="text-red-300 font-medium"> you're not failing</span> — your nervous system is asking for support.
                </p>
              </div>

              <div className="space-y-4 text-white/80">
                <p className="flex items-center gap-2 justify-center">
                  <Wind className="w-5 h-5 text-blue-400" />
                  Pause here.
                </p>
                <p>Breathe in slowly through your nose.</p>
                <p>Let your shoulders drop.</p>
                <p>Unclench your jaw.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-purple-300 font-medium text-lg">
                  You are safe in this moment.
                </p>
              </div>

              <p className="text-white/60 text-sm">
                This space exists for the moments when everything feels like too much. 
                You don't need to understand anything. You don't need to fix anything. 
                Just stay here for sixty seconds.
              </p>

              <p className="text-white/70 italic">
                Nothing is wrong with you. Your system is recalibrating.
              </p>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={startBreathing}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500"
                >
                  <Wind className="w-4 h-4 mr-2" />
                  Begin Breathing
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setPhase('grounding'); setStartTime(new Date()); setTechnique('5-4-3-2-1'); }}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  5-4-3-2-1 Grounding
                </Button>
              </div>
            </div>
          )}

          {/* Breathing Phase */}
          {phase === 'breathing' && (
            <div className="text-center space-y-6">
              <div className="flex justify-between items-center text-sm text-white/60 mb-4">
                <span>Breath {breathCount + 1} of 6</span>
                <span className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  {timer}s remaining
                </span>
              </div>

              <div className={`
                w-40 h-40 mx-auto rounded-full flex items-center justify-center
                bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border-2 border-blue-400/50
                transition-all duration-1000 ease-in-out
                ${breathPhase === 'inhale' ? 'scale-125' : breathPhase === 'hold' ? 'scale-125' : 'scale-100'}
              `}>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white capitalize">{breathPhase}</p>
                  <p className="text-sm text-white/60">
                    {breathPhase === 'inhale' && '4 seconds'}
                    {breathPhase === 'hold' && '4 seconds'}
                    {breathPhase === 'exhale' && '6 seconds'}
                  </p>
                </div>
              </div>

              <p className="text-white/70 italic">
                {affirmations[breathCount % affirmations.length]}
              </p>

              <Button
                variant="ghost"
                onClick={() => setPhase('grounding')}
                className="text-white/50 hover:text-white"
              >
                Skip to grounding
              </Button>
            </div>
          )}

          {/* Grounding Phase */}
          {phase === 'grounding' && (
            <div className="space-y-6">
              <p className="text-center text-white/80">
                Let's ground you in the present moment using your senses.
              </p>

              <div className="space-y-3">
                {groundingPrompts.map((prompt, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => {}}
                  >
                    <p className="text-white/90">{prompt}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setPhase('affirmation')}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Affirmation Phase */}
          {phase === 'affirmation' && (
            <div className="text-center space-y-6">
              <Sparkles className="w-12 h-12 text-purple-400 mx-auto" />

              <div className="space-y-4">
                {affirmations.map((affirmation, i) => (
                  <p
                    key={i}
                    className="text-white/90 text-lg"
                    style={{ animationDelay: `${i * 0.5}s` }}
                  >
                    {affirmation}
                  </p>
                ))}
              </div>

              <Button
                onClick={() => setPhase('complete')}
                className="bg-gradient-to-r from-emerald-500 to-teal-500"
              >
                <Check className="w-4 h-4 mr-2" />
                I Feel Better
              </Button>
            </div>
          )}

          {/* Complete Phase */}
          {phase === 'complete' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">You did it.</h3>
                <p className="text-white/70">
                  You showed up for yourself. That takes courage.
                </p>
              </div>

              {user && (
                <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">
                      How effective was this? ({effectiveness}/5)
                    </label>
                    <Slider
                      value={[effectiveness]}
                      onValueChange={([v]) => setEffectiveness(v)}
                      min={1}
                      max={5}
                      step={1}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/60 mb-2">
                      Any notes for yourself? (optional)
                    </label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="What triggered this? What helped most?"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => { setOpen(false); resetState(); }}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Close
                </Button>
                {user && (
                  <Button
                    onClick={saveSession}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    Save & Close
                  </Button>
                )}
              </div>

              <p className="text-center text-white/50 text-sm italic">
                A Gentle Reminder: You are not behind. You are not broken. 
                You are not doing this wrong.
              </p>
            </div>
          )}

          {/* Empty State for first-time users */}
          {showEmptyState && (
            <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white/80 mb-2">
                You don't need this right now — and that's a good thing.
              </p>
              <p className="text-white/60 text-sm">
                But when you do, this space will be here.
                <br />
                Quiet. Steady. Safe.
              </p>
              <p className="text-purple-300 text-sm mt-4 italic">
                You're allowed to need support before you fall apart.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
