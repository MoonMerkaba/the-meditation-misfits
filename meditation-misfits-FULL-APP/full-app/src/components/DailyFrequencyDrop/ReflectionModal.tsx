import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { useReflections } from '@/hooks/useReflections';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  frequencyName: string;
  frequencyId: string;
  hzValue: number;
  onSave?: () => void;
}

const prompts = [
  "What softened or shifted during this session?",
  "What emotion felt lighter?",
  "What truth did you hear inside?",
  "What will you do differently today?"
];

export function ReflectionModal({ isOpen, onClose, frequencyName, frequencyId, hzValue, onSave }: ReflectionModalProps) {
  const [reflection, setReflection] = useState('');
  const { saveReflection, loading } = useReflections();
  const { isPremium } = useSubscription();
  const [prompt, setPrompt] = useState(() => prompts[Math.floor(Math.random() * prompts.length)]);
  const [aiPrompt, setAiPrompt] = useState<string | null>(null);
  const [generatingPrompt, setGeneratingPrompt] = useState(false);

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

      const { data, error } = await supabase.functions.invoke('generate-reflection-prompt', {
        body: {
          userId: user.id,
          frequencyName,
          frequencyHz: hzValue.toString()
        }
      });

      if (error) throw error;
      
      setAiPrompt(data.prompt);
      setPrompt(data.prompt);
      toast.success('AI prompt generated!', {
        description: 'Use this as inspiration for your reflection'
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


  const handleSave = async () => {
    if (reflection.trim()) {
      try {
        await saveReflection({
          frequency_id: frequencyId,
          frequency_name: frequencyName,
          hz_value: hzValue,
          text: reflection
        });
        setReflection('');
        onSave?.();
        onClose();
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const charCount = reflection.length;
  const maxChars = 2000;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-purple-500/30 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="h-6 w-6 text-purple-400" />
            Capture the Shift
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* AI Prompt Section */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-purple-300 text-lg font-medium">
                {prompt}
              </p>
              {aiPrompt && (
                <div className="mt-2 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                  <p className="text-sm text-purple-200 italic">{aiPrompt}</p>
                </div>
              )}
            </div>
            <Button
              onClick={handleGeneratePrompt}
              disabled={generatingPrompt}
              size="sm"
              variant="outline"
              className="border-purple-500/50 hover:bg-purple-900/30 shrink-0"
            >
              {generatingPrompt ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Prompt
                </>
              )}
            </Button>
          </div>


          <Textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Write a few honest lines to lock in today's insight…"
            className="min-h-[200px] bg-gray-800 border-purple-500/30 text-white resize-none"
            maxLength={maxChars}
          />

          <div className="flex justify-between items-center text-sm">
            <span className={`${charCount > maxChars * 0.9 ? 'text-yellow-400' : 'text-gray-400'}`}>
              {charCount} / {maxChars} characters
            </span>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Not this time
            </Button>
            <Button
              onClick={handleSave}
              disabled={!reflection.trim() || loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? 'Saving...' : 'Save to Journal'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

