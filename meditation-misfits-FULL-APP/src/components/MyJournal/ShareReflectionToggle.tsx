import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Share2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ShareReflectionToggleProps {
  reflectionId: string;
  frequencyName: string;
  frequencyHz: number;
  reflectionText: string;
  isShared: boolean;
  isAnonymous: boolean;
  onShareChange: (shared: boolean, anonymous: boolean) => void;
}

export function ShareReflectionToggle({
  reflectionId,
  frequencyName,
  frequencyHz,
  reflectionText,
  isShared,
  isAnonymous,
  onShareChange
}: ShareReflectionToggleProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [anonymous, setAnonymous] = useState(isAnonymous);
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { error } = await supabase.functions.invoke('share-reflection', {
        body: {
          action: 'share',
          reflectionId,
          frequencyName,
          frequencyHz,
          reflectionText,
          isAnonymous: anonymous
        }
      });

      if (error) throw error;

      onShareChange(true, anonymous);
      toast.success('Reflection shared with community!');
      setShowDialog(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to share reflection');
    } finally {
      setLoading(false);
    }
  };

  const handleUnshare = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { error } = await supabase.functions.invoke('share-reflection', {
        body: { action: 'unshare', reflectionId }
      });

      if (error) throw error;

      onShareChange(false, false);
      toast.success('Reflection removed from community');
    } catch (error: any) {
      toast.error(error.message || 'Failed to unshare reflection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={isShared ? "default" : "outline"}
        size="sm"
        onClick={() => isShared ? handleUnshare() : setShowDialog(true)}
        disabled={loading}
      >
        <Share2 className="w-4 h-4 mr-2" />
        {isShared ? 'Shared' : 'Share'}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Reflection with Community</DialogTitle>
            <DialogDescription>
              Share your reflection with the Freqyn community. You can choose to share anonymously.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {anonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <Label htmlFor="anonymous">Share Anonymously</Label>
              </div>
              <Switch
                id="anonymous"
                checked={anonymous}
                onCheckedChange={setAnonymous}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {anonymous 
                ? "Your name won't be shown. Only your reflection will be visible."
                : "Your username will be displayed with this reflection."}
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleShare} disabled={loading}>
              Share Reflection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
