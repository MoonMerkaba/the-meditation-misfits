export interface FreqynReading {
  id: string;
  timestamp: Date;
  frequency: number;
  resonanceLevel: number;
  guidance: string;
  themes: string[];
}

export interface TarotReading {
  id: string;
  timestamp: Date;
  cards: string[];
  interpretation: string;
  archetypes: string[];
}

export interface OracleInsight {
  type: 'freqyn' | 'tarot';
  reading: FreqynReading | TarotReading;
}

export interface ResonancePattern {
  theme: string;
  frequency: number;
  lastSeen: Date;
}

export interface ArchetypeFrequency {
  archetype: string;
  count: number;
}
