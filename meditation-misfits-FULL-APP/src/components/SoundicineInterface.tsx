import React, { useState, useRef, useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Play, Pause, Volume2, Heart, Save, Bookmark, AlertCircle, RefreshCw, CheckCircle, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { loadAudioWithRetry, AudioLoadResult } from '../lib/audioLoader';
import { audioPreloader } from '../lib/audioPreloader';
import { audioAnalytics } from '../lib/audioAnalytics';


const BASE_URL = "https://b68a5bcd6bdd8d5e08d002edc5589e48.r2.cloudflarestorage.com/soundicine/";

const FREQ_FILES = {
  alpha: ["Classic-alpha-5-mins-(learning)-220-230.wav", "Classic-alpha-10-mins-(learning)-220-230.wav"],
  theta: ["Classic-theta-5-mins-(meditation)-220-230.wav", "Classic-theta-10-mins-(meditation)-220-230.wav"],
  delta: ["Classic-delta-5-mins-(sleep)-220-230.wav", "Classic-delta-10-mins-(sleep)-220-230.wav"],
  beta: ["Classic-beta-5-mins-(focus)-220-230.wav", "Classic-beta-10-mins-(focus)-220-230.wav"],
  gamma: ["Classic-gamma-5-mins-(insight)-220-230.wav"],
  heart: ["Heart-639hz-5-mins-220-230.wav", "Heart-639hz-10-mins-220-230.wav"],
  root: ["Root-396hz-5-mins-220-230.wav"],
  schumann: ["Schumann-7.83hz-5-mins-220-230.wav"],
  jupiter: ["Jupiter-183hz-5-mins-220-230.wav"],
  venus: ["Venus-221hz-5-mins-220-230.wav"]
};

const prescriptions = {
  Calm: { freq: "alpha", desc: "Calming alpha waves" },
  Focus: { freq: "beta", desc: "Beta focus boost" },
  Sleep: { freq: "delta", desc: "Delta sleep induction" },
  Healing: { freq: "heart", desc: "Heart chakra 639Hz" },
  Release: { freq: "theta", desc: "Theta release waves" },
  Courage: { freq: "root", desc: "Root chakra grounding" }
};

const SoundicineInterface: React.FC = () => {
  const { user, addSession, addFavoriteStack } = useAuth();
  const [mode, setMode] = useState<'simple' | 'stack'>('simple');
  
  // Simple mode state
  const [time, setTime] = useState("5m");
  const [aim, setAim] = useState("Calm");
  const [center, setCenter] = useState("Mind");
  const [result, setResult] = useState("");
  
  // Stack mode state
  const [stackMain, setStackMain] = useState("alpha");
  const [stackSupport, setStackSupport] = useState("none");
  const [stackTime, setStackTime] = useState("10m");
  const [mainVol, setMainVol] = useState([70]);
  const [supportVol, setSupportVol] = useState([30]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stackName, setStackName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  
  // Audio loading state
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [loadResult, setLoadResult] = useState<AudioLoadResult | null>(null);
  
  const mainRef = useRef<HTMLAudioElement>(null);
  const supportRef = useRef<HTMLAudioElement>(null);


  
  
  // Enhanced audio event listeners with error handling and analytics tracking
  useEffect(() => {
    const main = mainRef.current;
    const support = supportRef.current;
    
    const handleMainError = (e: Event) => {
      console.error('Main audio error:', e);
      const audio = e.target as HTMLAudioElement;
      const errorMsg = audio.error ? 
        `Audio Error: ${audio.error.message} (Code: ${audio.error.code})` : 
        'Failed to load audio file';
      setAudioError(errorMsg);
      setAudioLoading(false);
    };
    
    const handleMainCanPlay = () => {
      console.log('Main audio ready to play');
      setAudioLoading(false);
      setAudioError(null);
    };
    
    const handleMainPlay = () => {
      console.log('Main audio playing');
      // Track play event for analytics
      if (main?.src) {
        const filename = main.src.split('/').pop()?.split('?')[0] || '';
        if (filename && filename.endsWith('.wav')) {
          audioAnalytics.trackPlay(filename);
        }
      }
    };
    
    if (main) {
      main.addEventListener('loadstart', () => {
        console.log('Main audio loading...');
        setAudioLoading(true);
      });
      main.addEventListener('canplay', handleMainCanPlay);
      main.addEventListener('error', handleMainError);
      main.addEventListener('play', handleMainPlay);
    }
    
    if (support) {
      support.addEventListener('loadstart', () => console.log('Support audio loading...'));
      support.addEventListener('canplay', () => console.log('Support audio ready to play'));
      support.addEventListener('error', (e) => console.error('Support audio error:', e));
      support.addEventListener('play', () => {
        console.log('Support audio playing');
        // Track support layer play
        if (support?.src) {
          const filename = support.src.split('/').pop()?.split('?')[0] || '';
          if (filename && filename.endsWith('.wav')) {
            audioAnalytics.trackPlay(filename);
          }
        }
      });
    }
    
    return () => {
      if (main) {
        main.removeEventListener('canplay', handleMainCanPlay);
        main.removeEventListener('error', handleMainError);
        main.removeEventListener('play', handleMainPlay);
      }
    };
  }, []);

  
  const getFile = (type: string, duration: string) => {
    const files = FREQ_FILES[type as keyof typeof FREQ_FILES];
    if (!files) return null;
    const timeMap: { [key: string]: number } = { "5m": 0, "10m": 1, "15m": 1, "20m": 1, "30m": 1 };
    return files[timeMap[duration]] || files[0];
  };

  const prescribe = async () => {
    const rx = prescriptions[aim as keyof typeof prescriptions] || prescriptions.Calm;
    const file = getFile(rx.freq, time);
    setResult(`${time} ${aim} dose: ${rx.desc}`);
    setAudioError(null);
    
    if (mainRef.current && file) {
      const fullUrl = `${BASE_URL}${file}`;
      console.log('Loading audio from:', fullUrl);
      
      // Check if audio is preloaded in cache
      const cached = audioPreloader.getCached(fullUrl);
      
      if (cached) {
        console.log('Using preloaded audio from cache');
        const blobUrl = URL.createObjectURL(cached.blob);
        mainRef.current.src = blobUrl;
        setLoadResult({ success: true, url: fullUrl, retries: 0 });
      } else {
        // Fallback to loading with retry
        setAudioLoading(true);
        const result = await loadAudioWithRetry(fullUrl);
        setLoadResult(result);
        
        if (result.success) {
          mainRef.current.src = fullUrl;
          console.log(`Audio loaded${result.retries ? ` after ${result.retries} retries` : ''}`);
        } else {
          setAudioError(result.error || 'Failed to load audio');
          setAudioLoading(false);
          console.error('Failed to load audio:', result.error);
        }
      }
    }
    
    // Track session if user is logged in
    if (user) {
      addSession({
        type: 'simple',
        duration: time,
        frequencies: [rx.freq],
        aim: aim,
        center: center
      });
    }
  };


  const retryLoad = () => {
    if (mode === 'simple') {
      prescribe();
    } else {
      playStack();
    }
  };


  const playStack = async () => {
    if (!isPlaying) {
      const mainFile = getFile(stackMain, stackTime);
      const supportFile = stackSupport !== "none" ? getFile(stackSupport, stackTime) : null;
      
      setAudioError(null);
      
      if (mainFile && mainRef.current) {
        const mainUrl = `${BASE_URL}${mainFile}`;
        console.log('Loading main stack audio from:', mainUrl);
        
        // Check if audio is preloaded in cache
        const cachedMain = audioPreloader.getCached(mainUrl);
        
        if (cachedMain) {
          console.log('Using preloaded main audio from cache');
          const blobUrl = URL.createObjectURL(cachedMain.blob);
          mainRef.current.src = blobUrl;
          mainRef.current.volume = mainVol[0] / 100;
        } else {
          // Fallback to loading with retry
          setAudioLoading(true);
          const mainResult = await loadAudioWithRetry(mainUrl);
          
          if (!mainResult.success) {
            setAudioError(`Main layer: ${mainResult.error}`);
            setAudioLoading(false);
            return;
          }
          
          mainRef.current.src = mainUrl;
          mainRef.current.volume = mainVol[0] / 100;
          console.log(`Main audio loaded${mainResult.retries ? ` after ${mainResult.retries} retries` : ''}`);
        }
      }
      
      if (supportFile && supportRef.current) {
        const supportUrl = `${BASE_URL}${supportFile}`;
        console.log('Loading support stack audio from:', supportUrl);
        
        // Check if audio is preloaded in cache
        const cachedSupport = audioPreloader.getCached(supportUrl);
        
        if (cachedSupport) {
          console.log('Using preloaded support audio from cache');
          const blobUrl = URL.createObjectURL(cachedSupport.blob);
          supportRef.current.src = blobUrl;
          supportRef.current.volume = supportVol[0] / 100;
        } else {
          // Fallback to loading with retry
          const supportResult = await loadAudioWithRetry(supportUrl);
          
          if (!supportResult.success) {
            setAudioError(`Support layer: ${supportResult.error}`);
            setAudioLoading(false);
            return;
          }
          
          supportRef.current.src = supportUrl;
          supportRef.current.volume = supportVol[0] / 100;
          console.log(`Support audio loaded${supportResult.retries ? ` after ${supportResult.retries} retries` : ''}`);
        }
      }
      
      setAudioLoading(false);
      
      // Play both layers
      try {
        await mainRef.current?.play();
        if (supportFile) {
          await supportRef.current?.play();
        }
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing audio:', error);
        setAudioError('Failed to play audio. Please try again.');
        return;
      }
      
      // Track session if user is logged in
      if (user) {
        const frequencies = [stackMain];
        if (stackSupport !== "none") frequencies.push(stackSupport);
        
        addSession({
          type: 'stack',
          duration: stackTime,
          frequencies,
          mainVolume: mainVol[0],
          supportVolume: stackSupport !== "none" ? supportVol[0] : 0
        });
      }
    } else {
      mainRef.current?.pause();
      supportRef.current?.pause();
      setIsPlaying(false);
    }
  };



  const saveStack = () => {
    if (!user || !stackName.trim()) return;
    
    const frequencies = [stackMain];
    if (stackSupport !== "none") frequencies.push(stackSupport);
    
    addFavoriteStack({
      name: stackName.trim(),
      mainLayer: stackMain,
      supportLayer: stackSupport,
      duration: stackTime,
      mainVolume: mainVol[0],
      supportVolume: stackSupport !== "none" ? supportVol[0] : 0,
      frequencies
    });
    
    setStackName("");
    setShowSaveForm(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/50 border-purple-500 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-purple-300">
            ✨ Sound-icine: Freqyn's Forged Dose ✨
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6 justify-center">
            <Button
              onClick={() => setMode('simple')}
              variant={mode === 'simple' ? 'default' : 'outline'}
              className={mode === 'simple' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              Simple
            </Button>
            <Button
              onClick={() => setMode('stack')}
              variant={mode === 'stack' ? 'default' : 'outline'}
              className={mode === 'stack' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              Stack Builder
            </Button>
          </div>

          {mode === 'simple' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Time</label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5m">5m</SelectItem>
                      <SelectItem value="10m">10m</SelectItem>
                      <SelectItem value="15m">15m</SelectItem>
                      <SelectItem value="20m">20m</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Aim</label>
                  <Select value={aim} onValueChange={setAim}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Calm">Calm</SelectItem>
                      <SelectItem value="Focus">Focus</SelectItem>
                      <SelectItem value="Sleep">Sleep</SelectItem>
                      <SelectItem value="Healing">Healing</SelectItem>
                      <SelectItem value="Release">Release</SelectItem>
                      <SelectItem value="Courage">Courage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Center</label>
                  <Select value={center} onValueChange={setCenter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mind">Mind</SelectItem>
                      <SelectItem value="Body">Body</SelectItem>
                      <SelectItem value="Spirit">Spirit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button onClick={prescribe} className="w-full bg-pink-600 hover:bg-pink-700">
                    Forge Dose
                  </Button>
                </div>
              </div>
              
              {result && (
                <div className="bg-gray-800/50 p-3 rounded-lg text-green-300">
                  {result}
                  {loadResult && loadResult.retries && loadResult.retries > 0 && (
                    <span className="text-xs text-yellow-400 ml-2">
                      (Loaded after {loadResult.retries} {loadResult.retries === 1 ? 'retry' : 'retries'})
                    </span>
                  )}
                </div>
              )}
              
              {/* Loading State */}
              {audioLoading && (
                <div className="bg-blue-900/30 border border-blue-500/30 p-4 rounded-lg">
                  <div className="flex items-center justify-center gap-3 text-blue-300">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span className="font-medium">Loading audio file...</span>
                  </div>
                  <p className="text-xs text-blue-200/70 text-center mt-2">
                    Testing connection and verifying file accessibility
                  </p>
                </div>
              )}
              
              {/* Error State */}
              {audioError && (
                <div className="bg-red-900/30 border border-red-500/30 p-4 rounded-lg">
                  <div className="flex items-center gap-3 text-red-300 mb-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">Audio Loading Failed</p>
                      <p className="text-xs text-red-200/70 mt-1">{audioError}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-red-200/80">
                    <p className="font-medium">Troubleshooting tips:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Check your internet connection</li>
                      <li>Try refreshing the page</li>
                      <li>Ensure your browser allows audio playback</li>
                      <li>Try a different browser if the issue persists</li>
                    </ul>
                  </div>
                  <Button
                    onClick={retryLoad}
                    className="w-full mt-3 bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry Loading
                  </Button>
                </div>
              )}
              
              {/* Audio Player */}
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-4 rounded-lg border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-purple-300">Audio Player</span>
                  {mainRef.current?.src && !audioLoading && !audioError && (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Ready
                    </span>
                  )}
                </div>
                <audio ref={mainRef} controls className="w-full">
                  <source type="audio/wav" />
                  Your browser does not support audio playback.
                </audio>
              </div>
            </div>
          )}

          {mode === 'stack' && (

            <div className="space-y-6">
              <h3 className="text-lg text-purple-300 font-semibold">Layer Builder</h3>
              
              {/* Loading State for Stack */}
              {audioLoading && (
                <div className="bg-blue-900/30 border border-blue-500/30 p-4 rounded-lg">
                  <div className="flex items-center justify-center gap-3 text-blue-300">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span className="font-medium">Loading stack audio files...</span>
                  </div>
                  <p className="text-xs text-blue-200/70 text-center mt-2">
                    Testing connection and verifying file accessibility
                  </p>
                </div>
              )}
              
              {/* Error State for Stack */}
              {audioError && (
                <div className="bg-red-900/30 border border-red-500/30 p-4 rounded-lg">
                  <div className="flex items-center gap-3 text-red-300 mb-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">Stack Audio Loading Failed</p>
                      <p className="text-xs text-red-200/70 mt-1">{audioError}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-red-200/80">
                    <p className="font-medium">Troubleshooting tips:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Check your internet connection</li>
                      <li>Try refreshing the page</li>
                      <li>Ensure your browser allows audio playback</li>
                      <li>Try a different browser if the issue persists</li>
                    </ul>
                  </div>
                  <Button
                    onClick={retryLoad}
                    className="w-full mt-3 bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry Loading
                  </Button>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-800/50 border-gray-600">
                  <CardContent className="p-4">
                    <h4 className="text-purple-300 font-medium mb-3 flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      Main Layer
                    </h4>
                    
                    <Select value={stackMain} onValueChange={setStackMain}>
                      <SelectTrigger className="mb-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alpha">Alpha (Calm/Focus)</SelectItem>
                        <SelectItem value="beta">Beta (Focus/Productivity)</SelectItem>
                        <SelectItem value="theta">Theta (Release/Meditation)</SelectItem>
                        <SelectItem value="delta">Delta (Sleep/Recovery)</SelectItem>
                        <SelectItem value="gamma">Gamma (Insights)</SelectItem>
                        <SelectItem value="heart">Heart 639 Hz</SelectItem>
                        <SelectItem value="root">Root 396 Hz</SelectItem>
                        <SelectItem value="jupiter">Jupiter (Abundance)</SelectItem>
                        <SelectItem value="venus">Venus (Love/Creativity)</SelectItem>
                        <SelectItem value="schumann">Schumann 7.83 Hz</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">
                        Volume: {mainVol[0]}%
                      </label>
                      <Slider
                        value={mainVol}
                        onValueChange={setMainVol}
                        max={100}
                        step={10}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800/50 border-gray-600">
                  <CardContent className="p-4">
                    <h4 className="text-purple-300 font-medium mb-3 flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      Support Layer
                    </h4>
                    
                    <Select value={stackSupport} onValueChange={setStackSupport}>
                      <SelectTrigger className="mb-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— none —</SelectItem>
                        <SelectItem value="alpha">Alpha</SelectItem>
                        <SelectItem value="theta">Theta</SelectItem>
                        <SelectItem value="delta">Delta</SelectItem>
                        <SelectItem value="heart">Heart 639 Hz</SelectItem>
                        <SelectItem value="root">Root 396 Hz</SelectItem>
                        <SelectItem value="schumann">Schumann 7.83 Hz</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {stackSupport !== "none" && (
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">
                          Volume: {supportVol[0]}%
                        </label>
                        <Slider
                          value={supportVol}
                          onValueChange={setSupportVol}
                          max={100}
                          step={10}
                          className="w-full"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex gap-4 items-center justify-center">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Duration</label>
                  <Select value={stackTime} onValueChange={setStackTime}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5m">5m</SelectItem>
                      <SelectItem value="10m">10m</SelectItem>
                      <SelectItem value="15m">15m</SelectItem>
                      <SelectItem value="20m">20m</SelectItem>
                      <SelectItem value="30m">30m</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <Button 
                    onClick={playStack} 
                    disabled={audioLoading}
                    className="bg-pink-600 hover:bg-pink-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? "Stop Stack" : "Play Stack"}
                  </Button>
                  
                  {user && (
                    <Button
                      onClick={() => setShowSaveForm(!showSaveForm)}
                      variant="outline"
                      className="flex items-center gap-2 border-purple-500 text-purple-300 hover:bg-purple-600"
                    >
                      <Bookmark className="w-4 h-4" />
                      Save Stack
                    </Button>
                  )}
                </div>
              </div>

              
              {isPlaying && !audioError && (
                <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 p-4 rounded-lg border border-green-500/30 text-center">
                  <div className="flex items-center justify-center gap-2 text-green-300">
                    <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="font-medium">Stack Playing</span>
                  </div>
                  <p className="text-xs text-green-200/70 mt-1">Layered frequencies active</p>
                </div>
              )}

              
              {user && showSaveForm && (
                <Card className="bg-gray-800/30 border-purple-400">
                  <CardContent className="p-4">
                    <div className="flex gap-2">
                      <Input
                        value={stackName}
                        onChange={(e) => setStackName(e.target.value)}
                        placeholder="Name your custom stack..."
                        className="flex-1"
                      />
                      <Button
                        onClick={saveStack}
                        disabled={!stackName.trim()}
                        className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {!user && (
                <div className="text-center text-gray-400 text-sm">
                  <p>Login to save custom stacks and track your sessions</p>
                </div>
              )}
              
              <p className="text-sm text-gray-400 text-center">
                Two-layer system with auto-balanced volumes for optimal frequency mixing.
              </p>
              
              <audio ref={mainRef} className="hidden" />
              <audio ref={supportRef} className="hidden" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SoundicineInterface;
