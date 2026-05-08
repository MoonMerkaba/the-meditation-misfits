import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { invokeEdgeFunction } from '@/lib/edgeFunctionHelper';
import { Loader2 } from 'lucide-react';

export function TarotCard() {
  const [tarot, setTarot] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTarot();
  }, []);

  const loadTarot = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await invokeEdgeFunction('get-daily-tarot', { user_id: user.id });
      if (!error && data) {
        setTarot(data);
      }
    } catch (err) {
      console.error('Error loading tarot:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-indigo-900/20">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </Card>
    );
  }

  if (!tarot) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/30">
      <h3 className="text-xl font-bold mb-4 text-purple-300">Tarot of the Day</h3>
      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold mb-1">{tarot.card_name}</h4>
          <p className="text-xs text-purple-300 mb-2">{tarot.arcana_type} Arcana</p>
          {tarot.keywords && (
            <div className="flex gap-2 mb-3">
              {tarot.keywords.map((kw: string, i: number) => (
                <span key={i} className="text-xs bg-purple-500/20 px-2 py-1 rounded">{kw}</span>
              ))}
            </div>
          )}
          <p className="text-sm text-gray-300 mb-3">{tarot.short_vibe}</p>
          <p className="text-sm text-gray-200 mb-3">{expanded ? tarot.main_message : tarot.main_message?.slice(0, 100) + '...'}</p>
          {expanded && (
            <>
              <p className="text-sm text-yellow-200 mb-3"><strong>Shadow Invitation:</strong> {tarot.shadow_invitation}</p>
              <p className="text-sm text-green-200"><strong>Journal Prompt:</strong> {tarot.journal_prompt}</p>
            </>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-purple-400 hover:text-purple-300 mt-2"
          >
            {expanded ? 'Show Less' : 'More Insight'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
