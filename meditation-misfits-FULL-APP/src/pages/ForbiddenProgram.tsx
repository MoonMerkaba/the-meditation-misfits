import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { forbiddenProtocols, ForbiddenProtocol } from '@/data/forbiddenProtocols';
import { ProgramDisclaimer } from '@/components/ForbiddenProgram/ProgramDisclaimer';
import { ProtocolCard } from '@/components/ForbiddenProgram/ProtocolCard';
import { ProtocolDetail } from '@/components/ForbiddenProgram/ProtocolDetail';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileWarning, Lock, ArrowLeft, 
  Headphones, Shield, Radio, Eye, EyeOff
} from 'lucide-react';

const STORAGE_KEY = 'forbidden_program_state';

interface ProgramState {
  hasAcceptedDisclaimer: boolean;
  completedProtocols: string[];
  accessLevel: number;
}

export default function ForbiddenProgram() {
  const navigate = useNavigate();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [programState, setProgramState] = useState<ProgramState>({
    hasAcceptedDisclaimer: false,
    completedProtocols: [],
    accessLevel: 1
  });
  const [selectedProtocol, setSelectedProtocol] = useState<ForbiddenProtocol | null>(null);
  const [showRedacted, setShowRedacted] = useState(false);

  // Load state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      setProgramState(state);
      if (!state.hasAcceptedDisclaimer) {
        setShowDisclaimer(true);
      }
    } else {
      setShowDisclaimer(true);
    }
  }, []);

  // Save state to localStorage
  const saveState = (newState: ProgramState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    setProgramState(newState);
  };

  const handleAcceptDisclaimer = () => {
    const newState = { ...programState, hasAcceptedDisclaimer: true };
    saveState(newState);
    setShowDisclaimer(false);
  };

  const handleDeclineDisclaimer = () => {
    navigate('/');
  };

  const handleCompleteProtocol = (protocolId: string) => {
    if (programState.completedProtocols.includes(protocolId)) return;
    
    const newCompleted = [...programState.completedProtocols, protocolId];
    
    // Calculate new access level based on completed protocols
    let newAccessLevel = 1;
    const completedCount = newCompleted.length;
    if (completedCount >= 6) newAccessLevel = 5;
    else if (completedCount >= 4) newAccessLevel = 4;
    else if (completedCount >= 3) newAccessLevel = 3;
    else if (completedCount >= 2) newAccessLevel = 2;
    
    const newState = {
      ...programState,
      completedProtocols: newCompleted,
      accessLevel: newAccessLevel
    };
    saveState(newState);
  };

  const isProtocolUnlocked = (protocol: ForbiddenProtocol) => {
    return protocol.accessLevel <= programState.accessLevel;
  };

  const isProtocolCompleted = (protocolId: string) => {
    return programState.completedProtocols.includes(protocolId);
  };

  const progressPercent = (programState.completedProtocols.length / forbiddenProtocols.length) * 100;

  const handleResetProgress = () => {
    if (confirm('Reset all progress? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      setProgramState({
        hasAcceptedDisclaimer: false,
        completedProtocols: [],
        accessLevel: 1
      });
      setShowDisclaimer(true);
    }
  };

  if (!programState.hasAcceptedDisclaimer) {
    return (
      <ProgramDisclaimer
        open={showDisclaimer}
        onAccept={handleAcceptDisclaimer}
        onDecline={handleDeclineDisclaimer}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Subtle texture overlay */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOCIgbnVtT2N0YXZlcz0iNCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiLz48L3N2Zz4=')]" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-8 text-[#A2A1A3] hover:text-white hover:bg-[#444343]/30"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Exit Program
        </Button>

        {/* Header */}
        <div className="text-center mb-16">
          {/* Classification stamp */}
          <div className="inline-block mb-8">
            <div className="border-2 border-[#FF00BF] px-8 py-3 transform -rotate-1">
              <span className="text-[#FF00BF] font-bold text-sm tracking-[0.3em] font-mono">
                DECLASSIFIED
              </span>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white font-mono tracking-wider mb-4">
            THE FORBIDDEN FREQUENCY PROGRAM
          </h1>
          
          <p className="text-[#A2A1A3] max-w-2xl mx-auto mb-8 leading-relaxed">
            A curated sequence of experimental audio protocols. Not a treatment. Not a promise.
            Proceed with intention.
          </p>

          {/* Status bar */}
          <div className="flex items-center justify-center gap-6 text-xs font-mono text-[#6683A0] flex-wrap">
            <span className="flex items-center gap-2">
              <Radio className="w-3 h-3 text-[#FF00BF] animate-pulse" />
              SIGNAL ACTIVE
            </span>
            <span className="text-[#444343]">|</span>
            <span className="flex items-center gap-2">
              <Headphones className="w-3 h-3" />
              HEADPHONES REQUIRED
            </span>
            <span className="text-[#444343]">|</span>
            <span className="flex items-center gap-2">
              <Shield className="w-3 h-3" />
              ACCESS LEVEL: {programState.accessLevel}
            </span>
          </div>
        </div>

        {/* Progress section */}
        <div className="max-w-xl mx-auto mb-16 bg-[#444343]/10 border border-[#444343] p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#FF00BF] font-mono text-sm tracking-wider">SEQUENCE PROGRESS</span>
            <span className="text-[#A2A1A3] font-mono text-sm">
              {programState.completedProtocols.length} / {forbiddenProtocols.length}
            </span>
          </div>
          <div className="relative h-1 bg-[#444343] overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-[#FF00BF] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-[#6683A0]">
            <span>
              {programState.completedProtocols.length === 0 
                ? 'Begin with Protocol 001' 
                : programState.completedProtocols.length === forbiddenProtocols.length
                  ? 'Sequence Complete'
                  : 'Continue sequence in order'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetProgress}
              className="text-[#444343] hover:text-[#FF00BF] hover:bg-transparent text-xs p-0"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Important notice */}
        <div className="max-w-3xl mx-auto mb-12 p-4 bg-[#FF00BF]/5 border border-[#FF00BF]/20">
          <div className="flex items-start gap-3">
            <FileWarning className="w-5 h-5 text-[#FF00BF] flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-white mb-1 font-mono tracking-wide">
                Sequential Access Protocol
              </p>
              <p className="text-[#A2A1A3]">
                Protocols unlock as you progress through the sequence. This is intentional.
                Each protocol builds on previous experiences. Respect the order.
              </p>
            </div>
          </div>
        </div>

        {/* Toggle redacted view */}
        <div className="flex justify-end mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRedacted(!showRedacted)}
            className="text-[#6683A0] hover:text-white hover:bg-[#444343]/30"
          >
            {showRedacted ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Locked
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Show All
              </>
            )}
          </Button>
        </div>

        {/* Protocol Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {forbiddenProtocols
            .filter(p => showRedacted || isProtocolUnlocked(p))
            .map((protocol, index) => (
              <div
                key={protocol.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProtocolCard
                  protocol={protocol}
                  isUnlocked={isProtocolUnlocked(protocol)}
                  isCompleted={isProtocolCompleted(protocol.id)}
                  onSelect={() => isProtocolUnlocked(protocol) && setSelectedProtocol(protocol)}
                />
              </div>
            ))}
        </div>

        {/* Empty state for locked protocols */}
        {!showRedacted && forbiddenProtocols.filter(p => !isProtocolUnlocked(p)).length > 0 && (
          <div className="mt-12 text-center p-8 border border-[#444343]/50 bg-[#444343]/5">
            <Lock className="w-8 h-8 text-[#444343] mx-auto mb-3" />
            <p className="text-[#6683A0] font-mono">
              {forbiddenProtocols.filter(p => !isProtocolUnlocked(p)).length} protocols remain locked
            </p>
            <p className="text-[#444343] text-sm mt-1">
              Complete current protocols to unlock more
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-20 text-center border-t border-[#444343]/30 pt-8">
          <div className="flex items-center justify-center gap-4 text-[#444343] text-xs font-mono flex-wrap">
            <span>EXPERIMENTAL AUDIO CONTENT</span>
            <span className="text-[#FF00BF]">•</span>
            <span>NOT A TREATMENT</span>
            <span className="text-[#FF00BF]">•</span>
            <span>USE AT YOUR OWN DISCRETION</span>
          </div>
          <p className="text-[#444343] text-xs mt-4">
            This program is for entertainment and personal exploration only.
          </p>
        </div>
      </div>

      {/* Protocol Detail Modal */}
      <ProtocolDetail
        protocol={selectedProtocol}
        open={!!selectedProtocol}
        onClose={() => setSelectedProtocol(null)}
        onComplete={handleCompleteProtocol}
        isCompleted={selectedProtocol ? isProtocolCompleted(selectedProtocol.id) : false}
      />

      {/* CSS */}
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
          animation: fadeIn 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
