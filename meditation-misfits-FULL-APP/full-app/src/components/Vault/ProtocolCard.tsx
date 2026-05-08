import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VaultProtocol } from '@/data/vaultProtocols';
import { FileText, AlertTriangle, Radio, Clock, Waves } from 'lucide-react';

interface ProtocolCardProps {
  protocol: VaultProtocol;
  onOpen: () => void;
}

export function ProtocolCard({ protocol, onOpen }: ProtocolCardProps) {
  const getThreatColor = (level: string) => {
    switch(level.toLowerCase()) {
      case 'elevated': return 'bg-orange-600 text-black';
      case 'high': return 'bg-red-600 text-white';
      case 'critical': return 'bg-red-900 text-white animate-pulse';
      case 'moderate': return 'bg-yellow-600 text-black';
      case 'low': return 'bg-green-700 text-white';
      case 'minimal': return 'bg-green-600 text-black';
      default: return 'bg-yellow-600 text-black';
    }
  };

  return (
    <Card className="bg-black border-2 border-green-600 hover:border-green-400 transition-all hover:shadow-lg hover:shadow-green-500/30 group relative overflow-hidden">
      {/* Scanline effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-green-500 opacity-50" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-green-500 opacity-50" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-green-500 opacity-50" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-green-500 opacity-50" />

      <div className="p-6 space-y-4 relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <FileText className="w-5 h-5 text-green-500" />
              <Badge className="bg-red-600 text-white font-mono text-xs">
                {protocol.classification}
              </Badge>
              <Badge variant="outline" className="border-green-600 text-green-500 font-mono text-xs">
                <Radio className="w-3 h-3 mr-1" />
                AUDIO
              </Badge>
            </div>
            <h3 className="text-xl font-mono text-green-400 group-hover:text-green-300 transition-colors">
              {protocol.name}
            </h3>
          </div>
          
          <Badge className={`font-mono flex-shrink-0 ${getThreatColor(protocol.threat_level)}`}>
            <AlertTriangle className="w-3 h-3 mr-1" />
            {protocol.threat_level}
          </Badge>
        </div>

        {/* Hook text */}
        <p className="text-green-300/80 text-sm font-mono leading-relaxed border-l-2 border-green-700 pl-3">
          "{protocol.one_line_hook}"
        </p>

        {/* Tech specs preview */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="flex items-center gap-1 text-green-600">
            <Clock className="w-3 h-3" />
            <span>{protocol.duration}</span>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <Waves className="w-3 h-3" />
            <span>{protocol.tech_specs.beatStart} - {protocol.tech_specs.beatEnd}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-green-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-600 text-xs font-mono">READY</span>
          </div>
          <Button
            onClick={onOpen}
            className="bg-green-600 hover:bg-green-500 text-black font-mono font-bold tracking-wider group-hover:shadow-lg group-hover:shadow-green-500/30 transition-all"
          >
            OPEN FILE
          </Button>
        </div>
      </div>
    </Card>
  );
}
