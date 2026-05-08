import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { invokeEdgeFunction } from '@/lib/edgeFunctionHelper';
import { Loader2, Moon, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function DreamGate() {
  const [dreamText, setDreamText] = useState('');
  const [interpretation, setInterpretation] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await invokeEdgeFunction('interpret-dream', { user_id: user.id, action: 'history' });
      if (data) {
        setHistory(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  const interpretDream = async () => {
    if (!dreamText.trim() || loading) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await invokeEdgeFunction('interpret-dream', { user_id: user.id, dream_text: dreamText });
      if (!error && data) {
        setInterpretation(data);
        setDreamText('');
        loadHistory();
      } else {
        toast.error(error || 'Failed to interpret dream');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to interpret dream');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/30">
      <div className="flex items-center gap-2 mb-4">
        <Moon className="w-5 h-5 text-indigo-400" />
        <h3 className="text-xl font-bold text-indigo-300">Dream Gate</h3>
      </div>

      <Textarea
        value={dreamText}
        onChange={(e) => setDreamText(e.target.value)}
        placeholder="Describe your dream..."
        className="min-h-[100px] mb-4"
      />

      <Button onClick={interpretDream} disabled={loading || !dreamText.trim()} className="w-full mb-4">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
        Decode Dream
      </Button>

      {interpretation && (
        <div className="bg-indigo-900/30 p-4 rounded-lg mb-4">
          <h4 className="font-semibold mb-2">Interpretation</h4>
          <p className="text-sm text-gray-300 mb-3">{interpretation.interpretation}</p>
          {interpretation.key_symbols && interpretation.key_symbols.length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-semibold mb-1">Key Symbols</h5>
              <div className="flex flex-wrap gap-2">
                {interpretation.key_symbols.map((symbol: string, i: number) => (
                  <span key={i} className="text-xs bg-indigo-700/50 px-2 py-1 rounded">{symbol}</span>
                ))}
              </div>
            </div>
          )}
          {interpretation.suggested_ritual && (
            <div>
              <h5 className="text-sm font-semibold mb-1">Suggested Ritual</h5>
              <p className="text-sm text-gray-300">{interpretation.suggested_ritual}</p>
            </div>
          )}
        </div>
      )}

      <Button variant="outline" onClick={() => setShowHistory(!showHistory)} className="w-full">
        {showHistory ? 'Hide' : 'Show'} Past Dreams
      </Button>

      {showHistory && history.length > 0 && (
        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
          {history.map((dream) => (
            <div key={dream.id} className="bg-indigo-900/20 p-3 rounded text-sm">
              <p className="text-gray-400 text-xs mb-1">{new Date(dream.created_at).toLocaleDateString()}</p>
              <p className="text-gray-300">{dream.dream_text?.substring(0, 100)}...</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
