import React, { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { Button } from './ui/button';
import { X, Gift, ExternalLink } from 'lucide-react';
import { useShadowSafe } from '@/contexts/ShadowSafeContext';

export default function LeadBar() {
  const [visible, setVisible] = useState(false);
  const { isShadowSafeMode } = useShadowSafe();

  useEffect(() => {
    const hidden = storage.get('mm.leadbar.hide');
    setVisible(!hidden);
  }, []);

  const handleDismiss = () => {
    storage.set('mm.leadbar.hide', '1');
    setVisible(false);
  };

  const handleOpenFreebies = () => {
    window.open('https://samanthabushika.com/pnp-freebies/', '_blank', 'noopener,noreferrer');
  };

  if (!visible) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 py-3 px-4 shadow-lg ${
      isShadowSafeMode 
        ? 'bg-brand-dark-gray border-t border-brand-blue-gray/20' 
        : 'bg-gradient-to-r from-brand-black via-brand-dark-gray to-brand-black border-t border-brand-magenta/30'
    }`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Gift className={`w-5 h-5 flex-shrink-0 ${isShadowSafeMode ? 'text-brand-blue-gray' : 'text-brand-magenta'}`} />
          <p className={`text-sm md:text-base font-medium truncate md:whitespace-normal ${
            isShadowSafeMode ? 'text-brand-light-gray' : 'text-brand-white'
          }`}>
            Check out my digital product freebie page to aid in all of your personal development stages.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button 
            onClick={handleOpenFreebies} 
            size="sm" 
            className={`font-sans flex items-center gap-1 ${
              isShadowSafeMode 
                ? 'bg-brand-blue-gray/20 text-brand-blue-gray hover:bg-brand-blue-gray/30 border border-brand-blue-gray/30' 
                : 'bg-brand-magenta text-white hover:bg-brand-magenta/90 shadow-brand-sm'
            }`}
          >
            <span className="hidden sm:inline">Visit Freebies</span>
            <span className="sm:hidden">Visit</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
          <button 
            onClick={handleDismiss} 
            className={`p-1 rounded transition-colors ${
              isShadowSafeMode 
                ? 'hover:bg-brand-blue-gray/20 text-brand-blue-gray' 
                : 'hover:bg-brand-magenta/20 text-brand-light-gray'
            }`}
            aria-label="Dismiss"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
