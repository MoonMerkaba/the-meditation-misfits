import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, AlertTriangle, Ban, History } from 'lucide-react';

interface ModerationAction {
  id: string;
  action_type: string;
  reason: string;
  notes: string;
  created_at: string;
  moderator_id: string;
}

export function ModerationHistory() {
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('moderation_actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActions(data || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'remove': return <AlertTriangle className="w-4 h-4" />;
      case 'warn': return <Shield className="w-4 h-4" />;
      case 'ban': return <Ban className="w-4 h-4" />;
      default: return <History className="w-4 h-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'remove': return 'bg-yellow-100 text-yellow-800';
      case 'warn': return 'bg-orange-100 text-orange-800';
      case 'ban': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Loading history...</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Moderation History</h2>
      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {actions.map((action) => (
            <div key={action.id} className="border-l-4 border-purple-500 pl-4 py-2">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={getActionColor(action.action_type)}>
                  {getActionIcon(action.action_type)}
                  <span className="ml-1">{action.action_type.toUpperCase()}</span>
                </Badge>
                <span className="text-xs text-gray-500">
                  {new Date(action.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-sm font-medium">{action.reason}</p>
              {action.notes && (
                <p className="text-xs text-gray-600 mt-1">{action.notes}</p>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}