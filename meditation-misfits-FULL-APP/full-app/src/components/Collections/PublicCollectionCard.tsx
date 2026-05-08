import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Clock, Copy, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CollectionDetailModal } from './CollectionDetailModal';

interface Collection {
  id: string;
  name: string;
  description: string;
  theme: string;
  total_duration: number;
  clone_count: number;
  view_count: number;
  average_rating: number;
  rating_count: number;
  creator: { username: string; avatar_url: string };
}

export function PublicCollectionCard({ collection, onClone }: { collection: Collection; onClone: () => void }) {
  const [cloning, setCloning] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const handleClone = async () => {
    try {
      setCloning(true);
      const { data, error } = await supabase.functions.invoke('clone-collection', {
        body: { collectionId: collection.id }
      });

      if (error) throw error;
      toast.success('Collection cloned to your library!');
      onClone();
    } catch (error: any) {
      toast.error(error.message || 'Failed to clone collection');
    } finally {
      setCloning(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowDetail(true)}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{collection.name}</CardTitle>
              <CardDescription className="line-clamp-2 mt-1">
                {collection.description || 'No description'}
              </CardDescription>
            </div>
            {collection.theme && (
              <Badge variant="secondary" className="ml-2">{collection.theme}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{collection.average_rating.toFixed(1)}</span>
              <span className="text-xs">({collection.rating_count})</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(collection.total_duration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Copy className="h-4 w-4" />
              <span>{collection.clone_count}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={collection.creator?.avatar_url} />
              <AvatarFallback>{collection.creator?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">by {collection.creator?.username || 'Anonymous'}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={(e) => { e.stopPropagation(); handleClone(); }} disabled={cloning} className="w-full">
            <Copy className="h-4 w-4 mr-2" />
            {cloning ? 'Cloning...' : 'Clone to My Library'}
          </Button>
        </CardFooter>
      </Card>
      {showDetail && (
        <CollectionDetailModal collection={collection} open={showDetail} onClose={() => setShowDetail(false)} onClone={handleClone} />
      )}
    </>
  );
}