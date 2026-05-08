import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Play, Music, Lock, Globe, GripVertical } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useState } from 'react';


interface CollectionCardProps {
  collection: {
    id: string;
    name: string;
    description?: string;
    theme_color: string;
    is_public: boolean;
    meditation_count: number;
  };
  onPlay: () => void;
  onView: () => void;
  onReorder?: () => void;
}

export function CollectionCard({ collection, onPlay, onView, onReorder }: CollectionCardProps) {
  const [isPublic, setIsPublic] = useState(collection.is_public);

  const handleTogglePublic = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newValue = !isPublic;
      const { error } = await supabase
        .from('meditation_collections')
        .update({ is_public: newValue })
        .eq('id', collection.id);

      if (error) throw error;
      setIsPublic(newValue);
      toast.success(newValue ? 'Collection is now public' : 'Collection is now private');
    } catch (error) {
      toast.error('Failed to update collection');
    }
  };

  return (
    <Card 
      className="p-6 cursor-pointer hover:shadow-lg transition-all"
      style={{ borderLeft: `4px solid ${collection.theme_color}` }}
      onClick={onView}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{collection.name}</h3>
          {collection.description && (
            <p className="text-sm text-muted-foreground">{collection.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <Switch checked={isPublic} onCheckedChange={() => handleTogglePublic({} as any)} />
            <Globe className="w-4 h-4 text-muted-foreground" />
          </div>
          {isPublic && <Badge variant="secondary">Public</Badge>}
        </div>
      </div>

      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Music className="w-4 h-4" />
          <span>{collection.meditation_count} meditation{collection.meditation_count !== 1 ? 's' : ''}</span>
        </div>
        
        <div className="flex gap-2">
          {collection.meditation_count > 1 && onReorder && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onReorder();
              }}
              className="gap-2"
            >
              <GripVertical className="w-4 h-4" />
              Reorder
            </Button>
          )}
          
          {collection.meditation_count > 0 && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onPlay();
              }}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              Play All
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}