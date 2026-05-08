import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Copy, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CommentSection } from './CommentSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Collection {
  id: string;
  name: string;
  description: string;
  theme: string;
  total_duration: number;
  average_rating: number;
  rating_count: number;
}

export function CollectionDetailModal({ collection, open, onClose, onClone }: any) {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [meditations, setMeditations] = useState<any[]>([]);
  const [isOwner, setIsOwner] = useState(false);


  useEffect(() => {
    if (open) {
      loadDetails();
    }
  }, [open]);

  const loadDetails = async () => {
    try {
      const { data } = await supabase
        .from('collection_meditations')
        .select('*, custom_meditations(*)')
        .eq('collection_id', collection.id)
        .order('position');
      
      setMeditations(data || []);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsOwner(collection.user_id === user.id);
        
        const { data: rating } = await supabase
          .from('collection_ratings')
          .select('rating')
          .eq('collection_id', collection.id)
          .eq('user_id', user.id)
          .single();
        
        if (rating) setUserRating(rating.rating);
      }
    } catch (error) {
      console.error('Error loading details:', error);
    }
  };


  const handleRate = async (rating: number) => {
    try {
      const { error } = await supabase.functions.invoke('rate-collection', {
        body: { collectionId: collection.id, rating }
      });

      if (error) throw error;
      setUserRating(rating);
      toast.success('Rating saved!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save rating');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{collection.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="discussion">Discussion</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-6">
            <p className="text-muted-foreground">{collection.description}</p>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{collection.average_rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({collection.rating_count} ratings)</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{Math.floor(collection.total_duration / 60)} min</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Rate this collection</h3>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoverRating || userRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Meditations ({meditations.length})</h3>
              <div className="space-y-2">
                {meditations.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">{idx + 1}</span>
                    <div className="flex-1">
                      <div className="font-medium">{item.custom_meditations?.title || 'Untitled'}</div>
                      <div className="text-sm text-muted-foreground">
                        {Math.floor((item.custom_meditations?.duration || 0) / 60)} min
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={onClone} className="w-full">
              <Copy className="h-4 w-4 mr-2" />
              Clone to My Library
            </Button>
          </TabsContent>
          
          <TabsContent value="discussion" className="mt-4">
            <CommentSection collectionId={collection.id} isOwner={isOwner} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
