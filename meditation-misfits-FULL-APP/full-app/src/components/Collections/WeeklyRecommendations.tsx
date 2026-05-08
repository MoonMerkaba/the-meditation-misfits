import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, Target, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface MeditationSuggestion {
  title: string;
  duration: number;
  goal: string;
  theme: string;
}

interface CollectionRecommendation {
  name: string;
  description: string;
  theme: string;
  suggestedMeditations: MeditationSuggestion[];
  reasoning: string;
}

interface WeeklyRecommendationsProps {
  onCreateCollection: (recommendation: CollectionRecommendation) => void;
}

export function WeeklyRecommendations({ onCreateCollection }: WeeklyRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<CollectionRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<number | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-meditation-recommendations', {
        body: { type: 'weekly' }
      });

      if (error) throw error;
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (rec: CollectionRecommendation, index: number) => {
    setCreating(index);
    try {
      onCreateCollection(rec);
      toast.success('Collection created! Add meditations to get started.');
    } catch (error) {
      toast.error('Failed to create collection');
    } finally {
      setCreating(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-500" />
        <h3 className="text-lg font-semibold">Weekly Recommendations</h3>
      </div>

      {recommendations.map((rec, index) => (
        <Card key={index} className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{rec.name}</CardTitle>
                <CardDescription className="mt-1">{rec.description}</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {rec.theme}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/80 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Suggested Meditations:</p>
              {rec.suggestedMeditations.map((med, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{med.title}</span>
                  <span className="text-gray-500">• {med.duration}min</span>
                  <Badge variant="outline" className="text-xs">{med.goal}</Badge>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
              <Target className="h-4 w-4 mt-0.5 text-purple-500 flex-shrink-0" />
              <p>{rec.reasoning}</p>
            </div>

            <Button
              onClick={() => handleCreateCollection(rec, index)}
              disabled={creating === index}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {creating === index ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create This Collection
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}