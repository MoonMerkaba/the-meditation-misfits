import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Target, Zap, Star, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TimelineEvent {
  type: 'action' | 'win' | 'reflection';
  data: any;
  timestamp: string;
}

interface IntentionTimelineProps {
  intentionId: string;
}

export function IntentionTimeline({ intentionId }: IntentionTimelineProps) {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, [intentionId]);

  const loadTimeline = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('get-intention-timeline', {
        body: { intention_id: intentionId }
      });

      if (error) throw error;
      setTimeline(data.timeline || []);
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'action': return <Target className="w-4 h-4" />;
      case 'win': return <Star className="w-4 h-4" />;
      case 'reflection': return <BookOpen className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'action': return 'bg-blue-500';
      case 'win': return 'bg-yellow-500';
      case 'reflection': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Journey Timeline</h3>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-blue-500" />
        <div className="space-y-6">
          {timeline.map((event, idx) => (
            <div key={idx} className="relative pl-12">
              <div className={`absolute left-2 w-5 h-5 rounded-full ${getEventColor(event.type)} flex items-center justify-center text-white`}>
                {getEventIcon(event.type)}
              </div>
              <Card className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="capitalize">{event.type}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{event.data.note || event.data.insights || 'Reflection captured'}</p>
                {event.type === 'win' && event.data.tags && (
                  <div className="flex gap-1 mt-2">
                    {event.data.tags.map((tag: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
