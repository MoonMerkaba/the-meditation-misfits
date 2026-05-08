import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface SessionRequest {
  goal: 'calm' | 'focus' | 'sleep' | 'uplift' | 'abundance' | 'healing';
  minutes: number;
  headphones: boolean;
  sensitivity: 'high' | 'medium' | 'low';
}

interface Props {
  onStartSession: (request: SessionRequest) => void;
}

const quickStarters = [
  { label: "Calm (10 min, headphones)", goal: 'calm', minutes: 10, headphones: true },
  { label: "Deep Focus (15 min)", goal: 'focus', minutes: 15, headphones: true },
  { label: "Fall Asleep (8 min)", goal: 'sleep', minutes: 8, headphones: false },
  { label: "Abundance Tune", goal: 'abundance', minutes: 10, headphones: true },
  { label: "Healing (sensitive)", goal: 'healing', minutes: 10, headphones: true, sensitivity: 'high' }
];

const ConversationStarters: React.FC<Props> = ({ onStartSession }) => {
  const [customRequest, setCustomRequest] = useState<Partial<SessionRequest>>({
    minutes: 10,
    headphones: true,
    sensitivity: 'medium'
  });

  const handleQuickStart = (starter: any) => {
    console.log('Quick start clicked:', starter);
    const request: SessionRequest = {
      goal: starter.goal,
      minutes: starter.minutes,
      headphones: starter.headphones,
      sensitivity: starter.sensitivity || 'medium'
    };
    console.log('Calling onStartSession with:', request);
    onStartSession(request);
  };

  const handleCustomStart = () => {
    console.log('Custom start clicked:', customRequest);
    if (customRequest.goal) {
      console.log('Calling onStartSession with custom request');
      onStartSession(customRequest as SessionRequest);
    } else {
      console.log('No goal selected, cannot start');
    }
  };


  return (
    <div className="space-y-6">
      <Card className="bg-black/30 border-purple-500 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-purple-300">Quick Resonance Starters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {quickStarters.map((starter, index) => (
              <Button
                key={index}
                variant="outline"
                className="border-purple-400 text-purple-300 hover:bg-purple-800 justify-start"
                onClick={() => handleQuickStart(starter)}
              >
                {starter.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/30 border-indigo-500 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-indigo-300">Custom Frequency Attunement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-300">Resonance Goal</Label>
            <Select value={customRequest.goal} onValueChange={(value) => setCustomRequest({...customRequest, goal: value as any})}>
              <SelectTrigger className="bg-black/50 border-indigo-400">
                <SelectValue placeholder="Choose your path..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="calm">Calm - Aquamarine Serenity</SelectItem>
                <SelectItem value="focus">Focus - Crystalline Clarity</SelectItem>
                <SelectItem value="sleep">Sleep - Midnight Velvet</SelectItem>
                <SelectItem value="uplift">Uplift - Golden Ascension</SelectItem>
                <SelectItem value="abundance">Abundance - Emerald Prosperity</SelectItem>
                <SelectItem value="healing">Healing - Rose Quartz Restoration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-300">Duration (minutes)</Label>
            <Input
              type="number"
              min="5"
              max="60"
              value={customRequest.minutes}
              onChange={(e) => setCustomRequest({...customRequest, minutes: parseInt(e.target.value)})}
              className="bg-black/50 border-indigo-400"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-gray-300">Headphones Available</Label>
            <Switch
              checked={customRequest.headphones}
              onCheckedChange={(checked) => setCustomRequest({...customRequest, headphones: checked})}
            />
          </div>

          <div>
            <Label className="text-gray-300">Sensitivity Level</Label>
            <Select value={customRequest.sensitivity} onValueChange={(value) => setCustomRequest({...customRequest, sensitivity: value as any})}>
              <SelectTrigger className="bg-black/50 border-indigo-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High - Gentle frequencies</SelectItem>
                <SelectItem value="medium">Medium - Balanced intensity</SelectItem>
                <SelectItem value="low">Low - Strong resonance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleCustomStart}
            disabled={!customRequest.goal}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            Begin Freqynosis
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversationStarters;