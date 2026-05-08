import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Copy, Eye, MessageSquare, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface StackCardProps {
  stack: any;
  onLoad?: (config: any) => void;
  onClone?: () => void;
}

export function StackCard({ stack, onLoad, onClone }: StackCardProps) {
  const [rating, setRating] = useState(0);
  const [isRating, setIsRating] = useState(false);

  const handleRate = async (value: number) => {
    setIsRating(true);
    const { error } = await supabase.functions.invoke('rate-stack', {
      body: { presetId: stack.id, rating: value }
    });
    if (error) {
      toast.error('Failed to rate');
    } else {
      setRating(value);
      toast.success('Rating submitted!');
    }
    setIsRating(false);
  };

  const handleClone = async () => {
    const { data, error } = await supabase.functions.invoke('clone-stack', {
      body: { presetId: stack.id }
    });
    if (error) {
      toast.error('Failed to clone');
    } else {
      toast.success('Stack cloned to your library!');
      onClone?.();
    }
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={stack.profiles?.avatar_url} />
            <AvatarFallback>{stack.profiles?.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{stack.name}</p>
            <p className="text-xs text-muted-foreground">by {stack.profiles?.display_name || stack.profiles?.username}</p>
          </div>
        </div>
        <Badge variant="secondary">{stack.config?.layers?.length || 0} layers</Badge>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          {stack.average_rating?.toFixed(1) || '0.0'} ({stack.ratings_count || 0})
        </span>
        <span className="flex items-center gap-1">
          <Copy className="h-4 w-4" />
          {stack.clones_count || 0}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          {stack.views_count || 0}
        </span>
      </div>

      {stack.reviews?.length > 0 && (
        <div className="mb-3 p-2 bg-muted/50 rounded text-xs">
          <MessageSquare className="h-3 w-3 inline mr-1" />
          "{stack.reviews[0].review_text}"
        </div>
      )}

      <div className="flex gap-2">
        <Button size="sm" onClick={() => onLoad?.(stack.config)} className="flex-1">
          <Play className="h-4 w-4 mr-1" />
          Load
        </Button>
        <Button size="sm" variant="outline" onClick={handleClone} className="flex-1">
          <Copy className="h-4 w-4 mr-1" />
          Clone
        </Button>
      </div>

      <div className="flex gap-1 mt-3 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            disabled={isRating}
            className="hover:scale-110 transition-transform"
          >
            <Star
              className={`h-4 w-4 ${
                star <= (rating || stack.user_rating || 0)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </Card>
  );
}
