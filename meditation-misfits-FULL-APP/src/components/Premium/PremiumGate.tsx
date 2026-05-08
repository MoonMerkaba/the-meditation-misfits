import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Lock, Sparkles, Heart, Eye, Palette, Shield } from 'lucide-react';
import { SubscriptionModal } from './SubscriptionModal';

interface PremiumGateProps {
  feature: 'ritual_builder' | 'shadow_insights' | 'energy_trends' | 'custom_rituals' | 'advanced_analytics' | 'general';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showPreview?: boolean;
}

const featureCopy = {
  ritual_builder: {
    title: 'Save Your Sacred Rituals',
    icon: Palette,
    description: 'You can explore and experiment freely.',
    detail: 'Saving, revisiting, and evolving your rituals over time is part of the expanded experience.',
    closing: 'Both paths are valid. Choose what feels supportive, not pressured.'
  },
  shadow_insights: {
    title: 'Deeper Pattern Insights',
    icon: Eye,
    description: 'Patterns become clearer with time and reflection.',
    detail: 'Expanded insights help reveal themes gently — without labels, judgment, or diagnosis.',
    closing: 'This space is about understanding, not fixing.'
  },
  energy_trends: {
    title: 'Energy Trend Analysis',
    icon: Sparkles,
    description: 'Track your energy patterns over time.',
    detail: 'See how your energy, emotions, and clarity shift with moon phases and seasons.',
    closing: 'Awareness deepens with continuity.'
  },
  custom_rituals: {
    title: 'Custom Ritual Library',
    icon: Heart,
    description: 'Build a personal library of sacred practices.',
    detail: 'Save unlimited rituals and access them whenever you need support.',
    closing: 'Your rituals, always available.'
  },
  advanced_analytics: {
    title: 'Advanced Insights',
    icon: Shield,
    description: 'Deeper understanding of your journey.',
    detail: 'Access detailed analytics and personalized recommendations.',
    closing: 'Knowledge is power when held with compassion.'
  },
  general: {
    title: 'This Feature Unlocks Deeper Support',
    icon: Lock,
    description: "You're already doing meaningful work here.",
    detail: 'This feature offers deeper insight, personalization, and continuity — for those who want to explore further.',
    closing: "Nothing is taken away. More becomes available when you're ready."
  }
};

export function PremiumGate({ feature, children, fallback, showPreview = false }: PremiumGateProps) {
  const { user } = useAuth();
  const { isPremium, isLoading } = useSubscription();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showGateModal, setShowGateModal] = useState(false);

  const copy = featureCopy[feature] || featureCopy.general;
  const Icon = copy.icon;

  // If loading, show children (optimistic)
  if (isLoading) {
    return <>{children}</>;
  }

  // If premium, show children
  if (isPremium) {
    return <>{children}</>;
  }

  // If showing preview, show children with overlay
  if (showPreview) {
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none blur-sm">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-xl">
          <Button
            onClick={() => setShowGateModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Lock className="w-4 h-4 mr-2" />
            Unlock Feature
          </Button>
        </div>

        <Dialog open={showGateModal} onOpenChange={setShowGateModal}>
          <DialogContent className="max-w-md bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-purple-500/20">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Icon className="w-5 h-5 text-purple-400" />
                {copy.title}
              </DialogTitle>
            </DialogHeader>
            <PremiumGateContent 
              copy={copy} 
              onUnlock={() => {
                setShowGateModal(false);
                setShowSubscriptionModal(true);
              }} 
            />
          </DialogContent>
        </Dialog>

        <SubscriptionModal open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal} />
      </div>
    );
  }

  // Show fallback or gate
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <>
      <div 
        onClick={() => setShowGateModal(true)}
        className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 cursor-pointer hover:border-purple-500/40 transition-all"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-purple-500/20">
            <Lock className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">{copy.title}</h3>
        </div>
        <p className="text-white/70 text-sm mb-4">{copy.description}</p>
        <Button
          variant="outline"
          className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Explore Expanded Experience
        </Button>
      </div>

      <Dialog open={showGateModal} onOpenChange={setShowGateModal}>
        <DialogContent className="max-w-md bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Icon className="w-5 h-5 text-purple-400" />
              {copy.title}
            </DialogTitle>
          </DialogHeader>
          <PremiumGateContent 
            copy={copy} 
            onUnlock={() => {
              setShowGateModal(false);
              setShowSubscriptionModal(true);
            }} 
          />
        </DialogContent>
      </Dialog>

      <SubscriptionModal open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal} />
    </>
  );
}

function PremiumGateContent({ copy, onUnlock }: { copy: typeof featureCopy.general; onUnlock: () => void }) {
  return (
    <div className="space-y-6">
      {/* Main Copy */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <p className="text-white/80 leading-relaxed">
          {copy.description}
        </p>
        <p className="text-white/70 mt-3 leading-relaxed">
          {copy.detail}
        </p>
      </div>

      {/* Closing Message */}
      <div className="text-center">
        <p className="text-white/60 text-sm italic">
          {copy.closing}
        </p>
        <p className="text-white/50 text-sm mt-2">
          There's no rush.<br />
          Your growth isn't on a timer.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={onUnlock}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Unlock Deeper Support
        </Button>
        <Button
          variant="ghost"
          className="w-full text-white/50 hover:text-white/70"
          onClick={() => {}}
        >
          Continue With Free Experience
        </Button>
      </div>

      {/* Trust Note */}
      <p className="text-center text-white/40 text-xs">
        Nothing is taken away. More becomes available when you're ready.
      </p>
    </div>
  );
}

// Inline Premium Gate for buttons/actions
export function PremiumButton({ 
  feature, 
  children, 
  onClick,
  className = '',
  ...props 
}: { 
  feature: keyof typeof featureCopy;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  [key: string]: any;
}) {
  const { isPremium } = useSubscription();
  const [showModal, setShowModal] = useState(false);

  if (isPremium) {
    return (
      <Button onClick={onClick} className={className} {...props}>
        {children}
      </Button>
    );
  }

  const copy = featureCopy[feature] || featureCopy.general;
  const Icon = copy.icon;

  return (
    <>
      <Button 
        onClick={() => setShowModal(true)} 
        className={className} 
        {...props}
      >
        <Lock className="w-4 h-4 mr-2" />
        {children}
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Icon className="w-5 h-5 text-purple-400" />
              {copy.title}
            </DialogTitle>
          </DialogHeader>
          <PremiumGateContent 
            copy={copy} 
            onUnlock={() => setShowModal(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
