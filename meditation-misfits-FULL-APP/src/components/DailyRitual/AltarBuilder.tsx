import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { invokeEdgeFunction } from '@/lib/edgeFunctionHelper';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Gem, Flame, Leaf, Feather, Star, Moon, Save, Share2, Trash2,
  Sparkles, Heart, FolderOpen, Plus, Lightbulb, GripVertical, X,
  Users, Download, RotateCcw
} from 'lucide-react';

interface AltarObject {
  id: string;
  name: string;
  category: string;
  image_url: string;
  element?: string;
  moon_phase?: string[];
  properties?: string[];
  description?: string;
}

interface PlacedObject extends AltarObject {
  instanceId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface AltarDesign {
  id?: string;
  name: string;
  description?: string;
  objects: PlacedObject[];
  background: string;
  is_public: boolean;
  moon_phase?: string;
  element?: string;
}

const BACKGROUNDS = [
  { id: 'wood', name: 'Sacred Wood', gradient: 'from-amber-900 via-amber-800 to-amber-900' },
  { id: 'stone', name: 'Ancient Stone', gradient: 'from-slate-700 via-slate-600 to-slate-700' },
  { id: 'velvet', name: 'Velvet Night', gradient: 'from-purple-900 via-indigo-900 to-purple-900' },
  { id: 'forest', name: 'Forest Floor', gradient: 'from-emerald-900 via-green-800 to-emerald-900' },
  { id: 'cosmic', name: 'Cosmic Void', gradient: 'from-slate-950 via-purple-950 to-slate-950' },
  { id: 'moonlight', name: 'Moonlight', gradient: 'from-slate-800 via-blue-900 to-slate-800' }
];

export function AltarBuilder() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [objects, setObjects] = useState<AltarObject[]>([]);
  const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<PlacedObject | null>(null);
  const [background, setBackground] = useState('wood');
  const [altarName, setAltarName] = useState('My Sacred Altar');
  const [altarDescription, setAltarDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [savedAltars, setSavedAltars] = useState<AltarDesign[]>([]);
  const [publicAltars, setPublicAltars] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<AltarObject[]>([]);
  const [currentMoonPhase, setCurrentMoonPhase] = useState('');
  const [currentElement, setCurrentElement] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('build');
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedObject, setDraggedObject] = useState<AltarObject | null>(null);

  useEffect(() => {
    if (open) {
      loadObjects();
      loadSavedAltars();
      loadPublicAltars();
      calculateMoonPhase();
    }
  }, [open]);

  const calculateMoonPhase = () => {
    const today = new Date();
    const newMoon = new Date(2000, 0, 6, 18, 14, 0);
    const diff = today.getTime() - newMoon.getTime();
    const days = diff / 1000 / 60 / 60 / 24;
    const lunations = days / 29.53058867;
    const phase = lunations - Math.floor(lunations);
    
    let phaseName = '';
    if (phase < 0.0625) phaseName = 'New Moon';
    else if (phase < 0.1875) phaseName = 'Waxing Crescent';
    else if (phase < 0.3125) phaseName = 'First Quarter';
    else if (phase < 0.4375) phaseName = 'Waxing Gibbous';
    else if (phase < 0.5625) phaseName = 'Full Moon';
    else if (phase < 0.6875) phaseName = 'Waning Gibbous';
    else if (phase < 0.8125) phaseName = 'Last Quarter';
    else if (phase < 0.9375) phaseName = 'Waning Crescent';
    else phaseName = 'New Moon';

    setCurrentMoonPhase(phaseName);
    
    // Set element based on day of week
    const elements = ['Spirit', 'Moon', 'Fire', 'Water', 'Earth', 'Air', 'Saturn'];
    setCurrentElement(elements[today.getDay()]);
  };

  const loadObjects = async () => {
    try {
      const { data, error } = await invokeEdgeFunction('manage-altar', { action: 'get_objects' });
      if (error) { toast.error(error); return; }
      if (data?.objects) setObjects(data.objects);
    } catch (err) {
      console.error('Error loading objects:', err);
    }
  };

  const loadSavedAltars = async () => {
    if (!user) return;
    try {
      const { data, error } = await invokeEdgeFunction('manage-altar', { action: 'list' });
      if (error) { toast.error(error); return; }
      if (data?.altars) setSavedAltars(data.altars);
    } catch (err) {
      console.error('Error loading saved altars:', err);
    }
  };

  const loadPublicAltars = async () => {
    try {
      const { data, error } = await invokeEdgeFunction('manage-altar', { action: 'get_public' });
      if (error) { toast.error(error); return; }
      if (data?.altars) setPublicAltars(data.altars);
    } catch (err) {
      console.error('Error loading public altars:', err);
    }
  };

  const loadSuggestions = async () => {
    try {
      const { data, error } = await invokeEdgeFunction('manage-altar', { action: 'get_suggestions', moonPhase: currentMoonPhase, element: currentElement });
      if (error) return;
      if (data?.suggestions) setSuggestions(data.suggestions);
    } catch (err) {
      console.error('Error loading suggestions:', err);
    }
  };

  useEffect(() => {
    if (currentMoonPhase && currentElement) {
      loadSuggestions();
    }
  }, [currentMoonPhase, currentElement]);

  const handleDragStart = (obj: AltarObject) => {
    setDraggedObject(obj);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedObject || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPlacedObject: PlacedObject = {
      ...draggedObject,
      instanceId: `${draggedObject.id}-${Date.now()}`,
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
      scale: 1,
      rotation: 0
    };

    setPlacedObjects(prev => [...prev, newPlacedObject]);
    setDraggedObject(null);
  }, [draggedObject]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const updateObjectPosition = (instanceId: string, x: number, y: number) => {
    setPlacedObjects(prev => prev.map(obj => 
      obj.instanceId === instanceId ? { ...obj, x, y } : obj
    ));
  };

  const removeObject = (instanceId: string) => {
    setPlacedObjects(prev => prev.filter(obj => obj.instanceId !== instanceId));
    setSelectedObject(null);
  };

  const saveAltar = async () => {
    if (!user) {
      toast.error('Please sign in to save your altar');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await invokeEdgeFunction('manage-altar', {
        action: 'save',
        name: altarName,
        description: altarDescription,
        objects: placedObjects,
        background,
        isPublic,
        moonPhase: currentMoonPhase,
        element: currentElement
      });

      if (error) { toast.error(error); return; }
      toast.success('Altar saved successfully!');
      loadSavedAltars();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save altar');
    } finally {
      setSaving(false);
    }
  };

  const loadAltar = (altar: AltarDesign) => {
    setAltarName(altar.name);
    setAltarDescription(altar.description || '');
    setPlacedObjects(altar.objects || []);
    setBackground(altar.background || 'wood');
    setIsPublic(altar.is_public || false);
    setActiveTab('build');
    toast.success('Altar loaded!');
  };

  const clearAltar = () => {
    setPlacedObjects([]);
    setSelectedObject(null);
  };

  const likeAltar = async (altarId: string) => {
    if (!user) {
      toast.error('Please sign in to like altars');
      return;
    }

    try {
      const { data, error } = await invokeEdgeFunction('manage-altar', { action: 'like', altarId });
      if (error) { toast.error(error); return; }
      
      setPublicAltars(prev => prev.map(a => {
        if (a.id === altarId) {
          return {
            ...a,
            user_liked: data?.liked,
            likes_count: a.likes_count + (data?.liked ? 1 : -1)
          };
        }
        return a;
      }));
    } catch (error) {
      toast.error('Failed to update');
    }
  };


  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'crystal': return <Gem className="w-4 h-4" />;
      case 'candle': return <Flame className="w-4 h-4" />;
      case 'herb': return <Leaf className="w-4 h-4" />;
      case 'sacred': return <Star className="w-4 h-4" />;
      case 'tool': return <Sparkles className="w-4 h-4" />;
      default: return <Feather className="w-4 h-4" />;
    }
  };

  const groupedObjects = objects.reduce((acc, obj) => {
    if (!acc[obj.category]) acc[obj.category] = [];
    acc[obj.category].push(obj);
    return acc;
  }, {} as Record<string, AltarObject[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
          <Gem className="w-4 h-4 mr-2" />
          Altar Builder
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-slate-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Gem className="w-5 h-5 text-purple-400" />
            Virtual Altar Builder
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="bg-white/5 mb-4">
            <TabsTrigger value="build" className="data-[state=active]:bg-purple-500">
              <Plus className="w-4 h-4 mr-2" />Build
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-purple-500">
              <FolderOpen className="w-4 h-4 mr-2" />My Altars
            </TabsTrigger>
            <TabsTrigger value="community" className="data-[state=active]:bg-purple-500">
              <Users className="w-4 h-4 mr-2" />Community
            </TabsTrigger>
          </TabsList>

          <TabsContent value="build" className="flex gap-4 h-[60vh]">
            {/* Object Palette */}
            <div className="w-64 flex-shrink-0 overflow-y-auto space-y-4 pr-2">
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-white">Suggested for Today</span>
                  </div>
                  <p className="text-xs text-white/60 mb-2">{currentMoonPhase} • {currentElement}</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.slice(0, 6).map(obj => (
                      <button
                        key={obj.id}
                        draggable
                        onDragStart={() => handleDragStart(obj)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-grab active:cursor-grabbing"
                        title={obj.name}
                      >
                        <span className="text-xl">{obj.image_url}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* All Objects by Category */}
              {Object.entries(groupedObjects).map(([category, items]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    {getCategoryIcon(category)}
                    <span className="capitalize">{category}s</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {items.map(obj => (
                      <button
                        key={obj.id}
                        draggable
                        onDragStart={() => handleDragStart(obj)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-grab active:cursor-grabbing group relative"
                        title={obj.name}
                      >
                        <span className="text-xl">{obj.image_url}</span>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-black/90 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {obj.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Canvas */}
            <div className="flex-1 flex flex-col">
              {/* Background Selector */}
              <div className="flex gap-2 mb-3">
                {BACKGROUNDS.map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => setBackground(bg.id)}
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${bg.gradient} border-2 transition-all ${
                      background === bg.id ? 'border-purple-400 scale-110' : 'border-transparent'
                    }`}
                    title={bg.name}
                  />
                ))}
              </div>

              {/* Altar Canvas */}
              <div
                ref={canvasRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`flex-1 rounded-2xl bg-gradient-to-br ${
                  BACKGROUNDS.find(b => b.id === background)?.gradient || BACKGROUNDS[0].gradient
                } relative overflow-hidden border-4 border-amber-700/50`}
                style={{ minHeight: '300px' }}
              >
                {/* Decorative border pattern */}
                <div className="absolute inset-0 border-8 border-amber-600/20 rounded-xl pointer-events-none" />
                
                {placedObjects.map(obj => (
                  <div
                    key={obj.instanceId}
                    className={`absolute cursor-move transition-all ${
                      selectedObject?.instanceId === obj.instanceId ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-transparent' : ''
                    }`}
                    style={{
                      left: `${obj.x}%`,
                      top: `${obj.y}%`,
                      transform: `translate(-50%, -50%) scale(${obj.scale}) rotate(${obj.rotation}deg)`
                    }}
                    onClick={() => setSelectedObject(obj)}
                    draggable
                    onDragEnd={(e) => {
                      if (!canvasRef.current) return;
                      const rect = canvasRef.current.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      updateObjectPosition(obj.instanceId, Math.max(5, Math.min(95, x)), Math.max(5, Math.min(95, y)));
                    }}
                  >
                    <span className="text-4xl drop-shadow-lg">{obj.image_url}</span>
                    {selectedObject?.instanceId === obj.instanceId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeObject(obj.instanceId);
                        }}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}

                {placedObjects.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-white/40">
                    <div className="text-center">
                      <Gem className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Drag objects here to build your altar</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="mt-3 flex items-center gap-3">
                <Input
                  value={altarName}
                  onChange={(e) => setAltarName(e.target.value)}
                  placeholder="Altar name..."
                  className="flex-1 bg-white/5 border-white/10 text-white"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/60">Public</span>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                </div>
                <Button variant="outline" size="sm" onClick={clearAltar} className="border-white/20 text-white">
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button onClick={saveAltar} disabled={saving} className="bg-purple-500 hover:bg-purple-600">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="saved" className="h-[60vh] overflow-y-auto">
            {savedAltars.length === 0 ? (
              <div className="text-center py-12 text-white/60">
                <Gem className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No saved altars yet</p>
                <p className="text-sm mt-2">Create your first altar in the Build tab!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {savedAltars.map(altar => (
                  <div
                    key={altar.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all cursor-pointer"
                    onClick={() => loadAltar(altar)}
                  >
                    <div className={`h-24 rounded-lg bg-gradient-to-br ${
                      BACKGROUNDS.find(b => b.id === altar.background)?.gradient || BACKGROUNDS[0].gradient
                    } relative overflow-hidden mb-3`}>
                      {altar.objects?.slice(0, 5).map((obj, i) => (
                        <span
                          key={i}
                          className="absolute text-2xl"
                          style={{ left: `${obj.x}%`, top: `${obj.y}%`, transform: 'translate(-50%, -50%)' }}
                        >
                          {obj.image_url}
                        </span>
                      ))}
                    </div>
                    <h4 className="font-medium text-white">{altar.name}</h4>
                    <p className="text-xs text-white/60 mt-1">
                      {altar.objects?.length || 0} objects • {altar.is_public ? 'Public' : 'Private'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="community" className="h-[60vh] overflow-y-auto">
            {publicAltars.length === 0 ? (
              <div className="text-center py-12 text-white/60">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No community altars yet</p>
                <p className="text-sm mt-2">Be the first to share your altar!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {publicAltars.map(altar => (
                  <div
                    key={altar.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className={`h-24 rounded-lg bg-gradient-to-br ${
                      BACKGROUNDS.find(b => b.id === altar.background)?.gradient || BACKGROUNDS[0].gradient
                    } relative overflow-hidden mb-3`}>
                      {altar.objects?.slice(0, 5).map((obj: PlacedObject, i: number) => (
                        <span
                          key={i}
                          className="absolute text-2xl"
                          style={{ left: `${obj.x}%`, top: `${obj.y}%`, transform: 'translate(-50%, -50%)' }}
                        >
                          {obj.image_url}
                        </span>
                      ))}
                    </div>
                    <h4 className="font-medium text-white">{altar.name}</h4>
                    {altar.profiles && (
                      <p className="text-xs text-white/60">by @{altar.profiles.username}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <button
                        onClick={() => likeAltar(altar.id)}
                        className={`flex items-center gap-1 text-sm ${altar.user_liked ? 'text-pink-400' : 'text-white/50 hover:text-white'}`}
                      >
                        <Heart className={`w-4 h-4 ${altar.user_liked ? 'fill-current' : ''}`} />
                        {altar.likes_count || 0}
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadAltar(altar)}
                        className="text-white/60 hover:text-white"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Use
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
