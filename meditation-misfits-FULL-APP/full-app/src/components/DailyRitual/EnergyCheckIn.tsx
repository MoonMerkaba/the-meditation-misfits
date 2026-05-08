import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { invokeEdgeFunction } from '@/lib/edgeFunctionHelper';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Thermometer, Battery, Heart, Brain, Sparkles, Check, TrendingUp, ArrowLeft } from 'lucide-react';

interface EnergyCheckInProps {
  moonPhase?: string;
  element?: string;
  onComplete?: (data: { energy: number; emotional: number; clarity: number }) => void;
}

export function EnergyCheckIn({ moonPhase, element, onComplete }: EnergyCheckInProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [energy, setEnergy] = useState(5);
  const [emotional, setEmotional] = useState(5);
  const [clarity, setClarity] = useState(5);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [todayCheckin, setTodayCheckin] = useState<any>(null);
  const [showTrends, setShowTrends] = useState(false);
  const [trends, setTrends] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadTodayCheckin();
    }
  }, [open, user]);

  const loadTodayCheckin = async () => {
    if (!user) return;
    try {
      const { data, error } = await invokeEdgeFunction('manage-energy-checkin', { action: 'get_today' });
      if (error) return;
      if (data?.checkin) {
        setTodayCheckin(data.checkin);
        setEnergy(data.checkin.energy_level);
        setEmotional(data.checkin.emotional_state);
        setClarity(data.checkin.mental_clarity);
        setNotes(data.checkin.notes || '');
      }
    } catch (error) {
      console.error('Error loading checkin:', error);
    }
  };

  const loadTrends = async () => {
    if (!user) return;
    try {
      const { data, error } = await invokeEdgeFunction('manage-energy-checkin', { action: 'get_trends', days: 30 });
      if (error) { toast.error(error); return; }
      if (data?.trends) {
        setTrends(data.trends);
        setShowTrends(true);
      }
    } catch (error) {
      console.error('Error loading trends:', error);
    }
  };

  const saveCheckin = async () => {
    if (!user) {
      toast.error('Please sign in to save your check-in');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await invokeEdgeFunction('manage-energy-checkin', {
        action: 'save',
        energy_level: energy,
        emotional_state: emotional,
        mental_clarity: clarity,
        notes,
        moon_phase: moonPhase,
        element
      });

      if (error) { toast.error(error); return; }

      setShowConfirmation(true);
      onComplete?.({ energy, emotional, clarity });
      
      setTimeout(() => {
        setShowConfirmation(false);
        setOpen(false);
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save check-in');
    } finally {
      setSaving(false);
    }
  };


  const getEnergyLabel = (value: number) => {
    if (value <= 2) return 'Very Low';
    if (value <= 4) return 'Low';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'Good';
    return 'High';
  };

  const getEmotionalLabel = (value: number) => {
    if (value <= 2) return 'Struggling';
    if (value <= 4) return 'Heavy';
    if (value <= 6) return 'Neutral';
    if (value <= 8) return 'Positive';
    return 'Radiant';
  };

  const getClarityLabel = (value: number) => {
    if (value <= 2) return 'Foggy';
    if (value <= 4) return 'Scattered';
    if (value <= 6) return 'Present';
    if (value <= 8) return 'Clear';
    return 'Crystal Clear';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30 text-white hover:bg-amber-500/30"
        >
          <Thermometer className="w-4 h-4 mr-2" />
          Check In With Myself
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-amber-500/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-amber-400" />
            Daily Energy Check-In
          </DialogTitle>
        </DialogHeader>

        {showConfirmation ? (
          /* Confirmation View */
          <div className="py-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center">
              <Check className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Thank you for checking in honestly.</h3>
              <p className="text-white/70">
                Nothing you entered is "good" or "bad."
              </p>
              <p className="text-amber-300 mt-2">
                Awareness is the work — and you just did it.
              </p>
            </div>
          </div>
        ) : !showTrends ? (
          <div className="space-y-6">
            {/* Intro Copy */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <p className="text-white/80 text-sm leading-relaxed">
                Before we offer guidance, we want to understand you.
              </p>
              <p className="text-white/70 text-sm mt-2 leading-relaxed">
                Take a moment to check in honestly — not how you <em>think</em> you should feel, 
                but how you <span className="text-amber-300">actually</span> feel right now.
              </p>
              <p className="text-white/60 text-sm mt-3 italic">
                This isn't tracking for perfection.<br />
                It's listening.
              </p>
            </div>

            {/* Energy Level */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Battery className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-medium">Energy Level</span>
                </div>
                <span className="text-amber-400 font-medium">{getEnergyLabel(energy)}</span>
              </div>
              <Slider
                value={[energy]}
                onValueChange={([v]) => setEnergy(v)}
                min={1}
                max={10}
                step={1}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-white/40">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* Emotional State */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400" />
                  <span className="text-white font-medium">Emotional State</span>
                </div>
                <span className="text-pink-400 font-medium">{getEmotionalLabel(emotional)}</span>
              </div>
              <Slider
                value={[emotional]}
                onValueChange={([v]) => setEmotional(v)}
                min={1}
                max={10}
                step={1}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-white/40">
                <span>Heavy</span>
                <span>Light</span>
              </div>
            </div>

            {/* Mental Clarity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-medium">Mental Clarity</span>
                </div>
                <span className="text-purple-400 font-medium">{getClarityLabel(clarity)}</span>
              </div>
              <Slider
                value={[clarity]}
                onValueChange={([v]) => setClarity(v)}
                min={1}
                max={10}
                step={1}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-white/40">
                <span>Foggy</span>
                <span>Clear</span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm text-white/60">Anything else you want to note? (optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How you're feeling, what's on your mind..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px]"
              />
            </div>

            {/* Guidance Copy */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-white/60 text-sm">
                There are no right answers.
              </p>
              <p className="text-white/60 text-sm">
                There is no "good" or "bad" check-in.
              </p>
              <p className="text-white/80 text-sm mt-3">
                This is not about tracking perfection — it's about <span className="text-amber-400">awareness</span>.
              </p>
              <p className="text-white/70 text-sm mt-2">
                Awareness creates choice. Choice creates freedom.
              </p>
            </div>

            {/* Empty State for first check-in */}
            {!todayCheckin && user && (
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                <p className="text-purple-300 text-sm">
                  This is your first check-in.
                </p>
                <p className="text-white/60 text-xs mt-1">
                  There's no baseline yet — and that's okay.
                </p>
                <p className="text-white/60 text-xs">
                  Awareness begins the moment you notice how you feel.
                </p>
                <p className="text-white/70 text-xs mt-2 font-medium">
                  Show up honestly. That's enough.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {user && (
                <Button
                  variant="outline"
                  onClick={loadTrends}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Trends
                </Button>
              )}
              <Button
                onClick={saveCheckin}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500"
              >
                {saving ? (
                  'Saving...'
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {todayCheckin ? 'Update Check-In' : 'Save Check-In'}
                  </>
                )}
              </Button>
            </div>

            <p className="text-center text-white/50 text-sm italic">
              Thank you for showing up honestly today.
            </p>
          </div>
        ) : (
          /* Trends View */
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => setShowTrends(false)}
              className="text-white/60 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Check-In
            </Button>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white/70 text-sm text-center">
                Patterns become clearer with time and reflection.
              </p>
              <p className="text-white/60 text-sm text-center mt-2">
                This is about understanding, not fixing.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-center">
                <Battery className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{trends?.averages?.energy?.toFixed(1) || '-'}</p>
                <p className="text-xs text-white/60">Avg Energy</p>
              </div>
              <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20 text-center">
                <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{trends?.averages?.emotional?.toFixed(1) || '-'}</p>
                <p className="text-xs text-white/60">Avg Emotional</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                <Brain className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{trends?.averages?.clarity?.toFixed(1) || '-'}</p>
                <p className="text-xs text-white/60">Avg Clarity</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-white font-medium mb-3">Moon Phase Correlations</h4>
              {trends?.moonCorrelations && Object.keys(trends.moonCorrelations).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(trends.moonCorrelations).map(([phase, data]: [string, any]) => (
                    <div key={phase} className="flex justify-between items-center">
                      <span className="text-white/70 capitalize">{phase.replace('_', ' ')}</span>
                      <span className="text-amber-400">{data.avgEnergy.toFixed(1)} avg energy</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-white/50 text-sm">Not enough data yet.</p>
                  <p className="text-white/40 text-xs mt-1">Keep checking in to reveal patterns.</p>
                </div>
              )}
            </div>

            <p className="text-center text-white/60 text-sm">
              Based on {trends?.dataPoints || 0} check-ins over the last 30 days
            </p>

            <p className="text-center text-white/40 text-xs italic">
              Awareness is power — especially when it's compassionate.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

