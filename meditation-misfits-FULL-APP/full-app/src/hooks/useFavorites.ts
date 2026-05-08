import { useState, useEffect } from 'react';
import { invokeEdgeFunction } from '@/lib/edgeFunctionHelper';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Favorite {
  favorite_id: string;
  frequency_id: string;
  frequency_name: string;
  hz_value: number;
  description: string;
  audio_url: string;
  created_at: string;
}

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const loadFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await invokeEdgeFunction('list-favorites', {});

      if (error) {
        console.warn('Favorites load issue:', error);
        return;
      }
      
      if (data?.items) {
        setFavorites(data.items);
        setFavoriteIds(new Set(data.items.map((f: Favorite) => f.frequency_id)));
      } else if (Array.isArray(data)) {
        setFavorites(data);
        setFavoriteIds(new Set(data.map((f: Favorite) => f.frequency_id)));
      }
    } catch (err) {
      console.error('Error loading favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (frequencyId: string) => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return false;
    }

    const wasFavorited = favoriteIds.has(frequencyId);
    
    // Optimistic update
    if (wasFavorited) {
      setFavoriteIds(prev => {
        const next = new Set(prev);
        next.delete(frequencyId);
        return next;
      });
    } else {
      setFavoriteIds(prev => new Set(prev).add(frequencyId));
    }

    try {
      const { data, error } = await invokeEdgeFunction('toggle-favorite', {
        frequency_id: frequencyId
      });

      if (error) {
        // Revert optimistic update
        if (wasFavorited) {
          setFavoriteIds(prev => new Set(prev).add(frequencyId));
        } else {
          setFavoriteIds(prev => {
            const next = new Set(prev);
            next.delete(frequencyId);
            return next;
          });
        }
        toast.error(error);
        return false;
      }

      if (data?.limit_reached) {
        // Revert optimistic update
        if (!wasFavorited) {
          setFavoriteIds(prev => {
            const next = new Set(prev);
            next.delete(frequencyId);
            return next;
          });
        }
        return 'limit_reached';
      }

      toast.success(data?.favorited ? 'Added to My Playlist' : 'Removed from My Playlist');
      await loadFavorites();
      return data?.favorited;
    } catch (err: any) {
      // Revert optimistic update on error
      if (wasFavorited) {
        setFavoriteIds(prev => new Set(prev).add(frequencyId));
      } else {
        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.delete(frequencyId);
          return next;
        });
      }
      toast.error('Something went wrong. Please try again.');
      return false;
    }
  };

  const isFavorited = (frequencyId: string) => favoriteIds.has(frequencyId);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
      setFavoriteIds(new Set());
    }
  }, [user]);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorited,
    refetch: loadFavorites
  };
};
