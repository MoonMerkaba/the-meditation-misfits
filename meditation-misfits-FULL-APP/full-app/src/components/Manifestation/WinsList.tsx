import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface Win {
  id: string;
  note: string;
  tags: string[];
  created_at: string;
}

interface WinsListProps {
  wins: Win[];
}

const tagColors: Record<string, string> = {
  money: 'bg-green-100 text-green-800',
  connection: 'bg-pink-100 text-pink-800',
  synchronicity: 'bg-purple-100 text-purple-800',
  opportunity: 'bg-blue-100 text-blue-800',
  mindset: 'bg-orange-100 text-orange-800'
};

export function WinsList({ wins }: WinsListProps) {
  if (wins.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        This is where your magic shows up. Log synchronicities, unexpected gifts, and wins.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {wins.map((win) => (
        <div key={win.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
          <p className="font-medium mb-2 line-clamp-2">{win.note}</p>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {win.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className={tagColors[tag] || ''}>
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(win.created_at), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
