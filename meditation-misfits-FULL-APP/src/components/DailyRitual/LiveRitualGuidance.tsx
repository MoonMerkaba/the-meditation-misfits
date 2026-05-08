import React, { useState, useEffect } from 'react';
import { DailyRitual } from '@/lib/dailyRitual';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Sparkles, RefreshCw, Clock, Loader2 } from 'lucide-react';

interface LiveRitualGuidanceProps {
  ritual: DailyRitual | null;
  loading: boolean;
  onRefresh?: () => void;
}

export function LiveRitualGuidance({ ritual, loading, onRefresh }: LiveRitualGuidanceProps) {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (ritual) {
      setLastUpdated(new Date());
    }
  }, [ritual]);

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          <p className="text-white/60">Generating today's ritual guidance...</p>
        </div>
        <p className="text-center text-white/40 text-sm italic mt-4">
          If today's ritual hasn't loaded yet, pause anyway. Presence still counts.
        </p>
      </div>
    );
  }

  if (!ritual) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-500/10 to-slate-600/10 border border-white/10">
        <div className="text-center py-6">
          <Moon className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Ritual Guidance Unavailable</h3>
          <p className="text-white/60 text-sm mb-4">
            We couldn't load today's guidance, but that doesn't mean you can't practice.
          </p>
          <p className="text-white/50 text-sm italic mb-4">
            If today's ritual hasn't loaded yet, pause anyway.<br />
            Presence still counts.
          </p>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline" className="border-white/20 text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Guidance Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <Moon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Today's Ritual — Live Guidance</h3>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Clock className="w-3 h-3" />
                <span>Updated {lastUpdated.toLocaleTimeString()}</span>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400">Live</span>
              </div>
            </div>
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="text-white/50 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Main Copy */}
        <div className="space-y-4">
          <p className="text-white/80 leading-relaxed">
            Today's ritual is generated in real time using <span className="text-indigo-300">lunar cycles</span>, 
            <span className="text-purple-300"> energetic rhythms</span>, and 
            <span className="text-pink-300"> restorative principles</span>.
          </p>

          <div className="p-4 rounded-xl bg-black/20 border border-white/5">
            <p className="text-white/70 text-sm">
              Nothing here is random.<br />
              Nothing here is meant to overwhelm you.
            </p>
          </div>

          <p className="text-white/60 text-sm">
            Some days will feel lighter.<br />
            Some days will ask for rest.<br />
            <span className="text-white/80">Both are valid.</span>
          </p>
        </div>

        {/* Current Energies */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-white/5 text-center">
            <span className="text-2xl">{ritual.moon.emoji}</span>
            <p className="text-white text-sm font-medium mt-1">{ritual.moon.phase}</p>
            <p className="text-white/50 text-xs">Moon Phase</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 text-center">
            <Sparkles className="w-6 h-6 text-purple-400 mx-auto" />
            <p className="text-white text-sm font-medium mt-1">{ritual.element.name}</p>
            <p className="text-white/50 text-xs">Element</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 text-center">
            <div 
              className="w-6 h-6 rounded-full mx-auto"
              style={{ backgroundColor: ritual.candle.color.toLowerCase() }}
            />
            <p className="text-white text-sm font-medium mt-1">{ritual.candle.color}</p>
            <p className="text-white/50 text-xs">Candle</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 text-center">
            <span className="text-lg">{ritual.zodiac.current_season.emoji}</span>
            <p className="text-white text-sm font-medium mt-1">{ritual.zodiac.current_season.sign}</p>
            <p className="text-white/50 text-xs">Season</p>
          </div>
        </div>

        {/* Guidance Note */}
        <div className="mt-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <p className="text-white/70 text-sm text-center">
            If something resonates deeply, <span className="text-purple-300">linger with it</span>.<br />
            If something doesn't, <span className="text-pink-300">release it without guilt</span>.
          </p>
          <p className="text-white/80 text-sm text-center mt-3 font-medium">
            This ritual is a guide — you are the authority.
          </p>
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-center text-white/40 text-sm">
        This guidance refreshes daily to support rhythm, not routine.
      </p>
    </div>
  );
}

// Compact version for sidebar or widget
export function LiveRitualWidget({ ritual }: { ritual: DailyRitual | null }) {
  if (!ritual) return null;

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{ritual.moon.emoji}</span>
        <div>
          <p className="text-white text-sm font-medium">{ritual.moon.phase}</p>
          <p className="text-white/50 text-xs">{ritual.element.name} Day</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-xs">Live</span>
        </div>
      </div>
      <p className="text-white/60 text-xs italic">
        Today's ritual supports rhythm, not routine.
      </p>
    </div>
  );
}
