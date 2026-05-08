import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PresetCard } from './PresetCard';
import { TrendingPresets } from './TrendingPresets';
import AIRecommendations from './AIRecommendations';
import { ScheduleModal } from './ScheduleModal';
import { ScheduleList } from './ScheduleList';
import { supabase } from '@/lib/supabase';
import { Loader2, CalendarDays } from 'lucide-react';
import { buildSoundicineUrl } from '@/lib/soundicine';
import { PresetSchedule } from '@/lib/presetScheduling';

interface PresetBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPreset: (url: string) => void;
}

export const PresetBrowser: React.FC<PresetBrowserProps> = ({ isOpen, onClose, onLoadPreset }) => {
  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('All');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<any>(null);
  const [editingSchedule, setEditingSchedule] = useState<PresetSchedule | undefined>();
  const [scheduleRefresh, setScheduleRefresh] = useState(0);
  const [showSchedules, setShowSchedules] = useState(false);

  useEffect(() => {
    if (isOpen) loadPresets();
  }, [isOpen, category]);

  const loadPresets = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('list-soundicine-presets', {
        body: { category: category !== 'All' ? category : null }
      });
      setPresets(data?.presets || []);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (preset: any) => {
    const url = buildSoundicineUrl({
      goal: preset.goal,
      minutes: preset.minutes,
      beatStart: preset.beat_start,
      beatEnd: preset.beat_end,
      isoHz: preset.iso_hz,
      noise: preset.noise,
      strength: preset.strength
    });
    
    try {
      await supabase.functions.invoke('track-preset-usage', {
        body: { presetId: preset.id, durationSeconds: preset.minutes * 60, completed: false }
      });
    } catch (error) {
      console.error('Failed to track usage:', error);
    }
    
    onLoadPreset(url);
    onClose();
  };

  const handleSchedule = (preset: any) => {
    setSelectedPreset(preset);
    setEditingSchedule(undefined);
    setScheduleModalOpen(true);
  };

  const handleEditSchedule = (schedule: PresetSchedule) => {
    setEditingSchedule(schedule);
    setSelectedPreset(null);
    setScheduleModalOpen(true);
  };


  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-500/30 max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center justify-between">
              Preset Library
              <Button onClick={() => setShowSchedules(!showSchedules)} variant="outline" size="sm">
                <CalendarDays className="w-4 h-4 mr-2" />
                {showSchedules ? 'Hide' : 'My'} Schedules
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {showSchedules ? (
              <ScheduleList onEdit={handleEditSchedule} refreshTrigger={scheduleRefresh} />
            ) : (
              <>
                {category === 'All' && (
                  <>
                    <AIRecommendations onPresetSelect={handlePlay} />
                    <TrendingPresets onPlay={handlePlay} />
                  </>
                )}

                <Tabs value={category} onValueChange={setCategory}>
                  <TabsList className="bg-purple-800/30">
                    <TabsTrigger value="All">All</TabsTrigger>
                    <TabsTrigger value="Focus">Focus</TabsTrigger>
                    <TabsTrigger value="Relaxation">Relaxation</TabsTrigger>
                    <TabsTrigger value="Healing">Healing</TabsTrigger>
                    <TabsTrigger value="Energy">Energy</TabsTrigger>
                  </TabsList>
                  <TabsContent value={category} className="mt-4">
                    {loading ? (
                      <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {presets.map(preset => (
                          <PresetCard 
                            key={preset.id} 
                            preset={preset} 
                            onPlay={() => handlePlay(preset)} 
                            onRatingChange={loadPresets}
                            onSchedule={() => handleSchedule(preset)}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {scheduleModalOpen && (
        <ScheduleModal
          isOpen={scheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
          presetId={selectedPreset?.id || editingSchedule?.preset_id || ''}
          presetName={selectedPreset?.preset_name || editingSchedule?.schedule_name || ''}
          schedule={editingSchedule}
          onSuccess={() => {
            setScheduleRefresh(prev => prev + 1);
            setScheduleModalOpen(false);
          }}
        />
      )}
    </>
  );
};

