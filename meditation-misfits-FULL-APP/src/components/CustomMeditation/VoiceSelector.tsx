import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Play } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface VoiceSelectorProps {
  selectedVoice: string | null;
  onVoiceChange: (voiceName: string) => void;
  pitch: number;
  onPitchChange: (pitch: number) => void;
}

export function VoiceSelector({ selectedVoice, onVoiceChange, pitch, onPitchChange }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (!selectedVoice && availableVoices.length > 0) {
        onVoiceChange(availableVoices[0].name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const previewVoice = (voiceName: string) => {
    window.speechSynthesis.cancel();
    const voice = voices.find(v => v.name === voiceName);
    if (!voice) return;

    const utterance = new SpeechSynthesisUtterance(
      'Welcome to your meditation. Take a deep breath and relax.'
    );
    utterance.voice = voice;
    utterance.pitch = pitch;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const categorizeVoices = () => {
    const categories: Record<string, SpeechSynthesisVoice[]> = {
      'Female': [],
      'Male': [],
      'Other': []
    };

    voices.forEach(voice => {
      const name = voice.name.toLowerCase();
      if (name.includes('female') || name.includes('woman') || name.includes('samantha') || 
          name.includes('victoria') || name.includes('karen') || name.includes('moira')) {
        categories['Female'].push(voice);
      } else if (name.includes('male') || name.includes('man') || name.includes('daniel') || 
                 name.includes('alex') || name.includes('fred')) {
        categories['Male'].push(voice);
      } else {
        categories['Other'].push(voice);
      }
    });

    return categories;
  };

  const categorizedVoices = categorizeVoices();

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <Label>Voice Selection</Label>
        <Select value={selectedVoice || ''} onValueChange={onVoiceChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {Object.entries(categorizedVoices).map(([category, voiceList]) => 
              voiceList.length > 0 && (
                <div key={category}>
                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                    {category}
                  </div>
                  {voiceList.map(voice => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </div>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Pitch: {pitch.toFixed(1)}</Label>
        <Slider 
          value={[pitch]} 
          onValueChange={(v) => onPitchChange(v[0])} 
          min={0.5} 
          max={2} 
          step={0.1} 
        />
      </div>

      {selectedVoice && (
        <Button 
          onClick={() => previewVoice(selectedVoice)} 
          variant="outline" 
          size="sm"
          className="w-full"
        >
          <Play className="w-4 h-4 mr-2" />
          Preview Voice
        </Button>
      )}
    </Card>
  );
}
