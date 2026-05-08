import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Download, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { VoiceSelector } from './VoiceSelector';
import { supabase } from '@/lib/supabase';

interface Section {
  phase: string;
  duration_seconds: number;
  script: string;
  cues: string[];
}

interface GeneratedMeditationPlayerProps {
  meditation: {
    title: string;
    duration_minutes: number;
    sections: Section[];
    key_themes?: string[];
    affirmations?: string[];
  };
}

export function GeneratedMeditationPlayer({ meditation }: GeneratedMeditationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState([0.9]);
  const [volume, setVolume] = useState([1]);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [pitch, setPitch] = useState(1.0);

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('voice_preference, voice_pitch, voice_rate')
        .eq('id', user.id)
        .single();

      if (profile) {
        if (profile.voice_preference) setSelectedVoice(profile.voice_preference);
        if (profile.voice_pitch) setPitch(profile.voice_pitch);
        if (profile.voice_rate) setSpeechRate([profile.voice_rate]);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences when they change
  useEffect(() => {
    const savePreferences = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedVoice) return;

      await supabase
        .from('profiles')
        .update({
          voice_preference: selectedVoice,
          voice_pitch: pitch,
          voice_rate: speechRate[0]
        })
        .eq('id', user.id);
    };

    if (selectedVoice) {
      savePreferences();
    }
  }, [selectedVoice, pitch, speechRate]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);


  const speakSection = (sectionIndex: number) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech not supported in your browser');
      return;
    }

    window.speechSynthesis.cancel();

    const section = meditation.sections[sectionIndex];
    const text = section.script.replace(/\[PAUSE \d+s\]/g, '...');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate[0];
    utterance.volume = isMuted ? 0 : volume[0];
    utterance.pitch = pitch;

    // Set selected voice if available
    if (selectedVoice) {
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) {
        utterance.voice = voice;
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (sectionIndex < meditation.sections.length - 1) {
        setCurrentSection(sectionIndex + 1);
        setTimeout(() => speakSection(sectionIndex + 1), 1000);
      } else {
        setIsPlaying(false);
        setCurrentSection(0);
      }
    };

    window.speechSynthesis.speak(utterance);
  };


  const handlePlayPause = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsSpeaking(false);
    } else {
      setIsPlaying(true);
      speakSection(currentSection);
    }
  };

  const handleRestart = () => {
    window.speechSynthesis.cancel();
    setCurrentSection(0);
    setIsPlaying(false);
    setIsSpeaking(false);
  };

  const downloadScript = () => {
    const fullText = `${meditation.title}\n\nDuration: ${meditation.duration_minutes} minutes\n\n` +
      meditation.sections.map((s, i) => `${s.phase.toUpperCase()}\n${s.script}`).join('\n\n---\n\n') +
      (meditation.affirmations ? `\n\nAFFIRMATIONS:\n${meditation.affirmations.join('\n')}` : '');

    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meditation.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Meditation script downloaded');
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">{meditation.title}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">{meditation.duration_minutes} minutes</Badge>
          {meditation.key_themes?.map((theme) => (
            <Badge key={theme} variant="outline">{theme}</Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {meditation.sections.map((section, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg border transition-colors ${
              idx === currentSection && isPlaying
                ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-300'
                : 'bg-muted/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Badge variant={idx === currentSection && isPlaying ? 'default' : 'outline'}>
                {section.phase}
              </Badge>
              <span className="text-sm text-muted-foreground">{section.duration_seconds}s</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{section.script}</p>
          </div>
        ))}
      </div>
      <VoiceSelector
        selectedVoice={selectedVoice}
        onVoiceChange={setSelectedVoice}
        pitch={pitch}
        onPitchChange={setPitch}
      />

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center gap-4">
          <Button onClick={handlePlayPause} size="lg" className="flex-1">
            {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
            {isPlaying ? 'Pause' : 'Play with Text-to-Speech'}
          </Button>
          <Button onClick={handleRestart} variant="outline" size="lg">
            <RotateCcw className="w-5 h-5" />
          </Button>
          <Button onClick={downloadScript} variant="outline" size="lg">
            <Download className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Speed: {speechRate[0].toFixed(1)}x</label>
            <Slider value={speechRate} onValueChange={setSpeechRate} min={0.5} max={1.5} step={0.1} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              Volume
            </label>
            <div className="flex items-center gap-2">
              <Slider value={volume} onValueChange={setVolume} min={0} max={1} step={0.1} className="flex-1" />
              <Button variant="ghost" size="sm" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>


      {meditation.affirmations && meditation.affirmations.length > 0 && (
        <div className="space-y-2 pt-4 border-t">
          <h4 className="font-semibold">Affirmations</h4>
          <ul className="space-y-1">
            {meditation.affirmations.map((affirmation, idx) => (
              <li key={idx} className="text-sm text-muted-foreground">• {affirmation}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
