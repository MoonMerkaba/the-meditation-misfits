import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Music } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface DraggableMeditationItemProps {
  id: string;
  meditation: any;
  index: number;
}

export function DraggableMeditationItem({ id, meditation, index }: DraggableMeditationItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 mb-2 ${isDragging ? 'shadow-lg ring-2 ring-primary' : ''}`}
    >
      <div className="flex items-center gap-3">
        <button
          className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-accent rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </button>
        
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
          {index + 1}
        </div>
        
        <Music className="w-4 h-4 text-muted-foreground" />
        
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{meditation.title}</p>
          <p className="text-sm text-muted-foreground truncate">
            {meditation.duration} min • {meditation.theme}
          </p>
        </div>
      </div>
    </Card>
  );
}
