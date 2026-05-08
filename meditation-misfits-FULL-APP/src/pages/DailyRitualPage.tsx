import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchDailyRitual, DailyRitual, saveRitualCompletion } from '@/lib/dailyRitual';
import { RitualSection } from '@/components/DailyRitual/RitualSection';
import { RitualStreakDisplay } from '@/components/DailyRitual/RitualStreakDisplay';
import { RitualNotificationSettings } from '@/components/DailyRitual/RitualNotificationSettings';
import { RitualShareCard } from '@/components/DailyRitual/RitualShareCard';
import { RitualCalendar } from '@/components/DailyRitual/RitualCalendar';
import { RitualLeaderboard } from '@/components/DailyRitual/RitualLeaderboard';
import { AltarBuilder } from '@/components/DailyRitual/AltarBuilder';
import { RitualAudioPlayer } from '@/components/DailyRitual/RitualAudioPlayer';
import { AnnouncementBanner } from '@/components/DailyRitual/AnnouncementBanner';
import { RitualNarration } from '@/components/DailyRitual/RitualNarration';
import { LunarCalendar } from '@/components/DailyRitual/LunarCalendar';
import { CrystalCollection } from '@/components/DailyRitual/CrystalCollection';
import { NervousSystemRescue } from '@/components/DailyRitual/NervousSystemRescue';
import { EnergyCheckIn } from '@/components/DailyRitual/EnergyCheckIn';
import { ShadowPatternInsights } from '@/components/DailyRitual/ShadowPatternInsights';
import { RitualBuilder } from '@/components/DailyRitual/RitualBuilder';
import { LiveRitualGuidance } from '@/components/DailyRitual/LiveRitualGuidance';
import { RitualToolsAffiliate, RitualToolsSection } from '@/components/DailyRitual/RitualToolsAffiliate';
import { ErrorState, LoadingState, OfflineDetector } from '@/components/DailyRitual/ErrorStates';
import { FeatureGate, useFeatureAccess, UpgradePrompt } from '@/components/DailyRitual/FeatureGate';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Flame, Moon, Droplets, Wind, Sparkles, Heart, Eye, Feather,
  Coffee, Leaf, Star, BookOpen, Gem, Music, ChevronDown, Share2,
  Trophy, Gift, Users, Bookmark, Calendar, Headphones, Mic, Diamond,
  AlertOctagon, Thermometer, ShoppingBag, RefreshCw
} from 'lucide-react';

interface SharedContent {
  id: string;
  content_type: string;
  content_text: string;
  is_anonymous: boolean;
  resonance_count: number;
  saves_count: number;
  created_at: string;
  user_resonated: boolean;
  user_saved: boolean;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

export default function DailyRitualPage() {
  const { user } = useAuth();
  const { isPremium, energyTrendDays } = useFeatureAccess();

  const [ritual, setRitual] = useState<DailyRitual | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [journalEntry, setJournalEntry] = useState('');
  const [moodBefore, setMoodBefore] = useState(5);
  const [moodAfter, setMoodAfter] = useState(5);
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [breathCount, setBreathCount] = useState(0);
  const [showJournal, setShowJournal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [newRewards, setNewRewards] = useState<any[]>([]);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [energyCheckInData, setEnergyCheckInData] = useState<{ energy: number; emotional: number; clarity: number } | null>(null);
  
  // Share state
  const [shareOpen, setShareOpen] = useState(false);
  const [shareContent, setShareContent] = useState<{ type: 'shadow_work' | 'recovery' | 'intention' | 'journal'; text: string }>({ type: 'shadow_work', text: '' });
  
  // Community feed state
  const [showCommunity, setShowCommunity] = useState(false);
  const [communityContent, setCommunityContent] = useState<SharedContent[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);

  // New feature modals
  const [showNarration, setShowNarration] = useState(false);
  const [showLunarCalendar, setShowLunarCalendar] = useState(false);
  const [showCrystalCollection, setShowCrystalCollection] = useState(false);



  useEffect(() => {
    loadRitual();
  }, []);



  const loadRitual = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await fetchDailyRitual();
      setRitual(data);
    } catch (error: any) {
      console.error('Error loading ritual:', error);
      setLoadError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryLoad = async () => {
    setRetrying(true);
    await loadRitual();
    setRetrying(false);
  };


  const toggleSection = (section: string) => {
    setCompletedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

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
              toggleSection('breathwork');
              return 0;
            });
          }, ritual.breathwork.exhale * 1000);
        }, ritual.breathwork.hold * 1000);
      }, ritual.breathwork.inhale * 1000);
    };
    cycle();
  }, [ritual]);

  const saveProgress = async () => {
    if (!user || !ritual) return;
    setSaving(true);
    try {
      // Save to history
      await saveRitualCompletion(user.id, ritual.date, completedSections, journalEntry, moodBefore, moodAfter);
      
      // Update streak
      const { data, error } = await supabase.functions.invoke('update-ritual-streak', {
        body: {
          completedSections,
          journalEntry,
          moodBefore,
          moodAfter
        }
      });

      if (error) throw error;

      if (data?.ok) {
        if (data.new_rewards && data.new_rewards.length > 0) {
          setNewRewards(data.new_rewards);
          setShowRewardModal(true);
        }
        toast.success(`Ritual saved! ${data.current_streak} day streak!`);
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Error saving progress');
    } finally {
      setSaving(false);
    }
  };

  const loadCommunityContent = async () => {
    setLoadingCommunity(true);
    try {
      const { data, error } = await supabase.functions.invoke('share-ritual-content', {
        body: { action: 'list', limit: 20 }
      });

      if (error) throw error;
      setCommunityContent(data?.content || []);
    } catch (error) {
      console.error('Error loading community:', error);
    } finally {
      setLoadingCommunity(false);
    }
  };

  const handleResonate = async (contentId: string) => {
    if (!user) {
      toast.error('Please sign in to resonate');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('share-ritual-content', {
        body: { action: 'resonate', contentId }
      });

      if (error) throw error;

      setCommunityContent(prev => prev.map(item => {
        if (item.id === contentId) {
          return {
            ...item,
            user_resonated: data.resonated,
            resonance_count: item.resonance_count + (data.resonated ? 1 : -1)
          };
        }
        return item;
      }));
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleSave = async (contentId: string) => {
    if (!user) {
      toast.error('Please sign in to save');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('share-ritual-content', {
        body: { action: 'save', contentId }
      });

      if (error) throw error;

      setCommunityContent(prev => prev.map(item => {
        if (item.id === contentId) {
          return {
            ...item,
            user_saved: data.saved,
            saves_count: item.saves_count + (data.saved ? 1 : -1)
          };
        }
        return item;
      }));

      toast.success(data.saved ? 'Saved!' : 'Removed from saved');
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const openShare = (type: 'shadow_work' | 'recovery' | 'intention' | 'journal', text: string) => {
    setShareContent({ type, text });
    setShareOpen(true);
  };

  const getElementIcon = (element: string) => {
    switch (element?.toLowerCase()) {
      case 'fire': return <Flame className="w-6 h-6" />;
      case 'water': return <Droplets className="w-6 h-6" />;
      case 'air': return <Wind className="w-6 h-6" />;
      case 'earth': return <Leaf className="w-6 h-6" />;
      default: return <Sparkles className="w-6 h-6" />;
    }
  };

  const getElementGradient = (element: string) => {
    switch (element?.toLowerCase()) {
      case 'fire': return 'from-orange-500/20 to-red-500/20';
      case 'water': return 'from-blue-500/20 to-cyan-500/20';
      case 'air': return 'from-sky-500/20 to-indigo-500/20';
      case 'earth': return 'from-emerald-500/20 to-green-500/20';
      default: return 'from-purple-500/20 to-violet-500/20';
    }
  };

  const contentTypeLabels: Record<string, string> = {
    shadow_work: 'Shadow Work',
    recovery: 'Recovery',
    intention: 'Intention',
    journal: 'Journal'
  };

  if (loading) {
    return (

      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000000' }}>


        <LoadingState 
          type="ritual_load" 
          message="Your ritual is taking a moment to arrive."
        />
      </div>
    );
  }

  // Error state with compassionate messaging
  if (loadError || !ritual) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#000000' }}>

        <ErrorState 
          type="ritual_load" 
          onRetry={handleRetryLoad}
          retrying={retrying}
        />
      </div>
    );
  }


  const completionPercentage = Math.round((completedSections.length / 10) * 100);

  return (
    <div className="min-h-screen" style={{ background: '#000000' }}>


      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8 pb-24">
        {/* Announcements */}
        <AnnouncementBanner />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
            <Moon className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-white/60">{ritual.day_name}, {new Date(ritual.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-violet-300 bg-clip-text text-transparent mb-4">
            Your Daily Misfit Ritual
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">Align, Awaken, Return to Yourself</p>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <RitualNotificationSettings />
            <RitualCalendar />
            <RitualLeaderboard />
            <AltarBuilder />
            <RitualAudioPlayer />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNarration(true)}
              className="text-white/60 hover:text-white"
            >
              <Mic className="w-4 h-4 mr-2" />
              Narration
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLunarCalendar(true)}
              className="text-white/60 hover:text-white"
            >
              <Moon className="w-4 h-4 mr-2" />
              Lunar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCrystalCollection(true)}
              className="text-white/60 hover:text-white"
            >
              <Diamond className="w-4 h-4 mr-2" />
              Crystals
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCommunity(true);
                loadCommunityContent();
              }}
              className="text-white/60 hover:text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              Community
            </Button>
          </div>


          {/* New Feature Buttons Row */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <NervousSystemRescue />
            <EnergyCheckIn 
              moonPhase={ritual.moon.phase} 
              element={ritual.element.name}
              onComplete={setEnergyCheckInData}
            />
            <ShadowPatternInsights />
            <RitualBuilder />
            <RitualToolsAffiliate />
          </div>

        </div>


        {/* Streak Display */}
        <div className="mb-8">
          <RitualStreakDisplay />
        </div>

        {/* Energy Check-In Summary (if completed) */}
        {energyCheckInData && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
            <p className="text-center text-white/70 text-sm">
              Today's check-in: Energy {energyCheckInData.energy}/10 • Emotional {energyCheckInData.emotional}/10 • Clarity {energyCheckInData.clarity}/10
            </p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="flex justify-between text-sm text-white/40 mb-2">
            <span>Ritual Progress</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
          </div>
        </div>

        {/* Dynamic Daily Ritual Intro */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Moon className="w-5 h-5 text-purple-400" />
            Your Daily Ritual
          </h3>
          <p className="text-white/70 text-sm leading-relaxed mb-4">
            Each day, your ritual is curated based on energetic cycles, lunar influence, and nervous system support — 
            not trends, not pressure, and not spiritual bypassing.
          </p>
          <p className="text-white/60 text-sm">
            You'll notice shifts in: <span className="text-purple-300">color</span>, <span className="text-pink-300">scent</span>, 
            <span className="text-indigo-300"> intention</span>, <span className="text-cyan-300">reflection</span>, <span className="text-amber-300">focus</span>
          </p>
          <p className="text-white/50 text-sm mt-3 italic">
            This isn't randomness. It's rhythm.
          </p>
        </div>

        {/* Welcome Message */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10">
          <p className="text-white/80 text-center italic">
            Welcome back, love. Before you step into the world today, take a moment to return to you — 
            your energy, your intuition, your sovereignty.
          </p>
          <p className="text-white/60 text-center text-sm mt-3">
            You're not meant to do everything every day. You're meant to return to yourself — consistently, gently, intentionally.
          </p>
        </div>


        {/* Ritual Sections Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <RitualSection icon={getElementIcon(ritual.element.name)} title="Elemental Ritual" subtitle={`Today's element: ${ritual.element.name}`} gradient={getElementGradient(ritual.element.name)} completed={completedSections.includes('element')} onComplete={() => toggleSection('element')}>
            <p className="mb-4">{ritual.element.description}</p>
          </RitualSection>

          <RitualSection icon={<Flame className="w-6 h-6" />} title="Candle Magic" subtitle={`Color: ${ritual.candle.color}`} gradient="from-amber-500/20 to-orange-500/20" completed={completedSections.includes('candle')} onComplete={() => toggleSection('candle')}>
            <p className="mb-3 text-sm">{ritual.candle.meaning}</p>
            <div className="p-4 rounded-xl bg-black/20 border border-white/5">
              <p className="text-center italic text-white/90">"{ritual.candle.affirmation}"</p>
            </div>
          </RitualSection>

          <RitualSection icon={<Sparkles className="w-6 h-6" />} title="Color Frequency" subtitle={ritual.color_frequency.color} gradient="from-pink-500/20 to-rose-500/20" completed={completedSections.includes('color')} onComplete={() => toggleSection('color')}>
            <div className="flex flex-wrap gap-2">
              {ritual.color_frequency.benefits.map((benefit, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-white/10 text-sm">{benefit}</span>
              ))}
            </div>
          </RitualSection>

          <RitualSection icon={<Coffee className="w-6 h-6" />} title="Tea Ritual" subtitle="Supportive blend" gradient="from-emerald-500/20 to-teal-500/20" completed={completedSections.includes('tea')} onComplete={() => toggleSection('tea')}>
            <p className="font-medium text-white mb-2">{ritual.tea.blend}</p>
            <p className="text-sm">{ritual.tea.benefits}</p>
          </RitualSection>

          <RitualSection icon={<Leaf className="w-6 h-6" />} title="Scent Therapy" subtitle={ritual.essential_oil.name} gradient="from-lime-500/20 to-green-500/20" completed={completedSections.includes('scent')} onComplete={() => toggleSection('scent')}>
            <div className="flex flex-wrap gap-2">
              {ritual.essential_oil.benefits.map((benefit, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-white/10 text-sm">{benefit}</span>
              ))}
            </div>
          </RitualSection>

          <RitualSection icon={<span className="text-2xl">{ritual.moon.emoji}</span>} title="Moon Phase" subtitle={`${ritual.moon.phase} • ${ritual.moon.illumination}%`} gradient="from-slate-500/20 to-zinc-500/20" completed={completedSections.includes('moon')} onComplete={() => toggleSection('moon')}>
            <p className="mb-3">{ritual.moon.description}</p>
            <div className="flex gap-0.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className={`w-2 h-4 rounded-sm ${i < ritual.moon.manifestation_power ? 'bg-purple-400' : 'bg-white/10'}`} />
              ))}
            </div>
          </RitualSection>

          <RitualSection icon={<Star className="w-6 h-6" />} title="Daily Horoscope" subtitle={`${ritual.zodiac.current_season.emoji} ${ritual.zodiac.user_sign}`} gradient="from-indigo-500/20 to-purple-500/20" completed={completedSections.includes('horoscope')} onComplete={() => toggleSection('horoscope')} className="md:col-span-2">
            <p className="text-lg italic mb-4">"{ritual.zodiac.horoscope}"</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span><span className="text-white/40">Focus:</span> {ritual.zodiac.focus_area}</span>
              <span><span className="text-white/40">Lucky #:</span> {ritual.zodiac.lucky_number}</span>
            </div>
          </RitualSection>

          {/* Shadow Work with Share */}
          <RitualSection 
            icon={<Eye className="w-6 h-6" />} 
            title="Shadow Work" 
            subtitle={ritual.shadow_work.category} 
            gradient="from-slate-600/20 to-slate-800/20" 
            completed={completedSections.includes('shadow')} 
            onComplete={() => toggleSection('shadow')}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openShare('shadow_work', ritual.shadow_work.prompt);
                }}
                className="text-white/50 hover:text-white"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            }
          >
            <div className="p-4 rounded-xl bg-black/30 border border-white/5">
              <p className="text-center italic text-white/90">"{ritual.shadow_work.prompt}"</p>
            </div>
          </RitualSection>

          {/* Recovery with Share */}
          <RitualSection 
            icon={<Heart className="w-6 h-6" />} 
            title="Recovery Reflection" 
            subtitle={ritual.recovery.category} 
            gradient="from-rose-500/20 to-pink-500/20" 
            completed={completedSections.includes('recovery')} 
            onComplete={() => toggleSection('recovery')}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openShare('recovery', ritual.recovery.reminder);
                }}
                className="text-white/50 hover:text-white"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            }
          >
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-center text-white/90">{ritual.recovery.reminder}</p>
            </div>
          </RitualSection>

          <RitualSection icon={<Gem className="w-6 h-6" />} title="Altar Inspiration" subtitle={ritual.altar.theme} gradient="from-violet-500/20 to-purple-500/20" completed={completedSections.includes('altar')} onComplete={() => toggleSection('altar')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <Gem className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">{ritual.altar.crystal.name}</p>
                <p className="text-xs text-white/50">{ritual.altar.crystal.chakra} Chakra</p>
              </div>
            </div>
          </RitualSection>

          <RitualSection icon={<Wind className="w-6 h-6" />} title="Breathwork" subtitle="Nervous system reset" gradient="from-cyan-500/20 to-blue-500/20" completed={completedSections.includes('breathwork')}>
            <div className="text-center">
              {breathPhase === 'idle' ? (
                <>
                  <p className="mb-4 text-sm">Inhale {ritual.breathwork.inhale}s → Hold {ritual.breathwork.hold}s → Exhale {ritual.breathwork.exhale}s</p>
                  <Button onClick={startBreathwork} className="bg-gradient-to-r from-cyan-500 to-blue-500">
                    <Music className="w-4 h-4 mr-2" />Begin Breathwork
                  </Button>
                </>
              ) : (
                <div className="py-4">
                  <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-4 transition-transform duration-1000 ${breathPhase === 'inhale' || breathPhase === 'hold' ? 'scale-125' : 'scale-100'}`}>
                    <span className="text-white font-medium capitalize">{breathPhase}</span>
                  </div>
                  <p className="text-sm text-white/60">Breath {breathCount + 1} of 3</p>
                </div>
              )}
              <div className="mt-4 p-3 rounded-lg bg-white/5">
                <p className="text-sm italic">"{ritual.breathwork.affirmation}"</p>
              </div>
            </div>
          </RitualSection>
        </div>

        {/* Guided Intention with Share */}
        <div className="mt-8 p-8 rounded-2xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-violet-500/20 border border-white/10 text-center relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openShare('intention', ritual.intention)}
            className="absolute top-4 right-4 text-white/50 hover:text-white"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Feather className="w-8 h-8 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-4">Today's Guided Intention</h3>
          <p className="text-2xl italic text-white/90 mb-4">"{ritual.intention}"</p>
        </div>

        {/* Journal Section */}
        <div className="mt-8">
          <button onClick={() => setShowJournal(!showJournal)} className="w-full p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <span className="text-white">Journal Your Reflections</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-white/40 transition-transform ${showJournal ? 'rotate-180' : ''}`} />
          </button>

          {showJournal && (
            <div className="p-6 mt-2 rounded-xl bg-white/5 border border-white/10 space-y-6">
              <div>
                <label className="block text-sm text-white/60 mb-2">Mood before ({moodBefore}/10)</label>
                <Slider value={[moodBefore]} onValueChange={([v]) => setMoodBefore(v)} min={1} max={10} step={1} />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Your reflections:</label>
                <Textarea value={journalEntry} onChange={(e) => setJournalEntry(e.target.value)} placeholder="Write freely..." className="min-h-[150px] bg-white/5 border-white/10 text-white placeholder:text-white/30" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Mood after ({moodAfter}/10)</label>
                <Slider value={[moodAfter]} onValueChange={([v]) => setMoodAfter(v)} min={1} max={10} step={1} />
              </div>
              <div className="flex gap-3">
                {journalEntry && (
                  <Button
                    variant="outline"
                    onClick={() => openShare('journal', journalEntry)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                )}
                {user && (
                  <Button onClick={saveProgress} disabled={saving} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500">
                    {saving ? 'Saving...' : 'Save Progress & Update Streak'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Ritual Tools Affiliate Section */}
        <div className="mt-8">
          <RitualToolsSection />
        </div>

        {/* Gentle Reminder Footer */}
        <div className="mt-12 text-center">
          <div className="inline-block p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10 max-w-lg">
            <Heart className="w-8 h-8 text-pink-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-3">A Gentle Reminder</h3>
            <p className="text-white/70 leading-relaxed">
              You are not behind.<br />
              You are not broken.<br />
              You are not doing this wrong.
            </p>
            <p className="text-white/60 text-sm mt-4">
              Healing is not linear. Regulation takes practice. Awareness takes courage.
            </p>
            <p className="text-purple-300 mt-4 font-medium">
              The fact that you're here — checking in, breathing, returning — already matters.
            </p>
          </div>
        </div>
      </div>


      {/* Share Card Modal */}
      <RitualShareCard
        open={shareOpen}
        onOpenChange={setShareOpen}
        contentType={shareContent.type}
        contentText={shareContent.text}
        additionalInfo={{
          element: ritual?.element.name,
          moonPhase: ritual?.moon.phase,
          date: ritual?.date
        }}
      />

      {/* New Reward Modal */}
      <Dialog open={showRewardModal} onOpenChange={setShowRewardModal}>
        <DialogContent className="bg-slate-900 border-white/10 text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              <Gift className="w-6 h-6 text-yellow-400" />
              New Reward Unlocked!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {newRewards.map((reward, i) => (
              <div key={i} className={`p-6 rounded-xl bg-gradient-to-r ${reward.gradient}`}>
                <Trophy className="w-12 h-12 text-white mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white">{reward.name}</h3>
                <p className="text-white/80 mt-2">{reward.description}</p>
              </div>
            ))}
            <Button onClick={() => setShowRewardModal(false)} className="w-full">
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Community Feed Modal */}
      <Dialog open={showCommunity} onOpenChange={setShowCommunity}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Community Ritual Insights
            </DialogTitle>
          </DialogHeader>

          {loadingCommunity ? (
            <div className="py-8 text-center text-white/60">Loading community insights...</div>
          ) : communityContent.length === 0 ? (
            <div className="py-8 text-center text-white/60">
              <p>No shared insights yet.</p>
              <p className="text-sm mt-2">Be the first to share your ritual reflections!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {communityContent.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs">
                        {contentTypeLabels[item.content_type] || item.content_type}
                      </span>
                      {!item.is_anonymous && item.profiles && (
                        <span className="text-sm text-white/60">@{item.profiles.username}</span>
                      )}
                      {item.is_anonymous && (
                        <span className="text-sm text-white/40 italic">Anonymous</span>
                      )}
                    </div>
                    <span className="text-xs text-white/40">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-white/90 italic mb-4">"{item.content_text}"</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleResonate(item.id)}
                      className={`flex items-center gap-1 text-sm ${item.user_resonated ? 'text-pink-400' : 'text-white/50 hover:text-white'}`}
                    >
                      <Heart className={`w-4 h-4 ${item.user_resonated ? 'fill-current' : ''}`} />
                      {item.resonance_count}
                    </button>
                    <button
                      onClick={() => handleSave(item.id)}
                      className={`flex items-center gap-1 text-sm ${item.user_saved ? 'text-yellow-400' : 'text-white/50 hover:text-white'}`}
                    >
                      <Bookmark className={`w-4 h-4 ${item.user_saved ? 'fill-current' : ''}`} />
                      {item.saves_count}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Narration Modal */}
      <Dialog open={showNarration} onOpenChange={setShowNarration}>
        <DialogContent className="max-w-lg bg-slate-900 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-purple-400" />
              Guided Narration
            </DialogTitle>
          </DialogHeader>
          <RitualNarration ritual={ritual} onClose={() => setShowNarration(false)} />
        </DialogContent>
      </Dialog>

      {/* Lunar Calendar Modal */}
      <Dialog open={showLunarCalendar} onOpenChange={setShowLunarCalendar}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-slate-900 border-indigo-500/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-400" />
              Lunar Calendar & Rituals
            </DialogTitle>
          </DialogHeader>
          <LunarCalendar />
        </DialogContent>
      </Dialog>

      {/* Crystal Collection Modal */}
      <Dialog open={showCrystalCollection} onOpenChange={setShowCrystalCollection}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-slate-900 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Diamond className="w-5 h-5 text-pink-400" />
              Crystal Collection
            </DialogTitle>
          </DialogHeader>
          <CrystalCollection 
            currentMoonPhase={ritual.moon.phase.toLowerCase().replace(' ', '_')} 
            currentElement={ritual.element.name.toLowerCase()} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
