import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Session } from '../../types/session';
import { getCtx } from '../../lib/audioContext';
import { storage } from '../../lib/storage';
import { Download, BookOpen } from 'lucide-react';
import { ToneHint } from '../ToneHint';
import { FreqReadout } from '../FreqReadout';
import { BeatPresets } from '../BeatPresets';
import { SafetyNote } from '../SafetyNote';


interface PlayerModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenJournal: (sessionKey: string) => void;
}

export default function PlayerModal({ session, isOpen, onClose, onOpenJournal }: PlayerModalProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [activeGen, setActiveGen] = useState<string | null>(null);
  const [binauralLeftHz, setBinauralLeftHz] = useState<number | null>(null);
  const [binauralRightHz, setBinauralRightHz] = useState<number | null>(null);
  const [solfeggioActive, setSolfeggioActive] = useState(false);
  const nodesRef = useRef<any[]>([]);
  const solNodeRef = useRef<any[]>([]);


  useEffect(() => {
    if (isOpen && session && audioRef.current) {
      audioRef.current.addEventListener('play', trackPlay);
    }
    return () => {
      stopAllGenerators();
      audioRef.current?.removeEventListener('play', trackPlay);
    };
  }, [isOpen, session]);

  const trackPlay = () => {
    if (!session) return;
    const stats = storage.get('mm.stats') || { plays: { total: 0, byKey: {} }, lastPlayDate: '', streak: 0 };
    stats.plays.total++;
    stats.plays.byKey[session.key] = (stats.plays.byKey[session.key] || 0) + 1;
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastPlayDate) {
      const lastDate = new Date(stats.lastPlayDate);
      const todayDate = new Date(today);
      const diff = Math.floor((todayDate.getTime() - lastDate.getTime()) / 86400000);
      if (diff === 1) stats.streak++;
      else if (diff > 1) stats.streak = 1;
    } else {
      stats.streak = 1;
    }
    stats.lastPlayDate = today;
    storage.set('mm.stats', stats);
  };

  const stopAllGenerators = () => {
    nodesRef.current.forEach(n => n.stop?.());
    nodesRef.current = [];
    setActiveGen(null);
    setBinauralLeftHz(null);
    setBinauralRightHz(null);
  };

  const stopSolfeggio = () => {
    solNodeRef.current.forEach(n => n.stop?.());
    solNodeRef.current = [];
    setSolfeggioActive(false);
  };

  const setBinaural = (baseHz: number, beatHz: number) => {
    // Stop entrainment generators but keep solfeggio if active
    nodesRef.current.forEach(n => n.stop?.());
    nodesRef.current = [];
    
    const ctx = getCtx();
    const leftHz = baseHz;
    const rightHz = baseHz + beatHz;
    
    const oL = ctx.createOscillator();
    const oR = ctx.createOscillator();
    const mL = ctx.createGain();
    const mR = ctx.createGain();
    const merger = ctx.createChannelMerger(2);
    
    oL.frequency.value = leftHz;
    oR.frequency.value = rightHz;
    mL.gain.value = 0.3;
    mR.gain.value = 0.3;
    
    oL.connect(mL).connect(merger, 0, 0);
    oR.connect(mR).connect(merger, 0, 1);
    merger.connect(ctx.destination);
    
    oL.start();
    oR.start();
    
    nodesRef.current = [oL, oR];
    setActiveGen('binaural');
    setBinauralLeftHz(leftHz);
    setBinauralRightHz(rightHz);
  };

  const toggleBinaural = () => {
    if (activeGen === 'binaural') {
      nodesRef.current.forEach(n => n.stop?.());
      nodesRef.current = [];
      setActiveGen(null);
      setBinauralLeftHz(null);
      setBinauralRightHz(null);
    } else {
      setBinaural(200, 8);
    }
  };

  const toggleIsochronic = () => {
    if (activeGen === 'iso') {
      stopAllGenerators();
    } else {
      stopAllGenerators();
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo = ctx.createOscillator();
      osc.frequency.value = 200;
      lfo.frequency.value = 10;
      lfo.connect(gain.gain);
      gain.gain.value = 0.3;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      lfo.start();
      nodesRef.current = [osc, lfo];
      setActiveGen('iso');
    }
  };

  const toggleSolfeggio = () => {
    if (solfeggioActive) {
      stopSolfeggio();
    } else {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 528;
      gain.gain.value = 0.2;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      solNodeRef.current = [osc];
      setSolfeggioActive(true);
    }
  };


  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{session.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <audio ref={audioRef} controls className="w-full" crossOrigin="anonymous">
            <source src={session.url} type="audio/mpeg" />
          </audio>
          <div className="flex flex-wrap gap-2 items-center">
            <Button onClick={toggleBinaural} variant={activeGen === 'binaural' ? 'default' : 'outline'} size="sm">
              Binaural: {activeGen === 'binaural' ? 'On' : 'Off'}
            </Button>
            <ToneHint text="Two close tones, one per ear → your brain hears the difference (the beat). Headphones recommended." />
            
            <Button onClick={toggleIsochronic} variant={activeGen === 'iso' ? 'default' : 'outline'} size="sm">
              Isochronic: {activeGen === 'iso' ? 'On' : 'Off'}
            </Button>
            <ToneHint text="Single tone pulsing on/off at a set rate. Speakers okay. Clean, crisp entrainment." />
            
            <Button onClick={toggleSolfeggio} variant={solfeggioActive ? 'default' : 'outline'} size="sm">
              Solfeggio: {solfeggioActive ? 'On' : 'Off'}
            </Button>
            <ToneHint text="Steady frequency layer (e.g., 528 Hz). Not an entrainment beat—think flavor/intent." />

            
            <Button asChild variant="outline" size="sm">
              <a href={session.url} download><Download size={16} className="mr-1" /> Download</a>
            </Button>
            <Button onClick={() => onOpenJournal(session.key)} variant="outline" size="sm">
              <BookOpen size={16} className="mr-1" /> Journal
            </Button>
          </div>
          
          <FreqReadout left={binauralLeftHz ?? undefined} right={binauralRightHz ?? undefined} />
          
          {activeGen === 'binaural' && (
            <BeatPresets setBinaural={setBinaural} />
          )}
          
          <SafetyNote />
        </div>

      </DialogContent>
    </Dialog>
  );
}
