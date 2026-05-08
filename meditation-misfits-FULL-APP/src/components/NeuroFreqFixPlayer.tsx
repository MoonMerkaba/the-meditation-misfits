import React, { useState, useEffect } from 'react';
import { X, Maximize2, Minimize2, Volume2, VolumeX, RotateCcw, Settings, Save, Library } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { SavePresetModal } from './Soundicine/SavePresetModal';
import { PresetBrowser } from './Soundicine/PresetBrowser';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface NeuroFreqFixPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  playUrl: string;
}

export const NeuroFreqFixPlayer: React.FC<NeuroFreqFixPlayerProps> = ({
  isOpen,
  onClose,
  playUrl
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [showControls, setShowControls] = useState(true);
  const [showFreqynGuide, setShowFreqynGuide] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPresetBrowser, setShowPresetBrowser] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(playUrl);

  useEffect(() => {
    setCurrentUrl(playUrl);
  }, [playUrl]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const resetSession = () => {
    const iframe = document.getElementById('neurofreqfix-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  const parseUrlParams = (url: string) => {
    try {
      const urlObj = new URL(url);
      return {
        goal: urlObj.searchParams.get('goal') || '',
        minutes: parseInt(urlObj.searchParams.get('minutes') || '20'),
        beatStart: parseFloat(urlObj.searchParams.get('beatStart') || '8'),
        beatEnd: parseFloat(urlObj.searchParams.get('beatEnd') || '12'),
        isoHz: parseInt(urlObj.searchParams.get('isoHz') || '528'),
        noise: urlObj.searchParams.get('noise') || 'pink',
        strength: urlObj.searchParams.get('strength') || 'medium'
      };
    } catch {
      return null;
    }
  };

  const handleSavePreset = async (name: string, category: string, isPublic: boolean) => {
    const params = parseUrlParams(currentUrl);
    if (!params) {
      toast.error('Unable to parse current session parameters');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Please sign in to save presets');
      return;
    }

    const { error } = await supabase.functions.invoke('save-soundicine-preset', {
      body: {
        presetName: name,
        category,
        isPublic,
        ...params
      }
    });

    if (error) {
      toast.error('Failed to save preset');
    } else {
      toast.success('Preset saved successfully!');
    }
  };

  const handleLoadPreset = (url: string) => {
    setCurrentUrl(url);
    const iframe = document.getElementById('neurofreqfix-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = url;
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`relative bg-gradient-to-br from-purple-900/95 to-indigo-900/95 rounded-2xl shadow-2xl border border-purple-500/30 ${
        isFullscreen ? 'w-full h-full' : 'w-full max-w-6xl h-[90vh]'
      }`}>
        
        {/* Freqyn Guide Panel */}
        {showFreqynGuide && !isFullscreen && (
          <Card className="absolute -left-80 top-0 w-72 h-full bg-gradient-to-b from-purple-900/90 to-indigo-900/90 border-purple-500/30 rounded-l-2xl p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-purple-100">Freqyn's Guidance</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFreqynGuide(false)}
                className="text-purple-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-col items-center mb-6">
              <img 
                src="https://d64gsuwffb70l.cloudfront.net/68a69b86f5fd0bed13eb1d47_1756222394040_7cf8dd4a.webp"
                alt="Freqyn Resonique"
                className="w-32 h-40 object-cover rounded-lg border-2 border-purple-400/50 mb-4"
              />
              <p className="text-sm text-purple-200 text-center italic">
                "Allow the frequencies to flow through you. Trust the process."
              </p>
            </div>

            <div className="space-y-4 text-sm text-purple-200">
              <div className="p-3 bg-purple-800/30 rounded-lg">
                <h4 className="font-medium text-purple-100 mb-2">Session Tips:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Find a comfortable position</li>
                  <li>• Close your eyes if possible</li>
                  <li>• Breathe naturally</li>
                  <li>• Let thoughts pass without judgment</li>
                </ul>
              </div>
              
              <div className="p-3 bg-indigo-800/30 rounded-lg">
                <h4 className="font-medium text-purple-100 mb-2">What to Expect:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Initial settling period (2-3 min)</li>
                  <li>• Deeper states may emerge</li>
                  <li>• Effects continue after session</li>
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Header Controls */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/30">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-white">NeuroFreqFix Player</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-purple-200">Active Session</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPresetBrowser(true)}
              className="text-purple-300 hover:text-white"
            >
              <Library className="w-4 h-4 mr-2" />
              Presets
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSaveModal(true)}
              className="text-purple-300 hover:text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>

            {!showFreqynGuide && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFreqynGuide(true)}
                className="text-purple-300 hover:text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                Guide
              </Button>
            )}

            
            <Button
              variant="ghost"
              size="sm"
              onClick={resetSession}
              className="text-purple-300 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-purple-300 hover:text-white"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-purple-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Player Container */}
        <div className="relative flex-1 p-4">
          <iframe
            id="neurofreqfix-iframe"
            src={playUrl}
            className="w-full h-full rounded-xl border border-purple-500/30"
            style={{ minHeight: isFullscreen ? 'calc(100vh - 120px)' : '70vh' }}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            title="NeuroFreqFix Player"
          />

          {/* Custom Controls Overlay */}
          {showControls && (
            <div className="absolute bottom-6 left-6 right-6">
              <Card className="bg-black/60 backdrop-blur-sm border-purple-500/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:text-purple-300"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    
                    <div className="flex items-center space-x-2 w-32">
                      <span className="text-xs text-purple-200">Vol</span>
                      <Slider
                        value={volume}
                        onValueChange={setVolume}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs text-purple-200 w-8">{volume[0]}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-purple-200">Show Controls</span>
                      <Switch
                        checked={showControls}
                        onCheckedChange={setShowControls}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-purple-500/30 bg-gradient-to-r from-purple-900/50 to-indigo-900/50">
          <div className="flex items-center justify-between text-sm text-purple-200">
            <div className="flex items-center space-x-4">
              <span>🎧 For best results, use headphones</span>
              <span>⚠️ Do not use while driving</span>
            </div>
            <div className="text-xs opacity-75">
              Wellness audio only • Not medical advice
            </div>
          </div>
        </div>
      </div>

      <SavePresetModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSavePreset}
      />


      <PresetBrowser
        isOpen={showPresetBrowser}
        onClose={() => setShowPresetBrowser(false)}
        onLoadPreset={handleLoadPreset}
      />
    </div>
  );
};

export default NeuroFreqFixPlayer;
