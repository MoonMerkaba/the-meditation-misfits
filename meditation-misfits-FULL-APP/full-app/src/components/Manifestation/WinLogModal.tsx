import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { SocialShareButtons } from '@/components/Social/SocialShareButtons';
import { sendMilestoneEmail, MILESTONES } from '@/lib/emailNotifications';
import { useAuth } from '@/contexts/AuthContext';


interface WinLogModalProps {
  open: boolean;
  onClose: () => void;
  intentionId: string;
  intentionTitle: string;
}

export function WinLogModal({ open, onClose, intentionId, intentionTitle }: WinLogModalProps) {
  const [winDescription, setWinDescription] = useState('');
  const [winType, setWinType] = useState('win');
  const [sharePublic, setSharePublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showShare, setShowShare] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke('log-win', {
        body: { intention_id: intentionId, win_description: winDescription, win_type: winType }
      });

      if (error) throw error;

      const points = winType === 'breakthrough' ? 25 : winType === 'milestone' ? 20 : 15;
      toast.success(`Win logged! +${points} Resonance`);
      
      if (sharePublic) {
        setShowShare(true);
      } else {
        setWinDescription('');
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to log win');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Celebrate: {intentionTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Type</Label>
            <Select value={winType} onValueChange={setWinType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="win">Win (+15)</SelectItem>
                <SelectItem value="sync">Synchronicity (+15)</SelectItem>
                <SelectItem value="milestone">Milestone (+20)</SelectItem>
                <SelectItem value="breakthrough">Breakthrough (+25)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>What happened?</Label>
            <Textarea
              value={winDescription}
              onChange={(e) => setWinDescription(e.target.value)}
              placeholder="Describe your win or synchronicity..."
              rows={4}
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="share-public">Share to social media</Label>
            <Switch
              id="share-public"
              checked={sharePublic}
              onCheckedChange={setSharePublic}
            />
          </div>
          
          {showShare && winDescription && (
            <div className="pt-2">
              <SocialShareButtons text={winDescription} type="win" />
            </div>
          )}
          
          <Button type="submit" disabled={loading} className="w-full">
            Log Win
          </Button>

        </form>
      </DialogContent>
    </Dialog>
  );
}