import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { invokeEdgeFunction } from '@/lib/edgeFunctionHelper';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Sparkles, Flame, Volume2, VolumeX, Wind, Leaf, Moon, Heart,
  Eye, Feather, Save, Trash2, Play, Plus, Check, Users, Globe
} from 'lucide-react';

interface RitualElement {
  id: string;
  type: 'candle' | 'sound' | 'scent' | 'movement' | 'intention' | 'reflection' | 'breathwork' | 'crystal' | 'tea';
  name: string;
  description: string;
  icon: string;
  selected: boolean;
  customValue?: string;
}

interface CustomRitual {
  id?: string;
  name: string;
  description: string;
  elements: RitualElement[];
  is_public: boolean;
}

const defaultElements: RitualElement[] = [
  { id: 'candle', type: 'candle', name: 'Candle', description: 'Light a candle to create sacred space', icon: 'flame', selected: false },
  { id: 'no-candle', type: 'candle', name: 'No Candle', description: 'Work without flame today', icon: 'flame-off', selected: false },
  { id: 'sound', type: 'sound', name: 'Sound', description: 'Include ambient sounds or music', icon: 'volume', selected: false },
  { id: 'silence', type: 'sound', name: 'Silence', description: 'Practice in complete silence', icon: 'volume-x', selected: false },
  { id: 'scent', type: 'scent', name: 'Scent', description: 'Use essential oils or incense', icon: 'leaf', selected: false },
  { id: 'breath', type: 'breathwork', name: 'Breath', description: 'Include breathwork practice', icon: 'wind', selected: false },
  { id: 'movement', type: 'movement', name: 'Movement', description: 'Incorporate gentle movement', icon: 'move', selected: false },
  { id: 'stillness', type: 'movement', name: 'Stillness', description: 'Practice in complete stillness', icon: 'pause', selected: false },
  { id: 'intention', type: 'intention', name: 'Intention', description: 'Set a clear intention', icon: 'feather', selected: false },
  { id: 'reflection', type: 'reflection', name: 'Reflection', description: 'Include journaling or reflection', icon: 'eye', selected: false },
  { id: 'crystal', type: 'crystal', name: 'Crystal', description: 'Work with crystal energy', icon: 'gem', selected: false },
  { id: 'tea', type: 'tea', name: 'Tea Ritual', description: 'Include mindful tea drinking', icon: 'coffee', selected: false },
];

export function RitualBuilder() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [elements, setElements] = useState<RitualElement[]>(defaultElements);
  const [ritualName, setRitualName] = useState('');
  const [ritualDescription, setRitualDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedRituals, setSavedRituals] = useState<CustomRitual[]>([]);
  const [publicRituals, setPublicRituals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('create');
  const [editingRitual, setEditingRitual] = useState<CustomRitual | null>(null);

  useEffect(() => {
    if (open && user) {
      loadSavedRituals();
      loadPublicRituals();
    }
  }, [open, user]);

  const loadSavedRituals = async () => {
    try {
      const { data, error } = await invokeEdgeFunction('manage-custom-ritual', { action: 'list' });
      if (error) return;
      if (data?.rituals) setSavedRituals(data.rituals);
    } catch (error) {
      console.error('Error loading rituals:', error);
    }
  };

  const loadPublicRituals = async () => {
    try {
      const { data, error } = await invokeEdgeFunction('manage-custom-ritual', { action: 'browse_public', limit: 20 });
      if (error) return;
      if (data?.rituals) setPublicRituals(data.rituals);
    } catch (error) {
      console.error('Error loading public rituals:', error);
    }
  };

  const toggleElement = (id: string) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, selected: !el.selected } : el
    ));
  };

  const saveRitual = async () => {
    if (!user) {
      toast.error('Please sign in to save your ritual');
      return;
    }

    if (!ritualName.trim()) {
      toast.error('Please give your ritual a name');
      return;
    }

    const selectedElements = elements.filter(el => el.selected);
    if (selectedElements.length === 0) {
      toast.error('Please select at least one element');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await invokeEdgeFunction('manage-custom-ritual', {
        action: editingRitual ? 'update' : 'save',
        id: editingRitual?.id,
        name: ritualName,
        description: ritualDescription,
        elements: selectedElements,
        is_public: isPublic
      });

      if (error) { toast.error(error); return; }

      toast.success(editingRitual ? 'Ritual updated!' : 'Ritual saved!');
      loadSavedRituals();
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save ritual');
    } finally {
      setSaving(false);
    }
  };

  const deleteRitual = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ritual?')) return;

    try {
      const { error } = await invokeEdgeFunction('manage-custom-ritual', { action: 'delete', id });
      if (error) { toast.error(error); return; }
      toast.success('Ritual deleted');
      loadSavedRituals();
    } catch (error) {
      toast.error('Failed to delete ritual');
    }
  };


  const loadRitualForEdit = (ritual: CustomRitual) => {
    setEditingRitual(ritual);
    setRitualName(ritual.name);
    setRitualDescription(ritual.description || '');
    setIsPublic(ritual.is_public);
    setElements(defaultElements.map(el => ({
      ...el,
      selected: ritual.elements.some((re: any) => re.id === el.id)
    })));
    setActiveTab('create');
  };

  const usePublicRitual = (ritual: any) => {
    setRitualName(`My ${ritual.name}`);
    setRitualDescription(ritual.description || '');
    setElements(defaultElements.map(el => ({
      ...el,
      selected: ritual.elements.some((re: any) => re.id === el.id)
    })));
    setActiveTab('create');
    toast.success('Ritual loaded! Customize it and save as your own.');
  };

  const resetForm = () => {
    setRitualName('');
    setRitualDescription('');
    setIsPublic(false);
    setElements(defaultElements);
    setEditingRitual(null);
  };

  const getElementIcon = (iconName: string) => {
    switch (iconName) {
      case 'flame': return <Flame className="w-5 h-5" />;
      case 'flame-off': return <Flame className="w-5 h-5 opacity-30" />;
      case 'volume': return <Volume2 className="w-5 h-5" />;
      case 'volume-x': return <VolumeX className="w-5 h-5" />;
      case 'leaf': return <Leaf className="w-5 h-5" />;
      case 'wind': return <Wind className="w-5 h-5" />;
      case 'move': return <Sparkles className="w-5 h-5" />;
      case 'pause': return <Moon className="w-5 h-5" />;
      case 'feather': return <Feather className="w-5 h-5" />;
      case 'eye': return <Eye className="w-5 h-5" />;
      case 'gem': return <Sparkles className="w-5 h-5" />;
      case 'coffee': return <Leaf className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const selectedCount = elements.filter(el => el.selected).length;

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-violet-500/30 text-white hover:bg-violet-500/30"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Create My Own Ritual
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-violet-500/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            Build Your Own Ritual
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 bg-white/5">
            <TabsTrigger value="create" className="data-[state=active]:bg-violet-500/20">
              <Plus className="w-4 h-4 mr-2" />
              Create
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-violet-500/20">
              <Heart className="w-4 h-4 mr-2" />
              My Rituals
            </TabsTrigger>
            <TabsTrigger value="community" className="data-[state=active]:bg-violet-500/20">
              <Users className="w-4 h-4 mr-2" />
              Community
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6 mt-6">
            {/* Intro Copy */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
              <p className="text-white/80 leading-relaxed">
                You don't need permission to create something sacred.
              </p>
              <p className="text-white/60 mt-3 text-sm">
                Here, you can build a ritual that fits <span className="text-violet-300">you</span> — not someone else's routine, 
                not a rigid system, not a perfect version of yourself.
              </p>
            </div>

            {/* Ritual Name */}
            <div className="space-y-2">
              <label className="text-sm text-white/70">Ritual Name</label>
              <Input
                value={ritualName}
                onChange={(e) => setRitualName(e.target.value)}
                placeholder="e.g., Morning Grounding, Evening Release..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>

            {/* Choose Elements */}
            <div className="space-y-3">
              <p className="text-white/70 text-sm">Choose what resonates:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {elements.map((element) => (
                  <button
                    key={element.id}
                    onClick={() => toggleElement(element.id)}
                    className={`
                      p-4 rounded-xl border text-left transition-all
                      ${element.selected 
                        ? 'bg-violet-500/20 border-violet-500/50 ring-2 ring-violet-500/30' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={element.selected ? 'text-violet-400' : 'text-white/60'}>
                        {getElementIcon(element.icon)}
                      </span>
                      <span className={`font-medium ${element.selected ? 'text-white' : 'text-white/80'}`}>
                        {element.name}
                      </span>
                      {element.selected && (
                        <Check className="w-4 h-4 text-violet-400 ml-auto" />
                      )}
                    </div>
                    <p className="text-xs text-white/50">{element.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm text-white/70">Description (optional)</label>
              <Textarea
                value={ritualDescription}
                onChange={(e) => setRitualDescription(e.target.value)}
                placeholder="What is this ritual for? When do you use it?"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px]"
              />
            </div>

            {/* Public Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-white/60" />
                <div>
                  <p className="text-white font-medium">Share with Community</p>
                  <p className="text-xs text-white/50">Let others discover and use your ritual</p>
                </div>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>

            {/* Guidance Copy */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-white/60 text-sm">
                This is your space.
              </p>
              <p className="text-white/70 text-sm mt-2">
                There is no "right way" to ritual.
                <br />
                There is only <span className="text-violet-300">presence</span>.
              </p>
              <p className="text-white/60 text-sm mt-3 italic">
                When you create your own ritual, you're not following a system — 
                you're reclaiming your authority.
              </p>
            </div>

            {/* Save Button */}
            <Button
              onClick={saveRitual}
              disabled={saving || !ritualName.trim() || selectedCount === 0}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-500"
            >
              {saving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editingRitual ? 'Update Ritual' : 'Save My Ritual'}
                  {selectedCount > 0 && ` (${selectedCount} elements)`}
                </>
              )}
            </Button>

            {editingRitual && (
              <Button
                variant="ghost"
                onClick={resetForm}
                className="w-full text-white/60 hover:text-white"
              >
                Cancel Editing
              </Button>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-4 mt-6">
            {savedRituals.length === 0 ? (
              <div className="text-center p-8 rounded-xl bg-white/5 border border-white/10">
                <Sparkles className="w-12 h-12 text-violet-400 mx-auto mb-4 opacity-50" />
                <p className="text-white/80">You haven't created any rituals yet.</p>
                <p className="text-white/60 text-sm mt-2">
                  Go to the Create tab to build your first sacred practice.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedRituals.map((ritual) => (
                  <div
                    key={ritual.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-white flex items-center gap-2">
                          {ritual.name}
                          {ritual.is_public && (
                            <Globe className="w-4 h-4 text-violet-400" />
                          )}
                        </h4>
                        {ritual.description && (
                          <p className="text-sm text-white/60 mt-1">{ritual.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadRitualForEdit(ritual)}
                          className="text-white/60 hover:text-white"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRitual(ritual.id!)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {ritual.elements.map((el: any) => (
                        <span
                          key={el.id}
                          className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-xs"
                        >
                          {el.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="community" className="space-y-4 mt-6">
            {publicRituals.length === 0 ? (
              <div className="text-center p-8 rounded-xl bg-white/5 border border-white/10">
                <Users className="w-12 h-12 text-violet-400 mx-auto mb-4 opacity-50" />
                <p className="text-white/80">No community rituals yet.</p>
                <p className="text-white/60 text-sm mt-2">
                  Be the first to share your ritual with the community!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {publicRituals.map((ritual) => (
                  <div
                    key={ritual.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-white">{ritual.name}</h4>
                        {ritual.profiles && (
                          <p className="text-xs text-white/50">by @{ritual.profiles.username}</p>
                        )}
                        {ritual.description && (
                          <p className="text-sm text-white/60 mt-1">{ritual.description}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => usePublicRitual(ritual)}
                        className="border-violet-500/30 text-violet-300 hover:bg-violet-500/20"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Use
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {ritual.elements?.map((el: any) => (
                        <span
                          key={el.id}
                          className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-xs"
                        >
                          {el.name}
                        </span>
                      ))}
                    </div>
                    {ritual.uses_count > 0 && (
                      <p className="text-xs text-white/40 mt-2">
                        Used {ritual.uses_count} times
                      </p>
                    )}
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
