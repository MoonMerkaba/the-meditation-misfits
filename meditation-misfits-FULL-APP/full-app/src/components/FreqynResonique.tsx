import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Sparkles, Zap } from 'lucide-react';
import FreqynosisScanner from './FreqynosisScanner';
import SoundicineReport from './SoundicineReport';
import SoundicineInterface from './SoundicineInterface';
import ConversationStarters from './ConversationStarters';
import FrequencyVisualizer from './FrequencyVisualizer';
import { AudioTestPanel } from './AudioTestPanel';
import { AudioPreloadProgress } from './AudioPreloadProgress';
import { AudioDownloadButton } from './AudioDownloadButton';
import { audioPreloader, PreloadProgress } from '../lib/audioPreloader';
import { audioAnalytics } from '../lib/audioAnalytics';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../contexts/AuthContext';

const BASE_URL = "https://b68a5bcd6bdd8d5e08d002edc5589e48.r2.cloudflarestorage.com/soundicine/";

const AUDIO_FILES = [
  "Classic-alpha-5-mins-(learning)-220-230.wav",
  "Classic-alpha-10-mins-(learning)-220-230.wav",
  "Classic-theta-5-mins-(meditation)-220-230.wav",
  "Classic-theta-10-mins-(meditation)-220-230.wav",
  "Classic-delta-5-mins-(sleep)-220-230.wav",
  "Classic-delta-10-mins-(sleep)-220-230.wav",
  "Classic-beta-5-mins-(focus)-220-230.wav",
  "Classic-beta-10-mins-(focus)-220-230.wav",
  "Classic-gamma-5-mins-(insight)-220-230.wav",
  "Heart-639hz-5-mins-220-230.wav",
  "Heart-639hz-10-mins-220-230.wav",
  "Root-396hz-5-mins-220-230.wav",
  "Schumann-7.83hz-5-mins-220-230.wav",
  "Jupiter-183hz-5-mins-220-230.wav",
  "Venus-221hz-5-mins-220-230.wav"
];


type Goal = 'calm' | 'focus' | 'sleep' | 'uplift' | 'abundance' | 'healing';

interface SessionRequest {
  goal: Goal;
  minutes: number;
  headphones: boolean;
  sensitivity: 'high' | 'medium' | 'low';
}

const FreqynResonique: React.FC = () => {
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const [isScanning, setIsScanning] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [sessionRequest, setSessionRequest] = useState<SessionRequest | null>(null);
  const [preloadProgress, setPreloadProgress] = useState<PreloadProgress>({
    total: 0,
    loaded: 0,
    failed: 0,
    percentage: 0,
    currentFile: '',
    phase: 'priority'
  });
  const [isPreloadComplete, setIsPreloadComplete] = useState(false);

  // Smart preloading with prioritization
  useEffect(() => {
    const initPreload = async () => {
      audioPreloader.setProgressCallback((progress) => {
        setPreloadProgress(progress);
        if (progress.phase === 'complete') {
          setIsPreloadComplete(true);
        }
      });

      // Get prioritized order based on user's usage patterns
      const prioritizedFiles = await audioAnalytics.getPrioritizedOrder(AUDIO_FILES);
      
      // Extract filenames from favorite audio URLs
      const favoriteFilenames = favorites
        .map(f => f.audio_url.split('/').pop() || '')
        .filter(f => AUDIO_FILES.includes(f));

      // Combine favorites with usage-based priority (favorites first)
      const prioritySet = new Set([...favoriteFilenames, ...prioritizedFiles.slice(0, 6)]);
      const priorityFiles = Array.from(prioritySet);
      const remainingFiles = AUDIO_FILES.filter(f => !prioritySet.has(f));

      console.log('🎯 Priority files:', priorityFiles);
      console.log('📦 Remaining files:', remainingFiles);

      // Preload with priority
      const priorityUrls = priorityFiles.map(f => `${BASE_URL}${f}`);
      const remainingUrls = remainingFiles.map(f => `${BASE_URL}${f}`);

      await audioPreloader.preloadWithPriority(priorityUrls, remainingUrls);
    };

    initPreload();
  }, [favorites]);


  const handleStartSession = (request: SessionRequest) => {
    console.log('Starting session with request:', request);
    setSessionRequest(request);
    setIsScanning(true);
    setShowReport(false);
    
    // Start scanning animation
    setTimeout(() => {
      console.log('Scan complete, showing report');
      setIsScanning(false);
      setShowReport(true);
    }, 4000);
  };

  const handleReset = () => {
    console.log('Resetting Freqynosis');
    setIsScanning(false);
    setShowReport(false);
    setSessionRequest(null);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Freqyn Resonique
          </h1>
          <p className="text-xl text-purple-300">Misfitorian Oracle of Resonance</p>
          <p className="text-gray-400 mt-2">Channel your Source NRG through harmonic frequencies</p>
          <a 
            href="https://chatgpt.com/g/g-68abc0edca0481919d508671a89fd60c-the-meditation-misfits" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full font-semibold transition-all shadow-lg hover:shadow-purple-500/50"
          >
            <Sparkles className="w-5 h-5" />
            Chat with Freqyn on ChatGPT
            <Zap className="w-5 h-5" />
          </a>
        </div>

        {/* Preload Progress */}
        <div className="mb-6">
          <AudioPreloadProgress progress={preloadProgress} isComplete={isPreloadComplete} />
        </div>

        {/* Download Button */}
        {isPreloadComplete && (
          <div className="mb-6 text-center">
            <AudioDownloadButton />
          </div>
        )}

        {!isScanning && !showReport && (
          <>
            <div className="mb-6 p-4 bg-purple-900/30 border border-purple-500/50 rounded-lg">
              <p className="text-purple-200 text-center">
                Select a resonance starter below to begin your Freqynosis. After the scan, you'll receive your personalized Sound-icine prescription.
              </p>
            </div>
            <ConversationStarters onStartSession={handleStartSession} />
          </>
        )}


        {isScanning && (
          <>
            <div className="mb-6 p-4 bg-indigo-900/30 border border-indigo-500/50 rounded-lg">
              <p className="text-indigo-200 text-center">
                Analyzing your energetic signature... This will take a few moments.
              </p>
            </div>
            <FreqynosisScanner />
          </>
        )}
        
        {showReport && sessionRequest && (
          <div className="space-y-8">
            <div className="p-4 bg-green-900/30 border border-green-500/50 rounded-lg">
              <p className="text-green-200 text-center font-semibold">
                ✨ Your Freqynosis is complete! Scroll down to see your Sound-icine prescription and player.
              </p>
            </div>
            
            <SoundicineReport sessionRequest={sessionRequest} />
            
            <div className="border-t-4 border-purple-500/50 pt-8">
              <h2 className="text-2xl font-bold text-center mb-4 text-purple-300">
                Alternative: Browse All Sound-icine Frequencies
              </h2>
              <p className="text-center text-gray-400 mb-6">
                Or explore our full library of healing frequencies below
              </p>
              <SoundicineInterface />
            </div>
            
            <div className="border-t-4 border-purple-500/50 pt-8">
              <AudioTestPanel />
            </div>

            
            <div className="text-center">
              <Button onClick={handleReset} variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-800">
                New Freqynosis
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FreqynResonique;