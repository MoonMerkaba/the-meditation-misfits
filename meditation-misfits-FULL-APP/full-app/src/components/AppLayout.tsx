import React, { useState, useEffect } from 'react';
import CosmicBackground from './CosmicBackground';
import HeroSection from './HeroSection';
import Navigation from './Navigation';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import EmailModal from './EmailModal';
import DailyResonanceCard from './DailyResonanceCard';
import PlayerGrid from './SensoryPlayer/PlayerGrid';

import { EmailVerificationBanner } from './EmailVerificationBanner';
import { NotificationCenter } from './Notifications/NotificationCenter';
import { AdminAccessButton } from './Admin/AdminAccessButton';
import { ProfileCompletionModal } from './Profile/ProfileCompletionModal';

import WelcomeHero from './Home/WelcomeHero';
import PrimaryActions from './Home/PrimaryActions';
import BelongingSection from './Home/BelongingSection';
import WhatLivesHere from '../pages/WhatLivesHere';

import PlayerModal from './SensoryPlayer/PlayerModal';
import JournalModal from './JournalModal';
import Pathways from './MisfitPathways/Pathways';
import Achievements from './Achievements/Achievements';
import FreqynOracle from './FreqynOracle/FreqynOracle';
import FreqynResonique from './FreqynResonique';
import { OracleDashboard } from './OracleDashboard/OracleDashboard';
import { SubscriptionModal } from './Premium/SubscriptionModal';
import CommunityHub from './CommunityHub';
import { MessagingInterface } from './Messaging/MessagingInterface';
import { JourneyWhy } from './JourneyWhy';
import { ToneFAQ } from './ToneFAQ';
import EnhancedAnalytics from './Analytics/EnhancedAnalytics';
import Leaderboard from './Leaderboard/Leaderboard';
import AIRecommendations from './AIPersonalization/AIRecommendations';
import NotificationSystem from './NotificationSystem';
import { DailyFrequencyDrop } from './DailyFrequencyDrop/DailyFrequencyDrop';
import { FollowingFeed } from './Feed/FollowingFeed';
import { UserProfilePage } from './Profile/UserProfilePage';
import { PlaylistPage } from './Favorites/PlaylistPage';
import { StreakTracker } from './Streak/StreakTracker';
import { NotificationSettings } from './Notifications/NotificationSettings';
import { MixerCanvas } from './Mixer/MixerCanvas';
import { BreathPanel } from './BreathVisualizer/BreathPanel';
import { ManifestationTracker } from './Manifestation/ManifestationTracker';
import { MeditationLibrary } from './MeditationLibrary/MeditationLibrary';
import { MyJournalPage } from './MyJournal/MyJournalPage';
import { RitualWidget } from './DailyRitual/RitualWidget';

import { TodaysFlowExperience } from './TodaysFlow/TodaysFlowExperience';
import { ShadowSafeExperience } from './ShadowSafe/ShadowSafeExperience';
import { useShadowSafe } from '@/contexts/ShadowSafeContext';

import FreebiesPage from '../pages/FreebiesPage';

import { Session } from '../types/session';
import { fetchSessions } from '../lib/sessions';
import { startDailyJourney } from '../lib/journey';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/lib/supabase';

import { 
  Moon, Sparkles, BookOpen, Eye, Waves, Wind, Target, ArrowLeft, Lock
} from 'lucide-react';

type AppView = 'home' | 'profile' | 'community' | 'messages' | 'analytics' | 'leaderboard' | 'freqynResonique' | 'oracleDashboard' | 'communityReflections' | 'feed' | 'playlist' | 'notifications' | 'mixer' | 'breathwork' | 'manifestation' | 'meditationLibrary' | 'journal' | 'contact' | 'help' | 'vault' | 'whatLivesHere' | 'todayFlow' | 'differentToday' | 'shadowSafe' | 'freebies';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [journalSessionKey, setJournalSessionKey] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isJourneyActive, setIsJourneyActive] = useState(false);
  const [messageReceiverId, setMessageReceiverId] = useState<string | undefined>();
  const [messageReceiverName, setMessageReceiverName] = useState<string | undefined>();
  const [viewUserId, setViewUserId] = useState<string | undefined>();
  const { user, supabaseUser } = useAuth();
  const { isShadowSafeMode } = useShadowSafe();

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!user || !supabaseUser) return;
      const provider = supabaseUser.app_metadata?.provider;
      const validProviders = ['google', 'facebook', 'github'];
      if (!provider || typeof provider !== 'string' || !validProviders.includes(provider)) return;
      const hasShownModal = sessionStorage.getItem(`profile_completion_shown_${user.id}`);
      if (hasShownModal) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profile) {
        setCurrentProfile(profile);
        const isIncomplete = !profile.bio || !profile.location;
        if (isIncomplete) {
          setShowProfileCompletion(true);
          sessionStorage.setItem(`profile_completion_shown_${user.id}`, 'true');
        }
      }
    };
    checkProfileCompletion();
  }, [user, supabaseUser]);

  useEffect(() => {
    fetchSessions().then(setSessions);
    const handleOpenMessages = (e: any) => {
      setMessageReceiverId(e.detail.userId);
      setMessageReceiverName(e.detail.userName);
      setCurrentView('messages');
    };
    window.addEventListener('openMessages', handleOpenMessages);
    return () => window.removeEventListener('openMessages', handleOpenMessages);
  }, []);

  const handleNavigate = (view: string) => {
    if ((view === 'profile' || view === 'messages' || view === 'feed') && !user) {
      setShowAuthModal(true);
      return;
    }
    setCurrentView(view as AppView);
  };

  const handleSelectSession = (session: Session) => {
    setSelectedSession(session);
    setShowPlayerModal(true);
  };

  const handleOpenJournal = (sessionKey: string) => {
    setJournalSessionKey(sessionKey);
    setShowJournalModal(true);
  };

  const playSession = (session: Session): Promise<void> => {
    return new Promise((resolve) => {
      setSelectedSession(session);
      setShowPlayerModal(true);
      const checkAudio = setInterval(() => {
        const audio = document.querySelector('audio') as HTMLAudioElement;
        if (audio) {
          clearInterval(checkAudio);
          const onEnd = () => { audio.removeEventListener('ended', onEnd); resolve(); };
          audio.addEventListener('ended', onEnd);
        }
      }, 100);
      setTimeout(() => resolve(), 30000);
    });
  };

  const completeLevel = (id: string) => {
    const prog = JSON.parse(localStorage.getItem('mm.levels') || '{}');
    if (!prog[id]) { prog[id] = true; localStorage.setItem('mm.levels', JSON.stringify(prog)); }
  };

  const incrementStat = (path: string, by = 1) => {
    const stats = JSON.parse(localStorage.getItem('mm.stats') || '{}');
    const segs = path.split('.');
    let cur = stats;
    for (let i = 0; i < segs.length - 1; i++) { cur = cur[segs[i]] ?? (cur[segs[i]] = {}); }
    cur[segs[segs.length - 1]] = (cur[segs[segs.length - 1]] ?? 0) + by;
    localStorage.setItem('mm.stats', JSON.stringify(stats));
  };

  const updateStreak = () => {
    const s = JSON.parse(localStorage.getItem('mm.stats') || '{}');
    const today = new Date().toISOString().slice(0, 10);
    const y = new Date(); y.setDate(y.getDate() - 1);
    const yStr = y.toISOString().slice(0, 10);
    s.streak = s.lastPlayDate === yStr ? (s.streak || 0) + 1 : 1;
    s.lastPlayDate = today;
    localStorage.setItem('mm.stats', JSON.stringify(s));
  };

  const [journeyReason, setJourneyReason] = useState<string>('');

  const handleStartJourney = async () => {
    if (sessions.length === 0 || isJourneyActive) return;
    setIsJourneyActive(true);
    try {
      const reason = await startDailyJourney(sessions, { playSession, openJournal: handleOpenJournal, completeLevel, incrementStat, updateStreak });
      setJourneyReason(reason || '');
    } catch (error) { console.error('Journey error:', error); }
    finally { setIsJourneyActive(false); }
  };

  const BackButton = ({ onClick, label = "Back to Home" }: { onClick: () => void; label?: string }) => (
    <button 
      onClick={onClick} 
      className="flex items-center gap-2 px-4 py-2 transition-colors duration-200"
      style={{ color: '#FF00BF', border: '1px solid rgba(255, 0, 191, 0.3)', background: 'rgba(255, 0, 191, 0.05)' }}
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <>
      <CosmicBackground />
      
      <Header 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        onShowAuth={() => setShowAuthModal(true)} 
      />
      <div className="fixed top-[220px] md:top-[280px] right-4 z-50 flex items-center gap-2">
        {user && <AdminAccessButton />}
        {user && <NotificationCenter />}
      </div>

      {currentView === 'whatLivesHere' ? (
        <div className="relative z-10">
          <WhatLivesHere onBack={() => setCurrentView('home')} />
        </div>
      ) : currentView === 'freebies' ? (
        <div className="relative z-10">
          <FreebiesPage onBack={() => setCurrentView('home')} />
        </div>
      ) : currentView === 'oracleDashboard' ? (
        <div className="relative z-10">
          <OracleDashboard onBack={() => setCurrentView('home')} />
        </div>
      ) : currentView === 'freqynResonique' ? (
        <div className="relative z-10">
          <div className="fixed top-24 left-4 z-50">
            <BackButton onClick={() => setCurrentView('home')} />
          </div>
          <FreqynResonique />
        </div>
      ) : currentView === 'analytics' ? (
        <EnhancedAnalytics onClose={() => setCurrentView('home')} />
      ) : currentView === 'leaderboard' ? (
        <Leaderboard onClose={() => setCurrentView('home')} />
      ) : currentView === 'messages' ? (
        <MessagingInterface onBack={() => setCurrentView('home')} />
      ) : currentView === 'community' ? (
        <CommunityHub />
      ) : currentView === 'feed' ? (
        <div className="relative z-10">
          <FollowingFeed 
            onBack={() => setCurrentView('home')} 
            onProfileClick={(userId) => { setViewUserId(userId); setCurrentView('profile'); }}
          />
        </div>
      ) : currentView === 'profile' && viewUserId ? (
        <div className="relative z-10">
          <UserProfilePage 
            userId={viewUserId} 
            onBack={() => { setViewUserId(undefined); setCurrentView('feed'); }}
          />
        </div>
      ) : currentView === 'playlist' ? (
        <div className="relative z-10"><PlaylistPage /></div>
      ) : currentView === 'notifications' ? (
        <div className="relative z-10 pt-20 pb-12"><NotificationSettings /></div>
      ) : currentView === 'mixer' ? (
        <div className="relative z-10 pt-20 pb-12 max-w-4xl mx-auto px-4">
          <div className="mb-4"><BackButton onClick={() => setCurrentView('home')} /></div>
          <MixerCanvas />
        </div>
      ) : currentView === 'breathwork' ? (
        <div className="relative z-10 pt-20 pb-12 max-w-4xl mx-auto px-4">
          <div className="mb-4"><BackButton onClick={() => setCurrentView('home')} /></div>
          <BreathPanel />
        </div>
      ) : currentView === 'manifestation' ? (
        <div className="relative z-10"><ManifestationTracker /></div>
      ) : currentView === 'meditationLibrary' ? (
        <div className="relative z-10">
          <div className="fixed top-24 left-4 z-50">
            <BackButton onClick={() => setCurrentView('home')} />
          </div>
          <MeditationLibrary />
        </div>
      ) : currentView === 'journal' ? (
        <div className="relative z-10"><MyJournalPage /></div>
      ) : currentView === 'contact' ? (
        <div className="relative z-10 pt-20 pb-12 max-w-4xl mx-auto px-4">
          <div className="mb-4"><BackButton onClick={() => setCurrentView('home')} /></div>
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4" style={{ color: '#FFFFFF' }}>Contact Us</h1>
            <p style={{ color: '#A2A1A3' }}>Visit our <a href="/contact" style={{ color: '#FF00BF' }}>contact page</a> for support.</p>
          </div>
        </div>
      ) : currentView === 'help' ? (
        <div className="relative z-10 pt-20 pb-12 max-w-4xl mx-auto px-4">
          <div className="mb-4"><BackButton onClick={() => setCurrentView('home')} /></div>
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4" style={{ color: '#FFFFFF' }}>Help Center</h1>
            <p style={{ color: '#A2A1A3' }}>Visit our <a href="/help" style={{ color: '#FF00BF' }}>help center</a> for guides and FAQs.</p>
          </div>
        </div>
      ) : currentView === 'vault' ? (
        <div className="relative z-10 pt-20 pb-12 max-w-4xl mx-auto px-4">
          <div className="mb-4"><BackButton onClick={() => setCurrentView('home')} /></div>
          <div className="text-center py-12">
            <Lock className="w-12 h-12 mx-auto mb-4" style={{ color: '#FF00BF' }} />
            <h1 className="text-3xl font-bold mb-4" style={{ color: '#FFFFFF' }}>The Vault</h1>
            <p className="mb-6" style={{ color: '#A2A1A3' }}>Access restricted content and experimental protocols.</p>
            <a 
              href="/vault" 
              className="inline-block px-6 py-3 font-medium transition-colors duration-200"
              style={{ background: '#FF00BF', color: '#FFFFFF' }}
            >
              Enter the Vault
            </a>
            <div className="mt-6">
              <a 
                href="/forbidden-program" 
                className="inline-block px-6 py-3 font-medium transition-colors duration-200"
                style={{ border: '1px solid #FF00BF', color: '#FF00BF', background: 'transparent' }}
              >
                Forbidden Frequency Program
              </a>
            </div>
          </div>
        </div>
      ) : currentView === 'todayFlow' ? (
        <TodaysFlowExperience 
          onBack={() => setCurrentView('home')}
          onComplete={() => setCurrentView('home')}
        />
      ) : currentView === 'differentToday' ? (
        <div className="relative z-10 pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="mb-6"><BackButton onClick={() => setCurrentView('home')} /></div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4" style={{ color: '#FFFFFF' }}>Choose Your Path</h1>
              <p style={{ color: '#6683A0' }}>Based on your energy, not a schedule.</p>
            </div>
            <Pathways />
            <div className="mt-8"><AIRecommendations /></div>
            <div className="mt-8"><PlayerGrid onSelectSession={handleSelectSession} /></div>
          </div>
        </div>
      ) : currentView === 'shadowSafe' ? (
        <ShadowSafeExperience onBack={() => setCurrentView('home')} />
      ) : (
        /* HOME SCREEN */
        <div className="relative z-10 pt-[220px] md:pt-[280px] pb-12" style={{ background: '#000000' }}>
          <EmailVerificationBanner />
          <WelcomeHero userName={user?.name} />
          <PrimaryActions 
            onEnterFlow={() => setCurrentView('todayFlow')}
            onDifferentToday={() => setCurrentView('differentToday')}
            onShadowSafe={() => setCurrentView('shadowSafe')}
          />
          <BelongingSection 
            onWhyExists={() => setCurrentView('whatLivesHere')}
            onExploreAll={() => setCurrentView('whatLivesHere')}
          />

          {/* Quick Access Section */}
          <div className="max-w-4xl mx-auto px-4 mt-16">
            <div className="text-center mb-8">
              <p className="text-sm" style={{ color: '#444343' }}>Quick access to your sanctuary</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Daily Ritual', icon: Moon, href: '/daily-ritual' },
                { label: 'Meditations', icon: Sparkles, view: 'meditationLibrary' },
                { label: 'Journal', icon: BookOpen, view: 'journal' },
                { label: 'Oracle', icon: Eye, view: 'oracleDashboard' },
              ].map((item, i) => {
                const Icon = item.icon;
                const content = (
                  <div className="p-4 text-center transition-all duration-200" style={{
                    background: 'rgba(68, 67, 67, 0.2)',
                    border: '1px solid rgba(255, 0, 191, 0.15)',
                  }}>
                    <Icon className="w-6 h-6 mx-auto mb-2" style={{ color: '#FF00BF' }} />
                    <div className="text-sm font-medium" style={{ color: '#A2A1A3' }}>{item.label}</div>
                  </div>
                );

                if (item.href) {
                  return <a key={i} href={item.href} className="block hover:opacity-80 transition-opacity">{content}</a>;
                }
                return (
                  <button key={i} onClick={() => item.view && setCurrentView(item.view as AppView)} className="block w-full hover:opacity-80 transition-opacity">
                    {content}
                  </button>
                );
              })}
            </div>

            {/* More Tools */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { label: 'Frequency Mixer', icon: Waves, view: 'mixer' },
                { label: 'Breathwork', icon: Wind, view: 'breathwork' },
                { label: 'Manifestation', icon: Target, href: '/manifestation' },
              ].map((item, i) => {
                const Icon = item.icon;
                const content = (
                  <div className="p-3 text-center transition-all duration-200" style={{
                    background: 'rgba(68, 67, 67, 0.1)',
                    border: '1px solid rgba(102, 131, 160, 0.15)',
                  }}>
                    <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: '#6683A0' }} />
                    <div className="text-xs" style={{ color: '#A2A1A3' }}>{item.label}</div>
                  </div>
                );

                if (item.href) {
                  return <a key={i} href={item.href} className="block hover:opacity-80 transition-opacity">{content}</a>;
                }
                return (
                  <button key={i} onClick={() => item.view && setCurrentView(item.view as AppView)} className="block w-full hover:opacity-80 transition-opacity">
                    {content}
                  </button>
                );
              })}
            </div>

            {/* Forbidden Program Link */}
            <div className="mt-12">
              <a 
                href="/forbidden-program"
                className="block w-full p-6 text-center transition-all duration-200 hover:opacity-90"
                style={{
                  background: '#000000',
                  border: '1px solid rgba(255, 0, 191, 0.2)',
                }}
              >
                <div className="inline-block mb-3 px-4 py-1" style={{ border: '1px solid #FF00BF' }}>
                  <span className="text-xs font-mono tracking-widest" style={{ color: '#FF00BF' }}>DECLASSIFIED</span>
                </div>
                <h3 className="text-lg font-bold mb-1" style={{ color: '#FFFFFF' }}>The Forbidden Frequency Program</h3>
                <p className="text-sm" style={{ color: '#444343' }}>Experimental audio protocols. Proceed with intention.</p>
              </a>
            </div>
          </div>

          <Footer onNavigate={handleNavigate} />
        </div>
      )}

      <Navigation currentView={currentView} onNavigate={handleNavigate} onShowAuth={() => setShowAuthModal(true)} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <PlayerModal
        session={selectedSession}
        isOpen={showPlayerModal}
        onClose={() => setShowPlayerModal(false)}
        onOpenJournal={handleOpenJournal}
      />
      <EmailModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} />
      <JournalModal
        sessionKey={journalSessionKey}
        isOpen={showJournalModal}
        onClose={() => setShowJournalModal(false)}
      />
      <FreqynOracle />
      
      {currentProfile && (
        <ProfileCompletionModal
          isOpen={showProfileCompletion}
          onComplete={() => setShowProfileCompletion(false)}
          currentProfile={currentProfile}
        />
      )}
    </>
  );
};

const AppLayout: React.FC = () => <AppContent />;
export default AppLayout;
