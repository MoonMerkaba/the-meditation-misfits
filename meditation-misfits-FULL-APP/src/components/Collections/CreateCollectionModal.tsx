import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface CreateCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const THEME_COLORS = [
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Teal', value: '#14B8A6' },
];

export function CreateCollectionModal({ open, onOpenChange, onSuccess }: CreateCollectionModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [themeColor, setThemeColor] = useState('#8B5CF6');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a collection name');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-meditation-collection', {
        body: { name, description, is_public: isPublic, theme_color: themeColor }
      });

      if (error) throw error;

      toast.success('Collection created!');
      setName('');
      setDescription('');
      setIsPublic(false);
      setThemeColor('#8B5CF6');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create collection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Collection</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Collection Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Routine"
            />
          </div>
          <div>
            <Label>Description (Optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this collection for?"
              rows={3}
            />
          </div>
          <div>
            <Label>Theme Color</Label>
            <div className="flex gap-2 mt-2">
              {THEME_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setThemeColor(color.value)}
                  className="w-10 h-10 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: color.value,
                    borderColor: themeColor === color.value ? '#fff' : 'transparent',
                    boxShadow: themeColor === color.value ? '0 0 0 2px rgba(0,0,0,0.3)' : 'none'
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Make Public</Label>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
          <Button onClick={handleCreate} disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create Collection'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}