import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { invokeEdgeFunction } from '@/lib/edgeFunctionHelper';
import { toast } from 'sonner';
import { CreateIntentionModal } from './CreateIntentionModal';
import { IntentionCard } from './IntentionCard';
import { DailyPulseModal } from './DailyPulseModal';
import { WinLogModal } from './WinLogModal';
import { Sparkles, Plus } from 'lucide-react';

export function ManifestationTracker() {
  const [intentions, setIntentions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedIntention, setSelectedIntention] = useState<any>(null);
  const [showPulse, setShowPulse] = useState(false);
  const [showWin, setShowWin] = useState(false);

  useEffect(() => {
    loadIntentions();
  }, []);

  const loadIntentions = async () => {
    try {
      const { data, error } = await invokeEdgeFunction('list-intentions');
      if (error) {
        toast.error(error);
      } else {
        setIntentions(data?.intentions || []);
      }
    } catch (err: any) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIntention = async () => {
    await loadIntentions();
  };

  return (
    <div className="min-h-screen p-6" style={{ background: '#000000' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-2" style={{ color: '#FFFFFF' }}>
              <Sparkles className="w-8 h-8" style={{ color: '#FF00BF' }} />
              Manifestation Tracker
            </h1>
            <p className="mt-2" style={{ color: '#A2A1A3' }}>Set intentions. Take action. Celebrate wins.</p>
          </div>
          <Button onClick={() => setShowCreate(true)} size="lg" style={{ background: '#FF00BF', color: '#FFFFFF' }}>
            <Plus className="w-5 h-5 mr-2" />
            New Intention
          </Button>
        </div>

        {loading ? (
          <p style={{ color: '#A2A1A3' }}>Loading...</p>
        ) : intentions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg mb-4" style={{ color: '#A2A1A3' }}>No intentions yet. Start manifesting!</p>
            <Button onClick={() => setShowCreate(true)} style={{ background: '#FF00BF', color: '#FFFFFF' }}>Create Your First Intention</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {intentions.map((intention) => (
              <IntentionCard
                key={intention.id}
                intention={intention}
                onLogAction={() => {
                  setSelectedIntention(intention);
                  setShowPulse(true);
                }}
                onLogWin={() => {
                  setSelectedIntention(intention);
                  setShowWin(true);
                }}
                onViewDetails={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      <CreateIntentionModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreateIntention}
      />

      {selectedIntention && (
        <>
          <DailyPulseModal
            open={showPulse}
            onClose={() => setShowPulse(false)}
            intentionId={selectedIntention.id}
            intentionTitle={selectedIntention.title}
          />
          <WinLogModal
            open={showWin}
            onClose={() => setShowWin(false)}
            intentionId={selectedIntention.id}
            intentionTitle={selectedIntention.title}
          />
        </>
      )}
    </div>
  );
}
