import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Save, Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';


interface JournalEntryProps {
  isOpen: boolean;
  onClose: () => void;
  reflection: {
    id: string;
    date: string;
    frequency: string;
    text: string;
    tags?: string[];
    intention_id?: string;
  } | null;
  intentions: Array<{ id: string; title: string }>;
  onSave: (id: string, text: string, tags: string[], intentionId: string | null) => void;
  onDelete: (id: string) => void;
}

export function JournalEntry({ isOpen, onClose, reflection, intentions, onSave, onDelete }: JournalEntryProps) {
  const { isPremium } = useSubscription();
  const [text, setText] = useState(reflection?.text || '');
  const [tagInput, setTagInput] = useState(reflection?.tags?.join(', ') || '');
  const [intentionId, setIntentionId] = useState(reflection?.intention_id || 'none');
  const [aiPrompt, setAiPrompt] = useState<string | null>(null);
  const [generatingPrompt, setGeneratingPrompt] = useState(false);

  if (!reflection) return null;

  const handleGeneratePrompt = async () => {
    if (!isPremium) {
      toast.error('AI Prompts are a Premium feature', {
        description: 'Upgrade to unlock personalized journaling prompts'
      });
      return;
    }

    setGeneratingPrompt(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Extract frequency Hz from frequency string (e.g., "528 Hz - Love" -> "528")
      const hzMatch = reflection.frequency.match(/(\d+)\s*Hz/);
      const frequencyHz = hzMatch ? hzMatch[1] : '528';

      const { data, error } = await supabase.functions.invoke('generate-reflection-prompt', {
        body: {
          userId: user.id,
          frequencyName: reflection.frequency,
          frequencyHz
        }
      });

      if (error) throw error;
      
      setAiPrompt(data.prompt);
      toast.success('AI prompt generated!', {
        description: 'Use this as inspiration for deeper reflection'
      });
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast.error('Failed to generate prompt', {
        description: 'Please try again'
      });
    } finally {
      setGeneratingPrompt(false);
    }
  };

  const handleSave = () => {
    const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
    onSave(reflection.id, text, tags, intentionId === 'none' ? null : intentionId);
    onClose();
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reflection Entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Input value={new Date(reflection.date).toLocaleDateString()} disabled />
            </div>
            <div>
              <Label>Frequency</Label>
              <Input value={reflection.frequency} disabled />
            </div>
          </div>
          
          {/* AI Prompt Generator Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Need inspiration?</Label>
              <Button
                onClick={handleGeneratePrompt}
                disabled={generatingPrompt}
                size="sm"
                variant="outline"
                className="border-purple-500/50 hover:bg-purple-900/30"
              >
                {generatingPrompt ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI Prompt
                  </>
                )}
              </Button>
            </div>
            {aiPrompt && (
              <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                <p className="text-sm text-purple-200 leading-relaxed">{aiPrompt}</p>
              </div>
            )}
          </div>

          <div>
            <Label>Reflection</Label>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} />
          </div>

          <div>
            <Label>Tags (comma-separated)</Label>
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="clarity, release, love" />
          </div>
          <div>
            <Label>Link to Intention</Label>
            <Select value={intentionId} onValueChange={setIntentionId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No intention</SelectItem>
                {intentions.map(int => (
                  <SelectItem key={int.id} value={int.id}>{int.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between pt-4">
            <Button variant="destructive" onClick={() => { onDelete(reflection.id); onClose(); }}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
          <p className="text-xs text-gray-400 text-center">
            Private to you. No one else can view or access your reflections.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}