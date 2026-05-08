import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Sparkles, BookOpen, Check } from 'lucide-react';
import { FrequencyPlayer } from './FrequencyPlayer';
import { ReflectionModal } from './ReflectionModal';
import { useToast } from '@/hooks/use-toast';
import { useReflections } from '@/hooks/useReflections';
import { useAuth } from '@/contexts/AuthContext';

interface FrequencyData {
  frequency_name: string;
  hz_value: number;
  description: string;
  affirmation: string;
  audio_url: string;
  play_count: number;
}

const API_URL = 'https://dqqdwnzrulmgnqrlhfdc.functions.supabase.co/get-daily-frequency';

export function DailyFrequencyDrop() {
  const [data, setData] = useState<FrequencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [hasTodayReflection, setHasTodayReflection] = useState(false);
  const [autoOpenTimer, setAutoOpenTimer] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { listReflections } = useReflections();
  const { user } = useAuth();

  useEffect(() => {
    fetchFrequency();
    checkTodayReflection();
  }, []);

  useEffect(() => {
    return () => {
      if (autoOpenTimer) clearTimeout(autoOpenTimer);
    };
  }, [autoOpenTimer]);

  const fetchFrequency = async () => {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      if (result.ok && result.data) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch daily frequency:', error);
      toast({
        title: 'Error',
        description: 'Failed to load daily frequency',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkTodayReflection = async () => {
    if (!user) return;
    
    try {
      const reflections = await listReflections({ limit: 10 });
      const today = new Date().toISOString().split('T')[0];
      const todayReflection = reflections.some(r => r.date === today);
      setHasTodayReflection(todayReflection);
    } catch (error) {
      // Silently fail
    }
  };

  const incrementPlayCount = async () => {
    if (hasPlayed) return;
    
    try {
      await fetch(`${API_URL}?inc=1`);
      setHasPlayed(true);
      if (data) {
        setData({ ...data, play_count: data.play_count + 1 });
      }

      // Auto-open reflection modal after 4 seconds if user is logged in and hasn't reflected today
      if (user && !hasTodayReflection) {
        const timer = setTimeout(() => {
          setShowReflection(true);
        }, 4000);
        setAutoOpenTimer(timer);
      }
    } catch (error) {
      console.error('Failed to increment play count:', error);
    }
  };

  const handleReflectionSaved = () => {
    setHasTodayReflection(true);
    if (autoOpenTimer) {
      clearTimeout(autoOpenTimer);
      setAutoOpenTimer(null);
    }
  };

  if (loading) {
    return (
      <Card className="bg-black border-[#FF00BF]/30 p-8 animate-pulse">

        <div className="h-48" />
      </Card>
    );
  }

  if (!data) return null;

  return (
    <>
      <Card className="bg-black border-[#FF00BF]/30 p-8 shadow-2xl">

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-purple-300 font-medium">Today's Frequency</span>
                {hasTodayReflection && (
                  <Badge variant="outline" className="border-green-500/50 text-green-400 ml-2">
                    <Check className="h-3 w-3 mr-1" />
                    Reflected
                  </Badge>
                )}
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {data.frequency_name}
              </h2>
              <p className="text-2xl text-purple-300 mt-1">{data.hz_value} Hz</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Description</h3>
              <p className="text-gray-300">{data.description}</p>
            </div>

            <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/20">
              <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wide mb-2">Affirmation</h3>
              <p className="text-lg text-white italic">"{data.affirmation}"</p>
            </div>
          </div>

          <FrequencyPlayer audioUrl={data.audio_url} onPlay={incrementPlayCount} />

          <div className="flex items-center justify-between pt-4 border-t border-purple-500/20">
            <div className="flex items-center gap-2 text-gray-400">
              <Globe className="h-4 w-4" />
              <span className="text-sm">{data.play_count.toLocaleString()} tuned in today</span>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowReflection(true)}
              className="border-purple-500/30 hover:bg-purple-900/30"
              disabled={!user}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Journal Reflection
            </Button>
          </div>
        </div>
      </Card>

      {user && (
        <ReflectionModal
          isOpen={showReflection}
          onClose={() => setShowReflection(false)}
          frequencyName={data.frequency_name}
          frequencyId="daily"
          hzValue={data.hz_value}
          onSave={handleReflectionSaved}
        />
      )}
    </>
  );
}
