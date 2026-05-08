import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BreathCanvas } from './BreathCanvas';
import { Play, Pause } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const patterns = {
  box: { name: 'Box (4-4-4-4)', inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  '478': { name: '4-7-8 Relaxation', inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  coherent: { name: 'Coherent (5-5)', inhale: 5, hold1: 0, exhale: 5, hold2: 0 },
  energize: { name: 'Energize (3-0-3-0)', inhale: 3, hold1: 0, exhale: 3, hold2: 0 }
};

export function BreathPanel() {
  const [isActive, setIsActive] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<keyof typeof patterns>('box');
  const [showLabels, setShowLabels] = useState(true);
  const [currentPhase, setCurrentPhase] = useState('');

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl border border-white/10">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Breath Visualizer</h2>
        <p className="text-white/70 text-sm">Breathe with the light. Inhale as it grows, exhale as it softens.</p>
      </div>

      <div className="flex items-center justify-between">
        <Select value={selectedPattern} onValueChange={(v: any) => setSelectedPattern(v)}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(patterns).map(([key, { name }]) => (
              <SelectItem key={key} value={key}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={() => setIsActive(!isActive)} size="lg">
          {isActive ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
          {isActive ? 'Pause' : 'Start'}
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Switch checked={showLabels} onCheckedChange={setShowLabels} />
        <Label>Show phase labels</Label>
      </div>

      <BreathCanvas
        pattern={patterns[selectedPattern]}
        isActive={isActive}
        onPhaseChange={setCurrentPhase}
      />

      {showLabels && isActive && (
        <div className="text-center">
          <p className="text-2xl font-light text-white/90">{currentPhase}</p>
        </div>
      )}
    </div>
  );
}
