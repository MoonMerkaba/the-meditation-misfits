import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Search, Sparkles, Droplets, Moon, Heart, 
  AlertTriangle, Check, Trash2, Edit, Wand2, X, ImageIcon
} from 'lucide-react';
import { 
  getCrystalCollection, addCrystalToCollection, updateCrystal, 
  deleteCrystal, markCrystalCleansed, getCrystalSuggestions, identifyCrystal 
} from '@/lib/dailyRitual';
import { CrystalPhotoUpload } from './CrystalPhotoUpload';
import { useToast } from '@/hooks/use-toast';

interface Crystal {
  id: string;
  name: string;
  description?: string;
  photo_url?: string;
  purchase_date?: string;
  purchase_location?: string;
  properties: string[];
  chakras: string[];
  elements: string[];
  moon_phases: string[];
  last_cleansed?: string;
  cleansing_interval_days: number;
  notes?: string;
  is_favorite: boolean;
  days_since_cleansing?: number;
  needs_cleansing?: boolean;
}

interface CrystalCollectionProps {
  currentMoonPhase: string;
  currentElement: string;
}

const chakraColors: Record<string, string> = {
  'root': 'bg-red-600',
  'sacral': 'bg-orange-500',
  'solar plexus': 'bg-yellow-500',
  'heart': 'bg-green-500',
  'throat': 'bg-blue-500',
  'third eye': 'bg-indigo-600',
  'crown': 'bg-purple-600',
  'all': 'bg-gradient-to-r from-red-500 via-green-500 to-purple-500'
};

const elementIcons: Record<string, string> = {
  'fire': '🔥',
  'water': '💧',
  'earth': '🌍',
  'air': '💨',
  'spirit': '✨',
  'all': '🌟'
};

const crystalPresets = [
  { name: 'Amethyst', properties: ['calming', 'intuition', 'protection'], chakras: ['third eye', 'crown'], elements: ['air', 'water'] },
  { name: 'Clear Quartz', properties: ['amplification', 'clarity', 'healing'], chakras: ['all'], elements: ['all'] },
  { name: 'Rose Quartz', properties: ['love', 'compassion', 'self-love'], chakras: ['heart'], elements: ['water', 'earth'] },
  { name: 'Black Tourmaline', properties: ['protection', 'grounding', 'cleansing'], chakras: ['root'], elements: ['earth'] },
  { name: 'Citrine', properties: ['abundance', 'joy', 'manifestation'], chakras: ['solar plexus', 'sacral'], elements: ['fire'] },
  { name: 'Selenite', properties: ['cleansing', 'clarity', 'peace'], chakras: ['crown', 'third eye'], elements: ['air'] },
  { name: 'Labradorite', properties: ['transformation', 'intuition', 'magic'], chakras: ['third eye', 'throat'], elements: ['water', 'air'] },
  { name: 'Obsidian', properties: ['protection', 'truth', 'shadow work'], chakras: ['root'], elements: ['earth', 'fire'] }
];

export function CrystalCollection({ currentMoonPhase, currentElement }: CrystalCollectionProps) {
  const [crystals, setCrystals] = useState<Crystal[]>([]);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCrystal, setEditingCrystal] = useState<Crystal | null>(null);
  const [viewingCrystal, setViewingCrystal] = useState<Crystal | null>(null);
  const [identifyName, setIdentifyName] = useState('');
  const [identifyResult, setIdentifyResult] = useState<any>(null);
  const [newCrystal, setNewCrystal] = useState({
    name: '',
    description: '',
    photo_url: '',
    purchase_date: '',
    purchase_location: '',
    properties: [] as string[],
    chakras: [] as string[],
    elements: [] as string[],
    moon_phases: [] as string[],
    cleansing_interval_days: 30,
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [crystalData, suggestionsData] = await Promise.all([
        getCrystalCollection(),
        getCrystalSuggestions(currentMoonPhase, currentElement, ['healing', 'protection'])
      ]);
      setCrystals(crystalData);
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error('Failed to load crystal data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCrystal = async () => {
    if (!newCrystal.name.trim()) {
      toast({ title: 'Error', description: 'Please enter a crystal name.', variant: 'destructive' });
      return;
    }

    try {
      await addCrystalToCollection(newCrystal);
      toast({ title: 'Crystal Added', description: `${newCrystal.name} has been added to your collection.` });
      resetNewCrystal();
      loadData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add crystal.', variant: 'destructive' });
    }
  };

  const handleUpdateCrystal = async () => {
    if (!editingCrystal) return;

    try {
      await updateCrystal(editingCrystal.id, editingCrystal);
      toast({ title: 'Crystal Updated', description: 'Your crystal has been updated.' });
      setEditingCrystal(null);
      loadData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update crystal.', variant: 'destructive' });
    }
  };

  const handleDeleteCrystal = async (id: string) => {
    try {
      await deleteCrystal(id);
      toast({ title: 'Crystal Removed', description: 'Crystal has been removed from your collection.' });
      loadData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete crystal.', variant: 'destructive' });
    }
  };

  const handleMarkCleansed = async (id: string) => {
    try {
      await markCrystalCleansed(id);
      toast({ title: 'Crystal Cleansed', description: 'Crystal has been marked as cleansed.' });
      loadData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to mark crystal as cleansed.', variant: 'destructive' });
    }
  };

  const handleIdentify = async () => {
    if (!identifyName.trim()) return;

    try {
      const result = await identifyCrystal(identifyName);
      setIdentifyResult(result);
      
      if (result.identified && result.crystal_info) {
        setNewCrystal({
          ...newCrystal,
          name: result.crystal_info.name,
          properties: result.crystal_info.properties || [],
          chakras: result.crystal_info.chakras || [],
          elements: result.crystal_info.elements || [],
          moon_phases: result.crystal_info.moon_phases || []
        });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to identify crystal.', variant: 'destructive' });
    }
  };

  const applyPreset = (preset: typeof crystalPresets[0]) => {
    setNewCrystal({
      ...newCrystal,
      name: preset.name,
      properties: preset.properties,
      chakras: preset.chakras,
      elements: preset.elements
    });
  };

  const resetNewCrystal = () => {
    setNewCrystal({
      name: '',
      description: '',
      photo_url: '',
      purchase_date: '',
      purchase_location: '',
      properties: [],
      chakras: [],
      elements: [],
      moon_phases: [],
      cleansing_interval_days: 30,
      notes: ''
    });
    setIdentifyResult(null);
    setIdentifyName('');
  };

  const filteredCrystals = crystals.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.properties?.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const needsCleansingCrystals = crystals.filter(c => c.needs_cleansing);

  return (
    <div className="space-y-6">
      {/* Cleansing Alerts */}
      {needsCleansingCrystals.length > 0 && (
        <Card className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <div className="flex-1">
                <h4 className="font-medium text-amber-200">Crystals Need Cleansing</h4>
                <p className="text-sm text-amber-300">
                  {needsCleansingCrystals.length} crystal{needsCleansingCrystals.length > 1 ? 's' : ''} ready for cleansing
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {needsCleansingCrystals.slice(0, 3).map((c) => (
                  <Button
                    key={c.id}
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkCleansed(c.id)}
                    className="border-amber-500/30 text-amber-200 hover:bg-amber-900/30"
                  >
                    <Droplets className="w-3 h-3 mr-1" />
                    {c.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Suggestions */}
      {suggestions?.from_collection?.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-200 flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5" />
              Suggested for Today
            </CardTitle>
            <p className="text-sm text-purple-300">
              Based on {currentMoonPhase} and {currentElement} element
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {suggestions.from_collection.slice(0, 4).map((crystal: Crystal) => (
                <div
                  key={crystal.id}
                  className="flex-shrink-0 p-3 bg-purple-900/30 rounded-lg border border-purple-500/20 min-w-[140px] cursor-pointer hover:border-purple-400/40 transition-all"
                  onClick={() => setViewingCrystal(crystal)}
                >
                  <div className="text-center">
                    {crystal.photo_url ? (
                      <div className="w-12 h-12 mx-auto rounded-full overflow-hidden mb-2">
                        <img src={crystal.photo_url} alt={crystal.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl mb-2">
                        💎
                      </div>
                    )}
                    <h4 className="font-medium text-white text-sm">{crystal.name}</h4>
                    <p className="text-xs text-purple-300 mt-1">
                      {crystal.properties?.slice(0, 2).join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="collection" className="space-y-4">
        <TabsList className="bg-purple-900/30 border border-purple-500/30">
          <TabsTrigger value="collection" className="data-[state=active]:bg-purple-600">
            My Collection
          </TabsTrigger>
          <TabsTrigger value="add" className="data-[state=active]:bg-purple-600">
            Add Crystal
          </TabsTrigger>
          <TabsTrigger value="identify" className="data-[state=active]:bg-purple-600">
            Identify
          </TabsTrigger>
        </TabsList>

        <TabsContent value="collection">
          <Card className="bg-black/30 border-purple-500/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-purple-200">Crystal Collection ({crystals.length})</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search crystals..."
                  className="pl-9 bg-purple-900/30 border-purple-500/30 text-white w-48"
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredCrystals.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No crystals in your collection yet</p>
                  <p className="text-sm">Add your first crystal to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCrystals.map((crystal) => (
                    <div
                      key={crystal.id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        crystal.needs_cleansing
                          ? 'bg-amber-900/20 border-amber-500/30'
                          : 'bg-purple-900/20 border-purple-500/20 hover:border-purple-400/40'
                      }`}
                      onClick={() => setViewingCrystal(crystal)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {crystal.photo_url ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                              <img src={crystal.photo_url} alt={crystal.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-xl flex-shrink-0">
                              💎
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-white">{crystal.name}</h4>
                            {crystal.purchase_date && (
                              <p className="text-xs text-gray-400">
                                Acquired {new Date(crystal.purchase_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingCrystal(crystal)}
                            className="w-7 h-7 text-gray-400 hover:text-white"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteCrystal(crystal.id)}
                            className="w-7 h-7 text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Properties */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {crystal.properties?.slice(0, 3).map((prop, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-purple-500/30 text-purple-300">
                            {prop}
                          </Badge>
                        ))}
                      </div>

                      {/* Chakras */}
                      <div className="flex gap-1 mb-2">
                        {crystal.chakras?.map((chakra, i) => (
                          <div
                            key={i}
                            className={`w-4 h-4 rounded-full ${chakraColors[chakra.toLowerCase()] || 'bg-gray-500'}`}
                            title={chakra}
                          />
                        ))}
                      </div>

                      {/* Elements */}
                      <div className="flex gap-1 mb-3">
                        {crystal.elements?.map((element, i) => (
                          <span key={i} className="text-sm" title={element}>
                            {elementIcons[element.toLowerCase()] || '✨'}
                          </span>
                        ))}
                      </div>

                      {/* Cleansing Status */}
                      <div className="flex items-center justify-between pt-2 border-t border-purple-500/20" onClick={(e) => e.stopPropagation()}>
                        {crystal.needs_cleansing ? (
                          <Button
                            size="sm"
                            onClick={() => handleMarkCleansed(crystal.id)}
                            className="bg-amber-600 hover:bg-amber-500 text-xs"
                          >
                            <Droplets className="w-3 h-3 mr-1" />
                            Cleanse Now
                          </Button>
                        ) : (
                          <span className="text-xs text-green-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Cleansed {crystal.days_since_cleansing || 0}d ago
                          </span>
                        )}
                        {crystal.is_favorite && (
                          <Heart className="w-4 h-4 text-pink-400 fill-current" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card className="bg-black/30 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-200">Add New Crystal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Photo Upload */}
              <div>
                <Label className="text-purple-200 mb-2 block">Crystal Photo</Label>
                <CrystalPhotoUpload
                  currentPhotoUrl={newCrystal.photo_url}
                  onPhotoUploaded={(url) => setNewCrystal({ ...newCrystal, photo_url: url })}
                  crystalName={newCrystal.name}
                />
              </div>

              {/* Quick Presets */}
              <div>
                <Label className="text-purple-200 mb-2 block">Quick Add</Label>
                <div className="flex flex-wrap gap-2">
                  {crystalPresets.map((preset) => (
                    <Button
                      key={preset.name}
                      size="sm"
                      variant="outline"
                      onClick={() => applyPreset(preset)}
                      className="border-purple-500/30 text-purple-200 hover:bg-purple-900/30"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-purple-200">Crystal Name *</Label>
                  <Input
                    value={newCrystal.name}
                    onChange={(e) => setNewCrystal({ ...newCrystal, name: e.target.value })}
                    placeholder="e.g., Amethyst"
                    className="bg-purple-900/30 border-purple-500/30 text-white"
                  />
                </div>
                <div>
                  <Label className="text-purple-200">Purchase Location</Label>
                  <Input
                    value={newCrystal.purchase_location}
                    onChange={(e) => setNewCrystal({ ...newCrystal, purchase_location: e.target.value })}
                    placeholder="e.g., Local crystal shop"
                    className="bg-purple-900/30 border-purple-500/30 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-purple-200">Description</Label>
                <Textarea
                  value={newCrystal.description}
                  onChange={(e) => setNewCrystal({ ...newCrystal, description: e.target.value })}
                  placeholder="Describe your crystal..."
                  className="bg-purple-900/30 border-purple-500/30 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-purple-200">Purchase Date</Label>
                  <Input
                    type="date"
                    value={newCrystal.purchase_date}
                    onChange={(e) => setNewCrystal({ ...newCrystal, purchase_date: e.target.value })}
                    className="bg-purple-900/30 border-purple-500/30 text-white"
                  />
                </div>
                <div>
                  <Label className="text-purple-200">Cleansing Interval (days)</Label>
                  <Input
                    type="number"
                    value={newCrystal.cleansing_interval_days}
                    onChange={(e) => setNewCrystal({ ...newCrystal, cleansing_interval_days: parseInt(e.target.value) || 30 })}
                    className="bg-purple-900/30 border-purple-500/30 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-purple-200">Notes</Label>
                <Textarea
                  value={newCrystal.notes}
                  onChange={(e) => setNewCrystal({ ...newCrystal, notes: e.target.value })}
                  placeholder="Personal notes about this crystal..."
                  className="bg-purple-900/30 border-purple-500/30 text-white"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleAddCrystal} className="flex-1 bg-purple-600 hover:bg-purple-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Collection
                </Button>
                <Button variant="outline" onClick={resetNewCrystal} className="border-purple-500/30 text-purple-200">
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="identify">
          <Card className="bg-black/30 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-200 flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Crystal Identifier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-400">
                Enter a crystal name to get its properties, chakra associations, and suggested uses.
              </p>

              <div className="flex gap-2">
                <Input
                  value={identifyName}
                  onChange={(e) => setIdentifyName(e.target.value)}
                  placeholder="Enter crystal name..."
                  className="bg-purple-900/30 border-purple-500/30 text-white"
                />
                <Button onClick={handleIdentify} className="bg-purple-600 hover:bg-purple-500">
                  <Search className="w-4 h-4 mr-2" />
                  Identify
                </Button>
              </div>

              {identifyResult && (
                <div className={`p-4 rounded-lg border ${
                  identifyResult.identified 
                    ? 'bg-green-900/20 border-green-500/30' 
                    : 'bg-gray-900/20 border-gray-500/30'
                }`}>
                  {identifyResult.identified ? (
                    <div className="space-y-3">
                      <h4 className="font-medium text-white capitalize">{identifyResult.crystal_info.name}</h4>
                      <p className="text-gray-300 text-sm">{identifyResult.crystal_info.description}</p>
                      
                      <div>
                        <Label className="text-purple-200 text-sm">Properties</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {identifyResult.crystal_info.properties?.map((prop: string, i: number) => (
                            <Badge key={i} className="bg-purple-600/50">{prop}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-purple-200 text-sm">Chakras</Label>
                        <div className="flex gap-2 mt-1">
                          {identifyResult.crystal_info.chakras?.map((chakra: string, i: number) => (
                            <div key={i} className="flex items-center gap-1">
                              <div className={`w-4 h-4 rounded-full ${chakraColors[chakra.toLowerCase()] || 'bg-gray-500'}`} />
                              <span className="text-sm text-gray-300 capitalize">{chakra}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-purple-200 text-sm">Cleansing Methods</Label>
                        <p className="text-gray-300 text-sm mt-1">
                          {identifyResult.crystal_info.cleansing_methods?.join(', ')}
                        </p>
                      </div>

                      <Button 
                        onClick={() => {}} 
                        className="w-full bg-green-600 hover:bg-green-500"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Collection
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-400">{identifyResult.message}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Crystal Detail Modal */}
      <Dialog open={!!viewingCrystal} onOpenChange={() => setViewingCrystal(null)}>
        <DialogContent className="bg-gray-900 border-purple-500/30 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-purple-200 flex items-center gap-2">
              💎 {viewingCrystal?.name}
            </DialogTitle>
          </DialogHeader>
          {viewingCrystal && (
            <div className="space-y-4">
              {/* Full Size Photo */}
              {viewingCrystal.photo_url && (
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={viewingCrystal.photo_url} 
                    alt={viewingCrystal.name} 
                    className="w-full max-h-64 object-cover"
                  />
                </div>
              )}

              {viewingCrystal.description && (
                <p className="text-gray-300 text-sm">{viewingCrystal.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4">
                {viewingCrystal.purchase_date && (
                  <div>
                    <Label className="text-purple-200 text-sm">Acquired</Label>
                    <p className="text-gray-300">{new Date(viewingCrystal.purchase_date).toLocaleDateString()}</p>
                  </div>
                )}
                {viewingCrystal.purchase_location && (
                  <div>
                    <Label className="text-purple-200 text-sm">Location</Label>
                    <p className="text-gray-300">{viewingCrystal.purchase_location}</p>
                  </div>
                )}
              </div>

              {viewingCrystal.properties?.length > 0 && (
                <div>
                  <Label className="text-purple-200 text-sm">Properties</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {viewingCrystal.properties.map((prop, i) => (
                      <Badge key={i} className="bg-purple-600/50">{prop}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {viewingCrystal.chakras?.length > 0 && (
                <div>
                  <Label className="text-purple-200 text-sm">Chakras</Label>
                  <div className="flex gap-2 mt-1">
                    {viewingCrystal.chakras.map((chakra, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div className={`w-4 h-4 rounded-full ${chakraColors[chakra.toLowerCase()] || 'bg-gray-500'}`} />
                        <span className="text-sm text-gray-300 capitalize">{chakra}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingCrystal.notes && (
                <div>
                  <Label className="text-purple-200 text-sm">Notes</Label>
                  <p className="text-gray-300 text-sm mt-1">{viewingCrystal.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => {
                    setEditingCrystal(viewingCrystal);
                    setViewingCrystal(null);
                  }} 
                  className="flex-1 bg-purple-600 hover:bg-purple-500"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                {viewingCrystal.needs_cleansing && (
                  <Button 
                    onClick={() => {
                      handleMarkCleansed(viewingCrystal.id);
                      setViewingCrystal(null);
                    }} 
                    className="bg-amber-600 hover:bg-amber-500"
                  >
                    <Droplets className="w-4 h-4 mr-2" />
                    Cleanse
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Crystal Dialog */}
      <Dialog open={!!editingCrystal} onOpenChange={() => setEditingCrystal(null)}>
        <DialogContent className="bg-gray-900 border-purple-500/30 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-purple-200">Edit Crystal</DialogTitle>
          </DialogHeader>
          {editingCrystal && (
            <div className="space-y-4">
              {/* Photo Upload */}
              <div>
                <Label className="text-purple-200 mb-2 block">Crystal Photo</Label>
                <CrystalPhotoUpload
                  currentPhotoUrl={editingCrystal.photo_url}
                  onPhotoUploaded={(url) => setEditingCrystal({ ...editingCrystal, photo_url: url })}
                  crystalName={editingCrystal.name}
                />
              </div>

              <div>
                <Label className="text-purple-200">Name</Label>
                <Input
                  value={editingCrystal.name}
                  onChange={(e) => setEditingCrystal({ ...editingCrystal, name: e.target.value })}
                  className="bg-purple-900/30 border-purple-500/30 text-white"
                />
              </div>
              <div>
                <Label className="text-purple-200">Description</Label>
                <Textarea
                  value={editingCrystal.description || ''}
                  onChange={(e) => setEditingCrystal({ ...editingCrystal, description: e.target.value })}
                  className="bg-purple-900/30 border-purple-500/30 text-white"
                />
              </div>
              <div>
                <Label className="text-purple-200">Notes</Label>
                <Textarea
                  value={editingCrystal.notes || ''}
                  onChange={(e) => setEditingCrystal({ ...editingCrystal, notes: e.target.value })}
                  className="bg-purple-900/30 border-purple-500/30 text-white"
                />
              </div>
              <div>
                <Label className="text-purple-200">Cleansing Interval (days)</Label>
                <Input
                  type="number"
                  value={editingCrystal.cleansing_interval_days}
                  onChange={(e) => setEditingCrystal({ ...editingCrystal, cleansing_interval_days: parseInt(e.target.value) || 30 })}
                  className="bg-purple-900/30 border-purple-500/30 text-white"
                />
              </div>
              <Button onClick={handleUpdateCrystal} className="w-full bg-purple-600 hover:bg-purple-500">
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
