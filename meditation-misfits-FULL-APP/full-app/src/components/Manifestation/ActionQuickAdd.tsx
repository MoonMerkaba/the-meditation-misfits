import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface ActionQuickAddProps {
  intentionId: string;
  onActionAdded: () => void;
}

export function ActionQuickAdd({ intentionId, onActionAdded }: ActionQuickAddProps) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('log-action', {
        body: { intention_id: intentionId, note: note.trim() }
      });
      if (error) throw error;
      toast.success('Action logged!');
      setNote('');
      onActionAdded();
    } catch (err: any) {
      toast.error('Failed to log action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Send that email, apply to the program, organize one drawer..."
        className="flex-1"
      />
      <Button type="submit" disabled={loading || !note.trim()}>
        <Plus className="w-4 h-4" />
      </Button>
    </form>
  );
}
