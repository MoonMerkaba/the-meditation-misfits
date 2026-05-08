import React from 'react';

interface JourneySelectorProps {
  onSelectJourney: (journeyId: string) => void;
}

const JourneySelector: React.FC<JourneySelectorProps> = ({ onSelectJourney }) => {
  const journeys = [
    { id: 'calm', name: 'Deep Calm', freq: '432 Hz', desc: 'Release anxiety & stress', color: '#6b39ff' },
    { id: 'focus', name: 'Laser Focus', freq: '40 Hz', desc: 'Peak concentration', color: '#00e1ff' },
    { id: 'sleep', name: 'Sleep Deep', freq: '2-4 Hz', desc: 'Delta wave induction', color: '#ff00bf' },
    { id: 'energy', name: 'Energy Boost', freq: '14 Hz', desc: 'Beta activation', color: '#35d49a' },
    { id: 'creative', name: 'Creative Flow', freq: '7.83 Hz', desc: 'Theta inspiration', color: '#ffcc66' },
    { id: 'healing', name: 'Body Healing', freq: '528 Hz', desc: 'DNA repair frequency', color: '#ff5c93' }
  ];

  return (
    <div className="mb-20">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 px-1">Choose Your Path</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {journeys.map(journey => (
          <div
            key={journey.id}
            onClick={() => onSelectJourney(journey.id)}
            className="p-6 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] hover:shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${journey.color}15 0%, transparent 100%), linear-gradient(180deg, #10121a 0%, #0d0f16 100%)`,
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: `0 4px 16px ${journey.color}15, 0 0 20px ${journey.color}10`
            }}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg md:text-xl font-semibold">{journey.name}</h3>
              <span className="text-xs md:text-sm px-3 py-1 rounded-full font-medium" style={{
                background: `${journey.color}25`,
                color: journey.color,
                border: `1px solid ${journey.color}40`
              }}>{journey.freq}</span>
            </div>
            <p className="text-sm text-gray-400">{journey.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JourneySelector;
