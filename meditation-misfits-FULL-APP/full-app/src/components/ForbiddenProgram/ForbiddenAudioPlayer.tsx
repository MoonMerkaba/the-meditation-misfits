import { useState, useEffect, useRef } from 'react';
import { ForbiddenProtocol } from '@/data/forbiddenProtocols';
import { ForbiddenAudioEngine, getAudioEngine } from '@/lib/forbiddenAudioEngine';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, Pause, Volume2, VolumeX, 
  Radio, AlertCircle, Headphones
} from 'lucide-react';

interface ForbiddenAudioPlayerProps {
  protocol: ForbiddenProtocol;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onComplete?: () => void;
}

export function ForbiddenAudioPlayer({ 
  protocol, 
  onPlayStateChange,
  onComplete 
}: ForbiddenAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const engineRef = useRef<ForbiddenAudioEngine | null>(null);

  useEffect(() => {
    engineRef.current = getAudioEngine();

    engineRef.current.setCallbacks(
      (time, dur) => {
        setCurrentTime(time);
        setDuration(dur);
      },
      () => {
        setIsPlaying(false);
        onPlayStateChange?.(false);
        onComplete?.();
      }
    );

    return () => {
      if (engineRef.current?.getIsPlaying()) {
        engineRef.current.stop();
      }
    };
  }, [protocol.id]);

  const handlePlayPause = async () => {
    if (!engineRef.current) return;

    if (isPlaying) {
      engineRef.current.stop();
      setIsPlaying(false);
      onPlayStateChange?.(false);
    } else {
      setIsInitializing(true);
      setError(null);
      
      try {
        await engineRef.current.start({
          ...protocol.audioConfig,
          masterVolume: isMuted ? 0 : volume,
          layerCount: protocol.techSpecs.layerCount
        });
        setIsPlaying(true);
        setDuration(protocol.audioConfig.durationSeconds);
        onPlayStateChange?.(true);
      } catch (err) {
        setError('Failed to initialize audio. Please try again.');
        console.error('Audio engine error:', err);
      } finally {
        setIsInitializing(false);
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    engineRef.current?.setVolume(newVolume);
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    engineRef.current?.setVolume(newMuted ? 0 : volume);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Headphones reminder */}
      <div className="flex items-center justify-center gap-2 p-3 bg-[#FF00BF]/10 border border-[#FF00BF]/30">
        <Headphones className="w-4 h-4 text-[#FF00BF]" />
        <span className="text-[#A2A1A3] text-sm">
          Headphones required for binaural effect
        </span>
      </div>

      {/* Tech specs display */}
      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div className="bg-[#444343]/30 p-3">
          <span className="text-[#6683A0] block mb-1">FREQUENCY</span>
          <span className="text-white">{protocol.techSpecs.primaryFrequency}</span>
        </div>
        <div className="bg-[#444343]/30 p-3">
          <span className="text-[#6683A0] block mb-1">BINAURAL</span>
          <span className="text-white">{protocol.techSpecs.binauralRange}</span>
        </div>
        <div className="bg-[#444343]/30 p-3">
          <span className="text-[#6683A0] block mb-1">NOISE BED</span>
          <span className="text-white">{protocol.techSpecs.noiseBed}</span>
        </div>
        <div className="bg-[#444343]/30 p-3">
          <span className="text-[#6683A0] block mb-1">SPATIAL</span>
          <span className="text-white">{protocol.techSpecs.spatialMovement}</span>
        </div>
      </div>

      {/* Waveform visualization */}
      <div className="relative h-20 bg-[#444343]/20 overflow-hidden">
        {/* Progress bar */}
        <div 
          className="absolute inset-y-0 left-0 bg-[#FF00BF]/10 transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
        
        {/* Waveform lines */}
        <div className="absolute inset-0 flex items-center justify-center gap-[2px] px-2">
          {Array.from({ length: 80 }).map((_, i) => {
            const isActive = (i / 80) * 100 < progressPercent;
            const height = 30 + Math.sin(i * 0.2) * 20 + Math.sin(i * 0.5) * 10;
            return (
              <div
                key={i}
                className={`w-[2px] transition-all duration-100 ${
                  isActive ? 'bg-[#FF00BF]' : 'bg-[#444343]'
                }`}
                style={{ 
                  height: `${height}%`,
                  opacity: isPlaying && isActive ? 0.7 + Math.random() * 0.3 : 0.5
                }}
              />
            );
          })}
        </div>

        {/* Signal indicator */}
        {isPlaying && (
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <Radio className="w-3 h-3 text-[#FF00BF] animate-pulse" />
            <span className="text-[#FF00BF] text-xs font-mono tracking-wider">GENERATING</span>
          </div>
        )}
      </div>

      {/* Time display */}
      <div className="flex items-center justify-between text-sm font-mono">
        <span className="text-[#A2A1A3]">{formatTime(currentTime)}</span>
        <span className="text-[#6683A0]">{formatTime(duration || protocol.audioConfig.durationSeconds)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Play/Pause button */}
        <Button
          onClick={handlePlayPause}
          disabled={isInitializing}
          className={`w-14 h-14 ${
            isPlaying 
              ? 'bg-[#FF00BF] hover:bg-[#FF00BF]/80' 
              : 'bg-[#444343] hover:bg-[#444343]/80 border border-[#FF00BF]/50'
          }`}
        >
          {isInitializing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white ml-1" />
          )}
        </Button>

        {/* Volume controls */}
        <div className="flex-1 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-[#A2A1A3] hover:text-white hover:bg-[#444343]/50"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
          
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={handleVolumeChange}
            max={1}
            step={0.01}
            className="flex-1"
          />
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-[#FF00BF]/10 border border-[#FF00BF]/30">
          <AlertCircle className="w-4 h-4 text-[#FF00BF]" />
          <span className="text-[#A2A1A3] text-sm">{error}</span>
        </div>
      )}

      {/* Protocol info */}
      <div className="text-center pt-4 border-t border-[#444343]/50">
        <p className="text-[#6683A0] text-xs font-mono uppercase tracking-wider">
          {protocol.codename}
        </p>
        <p className="text-[#444343] text-xs mt-1">
          Real-time generated audio — {protocol.techSpecs.layerCount} layers
        </p>
      </div>
    </div>
  );
}
