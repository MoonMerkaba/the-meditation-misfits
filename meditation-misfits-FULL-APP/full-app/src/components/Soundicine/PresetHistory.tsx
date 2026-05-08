import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Clock, TrendingUp } from 'lucide-react';
import { PresetCard } from './PresetCard';

export const PresetHistory: React.FC<{ onPlay: (preset: any) => void }> = ({ onPlay }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('preset_usage')
        .select(`
          preset_id,
          created_at,
          soundicine_presets (*)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(6);

      const uniquePresets = new Map();
      data?.forEach(item => {
        if (item.soundicine_presets && !uniquePresets.has(item.preset_id)) {
          uniquePresets.set(item.preset_id, item.soundicine_presets);
        }
      });

      setHistory(Array.from(uniquePresets.values()));
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || history.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-bold text-white">Recently Played</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            onPlay={() => onPlay(preset)}
            onRatingChange={loadHistory}
          />
        ))}
      </div>
    </div>
  );
};
