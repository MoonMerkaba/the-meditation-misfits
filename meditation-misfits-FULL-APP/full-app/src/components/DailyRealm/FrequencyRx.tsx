import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { invokeEdgeFunction } from '@/lib/edgeFunctionHelper';
import { Loader2, Play, Clock } from 'lucide-react';

export function FrequencyRx() {
  const [rx, setRx] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRx();
  }, []);

  const loadRx = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await invokeEdgeFunction('get-frequency-rx', { user_id: user.id });
      if (!error && data) {
        setRx(data);
      }
    } catch (err) {
      console.error('Error loading frequency rx:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-green-900/20 to-teal-900/20">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </Card>
    );
  }

  if (!rx) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-green-900/20 to-teal-900/20 border-teal-500/30">
      <h3 className="text-xl font-bold mb-4 text-teal-300">Frequency RX of the Day</h3>
      
      <div className="space-y-3 mb-4">
        <div>
          <span className="text-sm text-gray-400">Goal</span>
          <p className="font-semibold text-teal-200">{rx.goal}</p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Clock className="w-4 h-4" />
          <span>{rx.duration} minutes</span>
        </div>
        
        <div>
          <span className="text-sm text-gray-400">Purpose</span>
          <p className="text-sm text-gray-300">{rx.purpose}</p>
        </div>
      </div>

      <Button 
        onClick={() => window.open(rx.freq_url, '_blank')}
        className="w-full bg-teal-600 hover:bg-teal-700"
      >
        <Play className="w-4 h-4 mr-2" />
        Play Frequency Mix
      </Button>
    </Card>
  );
}
