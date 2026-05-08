import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PresetCard } from './PresetCard';
import { TrendingUp, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const TrendingPresets: React.FC<{ onPlay: (preset: any) => void }> = ({ onPlay }) => {
  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-trending-presets', {
        body: { days: 7, limit: 6 }
      });

      if (error) throw error;
      setPresets(data?.data || []);
    } catch (error) {
      console.error('Failed to load trending presets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
      </div>
    );
  }

  if (presets.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-bold text-white">Trending This Week</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            onPlay={() => onPlay(preset)}
            onRatingChange={loadTrending}
          />
        ))}
      </div>
    </div>
  );
};
