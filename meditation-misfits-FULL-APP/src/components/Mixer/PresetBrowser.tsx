import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Trash2, Download } from 'lucide-react';

interface PresetBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoad: (config: any) => void;
}

export function PresetBrowser({ open, onOpenChange, onLoad }: PresetBrowserProps) {
  const [myPresets, setMyPresets] = useState<any[]>([]);
  const [publicPresets, setPublicPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) loadPresets();
  }, [open]);

  const loadPresets = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('list-mixer-presets');
    if (error || data?.error) {
      toast.error('Failed to load presets');
    } else {
      setMyPresets(data.mine || []);
      setPublicPresets(data.public || []);
    }
    setLoading(false);
  };

  const handleLoad = (preset: any) => {
    onLoad(preset.config);
    toast.success(`Loaded "${preset.name}"`);
    onOpenChange(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.functions.invoke('delete-mixer-preset', {
      body: { id }
    });
    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success('Preset deleted');
      loadPresets();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Load Preset</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">My Presets</h3>
              {myPresets.length === 0 ? (
                <p className="text-sm text-muted-foreground">No saved presets</p>
              ) : (
                <div className="space-y-2">
                  {myPresets.map(preset => (
                    <div key={preset.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{preset.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {preset.config?.layers?.length || 0} layers
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleLoad(preset)}>
                          <Download className="h-4 w-4 mr-1" />
                          Load
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(preset.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-3">Community Presets</h3>
              {publicPresets.length === 0 ? (
                <p className="text-sm text-muted-foreground">No public presets</p>
              ) : (
                <div className="space-y-2">
                  {publicPresets.map(preset => (
                    <div key={preset.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{preset.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {preset.config?.layers?.length || 0} layers
                        </p>
                      </div>
                      <Button size="sm" onClick={() => handleLoad(preset)}>
                        <Download className="h-4 w-4 mr-1" />
                        Load
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
