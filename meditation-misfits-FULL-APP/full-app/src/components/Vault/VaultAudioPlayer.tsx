import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Radio,
  Waves,
  Zap,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface VaultAudioPlayerProps {
  audioUrl: string;
  protocolName: string;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

// Audio file mapping to existing Soundicine files
const BASE_URL = "https://b68a5bcd6bdd8d5e08d002edc5589e48.r2.cloudflarestorage.com/soundicine/";

export function VaultAudioPlayer({ audioUrl, protocolName, onPlayStateChange }: VaultAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Overlay effect states
  const [tapeHissEnabled, setTapeHissEnabled] = useState(false);
  const [staticEnabled, setStaticEnabled] = useState(false);
  const [ambientHumEnabled, setAmbientHumEnabled] = useState(false);
  const [overlayVolume, setOverlayVolume] = useState(15);
  
  // Audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  // Overlay audio nodes
  const tapeHissNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const staticNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const ambientHumNodeRef = useRef<OscillatorNode | null>(null);
  const overlayGainRef = useRef<GainNode | null>(null);

  // Get the full audio URL
  const getFullAudioUrl = useCallback(() => {
    // If it's already a full URL, use it
    if (audioUrl.startsWith('http')) {
      return audioUrl;
    }
    // Otherwise, construct from base URL
    return `${BASE_URL}${audioUrl}`;
  }, [audioUrl]);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      gainNodeRef.current = audioContextRef.current.createGain();
      overlayGainRef.current = audioContextRef.current.createGain();
      
      gainNodeRef.current.connect(audioContextRef.current.destination);
      overlayGainRef.current.connect(audioContextRef.current.destination);
      overlayGainRef.current.gain.value = overlayVolume / 100;
    }
    
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, [overlayVolume]);

  // Create noise buffer for tape hiss and static
  const createNoiseBuffer = useCallback((type: 'hiss' | 'static'): AudioBuffer | null => {
    if (!audioContextRef.current) return null;
    
    const sampleRate = audioContextRef.current.sampleRate;
    const length = sampleRate * 2; // 2 second buffer
    const buffer = audioContextRef.current.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      if (type === 'hiss') {
        // Tape hiss - filtered white noise with subtle variations
        let lastValue = 0;
        for (let i = 0; i < length; i++) {
          // Low-pass filtered noise for tape hiss effect
          const white = Math.random() * 2 - 1;
          lastValue = lastValue * 0.95 + white * 0.05;
          data[i] = lastValue * 0.3;
        }
      } else {
        // Static - more aggressive noise with occasional crackles
        for (let i = 0; i < length; i++) {
          const white = Math.random() * 2 - 1;
          // Add occasional crackles
          const crackle = Math.random() > 0.9995 ? (Math.random() * 2 - 1) * 3 : 0;
          data[i] = (white * 0.15 + crackle) * 0.5;
        }
      }
    }
    
    return buffer;
  }, []);

  // Start tape hiss overlay
  const startTapeHiss = useCallback(() => {
    if (!audioContextRef.current || !overlayGainRef.current) return;
    
    stopTapeHiss();
    
    const buffer = createNoiseBuffer('hiss');
    if (!buffer) return;
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    
    // Add a low-pass filter for more authentic tape sound
    const filter = audioContextRef.current.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3000;
    
    source.connect(filter);
    filter.connect(overlayGainRef.current);
    source.start();
    
    tapeHissNodeRef.current = source;
  }, [createNoiseBuffer]);

  const stopTapeHiss = useCallback(() => {
    if (tapeHissNodeRef.current) {
      try {
        tapeHissNodeRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      tapeHissNodeRef.current = null;
    }
  }, []);

  // Start static overlay
  const startStatic = useCallback(() => {
    if (!audioContextRef.current || !overlayGainRef.current) return;
    
    stopStatic();
    
    const buffer = createNoiseBuffer('static');
    if (!buffer) return;
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    
    // Add band-pass filter for radio static effect
    const filter = audioContextRef.current.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 0.5;
    
    source.connect(filter);
    filter.connect(overlayGainRef.current);
    source.start();
    
    staticNodeRef.current = source;
  }, [createNoiseBuffer]);

  const stopStatic = useCallback(() => {
    if (staticNodeRef.current) {
      try {
        staticNodeRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      staticNodeRef.current = null;
    }
  }, []);

  // Start ambient hum overlay
  const startAmbientHum = useCallback(() => {
    if (!audioContextRef.current || !overlayGainRef.current) return;
    
    stopAmbientHum();
    
    // Create a low frequency hum (60Hz electrical hum)
    const oscillator = audioContextRef.current.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 60;
    
    // Add harmonics for more realistic hum
    const oscillator2 = audioContextRef.current.createOscillator();
    oscillator2.type = 'sine';
    oscillator2.frequency.value = 120;
    
    const humGain = audioContextRef.current.createGain();
    humGain.gain.value = 0.3;
    
    const humGain2 = audioContextRef.current.createGain();
    humGain2.gain.value = 0.15;
    
    oscillator.connect(humGain);
    oscillator2.connect(humGain2);
    humGain.connect(overlayGainRef.current);
    humGain2.connect(overlayGainRef.current);
    
    oscillator.start();
    oscillator2.start();
    
    ambientHumNodeRef.current = oscillator;
  }, []);

  const stopAmbientHum = useCallback(() => {
    if (ambientHumNodeRef.current) {
      try {
        ambientHumNodeRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      ambientHumNodeRef.current = null;
    }
  }, []);

  // Handle overlay toggles
  useEffect(() => {
    if (isPlaying) {
      if (tapeHissEnabled) {
        startTapeHiss();
      } else {
        stopTapeHiss();
      }
    }
  }, [tapeHissEnabled, isPlaying, startTapeHiss, stopTapeHiss]);

  useEffect(() => {
    if (isPlaying) {
      if (staticEnabled) {
        startStatic();
      } else {
        stopStatic();
      }
    }
  }, [staticEnabled, isPlaying, startStatic, stopStatic]);

  useEffect(() => {
    if (isPlaying) {
      if (ambientHumEnabled) {
        startAmbientHum();
      } else {
        stopAmbientHum();
      }
    }
  }, [ambientHumEnabled, isPlaying, startAmbientHum, stopAmbientHum]);

  // Update overlay volume
  useEffect(() => {
    if (overlayGainRef.current) {
      overlayGainRef.current.gain.value = overlayVolume / 100;
    }
  }, [overlayVolume]);

  // Load and play audio
  const togglePlay = async () => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = 'anonymous';
      
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
        setIsLoading(false);
      });
      
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        onPlayStateChange?.(false);
        stopAllOverlays();
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        setError('Failed to load audio file. Please try again.');
        setIsLoading(false);
      });
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false);
      stopAllOverlays();
    } else {
      initAudioContext();
      setIsLoading(true);
      setError(null);
      
      const fullUrl = getFullAudioUrl();
      
      if (audioRef.current.src !== fullUrl) {
        audioRef.current.src = fullUrl;
      }
      
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        onPlayStateChange?.(true);
        
        // Start enabled overlays
        if (tapeHissEnabled) startTapeHiss();
        if (staticEnabled) startStatic();
        if (ambientHumEnabled) startAmbientHum();
      } catch (err) {
        console.error('Playback error:', err);
        setError('Failed to play audio. Please try again.');
        setIsLoading(false);
      }
    }
  };

  const stopAllOverlays = useCallback(() => {
    stopTapeHiss();
    stopStatic();
    stopAmbientHum();
  }, [stopTapeHiss, stopStatic, stopAmbientHum]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Seek functionality
  const handleSeek = (value: number[]) => {
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = (value[0] / 100) * duration;
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      stopAllOverlays();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAllOverlays]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-4 border border-green-600 bg-black/80 p-4 rounded">
      {/* Protocol Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className={`w-4 h-4 ${isPlaying ? 'text-green-400 animate-pulse' : 'text-green-600'}`} />
          <span className="text-green-400 text-sm font-mono">
            {isPlaying ? 'PROTOCOL ACTIVE' : 'PROTOCOL STANDBY'}
          </span>
        </div>
        {isPlaying && (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-xs font-mono">REC</span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/30 border border-red-600 p-3 rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-300 text-sm">{error}</span>
          <Button 
            size="sm" 
            variant="ghost" 
            className="ml-auto text-red-400 hover:text-red-300"
            onClick={() => setError(null)}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="relative h-2 bg-green-900/50 rounded overflow-hidden">
          <div 
            className="absolute h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
          {isPlaying && (
            <div 
              className="absolute h-full w-1 bg-white/50 animate-pulse"
              style={{ left: `${progressPercent}%` }}
            />
          )}
        </div>
        <Slider
          value={[progressPercent]}
          onValueChange={handleSeek}
          max={100}
          step={0.1}
          className="opacity-0 absolute inset-0 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-green-500 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center gap-4">
        <Button
          onClick={togglePlay}
          disabled={isLoading}
          className={`flex-1 font-mono text-lg py-6 ${
            isPlaying 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-black'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              INITIALIZING...
            </>
          ) : isPlaying ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              TERMINATE PROTOCOL
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              ACTIVATE PROTOCOL
            </>
          )}
        </Button>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="text-green-400 hover:text-green-300 hover:bg-green-900/30"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <Slider
            value={[volume]}
            onValueChange={(v) => setVolume(v[0])}
            max={100}
            step={1}
            className="w-24"
          />
        </div>
      </div>

      {/* Overlay Effects Section */}
      <div className="border-t border-green-700 pt-4 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-green-300 text-sm font-mono">SIGNAL AUGMENTATION</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Tape Hiss */}
          <div className="flex items-center justify-between bg-green-950/30 p-2 rounded border border-green-800">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-green-500" />
              <span className="text-green-400 text-xs font-mono">TAPE HISS</span>
            </div>
            <Switch
              checked={tapeHissEnabled}
              onCheckedChange={setTapeHissEnabled}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          {/* Static */}
          <div className="flex items-center justify-between bg-green-950/30 p-2 rounded border border-green-800">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-green-500" />
              <span className="text-green-400 text-xs font-mono">STATIC</span>
            </div>
            <Switch
              checked={staticEnabled}
              onCheckedChange={setStaticEnabled}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          {/* Ambient Hum */}
          <div className="flex items-center justify-between bg-green-950/30 p-2 rounded border border-green-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-500" />
              <span className="text-green-400 text-xs font-mono">MECH HUM</span>
            </div>
            <Switch
              checked={ambientHumEnabled}
              onCheckedChange={setAmbientHumEnabled}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </div>

        {/* Overlay Volume */}
        {(tapeHissEnabled || staticEnabled || ambientHumEnabled) && (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-green-500 text-xs font-mono">OVERLAY INTENSITY:</span>
            <Slider
              value={[overlayVolume]}
              onValueChange={(v) => setOverlayVolume(v[0])}
              max={50}
              step={1}
              className="flex-1"
            />
            <span className="text-green-400 text-xs font-mono w-8">{overlayVolume}%</span>
          </div>
        )}
      </div>

      {/* Visual Feedback During Playback */}
      {isPlaying && (
        <div className="flex items-center justify-center gap-1 py-2">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-green-500 rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 20 + 8}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${0.3 + Math.random() * 0.3}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
