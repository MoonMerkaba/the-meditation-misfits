import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Play, Pause, Volume2, VolumeX, Music, Headphones,
  Wind, Droplets, Flame, TreePine, Bell, Waves,
  SkipBack, SkipForward, Repeat, Shuffle, Heart
} from 'lucide-react';

interface AudioTrack {
  id: string;
  name: string;
  category: string;
  section?: string;
  duration?: number;
  audio_url: string;
  description?: string;
}

interface AmbientSound {
  id: string;
  name: string;
  category: string;
  audio_url: string;
  icon: string;
  description?: string;
}

interface AmbientLayer {
  sound: AmbientSound;
  volume: number;
  isPlaying: boolean;
  audioRef: HTMLAudioElement | null;
}

export function RitualAudioPlayer() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [ambientSounds, setAmbientSounds] = useState<AmbientSound[]>([]);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ambientLayers, setAmbientLayers] = useState<AmbientLayer[]>([]);
  const [masterAmbientVolume, setMasterAmbientVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open) {
      loadAudioContent();
    }
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [open]);

  const loadAudioContent = async () => {
    try {
      // Load meditation tracks
      const { data: trackData } = await supabase
        .from('ritual_audio_tracks')
        .select('*')
        .order('category');
      
      if (trackData) setTracks(trackData);

      // Load ambient sounds
      const { data: ambientData } = await supabase
        .from('ambient_sounds')
        .select('*')
        .order('category');
      
      if (ambientData) setAmbientSounds(ambientData);
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const playTrack = (track: AudioTrack) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Create new audio element
    const audio = new Audio(track.audio_url);
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setProgress(0);
    });

    audio.play().catch(() => {
      // Audio URL might not exist, use placeholder behavior
      toast.info('Audio preview not available');
    });

    setCurrentTrack(track);
    setIsPlaying(true);

    // Update progress
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    progressInterval.current = setInterval(() => {
      if (audioRef.current) {
        setProgress(audioRef.current.currentTime);
      }
    }, 100);

    // Track listening history
    if (user) {
      supabase.from('ritual_listening_history').insert({
        user_id: user.id,
        track_id: track.id
      });
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleProgressChange = (value: number[]) => {
    const newProgress = value[0];
    setProgress(newProgress);
    if (audioRef.current) {
      audioRef.current.currentTime = newProgress;
    }
  };

  const toggleAmbientSound = (sound: AmbientSound) => {
    const existingIndex = ambientLayers.findIndex(l => l.sound.id === sound.id);
    
    if (existingIndex >= 0) {
      // Remove layer
      const layer = ambientLayers[existingIndex];
      if (layer.audioRef) {
        layer.audioRef.pause();
      }
      setAmbientLayers(prev => prev.filter((_, i) => i !== existingIndex));
    } else {
      // Add new layer
      const audio = new Audio(sound.audio_url);
      audio.loop = true;
      audio.volume = masterAmbientVolume;
      audio.play().catch(() => {
        // Placeholder behavior
      });

      setAmbientLayers(prev => [...prev, {
        sound,
        volume: masterAmbientVolume,
        isPlaying: true,
        audioRef: audio
      }]);
    }
  };

  const updateAmbientLayerVolume = (soundId: string, volume: number) => {
    setAmbientLayers(prev => prev.map(layer => {
      if (layer.sound.id === soundId) {
        if (layer.audioRef) {
          layer.audioRef.volume = volume;
        }
        return { ...layer, volume };
      }
      return layer;
    }));
  };

  const updateMasterAmbientVolume = (value: number[]) => {
    const newVolume = value[0];
    setMasterAmbientVolume(newVolume);
    ambientLayers.forEach(layer => {
      if (layer.audioRef) {
        layer.audioRef.volume = newVolume * layer.volume;
      }
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAmbientIcon = (icon: string) => {
    switch (icon) {
      case '🌧️': return <Droplets className="w-5 h-5" />;
      case '🌲': return <TreePine className="w-5 h-5" />;
      case '🌊': return <Waves className="w-5 h-5" />;
      case '🔥': return <Flame className="w-5 h-5" />;
      case '🎐': return <Wind className="w-5 h-5" />;
      case '🔔': return <Bell className="w-5 h-5" />;
      default: return <Music className="w-5 h-5" />;
    }
  };

  const tracksByCategory = tracks.reduce((acc, track) => {
    if (!acc[track.category]) acc[track.category] = [];
    acc[track.category].push(track);
    return acc;
  }, {} as Record<string, AudioTrack[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
          <Headphones className="w-4 h-4 mr-2" />
          Audio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden bg-slate-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Headphones className="w-5 h-5 text-purple-400" />
            Ritual Audio & Ambient Sounds
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="meditations" className="flex-1">
          <TabsList className="bg-white/5 mb-4">
            <TabsTrigger value="meditations" className="data-[state=active]:bg-purple-500">
              <Music className="w-4 h-4 mr-2" />Meditations
            </TabsTrigger>
            <TabsTrigger value="ambient" className="data-[state=active]:bg-purple-500">
              <Waves className="w-4 h-4 mr-2" />Ambient Mixer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="meditations" className="space-y-4 max-h-[50vh] overflow-y-auto">
            {/* Now Playing */}
            {currentTrack && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/30 flex items-center justify-center">
                    <Music className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{currentTrack.name}</h4>
                    <p className="text-sm text-white/60">{currentTrack.category}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <Slider
                    value={[progress]}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleProgressChange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button variant="ghost" size="sm" className="text-white/60">
                    <SkipBack className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={togglePlayPause}
                    className="w-12 h-12 rounded-full bg-purple-500 hover:bg-purple-600"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white/60">
                    <SkipForward className="w-5 h-5" />
                  </Button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-3 mt-3">
                  <VolumeX className="w-4 h-4 text-white/40" />
                  <Slider
                    value={[volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="flex-1"
                  />
                  <Volume2 className="w-4 h-4 text-white/40" />
                </div>
              </div>
            )}

            {/* Track List */}
            {Object.entries(tracksByCategory).map(([category, categoryTracks]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-white/60 mb-2 capitalize">{category}</h4>
                <div className="space-y-2">
                  {categoryTracks.map(track => (
                    <button
                      key={track.id}
                      onClick={() => playTrack(track)}
                      className={`w-full p-3 rounded-xl text-left transition-all ${
                        currentTrack?.id === track.id
                          ? 'bg-purple-500/20 border border-purple-500/30'
                          : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                          {currentTrack?.id === track.id && isPlaying ? (
                            <div className="flex gap-0.5">
                              <div className="w-1 h-4 bg-purple-400 animate-pulse" />
                              <div className="w-1 h-3 bg-purple-400 animate-pulse delay-75" />
                              <div className="w-1 h-5 bg-purple-400 animate-pulse delay-150" />
                            </div>
                          ) : (
                            <Play className="w-4 h-4 text-white/60" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{track.name}</p>
                          <p className="text-xs text-white/50">{track.description}</p>
                        </div>
                        {track.duration && (
                          <span className="text-xs text-white/40">{formatTime(track.duration)}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="ambient" className="space-y-4 max-h-[50vh] overflow-y-auto">
            {/* Master Volume */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">Master Volume</span>
                <span className="text-sm text-white/40">{Math.round(masterAmbientVolume * 100)}%</span>
              </div>
              <Slider
                value={[masterAmbientVolume]}
                max={1}
                step={0.01}
                onValueChange={updateMasterAmbientVolume}
              />
            </div>

            {/* Active Layers */}
            {ambientLayers.length > 0 && (
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <h4 className="text-sm font-medium text-white mb-3">Active Sounds</h4>
                <div className="space-y-3">
                  {ambientLayers.map(layer => (
                    <div key={layer.sound.id} className="flex items-center gap-3">
                      <button
                        onClick={() => toggleAmbientSound(layer.sound)}
                        className="w-8 h-8 rounded-lg bg-purple-500/30 flex items-center justify-center text-purple-300"
                      >
                        {getAmbientIcon(layer.sound.icon)}
                      </button>
                      <span className="text-sm text-white flex-shrink-0 w-24">{layer.sound.name}</span>
                      <Slider
                        value={[layer.volume]}
                        max={1}
                        step={0.01}
                        onValueChange={(v) => updateAmbientLayerVolume(layer.sound.id, v[0])}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sound Library */}
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-3">Sound Library</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ambientSounds.map(sound => {
                  const isActive = ambientLayers.some(l => l.sound.id === sound.id);
                  return (
                    <button
                      key={sound.id}
                      onClick={() => toggleAmbientSound(sound)}
                      className={`p-4 rounded-xl text-center transition-all ${
                        isActive
                          ? 'bg-purple-500/30 border border-purple-500/50'
                          : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                        isActive ? 'bg-purple-500/30 text-purple-300' : 'bg-white/10 text-white/60'
                      }`}>
                        {getAmbientIcon(sound.icon)}
                      </div>
                      <p className="text-sm font-medium text-white">{sound.name}</p>
                      <p className="text-xs text-white/50 mt-1">{sound.category}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
