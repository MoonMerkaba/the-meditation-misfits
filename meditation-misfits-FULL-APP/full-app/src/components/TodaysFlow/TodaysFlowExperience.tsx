import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Wind, Heart, Sparkles, BookOpen, ChevronRight, ChevronLeft,
  Check, Moon, Flame, Leaf, Droplets, Play, Pause, RotateCcw,
  Volume2, VolumeX
} from 'lucide-react';
import { fetchDailyRitual, DailyRitual } from '@/lib/dailyRitual';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { FlowNarrationPlayer, VoiceStyle } from './FlowNarrationPlayer';
import { useShadowSafe } from '@/contexts/ShadowSafeContext';

type FlowStep = 'arrival' | 'core' | 'integration';

interface TodaysFlowExperienceProps {
  onComplete?: () => void;
  onBack?: () => void;
}

// Narration scripts for each step
const getNarrationScripts = (ritual: DailyRitual | null, practiceType: string) => ({
  arrival: `Welcome to your daily flow. 
Take a moment to settle in. 
Find a comfortable position and let your body relax.
We'll begin with three conscious breaths to ground you in this moment.
When you're ready, we'll breathe together.
Inhale slowly for ${ritual?.breathwork.inhale || 4} seconds, filling your lungs completely.
Hold gently for ${ritual?.breathwork.hold || 4} seconds.
Then exhale slowly for ${ritual?.breathwork.exhale || 6} seconds, releasing any tension.
Let's begin.`,

  arrivalComplete: `Beautiful. You've arrived.
${ritual?.breathwork.affirmation || 'You are exactly where you need to be.'}
Take a moment to feel the shift in your energy.
When you're ready, we'll move into today's core practice.`,

  coreMeditation: `Today's practice centers on intention.
Your intention for today is: ${ritual?.intention || 'I am open to what this day brings.'}
Close your eyes if that feels comfortable.
Let this intention settle not just in your mind, but in your body.
Where do you feel it? Your heart? Your belly?
Breathe into that space.
There's nothing to fix or change. Simply be with what is.`,

  coreFrequency: `Today we work with color frequency.
The color for today is ${ritual?.color_frequency.color || 'violet'}.
Imagine this color as a warm, gentle light.
With each breath, draw this light into your body.
Feel it filling you from the crown of your head to the soles of your feet.
This color brings ${ritual?.color_frequency.benefits?.join(', ') || 'balance and harmony'}.
Rest here for a few moments, bathed in this healing light.`,

  coreReflection: `Today's practice is a shadow reflection.
Shadow work helps us integrate the parts of ourselves we've hidden away.
Here is your prompt: ${ritual?.shadow_work.prompt || 'What am I avoiding feeling right now?'}
There's no right answer. No judgment.
Simply notice what arises.
What sensations come up in your body?
What memories or images appear?
Allow them to be here without trying to change anything.`,

  integration: `Now we move into integration.
This is where we honor what arose during your practice.
Take a moment to notice your energy now compared to when you started.
Has anything shifted?
If words want to come, let them flow onto the page.
If not, that's perfectly okay too.
${ritual?.recovery.reminder || 'Remember: showing up is the practice.'}
Thank yourself for being here today.`
});

export function TodaysFlowExperience({ onComplete, onBack }: TodaysFlowExperienceProps) {
  const { user } = useAuth();
  const { isShadowSafeMode } = useShadowSafe();
  const [currentStep, setCurrentStep] = useState<FlowStep>('arrival');
  const [ritual, setRitual] = useState<DailyRitual | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Narration state
  const [narrationEnabled, setNarrationEnabled] = useState(true);
  const [currentNarrationKey, setCurrentNarrationKey] = useState<string>('arrival');
  
  // Arrival state
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [breathCount, setBreathCount] = useState(0);
  const [arrivalComplete, setArrivalComplete] = useState(false);
  
  // Core practice state
  const [coreComplete, setCoreComplete] = useState(false);
  const [practiceType, setPracticeType] = useState<'meditation' | 'frequency' | 'reflection'>('meditation');
  
  // Integration state
  const [journalEntry, setJournalEntry] = useState('');
  const [energyBefore, setEnergyBefore] = useState(5);
  const [energyAfter, setEnergyAfter] = useState(5);
  const [integrationComplete, setIntegrationComplete] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRitual();
    loadNarrationPreference();
  }, []);

  const loadRitual = async () => {
    try {
      const data = await fetchDailyRitual();
      setRitual(data);
      // Determine practice type based on day
      const dayOfWeek = new Date().getDay();
      if (dayOfWeek % 3 === 0) setPracticeType('meditation');
      else if (dayOfWeek % 3 === 1) setPracticeType('frequency');
      else setPracticeType('reflection');
    } catch (error) {
      console.error('Error loading ritual:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNarrationPreference = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('flow_narration_preferences')
        .select('enabled')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setNarrationEnabled(data.enabled);
      }
    } catch (error) {
      // Use default
    }
  };

  const toggleNarration = async () => {
    const newValue = !narrationEnabled;
    setNarrationEnabled(newValue);
    
    if (user) {
      await supabase
        .from('flow_narration_preferences')
        .upsert({
          user_id: user.id,
          enabled: newValue,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    }
  };

  const scripts = getNarrationScripts(ritual, practiceType);

  const startBreathwork = useCallback(() => {
    if (!ritual) return;
    setBreathPhase('inhale');
    setBreathCount(0);
    
    const cycle = () => {
      setBreathPhase('inhale');
      setTimeout(() => {
        setBreathPhase('hold');
        setTimeout(() => {
          setBreathPhase('exhale');
          setTimeout(() => {
            setBreathCount(prev => {
              if (prev < 2) {
                cycle();
                return prev + 1;
              }
              setBreathPhase('idle');
              setArrivalComplete(true);
              setCurrentNarrationKey('arrivalComplete');
              return 0;
            });
          }, ritual.breathwork.exhale * 1000);
        }, ritual.breathwork.hold * 1000);
      }, ritual.breathwork.inhale * 1000);
    };
    cycle();
  }, [ritual]);

  const handleSaveProgress = async () => {
    if (!user) {
      toast.error('Please sign in to save your progress');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-ritual-streak', {
        body: {
          completedSections: ['arrival', 'core', 'integration'],
          journalEntry,
          moodBefore: energyBefore,
          moodAfter: energyAfter
        }
      });

      if (error) throw error;

      setIntegrationComplete(true);
      toast.success('Your flow has been saved!');
      
      if (onComplete) {
        setTimeout(onComplete, 1500);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save progress');
    } finally {
      setSaving(false);
    }
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'arrival': return 33;
      case 'core': return 66;
      case 'integration': return 100;
      default: return 0;
    }
  };

  const getElementIcon = (element: string) => {
    const iconClass = isShadowSafeMode ? 'text-brand-blue-gray' : 'text-brand-magenta';
    switch (element?.toLowerCase()) {
      case 'fire': return <Flame className={`w-6 h-6 ${iconClass}`} />;
      case 'water': return <Droplets className={`w-6 h-6 ${iconClass}`} />;
      case 'air': return <Wind className={`w-6 h-6 ${iconClass}`} />;
      case 'earth': return <Leaf className={`w-6 h-6 ${iconClass}`} />;
      default: return <Sparkles className={`w-6 h-6 ${iconClass}`} />;
    }
  };

  const getCoreNarrationKey = () => {
    switch (practiceType) {
      case 'meditation': return 'coreMeditation';
      case 'frequency': return 'coreFrequency';
      case 'reflection': return 'coreReflection';
      default: return 'coreMeditation';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isShadowSafeMode 
          ? 'bg-brand-black' 
          : 'bg-gradient-to-br from-brand-black via-brand-dark-gray to-brand-black'
      }`}>
        <div className="text-center">
          <div className={`w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4 ${
            isShadowSafeMode 
              ? 'border-brand-blue-gray/30 border-t-brand-blue-gray' 
              : 'border-brand-magenta/30 border-t-brand-magenta'
          }`} />
          <p className={isShadowSafeMode ? 'text-brand-blue-gray' : 'text-brand-magenta/80'}>
            Preparing your flow...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      isShadowSafeMode 
        ? 'bg-brand-black' 
        : 'bg-gradient-to-br from-brand-black via-brand-dark-gray to-brand-black'
    }`}>
      {/* Background Effects */}
      {!isShadowSafeMode && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-magenta/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-blue-gray/5 rounded-full blur-3xl animate-pulse" />
        </div>
      )}

      <div className="relative max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className={`${
              isShadowSafeMode 
                ? 'text-brand-blue-gray/60 hover:text-brand-blue-gray hover:bg-brand-blue-gray/10' 
                : 'text-brand-light-gray/60 hover:text-brand-white hover:bg-brand-magenta/10'
            }`}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Button>
          <div className="text-center">
            <p className={`text-sm font-sans ${
              isShadowSafeMode ? 'text-brand-blue-gray' : 'text-brand-magenta'
            }`}>Today's Flow</p>

            <p className={`text-xs ${isShadowSafeMode ? 'text-brand-blue-gray/50' : 'text-brand-light-gray/40'}`}>
              {ritual?.day_name}
            </p>
          </div>
          {/* Narration Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleNarration}
              className={`p-2 rounded-lg transition-colors ${
                narrationEnabled 
                  ? isShadowSafeMode 
                    ? 'text-brand-blue-gray bg-brand-blue-gray/20' 
                    : 'text-brand-magenta bg-brand-magenta/20' 
                  : 'text-brand-light-gray/40'
              }`}
              title={narrationEnabled ? 'Narration on' : 'Narration off'}
            >
              {narrationEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className={`flex justify-between text-xs mb-2 ${
            isShadowSafeMode ? 'text-brand-blue-gray/40' : 'text-brand-light-gray/40'
          }`}>
            <span className={currentStep === 'arrival' ? (isShadowSafeMode ? 'text-brand-blue-gray' : 'text-brand-magenta') : ''}>
              Arrival
            </span>
            <span className={currentStep === 'core' ? (isShadowSafeMode ? 'text-brand-blue-gray' : 'text-brand-magenta') : ''}>
              Core Practice
            </span>
            <span className={currentStep === 'integration' ? (isShadowSafeMode ? 'text-brand-blue-gray' : 'text-brand-magenta') : ''}>
              Integration
            </span>
          </div>
          <Progress 
            value={getStepProgress()} 
            className={`h-2 ${isShadowSafeMode ? 'bg-brand-blue-gray/10' : 'bg-brand-dark-gray/30'}`}
          />
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* ARRIVAL STEP */}
          {currentStep === 'arrival' && (
            <div className="animate-in fade-in duration-500">
              <Card className={`${
                isShadowSafeMode 
                  ? 'bg-brand-dark-gray/50 border-brand-blue-gray/20' 
                  : 'bg-gradient-to-br from-brand-dark-gray/60 to-brand-black/60 border-brand-magenta/20'
              }`}>
                <CardContent className="p-8 text-center">
                  <Wind className={`w-12 h-12 mx-auto mb-4 ${
                    isShadowSafeMode ? 'text-brand-blue-gray' : 'text-brand-magenta'
                  }`} />
                  <h2 className="font-sans text-2xl text-brand-white mb-2">Grounding Arrival</h2>
                  <p className={`mb-6 ${isShadowSafeMode ? 'text-brand-blue-gray/70' : 'text-brand-light-gray/60'}`}>
                    Before we begin, let's arrive fully in this moment.
                    Take three conscious breaths to settle your nervous system.
                  </p>

                  {/* Narration Player */}
                  {narrationEnabled && (
                    <div className="mb-6">
                      <FlowNarrationPlayer
                        text={arrivalComplete ? scripts.arrivalComplete : scripts.arrival}
                        stepId={arrivalComplete ? 'arrival-complete' : 'arrival'}
                        autoPlay={false}
                      />
                    </div>
                  )}

                  {breathPhase === 'idle' && !arrivalComplete && (
                    <div className="space-y-6">
                      <p className={`text-sm ${isShadowSafeMode ? 'text-brand-blue-gray' : 'text-brand-magenta/80'}`}>
                        Inhale {ritual?.breathwork.inhale}s → Hold {ritual?.breathwork.hold}s → Exhale {ritual?.breathwork.exhale}s
                      </p>
                      <Button
                        onClick={startBreathwork}
                        className={`${
                          isShadowSafeMode 
                            ? 'bg-brand-blue-gray/20 hover:bg-brand-blue-gray/30 text-brand-blue-gray border border-brand-blue-gray/30' 
                            : 'bg-brand-magenta hover:bg-brand-magenta/90 text-white shadow-brand-sm'
                        }`}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Begin Breathwork
                      </Button>
                    </div>
                  )}

                  {breathPhase !== 'idle' && (
                    <div className="py-8">
                      <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-1000 ${
                        breathPhase === 'inhale' || breathPhase === 'hold' ? 'scale-125' : 'scale-100'
                      } ${
                        isShadowSafeMode 
                          ? 'bg-gradient-to-br from-brand-blue-gray/40 to-brand-blue-gray/20' 
                          : 'bg-gradient-to-br from-brand-magenta/40 to-brand-magenta/20'
                      }`}>
                        <span className="text-brand-white text-xl font-sans capitalize">{breathPhase}</span>

                      </div>
                      <p className={isShadowSafeMode ? 'text-brand-blue-gray/60' : 'text-brand-light-gray/60'}>
                        Breath {breathCount + 1} of 3
                      </p>
                    </div>
                  )}

                  {arrivalComplete && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-center gap-2 text-green-400">
                        <Check className="w-5 h-5" />
                        <span>Grounding complete</span>
                      </div>
                      <p className={`italic ${isShadowSafeMode ? 'text-brand-blue-gray/70' : 'text-brand-light-gray/60'}`}>
                        "{ritual?.breathwork.affirmation}"
                      </p>
                      <Button
                        onClick={() => {
                          setCurrentStep('core');
                          setCurrentNarrationKey(getCoreNarrationKey());
                        }}
                        className={`${
                          isShadowSafeMode 
                            ? 'bg-brand-blue-gray/20 hover:bg-brand-blue-gray/30 text-brand-blue-gray border border-brand-blue-gray/30' 
                            : 'bg-brand-magenta hover:bg-brand-magenta/90 text-white shadow-brand-sm'
                        }`}
                      >
                        Continue to Core Practice
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* CORE PRACTICE STEP */}
          {currentStep === 'core' && (
            <div className="animate-in fade-in duration-500">
              <Card className={`${
                isShadowSafeMode 
                  ? 'bg-brand-dark-gray/50 border-brand-blue-gray/20' 
                  : 'bg-gradient-to-br from-brand-dark-gray/60 to-brand-black/60 border-brand-magenta/20'
              }`}>
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    {getElementIcon(ritual?.element.name || '')}
                    <h2 className="font-sans text-2xl text-brand-white mt-4 mb-2">Core Practice</h2>
                    <p className={isShadowSafeMode ? 'text-brand-blue-gray/70' : 'text-brand-light-gray/60'}>
                      Today's element: <span className={isShadowSafeMode ? 'text-brand-blue-gray' : 'text-brand-magenta'}>
                        {ritual?.element.name}
                      </span>
                    </p>
                  </div>

                  {/* Narration Player */}
                  {narrationEnabled && (
                    <div className="mb-6">
                      <FlowNarrationPlayer
                        text={scripts[getCoreNarrationKey() as keyof typeof scripts]}
                        stepId={`core-${practiceType}`}
                        autoPlay={false}
                      />
                    </div>
                  )}

                  {/* Practice based on type */}
                  {practiceType === 'meditation' && (
                    <div className="space-y-6">
                      <div className={`p-6 rounded-xl ${
                        isShadowSafeMode 
                          ? 'bg-brand-black/30 border border-brand-blue-gray/10' 
                          : 'bg-brand-black/40 border border-brand-magenta/10'
                      }`}>
                        <h3 className={`text-lg mb-3 font-sans ${
                          isShadowSafeMode ? 'text-brand-blue-gray' : 'text-brand-magenta/80'
                        }`}>Guided Intention</h3>
                        <p className="text-xl italic text-brand-white/90 text-center">
                          "{ritual?.intention}"
                        </p>
                      </div>

                      <p className={`text-center text-sm ${
                        isShadowSafeMode ? 'text-brand-blue-gray/60' : 'text-brand-light-gray/60'
                      }`}>
                        Close your eyes and sit with this intention for 2-3 minutes.
                        Let it settle into your body, not just your mind.
                      </p>
                    </div>
                  )}

                  {practiceType === 'frequency' && (
                    <div className="space-y-6">
                      <div className={`p-6 rounded-xl ${
                        isShadowSafeMode 
                          ? 'bg-brand-black/30 border border-brand-blue-gray/10' 
                          : 'bg-brand-black/40 border border-brand-magenta/10'
                      }`}>
                        <h3 className={`text-lg mb-3 font-sans ${
                          isShadowSafeMode ? 'text-brand-blue-gray' : 'text-brand-magenta/80'
                        }`}>Color Frequency</h3>
                        <p className="text-xl text-brand-white/90 text-center mb-4">
                          {ritual?.color_frequency.color}
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {ritual?.color_frequency.benefits.map((benefit, i) => (
                            <span key={i} className={`px-3 py-1 rounded-full text-sm ${
                              isShadowSafeMode 
                                ? 'bg-brand-blue-gray/10 text-brand-blue-gray/80' 
                                : 'bg-brand-magenta/10 text-brand-light-gray/80'
                            }`}>
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className={`text-center text-sm ${
                        isShadowSafeMode ? 'text-brand-blue-gray/60' : 'text-brand-light-gray/60'
                      }`}>
                        Visualize this color surrounding you, breathing it in with each inhale.
                      </p>
                    </div>
                  )}

                  {practiceType === 'reflection' && (
                    <div className="space-y-6">
                      <div className={`p-6 rounded-xl ${
                        isShadowSafeMode 
                          ? 'bg-brand-black/30 border border-brand-blue-gray/10' 
                          : 'bg-brand-black/40 border border-brand-magenta/10'
                      }`}>
                        <h3 className={`text-lg mb-3 font-sans ${
                          isShadowSafeMode ? 'text-brand-blue-gray' : 'text-brand-magenta/80'
                        }`}>Shadow Reflection</h3>
                        <p className="text-lg italic text-brand-white/90 text-center">
                          "{ritual?.shadow_work.prompt}"
                        </p>
                      </div>
                      <p className={`text-center text-sm ${
                        isShadowSafeMode ? 'text-brand-blue-gray/60' : 'text-brand-light-gray/60'
                      }`}>
                        There's no right answer. Just notice what comes up without judgment.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between mt-8">
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentStep('arrival')}
                      className={isShadowSafeMode ? 'text-brand-blue-gray/60' : 'text-brand-light-gray/60'}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        setCoreComplete(true);
                        setCurrentStep('integration');
                        setCurrentNarrationKey('integration');
                      }}
                      className={`${
                        isShadowSafeMode 
                          ? 'bg-brand-blue-gray/20 hover:bg-brand-blue-gray/30 text-brand-blue-gray border border-brand-blue-gray/30' 
                          : 'bg-brand-magenta hover:bg-brand-magenta/90 text-white shadow-brand-sm'
                      }`}
                    >
                      Continue to Integration
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* INTEGRATION STEP */}
          {currentStep === 'integration' && (
            <div className="animate-in fade-in duration-500">
              <Card className={`${
                isShadowSafeMode 
                  ? 'bg-brand-dark-gray/50 border-brand-blue-gray/20' 
                  : 'bg-gradient-to-br from-brand-dark-gray/60 to-brand-black/60 border-brand-magenta/20'
              }`}>
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <Heart className={`w-12 h-12 mx-auto mb-4 ${
                      isShadowSafeMode ? 'text-brand-blue-gray' : 'text-brand-magenta'
                    }`} />
                    <h2 className="font-sans text-2xl text-brand-white mb-2">Integration</h2>
                    <p className={isShadowSafeMode ? 'text-brand-blue-gray/70' : 'text-brand-light-gray/60'}>
                      Capture what arose and honor your practice.
                    </p>
                  </div>

                  {/* Narration Player */}
                  {narrationEnabled && (
                    <div className="mb-6">
                      <FlowNarrationPlayer
                        text={scripts.integration}
                        stepId="integration"
                        autoPlay={false}
                      />
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Energy Check */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm mb-2 ${
                          isShadowSafeMode ? 'text-brand-blue-gray/60' : 'text-brand-light-gray/60'
                        }`}>
                          Energy before ({energyBefore}/10)
                        </label>
                        <Slider
                          value={[energyBefore]}
                          onValueChange={([v]) => setEnergyBefore(v)}
                          min={1}
                          max={10}
                          step={1}
                          className="py-2"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm mb-2 ${
                          isShadowSafeMode ? 'text-brand-blue-gray/60' : 'text-brand-light-gray/60'
                        }`}>
                          Energy after ({energyAfter}/10)
                        </label>
                        <Slider
                          value={[energyAfter]}
                          onValueChange={([v]) => setEnergyAfter(v)}
                          min={1}
                          max={10}
                          step={1}
                          className="py-2"
                        />
                      </div>
                    </div>

                    {/* Journal */}
                    <div>
                      <label className={`block text-sm mb-2 ${
                        isShadowSafeMode ? 'text-brand-blue-gray/60' : 'text-brand-light-gray/60'
                      }`}>
                        <BookOpen className="w-4 h-4 inline mr-1" />
                        What came up for you? (optional)
                      </label>
                      <Textarea
                        value={journalEntry}
                        onChange={(e) => setJournalEntry(e.target.value)}
                        placeholder="Write freely... no judgment, no editing..."
                        className={`min-h-[120px] ${
                          isShadowSafeMode 
                            ? 'bg-brand-black/30 border-brand-blue-gray/20 text-brand-white placeholder:text-brand-blue-gray/30' 
                            : 'bg-brand-black/40 border-brand-dark-gray/30 text-brand-white placeholder:text-brand-dark-gray'
                        }`}
                      />
                    </div>

                    {/* Recovery Reminder */}
                    <div className={`p-4 rounded-xl ${
                      isShadowSafeMode 
                        ? 'bg-brand-black/20 border border-brand-blue-gray/10' 
                        : 'bg-brand-black/30 border border-brand-magenta/10'
                    }`}>
                      <p className={`text-center italic text-sm ${
                        isShadowSafeMode ? 'text-brand-blue-gray/80' : 'text-brand-light-gray/80'
                      }`}>
                        "{ritual?.recovery.reminder}"
                      </p>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button
                        variant="ghost"
                        onClick={() => setCurrentStep('core')}
                        className={isShadowSafeMode ? 'text-brand-blue-gray/60' : 'text-brand-light-gray/60'}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back
                      </Button>
                      <Button
                        onClick={handleSaveProgress}
                        disabled={saving || integrationComplete}
                        className={`${
                          isShadowSafeMode 
                            ? 'bg-brand-blue-gray/20 hover:bg-brand-blue-gray/30 text-brand-blue-gray border border-brand-blue-gray/30' 
                            : 'bg-brand-magenta hover:bg-brand-magenta/90 text-white shadow-brand-sm'
                        }`}
                      >
                        {saving ? (
                          <>Saving...</>
                        ) : integrationComplete ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Complete
                          </>
                        ) : (
                          <>
                            Complete Flow
                            <Sparkles className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Completion Message */}
              {integrationComplete && (
                <div className={`mt-6 p-6 rounded-xl text-center animate-in fade-in ${
                  isShadowSafeMode 
                    ? 'bg-brand-blue-gray/10 border border-brand-blue-gray/20' 
                    : 'bg-green-900/20 border border-green-500/30'
                }`}>
                  <Check className={`w-12 h-12 mx-auto mb-4 ${
                    isShadowSafeMode ? 'text-brand-blue-gray' : 'text-green-400'
                  }`} />
                  <h3 className="font-sans text-xl text-brand-white mb-2">Flow Complete</h3>
                  <p className={isShadowSafeMode ? 'text-brand-blue-gray/70' : 'text-brand-light-gray/60'}>
                    You showed up for yourself today. That matters.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
