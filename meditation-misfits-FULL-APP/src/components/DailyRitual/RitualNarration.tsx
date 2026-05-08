import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Play, Pause, Volume2, VolumeX, Download, Loader2, Mic, Music, Settings } from 'lucide-react';
import { generateRitualNarration, DailyRitual } from '@/lib/dailyRitual';
import { useToast } from '@/hooks/use-toast';

interface RitualNarrationProps {
  ritual: DailyRitual;
  onClose?: () => void;
}

type VoiceStyle = 'calm_female' | 'soothing_male' | 'mystical';

const voiceOptions: { value: VoiceStyle; label: string; description: string }[] = [
  { value: 'calm_female', label: 'Serene Guide', description: 'Calm, nurturing female voice' },
  { value: 'soothing_male', label: 'Grounded Sage', description: 'Deep, soothing male voice' },
  { value: 'mystical', label: 'Ethereal Spirit', description: 'Mystical, otherworldly tone' }
];

const backgroundTracks = [
  { id: 'none', name: 'No Background', icon: VolumeX },
  { id: 'rain', name: 'Gentle Rain', icon: Music },
  { id: 'forest', name: 'Forest Ambience', icon: Music },
  { id: 'bowls', name: 'Crystal Bowls', icon: Music },
  { id: 'ocean', name: 'Ocean Waves', icon: Music },
  { id: '432hz', name: '432Hz Drone', icon: Music }
];

export function RitualNarration({ ritual, onClose }: RitualNarrationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>('calm_female');
  const [speakingSpeed, setSpeakingSpeed] = useState(1.0);
  const [volume, setVolume] = useState(0.8);
  const [backgroundTrack, setBackgroundTrack] = useState('none');
  const [backgroundVolume, setBackgroundVolume] = useState(0.3);
  const [showSettings, setShowSettings] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.pause();
      }
    };
  }, []);

  const generateNarration = async () => {
    setIsGenerating(true);
    try {
      const result = await generateRitualNarration({
        shadow_prompt: ritual.shadow_work.prompt,
        recovery_reminder: ritual.recovery.reminder,
        intention: ritual.intention,
        breathwork_guide: `Breathe in for ${ritual.breathwork.inhale} counts, hold for ${ritual.breathwork.hold} counts, and exhale for ${ritual.breathwork.exhale} counts.`,
        affirmation: ritual.breathwork.affirmation
      }, voiceStyle, speakingSpeed);

      if (result.success && result.audio_data) {
        const audioBlob = base64ToBlob(result.audio_data, 'audio/mp3');
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        toast({
          title: 'Narration Generated',
          description: 'Your personalized ritual narration is ready to play.'
        });
      } else {
        throw new Error(result.error || 'Failed to generate narration');
      }
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Could not generate narration. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.pause();
      }
    } else {
      audioRef.current.play();
      if (backgroundAudioRef.current && backgroundTrack !== 'none') {
        backgroundAudioRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleBackgroundVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setBackgroundVolume(newVolume);
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.volume = newVolume;
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `daily-ritual-${ritual.date}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Download Started',
      description: 'Your ritual narration is being downloaded.'
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border-purple-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-200">
            <Mic className="w-5 h-5" />
            Guided Narration
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-purple-300 hover:text-purple-100"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Settings Panel */}
        {showSettings && (
          <div className="space-y-4 p-4 bg-black/20 rounded-lg border border-purple-500/20">
            <div className="space-y-2">
              <Label className="text-purple-200">Voice Style</Label>
              <Select value={voiceStyle} onValueChange={(v) => setVoiceStyle(v as VoiceStyle)}>
                <SelectTrigger className="bg-purple-900/30 border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voiceOptions.map((voice) => (
                    <SelectItem key={voice.value} value={voice.value}>
                      <div>
                        <div className="font-medium">{voice.label}</div>
                        <div className="text-xs text-gray-400">{voice.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-purple-200">Speaking Speed: {speakingSpeed.toFixed(1)}x</Label>
              <Slider
                value={[speakingSpeed]}
                onValueChange={(v) => setSpeakingSpeed(v[0])}
                min={0.5}
                max={2.0}
                step={0.1}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-purple-400">
                <span>Slower</span>
                <span>Faster</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-purple-200">Background Sound</Label>
              <Select value={backgroundTrack} onValueChange={setBackgroundTrack}>
                <SelectTrigger className="bg-purple-900/30 border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {backgroundTracks.map((track) => (
                    <SelectItem key={track.id} value={track.id}>
                      {track.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {backgroundTrack !== 'none' && (
              <div className="space-y-2">
                <Label className="text-purple-200">Background Volume</Label>
                <Slider
                  value={[backgroundVolume]}
                  onValueChange={handleBackgroundVolumeChange}
                  min={0}
                  max={1}
                  step={0.1}
                  className="py-2"
                />
              </div>
            )}
          </div>
        )}

        {/* Generate Button */}
        {!audioUrl && (
          <Button
            onClick={generateNarration}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Narration...
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Generate Guided Narration
              </>
            )}
          </Button>
        )}

        {/* Audio Player */}
        {audioUrl && (
          <div className="space-y-4">
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
            />

            {/* Progress Bar */}
            <div className="space-y-2">
              <Slider
                value={[progress]}
                onValueChange={handleSeek}
                max={duration || 100}
                step={0.1}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-purple-400">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlayback}
                className="w-14 h-14 rounded-full bg-purple-600/50 hover:bg-purple-600/70 text-white"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-purple-400" />
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                className="flex-1"
              />
            </div>

            {/* Download Button */}
            <Button
              variant="outline"
              onClick={downloadAudio}
              className="w-full border-purple-500/30 text-purple-200 hover:bg-purple-900/30"
            >
              <Download className="w-4 h-4 mr-2" />
              Download for Offline
            </Button>

            {/* Regenerate */}
            <Button
              variant="ghost"
              onClick={() => {
                setAudioUrl(null);
                setProgress(0);
                setDuration(0);
              }}
              className="w-full text-purple-400 hover:text-purple-200"
            >
              Generate New Narration
            </Button>
          </div>
        )}

        {/* Voice Preview */}
        <div className="text-center text-xs text-purple-400">
          Selected: {voiceOptions.find(v => v.value === voiceStyle)?.label}
        </div>
      </CardContent>
    </Card>
  );
}
