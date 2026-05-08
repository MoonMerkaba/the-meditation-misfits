import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RecentReadings } from "./RecentReadings";
import { ArchetypeChart } from "./ArchetypeChart";
import { ResonanceThemes } from "./ResonanceThemes";
import { AIInsights } from "./AIInsights";
import { PredictiveGuidance } from "./PredictiveGuidance";
import { FreqynReading, TarotReading, ArchetypeFrequency, ResonancePattern } from "@/types/oracle";



interface OracleDashboardProps {
  onBack: () => void;
}

export function OracleDashboard({ onBack }: OracleDashboardProps) {
  const [freqynReadings, setFreqynReadings] = useState<FreqynReading[]>([]);
  const [tarotReadings, setTarotReadings] = useState<TarotReading[]>([]);
  const [archetypes, setArchetypes] = useState<ArchetypeFrequency[]>([]);
  const [patterns, setPatterns] = useState<ResonancePattern[]>([]);

  useEffect(() => {
    // Load from localStorage or use mock data
    const mockFreqyn: FreqynReading[] = [
      { id: '1', timestamp: new Date(), frequency: 528, resonanceLevel: 85, guidance: 'Your energy is aligned with transformation', themes: ['Growth', 'Healing'] },
      { id: '2', timestamp: new Date(Date.now() - 86400000), frequency: 432, resonanceLevel: 72, guidance: 'Embrace harmony in relationships', themes: ['Love', 'Balance'] },
      { id: '3', timestamp: new Date(Date.now() - 259200000), frequency: 639, resonanceLevel: 78, guidance: 'Connection and communication flow', themes: ['Connection', 'Growth'] },
      { id: '4', timestamp: new Date(Date.now() - 345600000), frequency: 528, resonanceLevel: 90, guidance: 'Deep healing energy present', themes: ['Healing', 'Transformation'] },
    ];

    const mockTarot: TarotReading[] = [
      { id: '1', timestamp: new Date(), cards: ['The Fool', 'The Magician'], interpretation: 'New beginnings with creative power', archetypes: ['Fool', 'Magician'] },
      { id: '2', timestamp: new Date(Date.now() - 172800000), cards: ['The High Priestess'], interpretation: 'Trust your intuition', archetypes: ['High Priestess'] },
      { id: '3', timestamp: new Date(Date.now() - 432000000), cards: ['The Empress', 'The Fool'], interpretation: 'Nurturing new ventures', archetypes: ['Empress', 'Fool'] },
    ];

    const mockArchetypes: ArchetypeFrequency[] = [
      { archetype: 'The Fool', count: 5 },
      { archetype: 'The Magician', count: 3 },
      { archetype: 'High Priestess', count: 4 },
      { archetype: 'The Empress', count: 2 },
    ];

    const mockPatterns: ResonancePattern[] = [
      { theme: 'Transformation', frequency: 8, lastSeen: new Date() },
      { theme: 'Healing', frequency: 6, lastSeen: new Date() },
      { theme: 'Love', frequency: 5, lastSeen: new Date(Date.now() - 86400000) },
      { theme: 'Growth', frequency: 7, lastSeen: new Date() },
    ];

    setFreqynReadings(mockFreqyn);
    setTarotReadings(mockTarot);
    setArchetypes(mockArchetypes);
    setPatterns(mockPatterns);
  }, []);

  // Combine all readings for AI analysis
  const allReadings = [
    ...freqynReadings.map(r => ({ 
      type: 'freqyn', 
      date: r.timestamp, 
      resonance: r.resonanceLevel, 
      themes: r.themes,
      archetypes: [] 
    })),
    ...tarotReadings.map(r => ({ 
      type: 'tarot', 
      date: r.timestamp, 
      resonance: 75, 
      themes: [],
      archetypes: r.archetypes 
    }))
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-2">
              🔮 Oracle Dashboard
            </h1>
            <p className="text-gray-400">Unified insights from Freqyn Resonique & Indigo Oracle</p>
          </div>
          <Button onClick={onBack} variant="outline" className="border-purple-500/50">
            ← Back
          </Button>
        </div>

        <AIInsights readings={allReadings} />

        <Card className="p-6 mb-6 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border-purple-500/30">
          <h2 className="text-xl font-bold mb-2 text-purple-300">✨ Personalized Guidance</h2>
          <p className="text-gray-300">
            Your recent readings show a strong pattern of transformation and growth. The combination of 528 Hz frequency
            and The Fool archetype suggests you're entering a new phase of spiritual awakening. Trust your intuition.
          </p>
        </Card>


        <RecentReadings freqynReadings={freqynReadings} tarotReadings={tarotReadings} />

        <div className="grid md:grid-cols-2 gap-6 mt-6 mb-6">
          <ArchetypeChart data={archetypes} />
          <ResonanceThemes patterns={patterns} />
        </div>

        <PredictiveGuidance readings={allReadings} />

      </div>
    </div>
  );
}
