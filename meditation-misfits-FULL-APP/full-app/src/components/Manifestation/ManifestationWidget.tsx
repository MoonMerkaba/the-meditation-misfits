import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Sparkles, TrendingUp, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ManifestationWidget() {
  const [intention, setIntention] = useState<any>(null);
  const [stats, setStats] = useState({ actions: 0, wins: 0, streak: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data } = await supabase.functions.invoke('list-intentions');
      const active = data?.intentions?.find((i: any) => i.status === 'active');
      if (active) {
        setIntention(active);
        const statsRes = await supabase.functions.invoke('get-intention-stats', {
          body: { intentionId: active.id }
        });
        if (statsRes.data) setStats(statsRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!intention) return null;

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold">Current Intention</h3>
        </div>
        <div className="text-2xl font-bold text-purple-600">{intention.resonance_score}</div>
      </div>
      
      <p className="text-sm font-medium mb-3">{intention.title}</p>
      
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">{stats.streak}</div>
          <div className="text-xs text-muted-foreground">Day Streak</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-pink-600">{stats.actions}</div>
          <div className="text-xs text-muted-foreground">Actions</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{stats.wins}</div>
          <div className="text-xs text-muted-foreground">Wins</div>
        </div>
      </div>

      <Button 
        onClick={() => navigate('/manifestation')} 
        size="sm" 
        className="w-full"
        variant="outline"
      >
        <Target className="w-4 h-4 mr-2" />
        View Details
      </Button>
    </Card>
  );
}
