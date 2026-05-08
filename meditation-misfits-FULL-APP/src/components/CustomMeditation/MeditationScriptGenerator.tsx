import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface MeditationScriptGeneratorProps {
  onGenerated: (meditation: any) => void;
}

export function MeditationScriptGenerator({ onGenerated }: MeditationScriptGeneratorProps) {
  const [mood, setMood] = useState('');
  const [intention, setIntention] = useState('');
  const [duration, setDuration] = useState([10]);
  const [style, setStyle] = useState('');
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!mood || !intention) {
      toast.error('Please select a mood and enter an intention');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-meditation-script', {
        body: {
          mood,
          intention,
          duration_minutes: duration[0],
          style,
          additional_notes: notes,
        },
      });

      if (error) throw error;

      toast.success('Meditation script generated!');
      onGenerated(data.meditation);
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate meditation');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Create Your Custom Meditation
        </h3>
        <p className="text-sm text-muted-foreground">
          Tell us how you're feeling and what you need. We'll create a personalized guided meditation just for you.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>How are you feeling right now?</Label>
          <Select value={mood} onValueChange={setMood}>
            <SelectTrigger>
              <SelectValue placeholder="Select your mood..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anxious">Anxious or Overwhelmed</SelectItem>
              <SelectItem value="stressed">Stressed or Tense</SelectItem>
              <SelectItem value="sad">Sad or Heavy</SelectItem>
              <SelectItem value="scattered">Scattered or Unfocused</SelectItem>
              <SelectItem value="tired">Tired or Depleted</SelectItem>
              <SelectItem value="restless">Restless or Agitated</SelectItem>
              <SelectItem value="numb">Numb or Disconnected</SelectItem>
              <SelectItem value="hopeful">Hopeful but Uncertain</SelectItem>
              <SelectItem value="calm">Calm and Open</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>What's your intention?</Label>
          <Textarea
            placeholder="e.g., I want to feel more grounded and safe in my body..."
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Duration: {duration[0]} minutes</Label>
          <Slider
            value={duration}
            onValueChange={setDuration}
            min={5}
            max={20}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label>Meditation Style</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a style..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grounding">Grounding & Body-Based</SelectItem>
              <SelectItem value="breathwork">Breathwork & Regulation</SelectItem>
              <SelectItem value="visualization">Visualization & Imagery</SelectItem>
              <SelectItem value="loving-kindness">Loving-Kindness & Self-Compassion</SelectItem>
              <SelectItem value="shadow-work">Shadow Work & Integration</SelectItem>
              <SelectItem value="energy">Energy & Chakra Balancing</SelectItem>
              <SelectItem value="sleep">Sleep & Deep Rest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Additional Notes (Optional)</Label>
          <Textarea
            placeholder="Anything else we should know? (e.g., I have aphantasia, I'm in recovery, I need extra grounding...)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !mood || !intention}
        className="w-full"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Your Meditation...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Meditation
          </>
        )}
      </Button>
    </Card>
  );
}
