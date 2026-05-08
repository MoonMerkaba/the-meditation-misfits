import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { PresetCard } from './PresetCard';


interface Recommendation {
  presetId: string;
  reason: string;
}

export default function AIRecommendations({ onPresetSelect }: { onPresetSelect: (preset: any) => void }) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');

    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-ai-recommendations', {
        body: { userId: user.id }
      });

      if (fnError) throw fnError;

      if (data?.recommendations) {
        const presetIds = data.recommendations.map((r: Recommendation) => r.presetId);
        
        const { data: presets, error: presetsError } = await supabase
          .from('soundicine_presets')
          .select('*')
          .in('id', presetIds);

        if (presetsError) throw presetsError;

        const enriched = presets?.map(preset => {
          const rec = data.recommendations.find((r: Recommendation) => r.presetId === preset.id);
          return { ...preset, aiReason: rec?.reason };
        }) || [];

        setRecommendations(enriched);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className="text-2xl font-bold">Recommended For You</h2>
        </div>
        <Button onClick={loadRecommendations} disabled={loading} variant="outline" size="sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
        </Button>
      </div>

      {loading && recommendations.length === 0 && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Analyzing your preferences...</p>
        </div>
      )}

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map(preset => (
            <PresetCard
              key={preset.id}
              preset={preset}
              onSelect={onPresetSelect}
              aiReason={preset.aiReason}
            />
          ))}
        </div>
      )}
    </div>
  );
}