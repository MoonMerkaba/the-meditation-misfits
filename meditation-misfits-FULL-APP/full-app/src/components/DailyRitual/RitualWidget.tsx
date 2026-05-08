import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { 
  Moon, Flame, CheckCircle, Circle, ArrowRight, 
  Sparkles, Calendar, Clock
} from 'lucide-react';

interface RitualWidgetProps {
  compact?: boolean;
}

export function RitualWidget({ compact = false }: RitualWidgetProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [streak, setStreak] = useState(0);
  const [completedToday, setCompletedToday] = useState(false);
  const [sectionsCompleted, setSectionsCompleted] = useState(0);
  const [moonPhase, setMoonPhase] = useState({ phase: '', emoji: '🌙', illumination: 0 });
  const [nextMoonEvent, setNextMoonEvent] = useState({ name: '', daysUntil: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWidgetData();
  }, [user]);

  const loadWidgetData = async () => {
    try {
      // Calculate moon phase
      const today = new Date();
      const newMoon = new Date(2000, 0, 6, 18, 14, 0);
      const diff = today.getTime() - newMoon.getTime();
      const days = diff / 1000 / 60 / 60 / 24;
      const lunations = days / 29.53058867;
      const phase = lunations - Math.floor(lunations);
      const illumination = Math.round((1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100);
      
      let phaseName = '';
      let emoji = '🌙';
      
      if (phase < 0.0625) { phaseName = 'New Moon'; emoji = '🌑'; }
      else if (phase < 0.1875) { phaseName = 'Waxing Crescent'; emoji = '🌒'; }
      else if (phase < 0.3125) { phaseName = 'First Quarter'; emoji = '🌓'; }
      else if (phase < 0.4375) { phaseName = 'Waxing Gibbous'; emoji = '🌔'; }
      else if (phase < 0.5625) { phaseName = 'Full Moon'; emoji = '🌕'; }
      else if (phase < 0.6875) { phaseName = 'Waning Gibbous'; emoji = '🌖'; }
      else if (phase < 0.8125) { phaseName = 'Last Quarter'; emoji = '🌗'; }
      else if (phase < 0.9375) { phaseName = 'Waning Crescent'; emoji = '🌘'; }
      else { phaseName = 'New Moon'; emoji = '🌑'; }

      setMoonPhase({ phase: phaseName, emoji, illumination });

      // Calculate next moon event
      const daysInCycle = phase * 29.53;
      let nextEvent = { name: '', daysUntil: 0 };
      
      if (phase < 0.5) {
        nextEvent = { name: 'Full Moon', daysUntil: Math.round((0.5 - phase) * 29.53) };
      } else {
        nextEvent = { name: 'New Moon', daysUntil: Math.round((1 - phase) * 29.53) };
      }
      setNextMoonEvent(nextEvent);

      // Load user streak data
      if (user) {
        const { data } = await supabase.functions.invoke('get-ritual-streak');
        if (data) {
          setStreak(data.current_streak || 0);
          setCompletedToday(data.completed_today || false);
          setSectionsCompleted(data.sections_completed_today || 0);
        }
      }
    } catch (error) {
      console.error('Error loading widget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSections = 10;
  const progressPercent = Math.round((sectionsCompleted / totalSections) * 100);

  if (compact) {
    return (
      <button
        onClick={() => navigate('/daily-ritual')}
        className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/10 hover:border-purple-500/30 transition-all group"
      >
        <div className="text-2xl">{moonPhase.emoji}</div>
        <div className="text-left">
          <div className="text-sm font-medium text-white flex items-center gap-2">
            Daily Ritual
            {completedToday && <CheckCircle className="w-4 h-4 text-green-400" />}
          </div>
          <div className="text-xs text-white/60">
            {streak > 0 ? `🔥 ${streak} day streak` : 'Start your practice'}
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors ml-auto" />
      </button>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-violet-500/10 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Daily Ritual
        </h3>
        {completedToday ? (
          <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Complete
          </span>
        ) : (
          <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs">
            In Progress
          </span>
        )}
      </div>

      {/* Moon Phase */}
      <div className="flex items-center gap-4 mb-4 p-3 rounded-xl bg-white/5">
        <div className="text-4xl">{moonPhase.emoji}</div>
        <div>
          <p className="text-white font-medium">{moonPhase.phase}</p>
          <p className="text-xs text-white/60">{moonPhase.illumination}% illumination</p>
        </div>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20">
          <Flame className="w-8 h-8 text-orange-400" />
          <div>
            <p className="text-2xl font-bold text-white">{streak}</p>
            <p className="text-xs text-white/60">Day Streak</p>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-white/60 mb-1">
          <span>Today's Progress</span>
          <span>{sectionsCompleted}/{totalSections} sections</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Next Moon Event */}
      <div className="flex items-center gap-2 mb-4 text-sm text-white/60">
        <Clock className="w-4 h-4" />
        <span>{nextMoonEvent.name} in {nextMoonEvent.daysUntil} days</span>
      </div>

      {/* Action Button */}
      <Button
        onClick={() => navigate('/daily-ritual')}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
      >
        {completedToday ? 'View Ritual' : 'Continue Ritual'}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
