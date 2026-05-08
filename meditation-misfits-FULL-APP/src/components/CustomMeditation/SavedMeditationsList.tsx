import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Trash2, Heart, FolderPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SavedMeditationsListProps {
  onSelect: (id: string) => void;
  refreshTrigger?: number;
  collections?: any[];
}

export function SavedMeditationsList({ onSelect, refreshTrigger, collections = [] }: SavedMeditationsListProps) {
  const [meditations, setMeditations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeditations();
  }, [refreshTrigger]);

  const loadMeditations = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_meditations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMeditations(data || []);
    } catch (error: any) {
      toast.error('Failed to load meditations');
    } finally {
      setLoading(false);
    }
  };

  const addToCollection = async (meditationId: string, collectionId: string) => {
    try {
      const { error } = await supabase.functions.invoke('add-to-collection', {
        body: { collection_id: collectionId, meditation_id: meditationId }
      });
      if (error) throw error;
      toast.success('Added to collection!');
    } catch (error: any) {
      toast.error('Failed to add');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (meditations.length === 0) return <Card className="p-8 text-center"><p>No meditations yet</p></Card>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Custom Meditations</h3>
      <div className="grid gap-4">
        {meditations.map((med) => (
          <Card key={med.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold">{med.title}</h4>
                <p className="text-sm text-muted-foreground">{med.intention}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{med.duration_minutes} min</Badge>
                  <Badge variant="outline">{med.mood}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onSelect(med.id)}><Play className="w-4 h-4" /></Button>
                {collections.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost"><FolderPlus className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {collections.map((col) => (
                        <DropdownMenuItem key={col.id} onClick={() => addToCollection(med.id, col.id)}>
                          {col.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}