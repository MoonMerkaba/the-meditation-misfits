import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface SharedReflection {
  id: string;
  reflection_text: string;
  frequency_name: string;
  frequency_hz: number;
  is_anonymous: boolean;
  created_at: string;
  views_count: number;
  resonance_count: number;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

export function CommunityReflections() {
  const [reflections, setReflections] = useState<SharedReflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [resonatedIds, setResonatedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadReflections();
  }, []);

  const loadReflections = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('community-reflections', {
        body: { action: 'list' }
      });

      if (error) throw error;
      setReflections(data.reflections || []);
    } catch (error: any) {
      toast.error('Failed to load community reflections');
    } finally {
      setLoading(false);
    }
  };

  const handleResonance = async (reflectionId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to resonate');
        return;
      }

      const { error } = await supabase.functions.invoke('community-reflections', {
        body: { action: 'toggle_resonance', sharedReflectionId: reflectionId }
      });

      if (error) throw error;

      // Update local state
      setReflections(prev => prev.map(r => {
        if (r.id === reflectionId) {
          const isResonated = resonatedIds.has(reflectionId);
          return {
            ...r,
            resonance_count: r.resonance_count + (isResonated ? -1 : 1)
          };
        }
        return r;
      }));

      setResonatedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(reflectionId)) {
          newSet.delete(reflectionId);
        } else {
          newSet.add(reflectionId);
        }
        return newSet;
      });
    } catch (error: any) {
      toast.error('Failed to update resonance');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading community reflections...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Community Reflections</h2>
      <p className="text-muted-foreground">
        Explore reflections shared by the Freqyn community
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {reflections.map((reflection) => (
          <Card key={reflection.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!reflection.is_anonymous && reflection.profiles ? (
                    <>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={reflection.profiles.avatar_url} />
                        <AvatarFallback>
                          {reflection.profiles.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{reflection.profiles.username}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground italic">Anonymous</span>
                  )}
                </div>
                <Badge variant="outline">{reflection.frequency_name}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{reflection.reflection_text}</p>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {reflection.views_count}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => handleResonance(reflection.id)}
                  >
                    <Heart
                      className={`w-4 h-4 ${resonatedIds.has(reflection.id) ? 'fill-red-500 text-red-500' : ''}`}
                    />
                    {reflection.resonance_count}
                  </Button>
                </div>
                <span>{new Date(reflection.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
