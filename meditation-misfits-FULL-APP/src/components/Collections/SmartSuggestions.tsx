import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, Target, Lightbulb, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface SmartSuggestion {
  title: string;
  duration: number;
  goal: string;
  theme: string;
  reasoning: string;
}

interface SmartSuggestionsProps {
  collectionId: string;
  collectionName: string;
  onGenerateMeditation: (suggestion: SmartSuggestion) => void;
}

export function SmartSuggestions({ collectionId, collectionName, onGenerateMeditation }: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<number | null>(null);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-meditation-recommendations', {
        body: { type: 'collection', collectionId }
      });

      if (error) throw error;
      setSuggestions(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast.error('Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (suggestion: SmartSuggestion, index: number) => {
    setGenerating(index);
    try {
      onGenerateMeditation(suggestion);
      toast.success('Generating meditation...');
    } catch (error) {
      toast.error('Failed to generate meditation');
    } finally {
      setGenerating(null);
    }
  };

  if (!suggestions.length && !loading) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Sparkles className="h-12 w-12 text-purple-300 mb-3" />
          <p className="text-sm text-gray-500 mb-4">Get AI-powered suggestions for this collection</p>
          <Button onClick={fetchSuggestions} variant="outline" size="sm">
            <Lightbulb className="h-4 w-4 mr-2" />
            Get Smart Suggestions
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <h4 className="font-semibold">Smart Suggestions for "{collectionName}"</h4>
            </div>
            <Button onClick={fetchSuggestions} variant="ghost" size="sm">
              Refresh
            </Button>
          </div>

          {suggestions.map((sug, index) => (
            <Card key={index} className="border-purple-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{sug.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{sug.theme}</Badge>
                  </div>
                </div>
                <CardDescription className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {sug.duration} min
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {sug.goal}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-purple-50 p-3 rounded-lg text-sm text-gray-700">
                  <p className="font-medium mb-1 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-purple-500" />
                    Why this fits:
                  </p>
                  <p>{sug.reasoning}</p>
                </div>
                <Button
                  onClick={() => handleGenerate(sug, index)}
                  disabled={generating === index}
                  className="w-full"
                  variant="outline"
                >
                  {generating === index ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate This Meditation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}