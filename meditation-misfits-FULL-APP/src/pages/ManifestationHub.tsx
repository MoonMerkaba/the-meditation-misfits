import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { invokeEdgeFunction } from '@/lib/edgeFunctionHelper';
import { toast } from 'sonner';
import { Plus, Info } from 'lucide-react';
import { CreateIntentionModal } from '@/components/Manifestation/CreateIntentionModal';
import { ResonanceScoreRing } from '@/components/Manifestation/ResonanceScoreRing';
import { ActionQuickAdd } from '@/components/Manifestation/ActionQuickAdd';
import { ActionsList } from '@/components/Manifestation/ActionsList';
import { WinsListModal } from '@/components/Manifestation/WinsListModal';
import { WinsList } from '@/components/Manifestation/WinsList';
import { ResonanceDetailsDrawer } from '@/components/Manifestation/ResonanceDetailsDrawer';
import { SubscriptionModal } from '@/components/Premium/SubscriptionModal';
import { useSubscription } from '@/hooks/useSubscription';

export default function ManifestationHub() {
  const { isPremium } = useSubscription();
  const [intention, setIntention] = useState<any>(null);
  const [actions, setActions] = useState([]);
  const [wins, setWins] = useState([]);
  const [resonance, setResonance] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showResonanceDrawer, setShowResonanceDrawer] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const [intentionsRes, actionsRes, winsRes] = await Promise.all([
        invokeEdgeFunction('list-intentions'),
        invokeEdgeFunction('list-actions'),
        invokeEdgeFunction('list-wins')
      ]);

      const activeIntention = intentionsRes.data?.intentions?.[0];
      setIntention(activeIntention);
      setActions(actionsRes.data?.actions || []);
      setWins(winsRes.data?.wins || []);

      if (activeIntention) {
        const resData = await invokeEdgeFunction('get-resonance', { intention_id: activeIntention.id });
        setResonance(resData.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    if (intention && !isPremium) {
      setShowPaywall(true);
    } else {
      setShowCreate(true);
    }
  };

  const areaColors: Record<string, string> = {
    abundance: 'bg-yellow-500',
    love: 'bg-pink-500',
    health: 'bg-green-500',
    purpose: 'bg-purple-500',
    'self-trust': 'bg-indigo-500',
    custom: 'bg-blue-500'
  };

  return (
    <div className="min-h-screen" style={{ background: '#000000' }}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Manifestation Hub</h1>
            <p className="text-[#A2A1A3] mt-1">
              Set your intention. Take tiny aligned actions. Track your resonance.
            </p>
          </div>
          <Button onClick={handleCreateClick} size="lg" className="bg-[#FF00BF] hover:bg-[#FF00BF]/80 text-white">
            <Plus className="w-5 h-5 mr-2" />
            Create Intention
          </Button>
        </div>

        {loading ? (
          <p className="text-white">Loading...</p>
        ) : !intention ? (
          <Card className="p-12 text-center bg-[#1a1a1a] border-[#444343]">
            <p className="text-lg mb-4 text-white">No active intention yet. Start manifesting!</p>
            <Button onClick={() => setShowCreate(true)} size="lg" className="bg-[#FF00BF] hover:bg-[#FF00BF]/80 text-white">
              Create Your First Intention
            </Button>
          </Card>
        ) : (
          <>
            <Card className="p-6 bg-[#1a1a1a] border-[#444343]">
              <div className="flex items-start gap-6">
                <div className="cursor-pointer" onClick={() => setShowResonanceDrawer(true)}>
                  <ResonanceScoreRing score={resonance?.score || 0} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-white">{intention.title}</h2>
                    <Badge className={areaColors[intention.area]}>{intention.area}</Badge>
                  </div>
                  <p className="text-sm text-[#A2A1A3] mb-4">
                    {intention.north_star || 'No north star set'}
                    {intention.target_date && ` • Target: ${new Date(intention.target_date).toLocaleDateString()}`}
                  </p>
                  {resonance?.hint && (
                    <div className="flex items-start gap-2 p-3 bg-[#FF00BF]/10 rounded-lg text-sm border border-[#FF00BF]/20">
                      <Info className="w-4 h-4 mt-0.5 text-[#FF00BF] flex-shrink-0" />
                      <p className="text-[#A2A1A3]">{resonance.hint}</p>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => setShowWinModal(true)} size="sm" className="bg-[#6683A0] hover:bg-[#6683A0]/80 text-white">
                      Log Win / Sync
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-[#1a1a1a] border-[#444343]">
              <Tabs defaultValue="actions">
                <TabsList className="w-full">
                  <TabsTrigger value="actions" className="flex-1">Actions</TabsTrigger>
                  <TabsTrigger value="wins" className="flex-1">Wins & Syncs</TabsTrigger>
                </TabsList>
                <TabsContent value="actions" className="space-y-4 mt-4">
                  <div>
                    <p className="text-sm font-medium mb-2 text-white">What is one small aligned action you can take today?</p>
                    <ActionQuickAdd intentionId={intention.id} onActionAdded={loadData} />
                  </div>
                  <ActionsList actions={actions} />
                </TabsContent>
                <TabsContent value="wins" className="mt-4">
                  <WinsList wins={wins} />
                </TabsContent>
              </Tabs>
            </Card>
          </>
        )}
      </div>

      <CreateIntentionModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={loadData}
      />

      {intention && (
        <>
          <WinsListModal
            open={showWinModal}
            onClose={() => setShowWinModal(false)}
            intentionId={intention.id}
            onWinAdded={loadData}
          />
          {resonance && (
            <ResonanceDetailsDrawer
              open={showResonanceDrawer}
              onClose={() => setShowResonanceDrawer(false)}
              resonanceData={resonance}
            />
          )}
        </>
      )}

      <SubscriptionModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        title="Hold More Than One Intention"
        description="Free members can focus on one intention at a time. Go Premium to hold up to 5 active intentions with full tracking and Resonance insights."
      />
    </div>
  );
}
