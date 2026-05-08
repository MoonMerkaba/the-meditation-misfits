import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

interface Action {
  id: string;
  note: string;
  created_at: string;
}

interface ActionsListProps {
  actions: Action[];
}

export function ActionsList({ actions }: ActionsListProps) {
  if (actions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No actions yet. Start with one tiny step.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {actions.map((action) => (
        <div key={action.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
          <ArrowRight className="w-4 h-4 mt-1 text-purple-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm">{action.note}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(action.created_at), 'MMM d, yyyy • h:mm a')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
