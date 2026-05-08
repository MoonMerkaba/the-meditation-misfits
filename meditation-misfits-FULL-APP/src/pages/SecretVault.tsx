import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vaultProtocols, VaultProtocol } from '@/data/vaultProtocols';
import { DisclaimerModal } from '@/components/Vault/DisclaimerModal';
import { ProtocolCard } from '@/components/Vault/ProtocolCard';
import { ProtocolDetail } from '@/components/Vault/ProtocolDetail';
import { Shield, Lock, Radio, AlertTriangle, RotateCcw, FileWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SecretVault() {
  const navigate = useNavigate();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<VaultProtocol | null>(null);
  const [glitchActive, setGlitchActive] = useState(false);


  useEffect(() => {
    const accepted = localStorage.getItem('vault_disclaimer_accepted');
    if (accepted === 'true') {
      setHasAccepted(true);
    } else {
      setShowDisclaimer(true);
    }
  }, []);

  // Random glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 150);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptDisclaimer = () => {
    localStorage.setItem('vault_disclaimer_accepted', 'true');
    setHasAccepted(true);
    setShowDisclaimer(false);
  };

  const handleResetDisclaimer = () => {
    localStorage.removeItem('vault_disclaimer_accepted');
    setHasAccepted(false);
    setShowDisclaimer(true);
  };

  if (!hasAccepted) {
    return (
      <DisclaimerModal 
        open={showDisclaimer} 
        onAccept={handleAcceptDisclaimer}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono relative overflow-hidden">
      {/* Scanline effect */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />
      </div>

      {/* CRT flicker effect */}
      <div className={`fixed inset-0 pointer-events-none z-40 transition-opacity duration-75 ${glitchActive ? 'opacity-30' : 'opacity-0'}`}>
        <div className="absolute inset-0 bg-green-500" />
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDBmZjAwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]" />

      {/* Vignette effect */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 border-2 border-red-600 p-8 bg-red-950/10 relative">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-500" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-500" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-500" />

          <div className="flex items-center justify-center gap-4 mb-4">
            <Shield className="w-12 h-12 text-red-500 animate-pulse" />
            <h1 className={`text-4xl md:text-5xl font-bold text-green-400 tracking-widest ${glitchActive ? 'translate-x-1' : ''}`}>
              SECRET GOVERNMENT VAULT
            </h1>
            <Lock className="w-12 h-12 text-red-500 animate-pulse" />
          </div>
          <p className="text-red-400 text-lg flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            CLASSIFIED CONSCIOUSNESS PROTOCOLS
            <AlertTriangle className="w-5 h-5" />
          </p>
          <p className="text-green-500 text-sm mt-2">RECOVERED FILES • FOR MISFIT EYES ONLY</p>
          
          {/* Status bar */}
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-green-600">
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" />
              SIGNAL: ACTIVE
            </span>
            <span>|</span>
            <span>PROTOCOLS LOADED: {vaultProtocols.length}</span>
            <span>|</span>
            <span>CLEARANCE: MISFIT</span>
          </div>
        </div>

        {/* Protocol Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaultProtocols.map((protocol, index) => (
            <div 
              key={protocol.id}
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProtocolCard
                protocol={protocol}
                onOpen={() => setSelectedProtocol(protocol)}
              />
            </div>
          ))}
        </div>

        {/* Empty state if no protocols */}
        {vaultProtocols.length === 0 && (
          <div className="text-center py-20 border border-green-600 bg-green-950/10">
            <p className="text-green-500 text-xl">NO PROTOCOLS AVAILABLE</p>
            <p className="text-green-700 text-sm mt-2">Check back later for new files...</p>
          </div>
        )}

        {/* Forbidden Program Access Point */}
        <div className="mt-12 mb-8">
          <button
            onClick={() => navigate('/forbidden-program')}
            className="w-full group relative overflow-hidden"
          >
            <div className="border-2 border-dashed border-amber-800/50 hover:border-amber-600 bg-amber-950/10 hover:bg-amber-950/20 p-6 transition-all duration-300">
              {/* Redacted lines effect */}
              <div className="absolute inset-0 opacity-10">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i} 
                    className="h-2 bg-amber-900 my-3 mx-8"
                    style={{ width: `${60 + Math.random() * 30}%` }}
                  />
                ))}
              </div>
              
              <div className="relative flex items-center justify-center gap-4">
                <FileWarning className="w-6 h-6 text-amber-600 group-hover:text-amber-400 transition-colors" />
                <div className="text-center">
                  <div className="inline-block border-2 border-amber-700 px-4 py-1 mb-2 transform -rotate-1">
                    <span className="text-amber-600 text-xs tracking-[0.2em] font-bold">DECLASSIFIED</span>
                  </div>
                  <h3 className="text-amber-500 group-hover:text-amber-400 text-lg font-mono tracking-wider transition-colors">
                    THE FORBIDDEN FREQUENCY PROGRAM
                  </h3>
                  <p className="text-amber-700 text-xs mt-1 font-mono">
                    EXPERIMENTAL AUDIO SEQUENCE • RESTRICTED ACCESS
                  </p>
                </div>
                <FileWarning className="w-6 h-6 text-amber-600 group-hover:text-amber-400 transition-colors" />
              </div>
            </div>
          </button>
        </div>


        {/* Footer */}

        <div className="mt-12 text-center border-t border-green-800 pt-8">
          <div className="flex items-center justify-center gap-4 text-green-700 text-xs">
            <span>MISFIT FREQUENCY DIVISION</span>
            <span>•</span>
            <span>CLASSIFIED ARCHIVE</span>
            <span>•</span>
            <span>ACCESS LOGGED</span>
          </div>
          
          {/* Reset disclaimer button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetDisclaimer}
            className="mt-4 text-green-700 hover:text-green-500 hover:bg-green-950/30"
          >
            <RotateCcw className="w-3 h-3 mr-2" />
            Reset Entry Disclaimer
          </Button>
        </div>
      </div>

      {/* Protocol Detail Modal */}
      <ProtocolDetail
        protocol={selectedProtocol}
        open={!!selectedProtocol}
        onClose={() => setSelectedProtocol(null)}
      />

      {/* CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
        @keyframes scan {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
