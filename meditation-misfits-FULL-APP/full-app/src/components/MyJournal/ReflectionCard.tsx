import { Card } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReflectionCardProps {
  id: string;
  date: string;
  frequency: string;
  text: string;
  tags?: string[];
  onClick: () => void;
  onDelete: () => void;
}

export function ReflectionCard({ 
  date, 
  frequency, 
  text, 
  tags,
  onClick, 
  onDelete 
}: ReflectionCardProps) {
  const snippet = text.length > 100 ? text.substring(0, 100) + '...' : text;
  const formattedDate = new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <Card 
      className="p-4 hover:bg-white/5 cursor-pointer transition-colors group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm text-gray-400">{formattedDate}</span>
            <span className="text-sm font-medium text-purple-400">{frequency}</span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{snippet}</p>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4 text-red-400" />
        </Button>
      </div>
    </Card>
  );
}