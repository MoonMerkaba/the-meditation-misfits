import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnalyticsChart from './AnalyticsChart';
import MoodTracker from './MoodTracker';
import { EmotionalTrendChart } from '@/components/MyJournal/EmotionalTrendChart';
import { TrendingUp, Calendar, Brain, Heart } from 'lucide-react';
import { invokeEdgeFunction } from '@/lib/edgeFunctionHelper';
import { useAuth } from '@/contexts/AuthContext';

interface EnhancedAnalyticsProps {
  onClose: () => void;
}


const EnhancedAnalytics: React.FC<EnhancedAnalyticsProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [weekData, setWeekData] = useState<any[]>([]);
  const [monthData, setMonthData] = useState<any[]>([]);
  const [moodData, setMoodData] = useState<any[]>([]);
  const [reflections, setReflections] = useState<any[]>([]);

  useEffect(() => {
    loadReflections();
    
    // Generate sample data - in production, fetch from Supabase
    const generateWeekData = () => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map(day => ({
        date: day,
        sessions: Math.floor(Math.random() * 5),
        minutes: Math.floor(Math.random() * 60) + 10
      }));
    };

    const generateMonthData = () => {
      return Array.from({ length: 4 }, (_, i) => ({
        date: `Week ${i + 1}`,
        sessions: Math.floor(Math.random() * 20) + 5,
        minutes: Math.floor(Math.random() * 300) + 100
      }));
    };

    const generateMoodData = () => {
      const moods = ['Calm', 'Energized', 'Focused', 'Peaceful', 'Balanced'];
      return moods.map(mood => ({
        mood,
        count: Math.floor(Math.random() * 10) + 1
      }));
    };

    setWeekData(generateWeekData());
    setMonthData(generateMonthData());
    setMoodData(generateMoodData());
  }, []);

  const loadReflections = async () => {
    if (!user) return;
    const { data, error } = await invokeEdgeFunction('list-reflections');
    if (!error && data?.reflections) {
      setReflections(data.reflections);
    }
  };


  return (
    <div className="min-h-screen p-6" style={{
      background: '#000000'

    }}>
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            Deep <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-magenta to-brand-blue-gray">Analytics</span>
          </h1>
          <p className="text-gray-300">Track your transformation</p>
        </div>

        {/* Emotional Trend Chart */}
        {reflections.length >= 3 && (
          <div className="mb-6">
            <EmotionalTrendChart reflections={reflections} />
          </div>
        )}

        <Tabs defaultValue="week" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10">
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="mood">Mood</TabsTrigger>
          </TabsList>


          <TabsContent value="week" className="space-y-6">
            <AnalyticsChart data={weekData} title="Sessions This Week" type="sessions" />
            <AnalyticsChart data={weekData} title="Minutes This Week" type="minutes" />
          </TabsContent>

          <TabsContent value="month" className="space-y-6">
            <AnalyticsChart data={monthData} title="Monthly Sessions" type="sessions" />
            <AnalyticsChart data={monthData} title="Monthly Minutes" type="minutes" />
          </TabsContent>

          <TabsContent value="mood">
            <MoodTracker data={moodData} />
          </TabsContent>
        </Tabs>

        <button
          onClick={onClose}
          className="mt-8 w-full bg-gradient-to-r from-[#FF00BF] to-[#6683a0] text-white font-bold px-8 py-3 rounded-full"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default EnhancedAnalytics;
