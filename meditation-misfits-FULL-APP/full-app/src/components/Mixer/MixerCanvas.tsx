import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LayerCard } from './LayerCard';
import { PresetBrowser } from './PresetBrowser';
import { AudioEngine } from '@/lib/audioEngine';
import { Play, Pause, Plus, Save, FolderOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSubscription } from '@/hooks/useSubscription';


let engine: AudioEngine | null = null;

export function MixerCanvas() {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [playing, setPlaying] = useState(false);
  const [masterVol, setMasterVol] = useState(0.8);
  const [layers, setLayers] = useState<any[]>([
    { id: '1', type: 'pure', hz: 396, gain: 0.7, pan: 0, wave: 'sine' }
  ]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [isPublic, setIsPublic] = useState(false);


  useEffect(() => {
    return () => {
      if (engine) {
        engine.stopAll();
        engine = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (!engine) engine = new AudioEngine();
    
    if (playing) {
      engine.stopAll();
      setPlaying(false);
    } else {
      engine.setMasterVolume(masterVol);
      layers.forEach(layer => {
        engine!.addLayer(layer.id, layer);
      });
      engine.resume();
      setPlaying(true);
    }
  };

  const addLayer = () => {
    if (!isPremium && layers.length >= 2) {
      toast.error('Upgrade to Premium to use 3 layers');
      return;
    }
    const newLayer = {
      id: Date.now().toString(),
      type: 'pure',
      hz: 528,
      gain: 0.5,
      pan: 0,
      wave: 'sine'
    };
    setLayers([...layers, newLayer]);
  };

  const updateLayer = (id: string, updates: any) => {
    setLayers(layers.map(l => l.id === id ? { ...l, ...updates } : l));
    if (playing && engine) {
      engine.removeLayer(id);
      const updated = layers.find(l => l.id === id);
      if (updated) {
        engine.addLayer(id, { ...updated, ...updates });
      }
    }
  };

  const removeLayer = (id: string) => {
    setLayers(layers.filter(l => l.id !== id));
    if (engine) engine.removeLayer(id);
  };

  const savePreset = async () => {
    if (!user) return;
    
    const config = { master: { volume: masterVol }, layers };
    const { data, error } = await supabase.functions.invoke('save-mixer-preset', {
      body: { name: presetName, is_public: isPublic, config }
    });

    if (error || data?.error) {
      toast.error(data?.error || 'Failed to save preset');
    } else {
      toast.success('Preset saved!');
      setSaveOpen(false);
      setPresetName('');
    }
  };

  const loadPreset = (config: any) => {
    if (config.master) {
      setMasterVol(config.master.volume || 0.8);
    }
    if (config.layers) {
      setLayers(config.layers);
    }
    if (playing && engine) {
      engine.stopAll();
      setPlaying(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Frequency Mixer</h2>
        <div className="flex gap-2">
          <Button onClick={togglePlay} size="lg">
            {playing ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
            {playing ? 'Pause' : 'Play'}
          </Button>
          <Button onClick={() => setLoadOpen(true)} variant="outline">
            <FolderOpen className="h-4 w-4 mr-2" />
            Load
          </Button>
          <Button onClick={() => setSaveOpen(true)} variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>

        </div>
      </div>

      <div className="space-y-4">
        {layers.map(layer => (
          <LayerCard
            key={layer.id}
            layer={layer}
            onUpdate={(updates) => updateLayer(layer.id, updates)}
            onRemove={() => removeLayer(layer.id)}
          />
        ))}
      </div>

      <Button onClick={addLayer} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Layer {!isPremium && `(${layers.length}/2)`}
      </Button>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Preset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Preset name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
            />
            <div className="flex items-center space-x-2">
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              <Label>Share publicly</Label>
            </div>
            <Button onClick={savePreset} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <PresetBrowser 
        open={loadOpen} 
        onOpenChange={setLoadOpen} 
        onLoad={loadPreset}
      />
    </div>

  );
}
