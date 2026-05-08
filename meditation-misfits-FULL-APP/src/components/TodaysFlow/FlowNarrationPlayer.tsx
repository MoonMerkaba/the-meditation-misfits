import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Volume2, VolumeX, Play, Pause, Loader2, 
  Settings, Download, RefreshCw, Mic
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type VoiceStyle = 'calm-female' | 'soothing-male' | 'mystical';

interface FlowNarrationPlayerProps {
  text: string;
  stepId: string;
  autoPlay?: boolean;
  onComplete?: () => void;
  className?: string;
}

const voiceOptions: { value: VoiceStyle; label: string; description: string }[] = [
  { value: 'calm-female', label: 'Calm Female', description: 'Gentle and soothing' },
  { value: 'soothing-male', label: 'Soothing Male', description: 'Deep and grounding' },
  { value: 'mystical', label: 'Mystical', description: 'Ethereal and enchanting' }
];

export function FlowNarrationPlayer({ 
  text, 
  stepId, 
  autoPlay = false,
  onComplete,
  className = ''
}: FlowNarrationPlayerProps) {
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Settings
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>('calm-female');
  const [speed, setSpeed] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  // Load user preferences
  useEffect(() => {
    loadPreferences();
  }, [user]);

  // Auto-play when audio is ready
  useEffect(() => {
    if (autoPlay && audioUrl && audioRef.current) {
      playAudio();
    }
  }, [audioUrl, autoPlay]);

  const loadPreferences = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('flow_narration_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setVoiceStyle(data.voice_style);
        setSpeed(data.speed);
      }
    } catch (error) {
      // No preferences saved yet, use defaults
    }
  };

  const savePreferences = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('flow_narration_preferences')
        .upsert({
          user_id: user.id,
          voice_style: voiceStyle,
          speed: speed,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      toast.success('Preferences saved');
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const generateNarration = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Check local cache first
      const cacheKey = `flow-narration-${stepId}-${voiceStyle}-${speed}`;
      const cachedUrl = localStorage.getItem(cacheKey);
      
      if (cachedUrl) {
        setAudioUrl(cachedUrl);
        setIsDownloaded(true);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-flow-narration', {
        body: {
          text,
          voiceStyle,
          speed,
          stepId
        }
      });

      if (error) throw error;

      if (data?.audioUrl) {
        setAudioUrl(data.audioUrl);
        
        // Cache for offline use
        localStorage.setItem(cacheKey, data.audioUrl);
        setIsDownloaded(true);
      }
    } catch (error: any) {
      console.error('Error generating narration:', error);
      toast.error('Failed to generate narration');
    } finally {
      setIsLoading(false);
    }
  }, [text, voiceStyle, speed, stepId]);

  const playAudio = async () => {
    if (!audioUrl) {
      await generateNarration();
      return;
    }

    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    if (onComplete) {
      onComplete();
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      const seekTime = (value[0] / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
      setProgress(value[0]);
    }
  };

  const regenerateAudio = async () => {
    // Clear cache and regenerate
    const cacheKey = `flow-narration-${stepId}-${voiceStyle}-${speed}`;
    localStorage.removeItem(cacheKey);
    setAudioUrl(null);
    setIsDownloaded(false);
    await generateNarration();
  };

  const downloadForOffline = async () => {
    if (!audioUrl) {
      await generateNarration();
    }
    toast.success('Audio saved for offline playback');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-white/5 rounded-xl p-4 border border-white/10 ${className}`}>
      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlay}
          disabled={isLoading}
          className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>

        {/* Progress and Controls */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-white/60">
              {voiceOptions.find(v => v.value === voiceStyle)?.label}
            </span>
            <span className="text-xs text-white/40">
              {speed}x
            </span>
            {isDownloaded && (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <Download className="w-3 h-3" />
                Saved
              </span>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <Slider
              value={[progress]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="flex-1"
              disabled={!audioUrl}
            />
            <span className="text-xs text-white/40 w-16 text-right">
              {audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'} / {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Mute Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="text-white/60 hover:text-white"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </Button>

        {/* Settings Popover */}
        <Popover open={showSettings} onOpenChange={setShowSettings}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60 hover:text-white"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 bg-slate-900 border-white/10" align="end">
            <div className="space-y-4">
              <h4 className="font-medium text-white">Narration Settings</h4>
              
              {/* Voice Selection */}
              <div className="space-y-2">
                <label className="text-sm text-white/60">Voice Style</label>
                <div className="grid gap-2">
                  {voiceOptions.map((voice) => (
                    <button
                      key={voice.value}
                      onClick={() => setVoiceStyle(voice.value)}
                      className={`p-3 rounded-lg text-left transition-all ${
                        voiceStyle === voice.value
                          ? 'bg-purple-500/30 border border-purple-500/50'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-sm text-white">{voice.label}</div>
                      <div className="text-xs text-white/50">{voice.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed Control */}
              <div className="space-y-2">
                <label className="text-sm text-white/60">
                  Speaking Speed: {speed}x
                </label>
                <Slider
                  value={[speed]}
                  onValueChange={([v]) => setSpeed(v)}
                  min={0.5}
                  max={1.5}
                  step={0.1}
                />
                <div className="flex justify-between text-xs text-white/40">
                  <span>Slower</span>
                  <span>Faster</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={regenerateAudio}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Regenerate
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    savePreferences();
                    setShowSettings(false);
                  }}
                  className="flex-1 bg-purple-500 hover:bg-purple-600"
                >
                  Save
                </Button>
              </div>

              {/* Download for Offline */}
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadForOffline}
                className="w-full text-white/60 hover:text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Save for Offline
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
