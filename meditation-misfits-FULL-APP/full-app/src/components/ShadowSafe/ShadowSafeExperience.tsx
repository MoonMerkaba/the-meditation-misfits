import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { 
  Heart, Wind, Moon, Feather, Volume2, VolumeX,
  ChevronLeft, Sparkles, Eye, Shield, Waves
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ShadowSafeExperienceProps {
  onBack?: () => void;
}

const gentleAffirmations = [
  "You don't have to feel better right now.",
  "This feeling is temporary, even when it doesn't feel that way.",
  "You're allowed to rest without earning it.",
  "Your nervous system is doing its best.",
  "Nothing is wrong with you.",
  "You don't have to understand this to survive it.",
  "Being here is enough.",
  "You're not behind. You're exactly where you are.",
  "This too shall pass — but it doesn't have to pass quickly.",
  "You're allowed to need support before you fall apart."
];

const groundingExercises = [
  {
    name: "5-4-3-2-1 Senses",
    description: "Notice 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.",
    icon: Eye
  },
  {
    name: "Feet on Floor",
    description: "Press your feet firmly into the ground. Feel the support beneath you.",
    icon: Shield
  },
  {
    name: "Cold Water",
    description: "Run cold water over your wrists or splash your face gently.",
    icon: Waves
  },
  {
    name: "Box Breathing",
    description: "Inhale 4 counts, hold 4, exhale 4, hold 4. Repeat slowly.",
    icon: Wind
  }
];

export function ShadowSafeExperience({ onBack }: ShadowSafeExperienceProps) {
  const { user } = useAuth();
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale' | 'holdEmpty'>('idle');
  const [breathCount, setBreathCount] = useState(0);
  const [journalEntry, setJournalEntry] = useState('');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [showJournal, setShowJournal] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);

  // Rotate affirmations slowly
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAffirmation(prev => (prev + 1) % gentleAffirmations.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const startBoxBreathing = useCallback(() => {
    setBreathPhase('inhale');
    setBreathCount(0);

    const cycle = () => {
      setBreathPhase('inhale');
      setTimeout(() => {
        setBreathPhase('hold');
        setTimeout(() => {
          setBreathPhase('exhale');
          setTimeout(() => {
            setBreathPhase('holdEmpty');
            setTimeout(() => {
              setBreathCount(prev => {
                if (prev < 3) {
                  cycle();
                  return prev + 1;
                }
                setBreathPhase('idle');
                return 0;
              });
            }, 4000);
          }, 4000);
        }, 4000);
      }, 4000);
    };
    cycle();
  }, []);

  const saveJournal = async () => {
    if (!user || !journalEntry.trim()) return;

    try {
      await supabase.functions.invoke('save-grounding-session', {
        body: {
          action: 'save',
          trigger_reason: 'shadow_safe_mode',
          duration_seconds: 0,
          technique_used: 'shadow_safe_journal',
          effectiveness_rating: energyLevel,
          notes: journalEntry
        }
      });
      toast.success('Your thoughts have been saved.');
      setJournalEntry('');
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Subtle Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-white/60 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Button>
          <div className="text-center">
            <p className="text-sm text-orange-300/80">Shadow-Safe Mode</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAudioMuted(!audioMuted)}
            className="text-white/60 hover:text-white"
          >
            {audioMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Gentle Affirmation */}
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-orange-500/20">
            <CardContent className="p-8 text-center">
              <Feather className="w-10 h-10 text-orange-300/60 mx-auto mb-4" />
              <p className="text-xl text-white/90 font-light leading-relaxed transition-all duration-1000">
                {gentleAffirmations[currentAffirmation]}
              </p>
              <p className="text-white/40 text-sm mt-4">
                No pressure. No timeline. Just presence.
              </p>
            </CardContent>
          </Card>

          {/* Box Breathing */}
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-orange-500/20">
            <CardContent className="p-6">
              <h3 className="text-lg text-orange-200 mb-4 flex items-center gap-2">
                <Wind className="w-5 h-5" />
                Gentle Breathing
              </h3>
              
              {breathPhase === 'idle' ? (
                <div className="text-center">
                  <p className="text-white/60 mb-4 text-sm">
                    Box breathing: 4 seconds each — inhale, hold, exhale, hold.
                    <br />
                    No rush. Your body knows how to do this.
                  </p>
                  <Button
                    onClick={startBoxBreathing}
                    className="bg-orange-600/30 hover:bg-orange-600/50 border border-orange-500/30 text-orange-200"
                  >
                    Begin When Ready
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className={`
                    w-28 h-28 mx-auto rounded-full flex items-center justify-center
                    bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30
                    transition-all duration-1000 ease-in-out
                    ${breathPhase === 'inhale' || breathPhase === 'hold' ? 'scale-110' : 'scale-100'}
                  `}>
                    <div className="text-center">
                      <p className="text-lg font-medium text-orange-200 capitalize">
                        {breathPhase === 'holdEmpty' ? 'Hold' : breathPhase}
                      </p>
                      <p className="text-xs text-white/50">4 seconds</p>
                    </div>
                  </div>
                  <p className="text-white/40 text-sm mt-4">
                    Breath {breathCount + 1} of 4
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Grounding Exercises */}
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-orange-500/20">
            <CardContent className="p-6">
              <h3 className="text-lg text-orange-200 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Grounding Options
              </h3>
              <p className="text-white/50 text-sm mb-4">
                You don't have to do any of these. They're just here if you want them.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {groundingExercises.map((exercise, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <exercise.icon className="w-4 h-4 text-orange-300/60" />
                      <h4 className="text-white/90 text-sm font-medium">{exercise.name}</h4>
                    </div>
                    <p className="text-white/50 text-xs">{exercise.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Soft Journal */}
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-orange-500/20">
            <CardContent className="p-6">
              <button
                onClick={() => setShowJournal(!showJournal)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-orange-300/60" />
                  <span className="text-orange-200">Soft Space to Write</span>
                </div>
                <span className="text-white/40 text-sm">{showJournal ? 'Close' : 'Open'}</span>
              </button>

              {showJournal && (
                <div className="mt-4 space-y-4 animate-in fade-in duration-300">
                  <p className="text-white/50 text-sm">
                    You don't have to make sense. You don't have to be positive.
                    Just let it out.
                  </p>
                  <Textarea
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    placeholder="Whatever needs to come out..."
                    className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                  />
                  
                  <div>
                    <label className="block text-sm text-white/50 mb-2">
                      Energy level right now ({energyLevel}/5)
                    </label>
                    <Slider
                      value={[energyLevel]}
                      onValueChange={([v]) => setEnergyLevel(v)}
                      min={1}
                      max={5}
                      step={1}
                      className="py-2"
                    />
                    <div className="flex justify-between text-xs text-white/30 mt-1">
                      <span>Depleted</span>
                      <span>Okay</span>
                    </div>
                  </div>

                  {user && journalEntry.trim() && (
                    <Button
                      onClick={saveJournal}
                      className="w-full bg-orange-600/30 hover:bg-orange-600/50 border border-orange-500/30 text-orange-200"
                    >
                      Save for Later
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Closing Message */}
          <div className="text-center py-8">
            <Moon className="w-8 h-8 text-orange-300/40 mx-auto mb-4" />
            <p className="text-white/60 text-sm max-w-md mx-auto leading-relaxed">
              Some days aren't for becoming. They're for staying.
              <br /><br />
              You're allowed to need support before you fall apart.
              <br />
              You're allowed to rest without earning it.
              <br />
              You're allowed to just... be.
            </p>
            <p className="text-orange-300/60 text-sm mt-6 italic">
              This space will be here whenever you need it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
