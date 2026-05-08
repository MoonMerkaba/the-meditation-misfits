import React from 'react';
import { Sparkles, Map } from 'lucide-react';

interface BelongingSectionProps {
  onWhyExists: () => void;
  onExploreAll: () => void;
}

const BelongingSection: React.FC<BelongingSectionProps> = ({
  onWhyExists,
  onExploreAll
}) => {
  return (
    <div className="max-w-2xl mx-auto px-4 mt-16">
      {/* Belonging Message */}
      <div className="text-center mb-8">
        <div className="space-y-2">
          <p className="text-xl font-light" style={{ color: '#FF00BF' }}>You're not behind.</p>
          <p className="text-xl font-light" style={{ color: '#FF00BF' }}>You're not broken.</p>
          <p className="text-xl font-light" style={{ color: '#FF00BF' }}>You're right on time.</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onWhyExists}
          className="w-full group relative overflow-hidden transition-all duration-200 hover:scale-[1.01]"
          style={{
            background: 'rgba(68, 67, 67, 0.3)',
            border: '1px solid rgba(255, 0, 191, 0.3)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 0, 191, 0.6)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 0, 191, 0.3)'; }}
        >
          <div className="relative p-4 flex items-center justify-center gap-3">
            <Sparkles className="w-5 h-5" style={{ color: '#FF00BF' }} />
            <span className="text-lg font-medium" style={{ color: '#FF00BF' }}>Why This App Exists</span>
          </div>
        </button>

        <button
          onClick={onExploreAll}
          className="w-full group relative overflow-hidden transition-all duration-200 hover:scale-[1.01]"
          style={{
            background: 'rgba(68, 67, 67, 0.15)',
            border: '1px solid rgba(102, 131, 160, 0.2)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 0, 191, 0.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(102, 131, 160, 0.2)'; }}
        >
          <div className="relative p-4 flex items-center justify-center gap-3">
            <Map className="w-5 h-5" style={{ color: '#6683A0' }} />
            <span className="text-lg font-medium" style={{ color: '#6683A0' }}>Explore Everything That Lives Here</span>
          </div>
        </button>
      </div>

      {/* Subtle closing element */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 text-sm">
          <div className="w-8 h-px" style={{ background: '#444343' }} />
          <span style={{ color: '#444343' }}>A sanctuary, not a system</span>
          <div className="w-8 h-px" style={{ background: '#444343' }} />
        </div>
      </div>
    </div>
  );
};

export default BelongingSection;
