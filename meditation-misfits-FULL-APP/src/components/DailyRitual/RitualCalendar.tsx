import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { invokeEdgeFunction } from '@/lib/edgeFunctionHelper';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar, ChevronLeft, ChevronRight, Flame, TrendingUp, 
  Target, BookOpen, Heart, Sparkles, Award
} from 'lucide-react';

interface CalendarDay {
  date: string;
  completed: boolean;
  completionPercentage: number;
  sections: string[];
  moodBefore?: number;
  moodAfter?: number;
  hasJournal: boolean;
}

interface CalendarStats {
  totalCompletions: number;
  daysInMonth: number;
  completionRate: number;
  avgMoodImprovement: number;
  mostCompletedSections: { section: string; count: number }[];
  currentStreak: number;
  bestStreak: number;
}

interface CalendarData {
  month: number;
  year: number;
  calendar: Record<string, CalendarDay>;
  streakDays: string[];
  stats: CalendarStats;
}

const sectionLabels: Record<string, string> = {
  element: 'Element',
  candle: 'Candle',
  color: 'Color',
  tea: 'Tea',
  scent: 'Scent',
  moon: 'Moon',
  horoscope: 'Horoscope',
  shadow: 'Shadow Work',
  recovery: 'Recovery',
  altar: 'Altar',
  breathwork: 'Breathwork'
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function RitualCalendar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CalendarData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  useEffect(() => {
    if (open && user) {
      loadCalendarData();
    }
  }, [open, user, viewMonth, viewYear]);

  const loadCalendarData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: result, error } = await invokeEdgeFunction('get-ritual-calendar', { month: viewMonth, year: viewYear });
      if (error) { console.error(error); return; }
      setData(result);
    } catch (error) {
      console.error('Error loading calendar:', error);
    } finally {
      setLoading(false);
    }

  };

  const goToPreviousMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const getCalendarGrid = () => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const grid: (CalendarDay | null)[] = [];
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      grid.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      grid.push(data?.calendar[dateStr] || {
        date: dateStr,
        completed: false,
        completionPercentage: 0,
        sections: [],
        hasJournal: false
      });
    }

    return grid;
  };

  const isToday = (dateStr: string) => {
    return dateStr === today.toISOString().split('T')[0];
  };

  const isStreakDay = (dateStr: string) => {
    return data?.streakDays.includes(dateStr) || false;
  };

  const selectedDayData = selectedDate ? data?.calendar[selectedDate] : null;

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
          <Calendar className="w-4 h-4 mr-2" />
          Calendar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Ritual Completion Calendar
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center text-white/60">
            <Sparkles className="w-8 h-8 animate-pulse mx-auto mb-2" />
            Loading your journey...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={goToPreviousMonth} className="text-white/60 hover:text-white">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-lg font-semibold text-white">
                {monthNames[viewMonth]} {viewYear}
              </h3>
              <Button variant="ghost" size="sm" onClick={goToNextMonth} className="text-white/60 hover:text-white">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Stats Summary */}
            {data?.stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-xs text-white/60">Current Streak</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{data.stats.currentStreak}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-white/60">Completion Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{data.stats.completionRate}%</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-white/60">Avg Mood Boost</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {data.stats.avgMoodImprovement > 0 ? '+' : ''}{data.stats.avgMoodImprovement}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-white/60">Best Streak</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{data.stats.bestStreak}</p>
                </div>
              </div>
            )}

            {/* Calendar Grid */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-xs text-white/40 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {getCalendarGrid().map((day, index) => (
                  <button
                    key={index}
                    onClick={() => day && setSelectedDate(day.date)}
                    disabled={!day}
                    className={`
                      aspect-square rounded-lg p-1 flex flex-col items-center justify-center text-sm transition-all
                      ${!day ? 'invisible' : ''}
                      ${day?.completed 
                        ? isStreakDay(day.date)
                          ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white'
                          : 'bg-gradient-to-br from-purple-500/50 to-pink-500/50 text-white'
                        : 'bg-white/5 text-white/40 hover:bg-white/10'
                      }
                      ${day && isToday(day.date) ? 'ring-2 ring-purple-400' : ''}
                      ${selectedDate === day?.date ? 'ring-2 ring-white' : ''}
                    `}
                  >
                    {day && (
                      <>
                        <span className="text-xs">
                          {new Date(day.date).getDate()}
                        </span>
                        {day.completed && (
                          <Flame className="w-3 h-3 mt-0.5" />
                        )}
                      </>
                    )}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-white/60">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-gradient-to-br from-orange-500 to-red-500" />
                  <span>Streak Day</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-gradient-to-br from-purple-500/50 to-pink-500/50" />
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-white/10" />
                  <span>Missed</span>
                </div>
              </div>
            </div>

            {/* Selected Day Details */}
            {selectedDayData && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  {new Date(selectedDayData.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h4>

                {selectedDayData.completed ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{ width: `${selectedDayData.completionPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-white/60">{selectedDayData.completionPercentage}%</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedDayData.sections.map(section => (
                        <span key={section} className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs">
                          {sectionLabels[section] || section}
                        </span>
                      ))}
                    </div>

                    {(selectedDayData.moodBefore != null && selectedDayData.moodAfter != null) && (
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-white/60">Mood:</span>
                        <span className="text-white">{selectedDayData.moodBefore}</span>
                        <span className="text-white/40">→</span>
                        <span className={selectedDayData.moodAfter > selectedDayData.moodBefore ? 'text-emerald-400' : 'text-white'}>
                          {selectedDayData.moodAfter}
                        </span>
                        {selectedDayData.moodAfter > selectedDayData.moodBefore && (
                          <span className="text-emerald-400 text-xs">
                            (+{selectedDayData.moodAfter - selectedDayData.moodBefore})
                          </span>
                        )}
                      </div>
                    )}

                    {selectedDayData.hasJournal && (
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <BookOpen className="w-4 h-4" />
                        <span>Journal entry recorded</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm">No ritual completed on this day</p>
                )}
              </div>
            )}

            {/* Most Completed Sections */}
            {data?.stats.mostCompletedSections && data.stats.mostCompletedSections.length > 0 && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400" />
                  Your Favorite Ritual Sections
                </h4>
                <div className="space-y-2">
                  {data.stats.mostCompletedSections.map((item, index) => (
                    <div key={item.section} className="flex items-center gap-3">
                      <span className="text-white/40 text-sm w-4">{index + 1}.</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white">{sectionLabels[item.section] || item.section}</span>
                          <span className="text-white/60">{item.count} times</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            style={{ width: `${(item.count / data.stats.totalCompletions) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
