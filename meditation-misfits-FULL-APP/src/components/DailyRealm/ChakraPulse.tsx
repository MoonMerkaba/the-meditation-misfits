import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { invokeEdgeFunction } from '@/lib/edgeFunctionHelper';
import { Loader2 } from 'lucide-react';

const chakraColors = {
  root: '#E53E3E',
  sacral: '#ED8936',
  solar: '#ECC94B',
  heart: '#48BB78',
  throat: '#4299E1',
  third_eye: '#667EEA',
  crown: '#9F7AEA'
};

const chakraNames = {
  root: 'Root',
  sacral: 'Sacral',
  solar: 'Solar Plexus',
  heart: 'Heart',
  throat: 'Throat',
  third_eye: 'Third Eye',
  crown: 'Crown'
};

export function ChakraPulse() {
  const [pulse, setPulse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPulse();
  }, []);

  const loadPulse = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await invokeEdgeFunction('get-chakra-pulse', { user_id: user.id });
      if (!error && data) {
        setPulse(data);
      }
    } catch (err) {
      console.error('Error loading pulse:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIntensity = (level: string) => {
    switch(level) {
      case 'high': return 1;
      case 'medium': return 0.6;
      case 'low': return 0.3;
      default: return 0.5;
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </Card>
    );
  }

  if (!pulse) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-pink-500/30">
      <h3 className="text-xl font-bold mb-4 text-pink-300">Chakra Pulse</h3>
      <div className="space-y-3">
        {Object.keys(chakraNames).map((key) => (
          <div key={key} className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-full"
              style={{ 
                backgroundColor: chakraColors[key as keyof typeof chakraColors],
                opacity: getIntensity(pulse[key])
              }}
            />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{chakraNames[key as keyof typeof chakraNames]}</span>
                <span className="text-xs text-gray-400 capitalize">{pulse[key]}</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all"
                  style={{ 
                    width: `${getIntensity(pulse[key]) * 100}%`,
                    backgroundColor: chakraColors[key as keyof typeof chakraColors]
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
