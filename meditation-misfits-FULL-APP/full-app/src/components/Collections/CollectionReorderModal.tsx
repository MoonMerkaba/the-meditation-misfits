import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableMeditationItem } from './DraggableMeditationItem';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Save, X } from 'lucide-react';

interface CollectionReorderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: string;
  collectionName: string;
  meditations: any[];
  onReorderComplete: () => void;
}

export function CollectionReorderModal({
  open,
  onOpenChange,
  collectionId,
  collectionName,
  meditations: initialMeditations,
  onReorderComplete,
}: CollectionReorderModalProps) {
  const [meditations, setMeditations] = useState(initialMeditations);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setMeditations((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.functions.invoke('reorder-collection', {
        body: {
          collectionId,
          meditationIds: meditations.map((m) => m.meditation_id),
        },
      });

      if (error) throw error;

      toast.success('Collection order saved!');
      setHasChanges(false);
      onReorderComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Failed to save order');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Reorder {collectionName}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Drag and drop meditations to reorder them
          </p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[50vh] pr-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={meditations.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              {meditations.map((meditation, index) => (
                <DraggableMeditationItem
                  key={meditation.id}
                  id={meditation.id}
                  meditation={meditation.custom_meditations}
                  index={index}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
