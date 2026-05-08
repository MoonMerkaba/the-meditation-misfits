import { useState, useEffect } from 'react';
import { MeditationScriptGenerator } from '@/components/CustomMeditation/MeditationScriptGenerator';
import { GeneratedMeditationPlayer } from '@/components/CustomMeditation/GeneratedMeditationPlayer';
import { SavedMeditationsList } from '@/components/CustomMeditation/SavedMeditationsList';
import { CollectionCard } from '@/components/Collections/CollectionCard';
import { CreateCollectionModal } from '@/components/Collections/CreateCollectionModal';
import { CollectionPlayer } from '@/components/Collections/CollectionPlayer';
import { CollectionReorderModal } from '@/components/Collections/CollectionReorderModal';
import { CollectionDiscovery } from '@/components/Collections/CollectionDiscovery';
import { WeeklyRecommendations } from '@/components/Collections/WeeklyRecommendations';
import { SmartSuggestions } from '@/components/Collections/SmartSuggestions';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Sparkles, FolderPlus, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { invokeEdgeFunction } from '@/lib/edgeFunctionHelper';
import { toast } from 'sonner';


export default function CustomMeditationPage() {
  const navigate = useNavigate();
  const [currentMeditation, setCurrentMeditation] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [collections, setCollections] = useState<any[]>([]);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [collectionMeditations, setCollectionMeditations] = useState<any[]>([]);
  const [showCollectionPlayer, setShowCollectionPlayer] = useState(false);
  const [selectedCollectionName, setSelectedCollectionName] = useState('');
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('create');

  useEffect(() => { loadCollections(); }, []);

  const loadCollections = async () => {
    const { data } = await invokeEdgeFunction('list-meditation-collections');
    if (data?.collections) setCollections(data.collections);
  };

  const loadCollectionMeditations = async (collectionId: string) => {
    const { data } = await invokeEdgeFunction('get-collection-meditations', { collection_id: collectionId });
    if (data?.meditations) setCollectionMeditations(data.meditations);
  };

  const handlePlayCollection = async (collection: any) => {
    await loadCollectionMeditations(collection.id);
    setSelectedCollectionName(collection.name);
    setShowCollectionPlayer(true);
  };

  const handleReorderCollection = async (collection: any) => {
    await loadCollectionMeditations(collection.id);
    setSelectedCollectionId(collection.id);
    setSelectedCollectionName(collection.name);
    setShowReorderModal(true);
  };

  const handleReorderComplete = async () => {
    await loadCollectionMeditations(selectedCollectionId);
    await loadCollections();
  };


  const handleGenerated = (meditation: any) => {
    setCurrentMeditation(meditation);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSelectSaved = async (id: string) => {
    const { data } = await supabase.from('custom_meditations').select('*').eq('id', id).single();
    if (data) {
      await supabase.from('custom_meditations').update({ 
        play_count: (data.play_count || 0) + 1 
      }).eq('id', id);
      setCurrentMeditation({ title: data.title, duration_minutes: data.duration_minutes, sections: data.script_sections });
    }
  };

  const handleCreateFromRecommendation = async (recommendation: any) => {
    try {
      const { data, error } = await invokeEdgeFunction('create-meditation-collection', {
        name: recommendation.name,
        description: recommendation.description,
        theme: recommendation.theme,
        is_public: false
      });
      if (error) throw new Error(error);
      await loadCollections();
      setShowCreateCollection(false);
      toast.success(`Collection "${recommendation.name}" created!`);
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error('Failed to create collection');
    }
  };

  const handleGenerateFromSuggestion = async (suggestion: any) => {
    setCurrentMeditation({
      title: suggestion.title,
      duration_minutes: suggestion.duration,
      goal: suggestion.goal,
      theme: suggestion.theme
    });
    setActiveTab('create');
  };


  return (
    <div className="min-h-screen" style={{ background: '#000000' }}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-white hover:text-[#FF00BF]">
          <ArrowLeft className="w-4 h-4 mr-2" />Back
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-[#FF00BF]" />
          <h1 className="text-4xl font-bold text-white">AI Meditation Creator</h1>
        </div>
        <p className="text-lg text-[#A2A1A3] mb-8">Create personalized guided meditations</p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="collections">Collections ({collections.length})</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="recommendations">
              <Lightbulb className="w-4 h-4 mr-2" />
              Weekly Picks
            </TabsTrigger>
          </TabsList>


          <TabsContent value="create" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <MeditationScriptGenerator onGenerated={handleGenerated} />
                <SavedMeditationsList onSelect={handleSelectSaved} refreshTrigger={refreshTrigger} collections={collections} />
              </div>
              <div className="lg:sticky lg:top-8 h-fit">
                {currentMeditation ? <GeneratedMeditationPlayer meditation={currentMeditation} /> : (
                  <div className="bg-[#1a1a1a] border border-[#444343] rounded-lg p-12 text-center">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 text-[#FF00BF]" />
                    <h3 className="text-xl font-semibold mb-2 text-white">Your Meditation Will Appear Here</h3>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="collections" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">My Collections</h2>
              <Button onClick={() => setShowCreateCollection(true)} className="bg-[#FF00BF] hover:bg-[#FF00BF]/80 text-white"><FolderPlus className="w-4 h-4 mr-2" />New Collection</Button>
            </div>
            
            {collections.length === 0 ? (
              <Card className="border-dashed border-[#444343] bg-[#1a1a1a]">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FolderPlus className="h-16 w-16 text-[#444343] mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-white">No Collections Yet</h3>
                  <p className="text-sm text-[#A2A1A3] mb-4">Create your first collection to organize meditations</p>
                  <Button onClick={() => setShowCreateCollection(true)} className="bg-[#FF00BF] hover:bg-[#FF00BF]/80 text-white">
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Create Collection
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {collections.map((col) => (
                  <CollectionCard 
                    key={col.id} 
                    collection={col} 
                    onPlay={() => handlePlayCollection(col)} 
                    onView={() => handlePlayCollection(col)}
                    onReorder={() => handleReorderCollection(col)}
                  />
                ))}
              </div>
            )}

            {showSmartSuggestions && selectedCollectionId && (
              <div className="mt-8">
                <SmartSuggestions
                  collectionId={selectedCollectionId}
                  collectionName={selectedCollectionName}
                  onGenerateMeditation={handleGenerateFromSuggestion}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 text-white">Discover Community Collections</h2>
              <p className="text-[#A2A1A3]">Explore and clone meditation collections shared by the community</p>
            </div>
            <CollectionDiscovery />
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <WeeklyRecommendations onCreateCollection={handleCreateFromRecommendation} />
          </TabsContent>
        </Tabs>



        <CreateCollectionModal open={showCreateCollection} onOpenChange={setShowCreateCollection} onSuccess={loadCollections} />
        <CollectionPlayer open={showCollectionPlayer} onOpenChange={setShowCollectionPlayer} meditations={collectionMeditations} collectionName={selectedCollectionName} />
        <CollectionReorderModal 
          open={showReorderModal} 
          onOpenChange={setShowReorderModal}
          collectionId={selectedCollectionId}
          collectionName={selectedCollectionName}
          meditations={collectionMeditations}
          onReorderComplete={handleReorderComplete}
        />
      </div>
    </div>
  );
}
