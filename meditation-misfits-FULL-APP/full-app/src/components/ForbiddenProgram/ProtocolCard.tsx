import { ForbiddenProtocol } from '@/data/forbiddenProtocols';
import { Badge } from '@/components/ui/badge';
import { Lock, CheckCircle2, Radio } from 'lucide-react';

interface ProtocolCardProps {
  protocol: ForbiddenProtocol;
  isUnlocked: boolean;
  isCompleted: boolean;
  onSelect: () => void;
}

export function ProtocolCard({ protocol, isUnlocked, isCompleted, onSelect }: ProtocolCardProps) {
  const getClassificationStyle = (classification: string) => {
    switch (classification) {
      case 'DECLASSIFIED':
        return 'bg-[#6683A0]/20 text-[#6683A0] border-[#6683A0]/50';
      case 'RESTRICTED':
        return 'bg-[#FF00BF]/20 text-[#FF00BF] border-[#FF00BF]/50';
      case 'REDACTED':
        return 'bg-white/10 text-white border-white/30';
      default:
        return 'bg-[#444343] text-[#A2A1A3] border-[#444343]';
    }
  };

  if (!isUnlocked) {
    return (
      <div className="relative bg-black border border-[#444343]/50 p-6 opacity-60 cursor-not-allowed">
        {/* Locked overlay */}
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-8 h-8 text-[#444343] mx-auto mb-2" />
            <span className="text-[#444343] text-xs font-mono tracking-wider">
              ACCESS LEVEL {protocol.accessLevel} REQUIRED
            </span>
          </div>
        </div>

        {/* Blurred content */}
        <div className="blur-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#444343] font-mono text-xs">
              #{String(protocol.sequenceNumber).padStart(3, '0')}
            </span>
            <Badge className="bg-[#444343]/50 text-[#444343] border-[#444343] font-mono text-xs">
              LOCKED
            </Badge>
          </div>
          <h3 className="text-[#444343] font-mono text-lg tracking-wider mb-1">
            [REDACTED]
          </h3>
          <p className="text-[#444343] text-sm">
            Protocol details classified
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`
        relative bg-black border p-6 cursor-pointer transition-all duration-200
        ${isCompleted 
          ? 'border-[#6683A0]/50 hover:border-[#6683A0]' 
          : 'border-[#444343] hover:border-[#FF00BF]/50'
        }
        hover:bg-[#444343]/10
      `}
    >
      {/* Status indicator */}
      {isCompleted && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 className="w-5 h-5 text-[#6683A0]" />
        </div>
      )}

      {/* Protocol number and classification */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[#FF00BF] font-mono text-xs tracking-wider">
          #{String(protocol.sequenceNumber).padStart(3, '0')}
        </span>
        <Badge className={`font-mono text-xs ${getClassificationStyle(protocol.classification)}`}>
          {protocol.classification}
        </Badge>
      </div>

      {/* Codename */}
      <h3 className="text-white font-mono text-lg tracking-wider mb-1">
        {protocol.codename}
      </h3>
      
      {/* Title */}
      <p className="text-[#A2A1A3] text-sm mb-4">
        {protocol.title}
      </p>

      {/* Tech specs preview */}
      <div className="space-y-2 text-xs font-mono">
        <div className="flex items-center justify-between">
          <span className="text-[#6683A0]">FREQ</span>
          <span className="text-[#A2A1A3]">{protocol.techSpecs.primaryFrequency}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#6683A0]">DURATION</span>
          <span className="text-[#A2A1A3]">{protocol.duration}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#6683A0]">LAYERS</span>
          <span className="text-[#A2A1A3]">{protocol.techSpecs.layerCount}</span>
        </div>
      </div>

      {/* Signal indicator for active/available */}
      <div className="mt-4 pt-4 border-t border-[#444343]/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className={`w-3 h-3 ${isCompleted ? 'text-[#6683A0]' : 'text-[#FF00BF] animate-pulse'}`} />
          <span className={`text-xs font-mono ${isCompleted ? 'text-[#6683A0]' : 'text-[#FF00BF]'}`}>
            {isCompleted ? 'COMPLETED' : 'READY'}
          </span>
        </div>
        <span className="text-[#444343] text-xs">
          TAP TO ACCESS
        </span>
      </div>
    </div>
  );
}
