import React from 'react';

interface FeatureCardsProps {
  onOpenFreqyn?: () => void;
}

const FeatureCards: React.FC<FeatureCardsProps> = ({ onOpenFreqyn }) => {
  const features = [
    {
      title: 'Freqyn Resonique™',
      desc: 'Personalized frequency analysis',
      img: 'https://d64gsuwffb70l.cloudfront.net/68a69b86f5fd0bed13eb1d47_1759193987889_41ba41dd.webp',
      tag: 'AI-Powered'
    },
    {
      title: 'Soundicine™',
      desc: 'Healing through sonic medicine',
      img: 'https://d64gsuwffb70l.cloudfront.net/68a69b86f5fd0bed13eb1d47_1759193989660_bbd2543e.webp',
      tag: 'Clinical'
    },
    {
      title: 'NeuroFreqFix™',
      desc: 'Brainwave entrainment sessions',
      img: 'https://d64gsuwffb70l.cloudfront.net/68a69b86f5fd0bed13eb1d47_1759193991465_eefce3ff.webp',
      tag: 'Science-Based'
    },
    {
      title: 'Community Hub',
      desc: 'Connect with fellow misfits',
      img: 'https://d64gsuwffb70l.cloudfront.net/68a69b86f5fd0bed13eb1d47_1759193993340_89c76a81.webp',
      tag: 'Social'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {features.map((feat, i) => (
        <div key={i} className="relative p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02]" style={{
          background: 'radial-gradient(500px 200px at 100% 0%, rgba(255,0,191,0.14), transparent 60%), #121321',
          border: '1px solid rgba(255,255,255,0.08)',
          minHeight: '140px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
        }} onClick={i === 0 ? onOpenFreqyn : undefined}>
          <div>
            <img src={feat.img} alt={feat.title} className="w-12 h-12 rounded-lg mb-3 object-cover" style={{
              boxShadow: '0 0 8px rgba(255,0,191,0.2)'
            }} />
            <h3 className="text-sm md:text-base font-semibold mb-1">{feat.title}</h3>
            <p className="text-xs text-gray-400">{feat.desc}</p>
          </div>
          <span className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full" style={{
            background: 'rgba(107,57,255,0.3)',
            color: '#d6b3ff',
            border: '1px solid rgba(107,57,255,0.5)'
          }}>{feat.tag}</span>
        </div>
      ))}
    </div>
  );
};

export default FeatureCards;
