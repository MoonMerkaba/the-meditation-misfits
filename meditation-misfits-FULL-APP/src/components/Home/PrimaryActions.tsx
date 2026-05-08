import React from 'react';
import { Moon, Eye, Flame } from 'lucide-react';

interface PrimaryActionsProps {
  onEnterFlow: () => void;
  onDifferentToday: () => void;
  onShadowSafe: () => void;
}

const PrimaryActions: React.FC<PrimaryActionsProps> = ({
  onEnterFlow,
  onDifferentToday,
  onShadowSafe
}) => {
  return (
    <div className="max-w-2xl mx-auto px-4 space-y-4">
      {/* Button 1: Enter Today's Flow */}
      <button
        onClick={onEnterFlow}
        className="w-full group relative overflow-hidden transition-all duration-200 hover:scale-[1.01]"
        style={{
          background: '#000000',
          border: '1px solid rgba(255, 0, 191, 0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 0, 191, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 0, 191, 0.3)';
        }}
      >
        <div className="relative p-6 flex items-center gap-4">
          <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center" style={{ background: 'rgba(255, 0, 191, 0.15)' }}>
            <Moon className="w-7 h-7" style={{ color: '#FF00BF' }} />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-semibold" style={{ color: '#FFFFFF' }}>Enter Today's Flow</h3>
            <p className="text-sm mt-1" style={{ color: 'rgba(255, 0, 191, 0.7)' }}>
              A gentle path for where you are right now.
            </p>
          </div>
        </div>
      </button>

      {/* Button 2: I Need Something Different Today */}
      <button
        onClick={onDifferentToday}
        className="w-full group relative overflow-hidden transition-all duration-200 hover:scale-[1.01]"
        style={{
          background: '#000000',
          border: '1px solid rgba(102, 131, 160, 0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(102, 131, 160, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(102, 131, 160, 0.3)';
        }}
      >
        <div className="relative p-6 flex items-center gap-4">
          <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center" style={{ background: 'rgba(102, 131, 160, 0.15)' }}>
            <Eye className="w-7 h-7" style={{ color: '#6683A0' }} />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-semibold" style={{ color: '#FFFFFF' }}>I Need Something Different Today</h3>
            <p className="text-sm mt-1" style={{ color: '#6683A0' }}>
              Choose based on your energy, not a schedule.
            </p>
          </div>
        </div>
      </button>

      {/* Button 3: Shadow-Safe Mode */}
      <button
        onClick={onShadowSafe}
        className="w-full group relative overflow-hidden transition-all duration-200 hover:scale-[1.01]"
        style={{
          background: '#000000',
          border: '1px solid rgba(162, 161, 163, 0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(162, 161, 163, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(162, 161, 163, 0.2)';
        }}
      >
        <div className="relative p-6 flex items-center gap-4">
          <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center" style={{ background: 'rgba(162, 161, 163, 0.1)' }}>
            <Flame className="w-7 h-7" style={{ color: '#A2A1A3' }} />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-semibold" style={{ color: '#FFFFFF' }}>Shadow-Safe Mode</h3>
            <p className="text-sm mt-1" style={{ color: '#A2A1A3' }}>
              Low capacity. High tenderness. No fixing.
            </p>
          </div>
        </div>
      </button>
    </div>
  );
};

export default PrimaryActions;
