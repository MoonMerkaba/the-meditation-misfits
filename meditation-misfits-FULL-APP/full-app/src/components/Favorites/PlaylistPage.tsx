import { useState } from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Play, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SubscriptionModal } from '@/components/Premium/SubscriptionModal';

export const PlaylistPage = () => {
  const { favorites, loading, toggleFavorite } = useFavorites();
  const { subscription } = useSubscription();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  const isPremium = subscription?.status === 'active';

  const handlePlay = (audioUrl: string, id: string) => {
    // Simple audio play - in production, integrate with your audio player
    const audio = new Audio(audioUrl);
    audio.play();
    setPlayingId(id);
    audio.onended = () => setPlayingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Playlist</h1>
          <p className="text-gray-400">
            {isPremium ? 'Unlimited favorites' : `${favorites.length} / 3 favorites`}
          </p>
        </div>
        {!isPremium && (
          <Button onClick={() => setShowSubscriptionModal(true)}>
            Upgrade for Unlimited
          </Button>
        )}
      </div>

      {favorites.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="py-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-gray-400">
              Tap the heart on any frequency to save it to your playlist
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {favorites.map((fav) => (
            <Card key={fav.favorite_id} className="bg-gray-800/50 border-gray-700 hover:border-purple-500 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{fav.frequency_name}</h3>
                      <Badge variant="outline" className="text-purple-400 border-purple-400">
                        {fav.hz_value} Hz
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm">{fav.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePlay(fav.audio_url, fav.frequency_id)}
                      className={playingId === fav.frequency_id ? 'bg-purple-500/20' : ''}
                    >
                      <Play size={20} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(fav.frequency_id)}
                      className="hover:scale-110 transition-transform"
                    >
                      <Heart size={20} className="fill-red-500 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
    </div>
  );
};
