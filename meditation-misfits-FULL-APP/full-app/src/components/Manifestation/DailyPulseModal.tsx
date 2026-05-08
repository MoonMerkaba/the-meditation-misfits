import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DailyPulseModalProps {
  open: boolean;
  onClose: () => void;
  intentionId: string;
  intentionTitle: string;
}

export function DailyPulseModal({ open, onClose, intentionId, intentionTitle }: DailyPulseModalProps) {
  const [actionNote, setActionNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke('log-action', {
        body: { intention_id: intentionId, action_note: actionNote }
      });

      if (error) throw error;

      toast.success('Action logged! +5 Resonance');
      setActionNote('');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to log action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Daily Pulse: {intentionTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>What aligned action did you take today?</Label>
            <Textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="Even small steps count..."
              rows={4}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            Log Action
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}