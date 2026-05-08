import { useState, useEffect } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { invokeEdgeFunction } from '@/lib/edgeFunctionHelper';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ReflectionCard } from './ReflectionCard';
import { JournalFilters } from './JournalFilters';
import { JournalEntry } from './JournalEntry';
import { EmotionalTrendChart } from './EmotionalTrendChart';
import { ReflectionModal } from '@/components/DailyFrequencyDrop/ReflectionModal';
import { SubscriptionModal } from '@/components/Premium/SubscriptionModal';
import { toast } from 'sonner';


const FREE_REFLECTION_LIMIT = 30;

export function MyJournalPage() {
  const { user } = useAuth();
  const [reflections, setReflections] = useState<any[]>([]);
  const [filteredReflections, setFilteredReflections] = useState<any[]>([]);
  const [intentions, setIntentions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('all');
  const [selectedIntention, setSelectedIntention] = useState('all');
  const [selectedReflection, setSelectedReflection] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    filterReflections();
  }, [reflections, searchQuery, selectedFrequency, selectedIntention]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadReflections(), loadIntentions(), checkPremium()]);
    setLoading(false);
  };

  const loadReflections = async () => {
    const { data, error } = await invokeEdgeFunction('list-reflections');
    if (!error && data?.reflections) {
      setReflections(data.reflections);
    } else if (!error && Array.isArray(data)) {
      setReflections(data);
    }
  };

  const loadIntentions = async () => {
    const { data, error } = await invokeEdgeFunction('list-intentions');
    if (!error && data?.intentions) {
      setIntentions(data.intentions);
    }
  };

  const checkPremium = async () => {
    try {
      const { data } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user?.id)
        .single();
      setIsPremium(data?.status === 'active' || data?.status === 'trialing');
    } catch {
      // Not premium
    }
  };

  const filterReflections = () => {
    let filtered = [...reflections];
    if (searchQuery) {
      filtered = filtered.filter(r => r.text?.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedFrequency !== 'all') {
      filtered = filtered.filter(r => r.frequency_name?.includes(selectedFrequency));
    }
    if (selectedIntention !== 'all') {
      filtered = filtered.filter(r => r.intention_id === selectedIntention);
    }
    setFilteredReflections(filtered);
  };

  const handleAddReflection = () => {
    if (!isPremium && reflections.length >= FREE_REFLECTION_LIMIT) {
      setShowPaywall(true);
    } else {
      setShowAddModal(true);
    }
  };

  const handleSaveReflection = async (id: string, text: string, tags: string[], intentionId: string | null) => {
    const { error } = await invokeEdgeFunction('update-reflection', {
      id, text, tags, intention_id: intentionId
    });
    if (!error) {
      toast.success('Reflection updated');
      loadReflections();
    } else {
      toast.error(error);
    }
  };

  const handleDeleteReflection = async (id: string) => {
    const { error } = await invokeEdgeFunction('delete-reflection', { id });
    if (!error) {
      toast.success('Reflection deleted');
      loadReflections();
    } else {
      toast.error(error);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ background: '#000000' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3" style={{ color: '#FFFFFF' }}>
              <BookOpen className="h-10 w-10" style={{ color: '#FF00BF' }} />
              Reflection Journal
            </h1>
            <p style={{ color: '#A2A1A3' }}>Capture what shifted, what softened, and what you're remembering.</p>
          </div>
          <Button onClick={handleAddReflection} size="lg" className="gap-2" style={{ background: '#FF00BF', color: '#FFFFFF' }}>
            <Plus className="h-5 w-5" />
            Add Reflection
          </Button>
        </div>

        <JournalFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedFrequency={selectedFrequency}
          onFrequencyChange={setSelectedFrequency}
          selectedIntention={selectedIntention}
          onIntentionChange={setSelectedIntention}
          intentions={intentions}
        />

        {/* Emotional Trend Chart - Premium Feature */}
        {reflections.length >= 3 && (
          <div className="mb-6">
            <EmotionalTrendChart reflections={reflections} />
          </div>
        )}


        {loading ? (
          <div className="text-center py-12" style={{ color: '#A2A1A3' }}>Loading reflections...</div>
        ) : filteredReflections.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: '#A2A1A3' }} className="mb-4">
              {reflections.length === 0 
                ? "Your reflections will appear here as you tune in and write. Let each session tell your story."
                : "No reflections match your filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReflections.map((reflection) => (
              <ReflectionCard
                key={reflection.id}
                id={reflection.id}
                date={reflection.created_at}
                frequency={reflection.frequency_name || 'Unknown'}
                text={reflection.text}
                tags={reflection.tags}
                onClick={() => setSelectedReflection(reflection)}
                onDelete={() => handleDeleteReflection(reflection.id)}
              />
            ))}
          </div>
        )}

        <JournalEntry
          isOpen={!!selectedReflection}
          onClose={() => setSelectedReflection(null)}
          reflection={selectedReflection}
          intentions={intentions}
          onSave={handleSaveReflection}
          onDelete={handleDeleteReflection}
        />

        <ReflectionModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={loadReflections}
          frequencyName="Manual Entry"
        />

        <SubscriptionModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          message="You've filled your free journal pages. Go Premium for unlimited reflections and emotional insights."
        />
      </div>
    </div>
  );
}
