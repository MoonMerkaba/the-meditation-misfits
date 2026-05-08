import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Copy, Layers } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function StackLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const { data, error } = await supabase.functions.invoke('get-stack-leaderboard');
    if (!error && data) {
      setLeaderboard(data.leaderboard || []);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading leaderboard...</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Trophy className="h-6 w-6 text-yellow-500" />
        Top Stack Creators
      </h2>
      <div className="space-y-3">
        {leaderboard.map((creator, index) => (
          <div
            key={creator.userId}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <span className={`text-2xl font-bold ${
                index === 0 ? 'text-yellow-500' :
                index === 1 ? 'text-gray-400' :
                index === 2 ? 'text-amber-600' :
                'text-muted-foreground'
              }`}>
                #{index + 1}
              </span>
              <Avatar className="h-10 w-10">
                <AvatarImage src={creator.avatarUrl} />
                <AvatarFallback>{creator.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{creator.displayName || creator.username}</p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    {creator.totalStacks} stacks
                  </span>
                  <span className="flex items-center gap-1">
                    <Copy className="h-3 w-3" />
                    {creator.totalClones} clones
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {creator.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
            <Badge variant="secondary">{Math.round(creator.score)} pts</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
