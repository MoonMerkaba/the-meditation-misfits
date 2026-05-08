import React, { useState, useEffect } from 'react';
import { GuidedMeditation, MeditationCategory, MeditationProgress } from '@/types/meditation';
import { fetchCategories, fetchMeditations, fetchUserProgress } from '@/lib/meditation';
import { CategoryFilter } from './CategoryFilter';
import { MeditationCard } from './MeditationCard';
import { MeditationPlayer } from './MeditationPlayer';
import { MeditationStatsDashboard } from './MeditationStatsDashboard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Upload, BarChart2, Library } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';

export const MeditationLibrary: React.FC = () => {
  const [categories, setCategories] = useState<MeditationCategory[]>([]);
  const [meditations, setMeditations] = useState<GuidedMeditation[]>([]);
  const [filteredMeditations, setFilteredMeditations] = useState<GuidedMeditation[]>([]);
  const [progress, setProgress] = useState<MeditationProgress[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeditation, setSelectedMeditation] = useState<GuidedMeditation | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('library');
  const { user } = useAuth();
  const { isPremium } = useSubscription();

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    filterMeditations();
  }, [meditations, selectedCategory, selectedDuration, selectedDifficulty, searchQuery]);

  const loadData = async () => {
    try {
      const [cats, meds] = await Promise.all([
        fetchCategories(),
        fetchMeditations()
      ]);
      setCategories(cats);
      setMeditations(meds);
      
      if (user) {
        const prog = await fetchUserProgress(user.id);
        setProgress(prog);
      }
    } catch (error) {
      console.error('Error loading meditation data:', error);
    }
  };

  const filterMeditations = () => {
    let filtered = [...meditations];

    if (selectedCategory) {
      filtered = filtered.filter(m => m.category_id === selectedCategory);
    }

    if (selectedDuration !== 'all') {
      filtered = filtered.filter(m => m.duration === parseInt(selectedDuration));
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(m => m.difficulty === selectedDifficulty);
    }

    if (searchQuery) {
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredMeditations(filtered);
  };

  const handlePlayMeditation = (meditation: GuidedMeditation) => {
    setSelectedMeditation(meditation);
    setIsPlayerOpen(true);
  };

  const isCompleted = (meditationId: string) => {
    return progress.some(p => p.meditation_id === meditationId && p.completed);
  };

  return (
    <div className="min-h-screen pt-20 pb-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Guided Meditation Library</h1>
          <p className="text-white/70">Explore our collection of guided meditations and track your journey</p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/10 border-white/20">
            <TabsTrigger value="library" className="data-[state=active]:bg-purple-600">
              <Library className="w-4 h-4 mr-2" />
              Library
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-purple-600">
              <BarChart2 className="w-4 h-4 mr-2" />
              My Stats
            </TabsTrigger>
          </TabsList>

          {/* Library Tab */}
          <TabsContent value="library" className="mt-6">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                <Input
                  placeholder="Search meditations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Durations</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="20">20 minutes</SelectItem>
                  <SelectItem value="25">25 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isPremium && (
              <div className="mb-6">
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Custom Meditation
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMeditations.map((meditation) => (
                <MeditationCard
                  key={meditation.id}
                  meditation={meditation}
                  onPlay={handlePlayMeditation}
                  isCompleted={isCompleted(meditation.id)}
                />
              ))}
            </div>

            {filteredMeditations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-white/60 text-lg">No meditations found matching your criteria</p>
              </div>
            )}
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="mt-6">
            <MeditationStatsDashboard />
          </TabsContent>
        </Tabs>
      </div>

      <MeditationPlayer
        meditation={selectedMeditation}
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
      />
    </div>
  );
};
