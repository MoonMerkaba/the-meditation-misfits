import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface ModerationActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: any;
  onComplete: () => void;
}

export function ModerationActionDialog({ open, onOpenChange, report, onComplete }: ModerationActionDialogProps) {
  const [action, setAction] = useState<string>('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [banDuration, setBanDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!action || !reason) {
      toast.error('Please select an action and provide a reason');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('moderate-content', {
        body: {
          reportId: report.id,
          action,
          reason,
          notes,
          severity,
          banDuration
        }
      });

      if (error) throw error;
      onComplete();
    } catch (error: any) {
      toast.error('Failed to take action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Take Moderation Action</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remove">Remove Comment</SelectItem>
                <SelectItem value="warn">Warn User</SelectItem>
                <SelectItem value="ban">Ban User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {action === 'warn' && (
            <div>
              <Label>Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {action === 'ban' && (
            <div>
              <Label>Ban Duration (days, leave empty for permanent)</Label>
              <Select value={banDuration?.toString() || 'permanent'} onValueChange={(v) => setBanDuration(v === 'permanent' ? null : parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Reason (sent to user)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this action is being taken..."
              rows={3}
            />
          </div>

          <div>
            <Label>Internal Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional context for other moderators..."
              rows={2}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Action'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}