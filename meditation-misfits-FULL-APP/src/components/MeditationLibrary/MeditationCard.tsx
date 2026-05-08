import React from 'react';
import { GuidedMeditation } from '@/types/meditation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FavoriteButton } from '@/components/Favorites/FavoriteButton';
import { Play, Clock, TrendingUp } from 'lucide-react';

interface MeditationCardProps {
  meditation: GuidedMeditation;
  onPlay: (meditation: GuidedMeditation) => void;
  isCompleted?: boolean;
}

export const MeditationCard: React.FC<MeditationCardProps> = ({
  meditation,
  onPlay,
  isCompleted
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all group cursor-pointer overflow-hidden">
      <div className="relative aspect-video bg-gradient-to-br from-purple-600 to-pink-600">
        {meditation.thumbnail_url && (
          <img src={meditation.thumbnail_url} alt={meditation.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onPlay(meditation)}
            className="bg-white text-purple-600 rounded-full p-4 hover:scale-110 transition-transform"
          >
            <Play className="w-8 h-8 fill-current" />
          </button>
        </div>
        {isCompleted && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
            ✓ Completed
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-white font-semibold text-lg flex-1">{meditation.title}</h3>
          <FavoriteButton itemId={meditation.id} itemType="meditation" />
        </div>
        <p className="text-white/70 text-sm mb-3 line-clamp-2">{meditation.description}</p>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge className={`${getDifficultyColor(meditation.difficulty)} text-white`}>
            {meditation.difficulty}
          </Badge>
          <Badge variant="outline" className="text-white border-white/30">
            <Clock className="w-3 h-3 mr-1" />
            {meditation.duration} min
          </Badge>
          {meditation.is_premium && (
            <Badge className="bg-yellow-500 text-black">Premium</Badge>
          )}
        </div>
      </div>
    </Card>
  );
};
