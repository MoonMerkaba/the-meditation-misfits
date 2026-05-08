import React from 'react';

interface WelcomeHeroProps {
  userName?: string;
}

const WelcomeHero: React.FC<WelcomeHeroProps> = ({ userName }) => {
  return (
    <div className="text-center py-12 px-4">
      <h1 
        className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
        style={{ color: '#FFFFFF', letterSpacing: '-0.03em' }}
      >
        Welcome back.
      </h1>
      
      <div className="max-w-2xl mx-auto space-y-2">
        <p className="text-xl md:text-2xl font-light" style={{ color: '#FF00BF' }}>
          You're not here to be fixed.
        </p>
        <p className="text-xl md:text-2xl font-light" style={{ color: '#FF00BF' }}>
          You're here to remember who you are.
        </p>
      </div>
      
      <p className="mt-8 text-lg max-w-xl mx-auto leading-relaxed" style={{ color: '#A2A1A3' }}>
        This space is for Lightworkers, Starseeds, and sensitive souls who've walked through the dark and chose to stay.
      </p>
      
      {/* Subtle decorative element */}
      <div className="mt-10 flex justify-center items-center gap-3">
        <div className="w-12 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,0,191,0.5))' }} />
        <div className="w-2 h-2" style={{ background: '#FF00BF', opacity: 0.6 }} />
        <div className="w-12 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(255,0,191,0.5))' }} />
      </div>
    </div>
  );
};

export default WelcomeHero;
