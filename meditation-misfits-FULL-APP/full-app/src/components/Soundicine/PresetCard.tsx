import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Users, Clock, Heart, Share2, Calendar } from 'lucide-react';

import { RatingStars } from './RatingStars';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface PresetCardProps {
  preset: {
    id: string;
    preset_name: string;
    category: string;
    goal: string;
    minutes: number;
    beat_start: number;
    beat_end: number;
    iso_hz: number;
    noise: string;
    strength: string;
    is_public: boolean;
    play_count: number;
    avg_rating?: number;
    rating_count?: number;
    user_rating?: number;
    profiles?: { username: string };
  };
  onSelect?: (preset: any) => void;
  onPlay?: () => void;
  onRatingChange?: () => void;
  onSchedule?: () => void;
  aiReason?: string;
}

export const PresetCard: React.FC<PresetCardProps> = ({ preset, onSelect, onPlay, onRatingChange, onSchedule, aiReason }) => {

  const [isFavorited, setIsFavorited] = useState(false);
  const [isRating, setIsRating] = useState(false);
  
  const handlePlayClick = () => {
    if (onPlay) onPlay();
    if (onSelect) onSelect(preset);
  };

  
  const categoryColors = {
    Focus: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Relaxation: 'bg-green-500/20 text-green-300 border-green-500/30',
    Healing: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    Energy: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    Custom: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  };

  const handleRate = async (rating: number) => {
    setIsRating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to rate presets');
        return;
      }

      const { error } = await supabase.functions.invoke('rate-preset', {
        body: { presetId: preset.id, rating }
      });

      if (error) throw error;
      toast.success('Rating saved!');
      onRatingChange?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save rating');
    } finally {
      setIsRating(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/soundicine?preset=${preset.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  return (
    <Card className="bg-gradient-to-br from-purple-800/40 to-indigo-800/40 border-purple-500/30 p-4 hover:border-purple-400/50 transition-all">
      {aiReason && (
        <div className="mb-3 p-2 bg-purple-900/30 rounded border border-purple-500/20">
          <p className="text-xs text-purple-200 italic">AI: {aiReason}</p>
        </div>
      )}
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-1">{preset.preset_name}</h3>
          <p className="text-purple-300 text-sm">{preset.goal}</p>
          {preset.profiles?.username && (
            <p className="text-purple-400 text-xs mt-1">by {preset.profiles.username}</p>
          )}
        </div>
        <Badge className={categoryColors[preset.category as keyof typeof categoryColors]}>
          {preset.category}
        </Badge>
      </div>

      
      <div className="flex items-center gap-3 mb-3">
        <RatingStars 
          rating={preset.user_rating || preset.avg_rating || 0} 
          onRate={handleRate}
          readonly={isRating}
        />
        {preset.rating_count ? (
          <span className="text-xs text-purple-300">({preset.rating_count})</span>
        ) : null}
      </div>

      <div className="flex items-center gap-4 text-xs text-purple-200 mb-3">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {preset.minutes}m
        </span>
        <span>{preset.iso_hz}Hz</span>
        <span>{preset.beat_start}-{preset.beat_end} BPM</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button onClick={handlePlayClick} size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 flex-1">
          <Play className="w-4 h-4 mr-1" />
          Play
        </Button>

        {onSchedule && (
          <Button onClick={onSchedule} size="sm" variant="outline" className="border-purple-500/30">
            <Calendar className="w-4 h-4" />
          </Button>
        )}

        <Button onClick={handleShare} size="sm" variant="outline" className="border-purple-500/30">
          <Share2 className="w-4 h-4" />
        </Button>
        {preset.is_public && (
          <span className="flex items-center gap-1 text-xs text-purple-300">
            <Users className="w-3 h-3" />
            {preset.play_count || 0}
          </span>
        )}
      </div>

    </Card>
  );
};
