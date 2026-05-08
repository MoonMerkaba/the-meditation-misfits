import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface LayerCardProps {
  layer: any;
  onUpdate: (updates: any) => void;
  onRemove: () => void;
}

export function LayerCard({ layer, onUpdate, onRemove }: LayerCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Select value={layer.type} onValueChange={(type) => onUpdate({ type })}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pure">Pure Tone</SelectItem>
            <SelectItem value="binaural">Binaural Beat</SelectItem>
            <SelectItem value="isochronic">Isochronic</SelectItem>
            <SelectItem value="noise">Noise</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {(layer.type === 'pure' || layer.type === 'isochronic') && (
        <div>
          <label className="text-sm text-white/70">Frequency: {layer.hz} Hz</label>
          <Slider
            value={[layer.hz]}
            onValueChange={([hz]) => onUpdate({ hz })}
            min={20}
            max={1000}
            step={1}
            className="mt-2"
          />
        </div>
      )}

      {layer.type === 'binaural' && (
        <>
          <div>
            <label className="text-sm text-white/70">Carrier: {layer.carrier_hz} Hz</label>
            <Slider
              value={[layer.carrier_hz]}
              onValueChange={([carrier_hz]) => onUpdate({ carrier_hz })}
              min={100}
              max={500}
              step={1}
              className="mt-2"
            />
          </div>
          <div>
            <label className="text-sm text-white/70">Beat: {layer.beat_hz} Hz</label>
            <Slider
              value={[layer.beat_hz]}
              onValueChange={([beat_hz]) => onUpdate({ beat_hz })}
              min={0.5}
              max={40}
              step={0.5}
              className="mt-2"
            />
          </div>
        </>
      )}

      {layer.type === 'noise' && (
        <Select value={layer.color} onValueChange={(color) => onUpdate({ color })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="white">White Noise</SelectItem>
            <SelectItem value="pink">Pink Noise</SelectItem>
            <SelectItem value="brown">Brown Noise</SelectItem>
          </SelectContent>
        </Select>
      )}

      <div>
        <label className="text-sm text-white/70">Volume: {Math.round(layer.gain * 100)}%</label>
        <Slider
          value={[layer.gain * 100]}
          onValueChange={([v]) => onUpdate({ gain: v / 100 })}
          min={0}
          max={100}
          step={1}
          className="mt-2"
        />
      </div>

      <div>
        <label className="text-sm text-white/70">Pan: {layer.pan > 0 ? 'R' : layer.pan < 0 ? 'L' : 'C'}</label>
        <Slider
          value={[layer.pan * 100]}
          onValueChange={([v]) => onUpdate({ pan: v / 100 })}
          min={-100}
          max={100}
          step={1}
          className="mt-2"
        />
      </div>
    </div>
  );
}
