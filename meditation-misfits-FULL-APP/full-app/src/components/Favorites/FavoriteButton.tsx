import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { useSubscription } from '@/hooks/useSubscription';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SubscriptionModal } from '@/components/Premium/SubscriptionModal';

interface FavoriteButtonProps {
  frequencyId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FavoriteButton = ({ frequencyId, size = 'md', className = '' }: FavoriteButtonProps) => {
  const { toggleFavorite, isFavorited } = useFavorites();
  const { subscription } = useSubscription();
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  const favorited = isFavorited(frequencyId);
  const isPremium = subscription?.status === 'active';

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const result = await toggleFavorite(frequencyId);
    
    if (result === 'limit_reached') {
      setShowLimitModal(true);
    }
  };

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className={`hover:scale-110 transition-transform ${className}`}
        title={favorited ? 'Saved to My Playlist' : 'Save to My Playlist'}
      >
        <Heart
          size={iconSize}
          className={favorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}
        />
      </Button>

      <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Favorites Full</DialogTitle>
            <DialogDescription>
              Free members can save up to 3 frequencies. Go Premium for unlimited favorites.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLimitModal(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowLimitModal(false);
              setShowSubscriptionModal(true);
            }}>
              Upgrade to Premium
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
    </>
  );
};
