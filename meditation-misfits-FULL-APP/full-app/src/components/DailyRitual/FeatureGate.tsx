import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Lock, Sparkles, Heart, Eye, Palette, Shield, Clock, Share2, Headphones, TrendingUp } from 'lucide-react';
import { SubscriptionModal } from '@/components/Premium/SubscriptionModal';

// V1 (Free) vs V2 (Premium) Feature Definitions
export const FEATURE_TIERS = {
  // V1 (Free) Features
  v1: {
    ritual_saves: 3,
    energy_trend_days: 7,
    shadow_analysis: 'basic',
    ritual_sharing: false,
    priority_support: false,
    custom_rituals: 3
  },
  // V2 (Premium) Features
  v2: {
    ritual_saves: 'unlimited',
    energy_trend_days: 90,
    shadow_analysis: 'advanced',
    ritual_sharing: true,
    priority_support: true,
    custom_rituals: 'unlimited'
  }
};

// Feature-specific copy and configuration
const featureConfig = {
  unlimited_ritual_saves: {
    title: 'Unlimited Ritual Saves',
    icon: Palette,
    v1Copy: "You've created 3 rituals — the foundation of a beautiful practice.",
    v2Benefit: 'Save unlimited rituals to build your personal library.',
    description: 'Your rituals deserve a permanent home.'
  },
  advanced_shadow_analysis: {
    title: 'Advanced Pattern Analysis',
    icon: Eye,
    v1Copy: 'You have access to basic pattern recognition.',
    v2Benefit: 'AI-powered deep analysis reveals hidden themes and cycles.',
    description: 'Patterns become clearer with advanced insight.'
  },
  extended_energy_trends: {
    title: 'Extended Energy History',
    icon: TrendingUp,
    v1Copy: 'You can see 7 days of energy trends.',
    v2Benefit: 'Access 90 days of energy history to see seasonal patterns.',
    description: 'Longer timelines reveal deeper rhythms.'
  },
  custom_ritual_sharing: {
    title: 'Share Your Rituals',
    icon: Share2,
    v1Copy: 'Your rituals are private to you.',
    v2Benefit: 'Share rituals with the community and inspire others.',
    description: 'Your practice can light the way for others.'
  },
  priority_support: {
    title: 'Priority Support',
    icon: Headphones,
    v1Copy: 'You have access to community support.',
    v2Benefit: 'Direct access to our support team with faster response times.',
    description: "We're here when you need us."
  }
};

type FeatureKey = keyof typeof featureConfig;

interface FeatureGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  currentCount?: number;
  maxFree?: number;
  showPreview?: boolean;
  onUpgrade?: () => void;
}

export function FeatureGate({ 
  feature, 
  children, 
  currentCount, 
  maxFree,
  showPreview = false,
  onUpgrade 
}: FeatureGateProps) {
  const { user } = useAuth();
  const { isPremium, isLoading } = useSubscription();
  const [showModal, setShowModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const config = featureConfig[feature];
  const Icon = config.icon;

  // Loading state - show children optimistically
  if (isLoading) {
    return <>{children}</>;
  }

  // Premium users get full access
  if (isPremium) {
    return <>{children}</>;
  }

  // Check if user has hit their free limit
  const hasHitLimit = currentCount !== undefined && maxFree !== undefined && currentCount >= maxFree;

  // If not at limit, show children
  if (!hasHitLimit && !showPreview) {
    return <>{children}</>;
  }

  // Show the gate
  return (
    <>
      {showPreview ? (
        <div className="relative">
          <div className="opacity-40 pointer-events-none blur-[2px]">
            {children}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-purple-500/90 to-pink-500/90 hover:from-purple-600 hover:to-pink-600 shadow-lg"
            >
              <Lock className="w-4 h-4 mr-2" />
              Unlock Feature
            </Button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => setShowModal(true)}
          className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 cursor-pointer hover:border-purple-500/40 transition-all group"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
              <Icon className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">{config.title}</h3>
          </div>
          
          {/* V1 Status */}
          <div className="p-3 rounded-lg bg-white/5 mb-3">
            <p className="text-white/70 text-sm">{config.v1Copy}</p>
            {currentCount !== undefined && maxFree !== undefined && (
              <p className="text-white/50 text-xs mt-1">
                {currentCount} of {maxFree} free uses
              </p>
            )}
          </div>

          {/* Foundation Message */}
          <p className="text-white/60 text-sm italic mb-4">
            You're experiencing the foundation.<br />
            More depth awaits when you're ready.
          </p>

          <Button
            variant="outline"
            className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Explore Expanded Experience
          </Button>
        </div>
      )}

      {/* Feature Gate Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Icon className="w-5 h-5 text-purple-400" />
              {config.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Status */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-white/50 mb-1">Your current experience:</p>
              <p className="text-white/80">{config.v1Copy}</p>
              {currentCount !== undefined && maxFree !== undefined && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${Math.min((currentCount / maxFree) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/50">{currentCount}/{maxFree}</span>
                </div>
              )}
            </div>

            {/* Foundation Message */}
            <div className="text-center py-4 border-y border-white/10">
              <p className="text-white/70 leading-relaxed">
                You're experiencing the foundation.
              </p>
              <p className="text-purple-300 mt-2 font-medium">
                More depth awaits when you're ready.
              </p>
            </div>

            {/* V2 Benefits */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <p className="text-sm text-purple-300 mb-2">With expanded access:</p>
              <p className="text-white/90">{config.v2Benefit}</p>
            </div>

            {/* V2 Features List */}
            <div className="space-y-2">
              <p className="text-sm text-white/50">Expanded experience includes:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-white/70">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Unlimited ritual saves
                </li>
                <li className="flex items-center gap-2 text-white/70">
                  <Eye className="w-4 h-4 text-purple-400" />
                  Advanced AI shadow analysis
                </li>
                <li className="flex items-center gap-2 text-white/70">
                  <Clock className="w-4 h-4 text-purple-400" />
                  90-day energy trend history
                </li>
                <li className="flex items-center gap-2 text-white/70">
                  <Share2 className="w-4 h-4 text-purple-400" />
                  Share rituals with community
                </li>
                <li className="flex items-center gap-2 text-white/70">
                  <Headphones className="w-4 h-4 text-purple-400" />
                  Priority support
                </li>
              </ul>
            </div>

            {/* Closing Message */}
            <div className="text-center">
              <p className="text-white/50 text-sm">
                There's no rush.<br />
                Your growth isn't on a timer.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setShowModal(false);
                  setShowSubscriptionModal(true);
                  onUpgrade?.();
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Unlock Deeper Support
              </Button>
              <Button
                variant="ghost"
                className="w-full text-white/50 hover:text-white/70"
                onClick={() => setShowModal(false)}
              >
                Continue With Foundation
              </Button>
            </div>

            {/* Trust Note */}
            <p className="text-center text-white/40 text-xs">
              Nothing is taken away. More becomes available when you're ready.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <SubscriptionModal open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal} />
    </>
  );
}

// Hook to check feature access
export function useFeatureAccess() {
  const { isPremium } = useSubscription();

  return {
    isPremium,
    tier: isPremium ? 'v2' : 'v1',
    limits: isPremium ? FEATURE_TIERS.v2 : FEATURE_TIERS.v1,
    canSaveRitual: (currentCount: number) => isPremium || currentCount < FEATURE_TIERS.v1.ritual_saves,
    canViewExtendedTrends: isPremium,
    canUseAdvancedAnalysis: isPremium,
    canShareRituals: isPremium,
    hasPrioritySupport: isPremium,
    energyTrendDays: isPremium ? FEATURE_TIERS.v2.energy_trend_days : FEATURE_TIERS.v1.energy_trend_days
  };
}

// Inline upgrade prompt component
export function UpgradePrompt({ 
  feature,
  compact = false 
}: { 
  feature: FeatureKey;
  compact?: boolean;
}) {
  const { isPremium } = useSubscription();
  const [showModal, setShowModal] = useState(false);

  if (isPremium) return null;

  const config = featureConfig[feature];

  if (compact) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="text-xs text-purple-400 hover:text-purple-300 underline underline-offset-2"
        >
          Unlock more depth
        </button>
        <SubscriptionModal open={showModal} onOpenChange={setShowModal} />
      </>
    );
  }

  return (
    <>
      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
        <p className="text-white/70 text-sm mb-2">
          You're experiencing the foundation.
        </p>
        <p className="text-white/60 text-xs mb-3">
          {config.v2Benefit}
        </p>
        <Button
          size="sm"
          onClick={() => setShowModal(true)}
          className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Explore More
        </Button>
      </div>
      <SubscriptionModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
}
