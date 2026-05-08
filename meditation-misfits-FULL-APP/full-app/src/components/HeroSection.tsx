import React from 'react';
import { Loader2 } from 'lucide-react';

interface HeroSectionProps {
  onStartJourney: () => void;
  isJourneyActive: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onStartJourney, isJourneyActive }) => {
  return (

    <div className="relative overflow-hidden rounded-3xl mb-8" style={{
      background: 'linear-gradient(135deg, rgba(255,0,191,0.15) 0%, rgba(107,57,255,0.15) 50%, rgba(0,225,255,0.1) 100%)',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
    }}>
      <img 
        src="https://d64gsuwffb70l.cloudfront.net/68a69b86f5fd0bed13eb1d47_1759193987125_6e481ef4.webp"
        alt="Cosmic Meditation"
        className="w-full h-64 md:h-80 object-cover opacity-70"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-gradient-to-t from-black/60 via-transparent to-black/40">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl" style={{
            background: 'conic-gradient(from 0deg at 50% 50%, #ff00bf, #6b39ff, #00e1ff, #ff00bf)',
            filter: 'drop-shadow(0 0 10px rgba(255,0,191,0.55))'
          }}></div>
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            The Meditation Misfits
          </h1>


        </div>
        <p className="text-lg md:text-xl text-gray-200 max-w-2xl mb-6">
          Unconventional paths to inner peace. Sound healing for rebels & seekers.
        </p>
        <button 

          onClick={onStartJourney}
          disabled={isJourneyActive}
          className="px-8 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
          style={{
            background: 'linear-gradient(180deg, #2a0b24 0%, #160614 100%)',
            border: '1px solid rgba(255,0,191,0.4)',
            boxShadow: '0 0 16px rgba(255,0,191,0.25)'
          }}
        >
          {isJourneyActive ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Journey in Progress...
            </>
          ) : (
            'Start Your Journey'
          )}
        </button>

      </div>
    </div>
  );
};

export default HeroSection;
