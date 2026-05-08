import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, ThumbsUp, Eye, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface FeedReflectionCardProps {
  reflection: {
    id: string;
    content: string;
    frequency_type: string;
    shared_at: string;
    is_anonymous: boolean;
    view_count: number;
    user_name?: string;
    user_id?: string;
    reactions?: {
      resonate: number;
      inspire: number;
      gratitude: number;
    };
    user_reactions?: string[];
  };
  onProfileClick?: (userId: string) => void;
}

export const FeedReflectionCard: React.FC<FeedReflectionCardProps> = ({ 
  reflection, 
  onProfileClick 
}) => {
  const [reactions, setReactions] = useState(reflection.reactions || { resonate: 0, inspire: 0, gratitude: 0 });
  const [userReactions, setUserReactions] = useState<string[]>(reflection.user_reactions || []);
  const [isLoading, setIsLoading] = useState(false);

  const handleReaction = async (reactionType: string) => {
    setIsLoading(true);
    const hasReacted = userReactions.includes(reactionType);
    const action = hasReacted ? 'remove' : 'add';

    try {
      const { error } = await supabase.functions.invoke('add-resonance-reaction', {
        body: { sharedReflectionId: reflection.id, reactionType, action }
      });

      if (error) throw error;

      setReactions(prev => ({
        ...prev,
        [reactionType]: hasReacted ? prev[reactionType as keyof typeof prev] - 1 : prev[reactionType as keyof typeof prev] + 1
      }));

      setUserReactions(prev => 
        hasReacted ? prev.filter(r => r !== reactionType) : [...prev, reactionType]
      );
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update reaction', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border-purple-500/30">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {reflection.is_anonymous ? (
            <Badge variant="outline" className="bg-purple-800/50">Anonymous</Badge>
          ) : (
            <button onClick={() => onProfileClick?.(reflection.user_id!)} className="flex items-center gap-2 hover:opacity-80">
              <User className="w-4 h-4" />
              <span className="font-medium">{reflection.user_name}</span>
            </button>
          )}
          <Badge className="bg-indigo-600">{reflection.frequency_type}</Badge>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Eye className="w-4 h-4" />
          <span>{reflection.view_count}</span>
        </div>
      </div>

      <p className="text-gray-200 mb-4 leading-relaxed">{reflection.content}</p>

      <div className="flex gap-2 mt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleReaction('resonate')}
          disabled={isLoading}
          className={userReactions.includes('resonate') ? 'bg-pink-600/30' : ''}
        >
          <Heart className="w-4 h-4 mr-1" />
          {reactions.resonate}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleReaction('inspire')}
          disabled={isLoading}
          className={userReactions.includes('inspire') ? 'bg-purple-600/30' : ''}
        >
          <Sparkles className="w-4 h-4 mr-1" />
          {reactions.inspire}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleReaction('gratitude')}
          disabled={isLoading}
          className={userReactions.includes('gratitude') ? 'bg-indigo-600/30' : ''}
        >
          <ThumbsUp className="w-4 h-4 mr-1" />
          {reactions.gratitude}
        </Button>
      </div>
    </Card>
  );
};
