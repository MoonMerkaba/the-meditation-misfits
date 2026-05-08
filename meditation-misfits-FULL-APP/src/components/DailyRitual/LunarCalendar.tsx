import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, ChevronRight, Moon, Sun, Star, Users, 
  Calendar, Clock, Plus, Sparkles, AlertCircle, Bell
} from 'lucide-react';
import { getLunarEvents, getUserMoonRituals, saveMoonRitual, getGroupRituals, joinGroupRitual } from '@/lib/dailyRitual';
import { useToast } from '@/hooks/use-toast';

interface LunarEvent {
  id: string;
  event_type: string;
  event_name: string;
  event_date: string;
  zodiac_sign: string;
  description: string;
  ritual_suggestions: string[];
  energy_themes: string[];
  days_until: number;
  is_past: boolean;
  is_today: boolean;
  is_upcoming: boolean;
}

interface MoonRitual {
  id: string;
  moon_phase: string;
  title: string;
  description?: string;
  ritual_steps: string[];
  crystals: string[];
  candles: string[];
  intentions?: string;
  duration_minutes: number;
}

interface GroupRitual {
  id: string;
  title: string;
  description: string;
  scheduled_time: string;
  duration_minutes: number;
  max_participants: number;
  participant_count: { count: number }[];
  lunar_events: LunarEvent;
}

const moonPhases = [
  { id: 'new_moon', name: 'New Moon', emoji: '🌑', description: 'New beginnings, setting intentions' },
  { id: 'waxing_crescent', name: 'Waxing Crescent', emoji: '🌒', description: 'Taking action, building momentum' },
  { id: 'first_quarter', name: 'First Quarter', emoji: '🌓', description: 'Challenges, decision making' },
  { id: 'waxing_gibbous', name: 'Waxing Gibbous', emoji: '🌔', description: 'Refining, adjusting' },
  { id: 'full_moon', name: 'Full Moon', emoji: '🌕', description: 'Culmination, release, gratitude' },
  { id: 'waning_gibbous', name: 'Waning Gibbous', emoji: '🌖', description: 'Sharing wisdom, gratitude' },
  { id: 'last_quarter', name: 'Last Quarter', emoji: '🌗', description: 'Letting go, forgiveness' },
  { id: 'waning_crescent', name: 'Waning Crescent', emoji: '🌘', description: 'Rest, reflection, surrender' }
];

const eventTypeIcons: Record<string, React.ReactNode> = {
  new_moon: <Moon className="w-4 h-4" />,
  full_moon: <Moon className="w-4 h-4 fill-current" />,
  eclipse: <AlertCircle className="w-4 h-4" />,
  supermoon: <Sparkles className="w-4 h-4" />
};

const eventTypeColors: Record<string, string> = {
  new_moon: 'bg-gray-600',
  full_moon: 'bg-yellow-500',
  eclipse: 'bg-red-600',
  supermoon: 'bg-purple-600'
};

export function LunarCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<LunarEvent[]>([]);
  const [userRituals, setUserRituals] = useState<MoonRitual[]>([]);
  const [groupRituals, setGroupRituals] = useState<GroupRitual[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<LunarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateRitual, setShowCreateRitual] = useState(false);
  const [newRitual, setNewRitual] = useState({
    moon_phase: 'full_moon',
    title: '',
    description: '',
    ritual_steps: [''],
    crystals: [''],
    candles: [''],
    intentions: '',
    duration_minutes: 30
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 3, 0).toISOString();
      
      const [eventsData, ritualsData, groupData] = await Promise.all([
        getLunarEvents(startDate, endDate),
        getUserMoonRituals(),
        getGroupRituals()
      ]);
      
      setEvents(eventsData);
      setUserRituals(ritualsData);
      setGroupRituals(groupData);
    } catch (error) {
      console.error('Failed to load lunar data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const handleSaveRitual = async () => {
    try {
      await saveMoonRitual({
        ...newRitual,
        ritual_steps: newRitual.ritual_steps.filter(s => s.trim()),
        crystals: newRitual.crystals.filter(c => c.trim()),
        candles: newRitual.candles.filter(c => c.trim())
      });
      
      toast({
        title: 'Ritual Saved',
        description: 'Your custom moon ritual has been saved.'
      });
      
      setShowCreateRitual(false);
      setNewRitual({
        moon_phase: 'full_moon',
        title: '',
        description: '',
        ritual_steps: [''],
        crystals: [''],
        candles: [''],
        intentions: '',
        duration_minutes: 30
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save ritual.',
        variant: 'destructive'
      });
    }
  };

  const handleJoinGroupRitual = async (ritualId: string) => {
    try {
      await joinGroupRitual(ritualId);
      toast({
        title: 'Joined Ritual',
        description: 'You have joined the group ritual. We\'ll remind you before it starts.'
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to join ritual.',
        variant: 'destructive'
      });
    }
  };

  const upcomingEvents = events.filter(e => !e.is_past).slice(0, 5);
  const nextEvent = upcomingEvents[0];

  return (
    <div className="space-y-6">
      {/* Next Event Countdown */}
      {nextEvent && (
        <Card className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 border-indigo-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full ${eventTypeColors[nextEvent.event_type]} flex items-center justify-center text-3xl`}>
                  {nextEvent.event_type === 'full_moon' ? '🌕' : nextEvent.event_type === 'new_moon' ? '🌑' : '✨'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{nextEvent.event_name}</h3>
                  <p className="text-indigo-300">{nextEvent.zodiac_sign}</p>
                  <p className="text-sm text-indigo-400 mt-1">{nextEvent.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-white">{nextEvent.days_until}</div>
                <div className="text-indigo-300">days until</div>
                <Button
                  size="sm"
                  className="mt-2 bg-indigo-600 hover:bg-indigo-500"
                  onClick={() => setSelectedEvent(nextEvent)}
                >
                  <Bell className="w-4 h-4 mr-1" />
                  Set Reminder
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="bg-purple-900/30 border border-purple-500/30">
          <TabsTrigger value="calendar" className="data-[state=active]:bg-purple-600">
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="my-rituals" className="data-[state=active]:bg-purple-600">
            <Moon className="w-4 h-4 mr-2" />
            My Rituals
          </TabsTrigger>
          <TabsTrigger value="group" className="data-[state=active]:bg-purple-600">
            <Users className="w-4 h-4 mr-2" />
            Group Rituals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <Card className="bg-black/30 border-purple-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigateMonth(-1)}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <CardTitle className="text-purple-200">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </CardTitle>
                <Button variant="ghost" onClick={() => navigateMonth(1)}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
                      event.is_today
                        ? 'bg-purple-600/30 border-purple-400'
                        : event.is_upcoming
                        ? 'bg-indigo-900/30 border-indigo-500/30'
                        : 'bg-gray-900/30 border-gray-700/30'
                    }`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${eventTypeColors[event.event_type]} flex items-center justify-center`}>
                          {eventTypeIcons[event.event_type]}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{event.event_name}</h4>
                          <p className="text-sm text-gray-400">
                            {new Date(event.event_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {event.is_today ? (
                          <Badge className="bg-purple-600">Today</Badge>
                        ) : (
                          <span className="text-sm text-gray-400">
                            {event.days_until} days
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {event.energy_themes.slice(0, 3).map((theme, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-purple-500/30 text-purple-300">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-rituals">
          <Card className="bg-black/30 border-purple-500/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-purple-200">Custom Moon Rituals</CardTitle>
              <Dialog open={showCreateRitual} onOpenChange={setShowCreateRitual}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-500">
                    <Plus className="w-4 h-4 mr-1" />
                    Create Ritual
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-purple-500/30 max-w-lg max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-purple-200">Create Moon Ritual</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-purple-200">Moon Phase</Label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {moonPhases.map((phase) => (
                          <button
                            key={phase.id}
                            onClick={() => setNewRitual({ ...newRitual, moon_phase: phase.id })}
                            className={`p-2 rounded-lg text-center transition-all ${
                              newRitual.moon_phase === phase.id
                                ? 'bg-purple-600 border-purple-400'
                                : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                            } border`}
                          >
                            <div className="text-2xl">{phase.emoji}</div>
                            <div className="text-xs text-gray-300 mt-1">{phase.name.split(' ')[0]}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-purple-200">Ritual Title</Label>
                      <Input
                        value={newRitual.title}
                        onChange={(e) => setNewRitual({ ...newRitual, title: e.target.value })}
                        placeholder="e.g., Full Moon Release Ceremony"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-purple-200">Description</Label>
                      <Textarea
                        value={newRitual.description}
                        onChange={(e) => setNewRitual({ ...newRitual, description: e.target.value })}
                        placeholder="Describe your ritual..."
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-purple-200">Intentions</Label>
                      <Textarea
                        value={newRitual.intentions}
                        onChange={(e) => setNewRitual({ ...newRitual, intentions: e.target.value })}
                        placeholder="What intentions will you set?"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-purple-200">Duration (minutes)</Label>
                      <Input
                        type="number"
                        value={newRitual.duration_minutes}
                        onChange={(e) => setNewRitual({ ...newRitual, duration_minutes: parseInt(e.target.value) || 30 })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>

                    <Button onClick={handleSaveRitual} className="w-full bg-purple-600 hover:bg-purple-500">
                      Save Ritual
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {userRituals.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Moon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No custom rituals yet</p>
                  <p className="text-sm">Create rituals for each moon phase</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userRituals.map((ritual) => {
                    const phase = moonPhases.find(p => p.id === ritual.moon_phase);
                    return (
                      <div
                        key={ritual.id}
                        className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{phase?.emoji}</span>
                          <div>
                            <h4 className="font-medium text-white">{ritual.title}</h4>
                            <p className="text-sm text-purple-300">{phase?.name}</p>
                          </div>
                          <Badge className="ml-auto bg-purple-600/50">
                            {ritual.duration_minutes} min
                          </Badge>
                        </div>
                        {ritual.description && (
                          <p className="text-sm text-gray-400 mt-2">{ritual.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="group">
          <Card className="bg-black/30 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-200 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Community Group Rituals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {groupRituals.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No upcoming group rituals</p>
                  <p className="text-sm">Check back during major lunar events</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupRituals.map((ritual) => (
                    <div
                      key={ritual.id}
                      className="p-4 bg-indigo-900/20 rounded-lg border border-indigo-500/20"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-white">{ritual.title}</h4>
                          <p className="text-sm text-indigo-300 mt-1">{ritual.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(ritual.scheduled_time).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {ritual.participant_count[0]?.count || 0}/{ritual.max_participants}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleJoinGroupRitual(ritual.id)}
                          className="bg-indigo-600 hover:bg-indigo-500"
                        >
                          Join
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="bg-gray-900 border-purple-500/30 max-w-lg">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-purple-200 flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full ${eventTypeColors[selectedEvent.event_type]} flex items-center justify-center`}>
                    {eventTypeIcons[selectedEvent.event_type]}
                  </div>
                  {selectedEvent.event_name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedEvent.event_date).toLocaleString()}
                </div>
                <p className="text-gray-300">{selectedEvent.description}</p>
                
                <div>
                  <h4 className="font-medium text-purple-200 mb-2">Energy Themes</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.energy_themes.map((theme, i) => (
                      <Badge key={i} className="bg-purple-600/50">{theme}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-purple-200 mb-2">Suggested Rituals</h4>
                  <ul className="space-y-1">
                    {selectedEvent.ritual_suggestions.map((suggestion, i) => (
                      <li key={i} className="text-gray-300 flex items-center gap-2">
                        <Star className="w-3 h-3 text-yellow-400" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button className="w-full bg-purple-600 hover:bg-purple-500">
                  <Bell className="w-4 h-4 mr-2" />
                  Set Reminder for This Event
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
