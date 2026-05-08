import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface WinsListModalProps {
  open: boolean;
  onClose: () => void;
  intentionId: string;
  onWinAdded: () => void;
}

const tagOptions = [
  { value: 'money', label: 'Money', color: 'bg-green-500' },
  { value: 'connection', label: 'Connection', color: 'bg-pink-500' },
  { value: 'synchronicity', label: 'Synchronicity', color: 'bg-purple-500' },
  { value: 'opportunity', label: 'Opportunity', color: 'bg-blue-500' },
  { value: 'mindset', label: 'Mindset', color: 'bg-orange-500' }
];

export function WinsListModal({ open, onClose, intentionId, onWinAdded }: WinsListModalProps) {
  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('log-win', {
        body: { intention_id: intentionId, note, tags }
      });
      if (error) throw error;
      toast.success('Win logged!');
      setNote('');
      setTags([]);
      onWinAdded();
      onClose();
    } catch (err) {
      toast.error('Failed to log win');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Win / Sync</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Unexpected refund, random invite, someone mentioned exactly what I've been thinking about..."
            rows={4}
            required
          />
          <div className="space-y-2">
            <p className="text-sm font-medium">Tags</p>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map(tag => (
                <Badge
                  key={tag.value}
                  onClick={() => toggleTag(tag.value)}
                  className={`cursor-pointer ${tags.includes(tag.value) ? tag.color : 'bg-muted'}`}
                >
                  {tag.label}
                </Badge>
              ))}
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">Log Win</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
