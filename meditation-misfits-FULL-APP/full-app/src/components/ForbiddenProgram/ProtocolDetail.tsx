import { useState } from 'react';
import { ForbiddenProtocol } from '@/data/forbiddenProtocols';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, Headphones, AlertTriangle, 
  FileText, Shield, Activity, CheckCircle2
} from 'lucide-react';
import { ForbiddenAudioPlayer } from './ForbiddenAudioPlayer';

interface ProtocolDetailProps {
  protocol: ForbiddenProtocol | null;
  open: boolean;
  onClose: () => void;
  onComplete: (protocolId: string) => void;
  isCompleted: boolean;
}

export function ProtocolDetail({ protocol, open, onClose, onComplete, isCompleted }: ProtocolDetailProps) {
  const [activeTab, setActiveTab] = useState('briefing');
  const [hasStartedListening, setHasStartedListening] = useState(false);

  if (!protocol) return null;

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

  const handlePlayStateChange = (isPlaying: boolean) => {
    if (isPlaying) {
      setHasStartedListening(true);
    }
  };

  const handleMarkComplete = () => {
    onComplete(protocol.id);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-black border border-[#444343] p-0 rounded-none">
        {/* Header */}
        <div className="bg-black p-6 border-b border-[#444343]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="text-[#FF00BF] font-mono text-sm tracking-wider">
                  PROTOCOL #{String(protocol.sequenceNumber).padStart(3, '0')}
                </span>
                <Badge className={`font-mono text-xs ${getClassificationStyle(protocol.classification)}`}>
                  {protocol.classification}
                </Badge>
                {isCompleted && (
                  <Badge className="bg-[#6683A0]/20 text-[#6683A0] border-[#6683A0]/50 font-mono text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    COMPLETED
                  </Badge>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white font-mono tracking-wider">
                {protocol.codename}
              </h2>
              <p className="text-[#A2A1A3] mt-1">{protocol.title}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-[#A2A1A3] hover:text-white hover:bg-[#444343]/50"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Headphones warning */}
          <div className="flex items-center gap-2 mt-4 p-3 bg-[#FF00BF]/10 border border-[#FF00BF]/30">
            <Headphones className="w-5 h-5 text-[#FF00BF]" />
            <span className="text-[#FF00BF] text-sm font-medium tracking-wide">
              HEADPHONES REQUIRED — Binaural frequencies require stereo separation
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start bg-black border-b border-[#444343] rounded-none p-0 h-auto">
              <TabsTrigger 
                value="briefing" 
                className="data-[state=active]:bg-[#444343]/30 data-[state=active]:text-white text-[#A2A1A3] rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF00BF] px-6 py-3"
              >
                <FileText className="w-4 h-4 mr-2" />
                Briefing
              </TabsTrigger>
              <TabsTrigger 
                value="protocol"
                className="data-[state=active]:bg-[#444343]/30 data-[state=active]:text-white text-[#A2A1A3] rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF00BF] px-6 py-3"
              >
                <Activity className="w-4 h-4 mr-2" />
                Protocol
              </TabsTrigger>
              <TabsTrigger 
                value="safety"
                className="data-[state=active]:bg-[#444343]/30 data-[state=active]:text-white text-[#A2A1A3] rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF00BF] px-6 py-3"
              >
                <Shield className="w-4 h-4 mr-2" />
                Safety
              </TabsTrigger>
            </TabsList>

            {/* Briefing Tab */}
            <TabsContent value="briefing" className="p-6 space-y-6 bg-black">
              <div>
                <h3 className="text-[#FF00BF] font-mono text-sm mb-3 uppercase tracking-wider">
                  File Summary
                </h3>
                <p className="text-[#A2A1A3] leading-relaxed">
                  {protocol.briefing}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-[#FF00BF] font-mono text-sm mb-3 uppercase tracking-wider">
                    Observed Responses
                  </h3>
                  <ul className="space-y-2">
                    {protocol.observedResponses.map((response, i) => (
                      <li key={i} className="text-[#A2A1A3] text-sm flex items-start gap-2">
                        <span className="text-[#6683A0] mt-1">—</span>
                        {response}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-[#FF00BF] font-mono text-sm mb-3 uppercase tracking-wider">
                    Reported Experiences
                  </h3>
                  <ul className="space-y-2">
                    {protocol.reportedExperiences.map((exp, i) => (
                      <li key={i} className="text-[#A2A1A3] text-sm flex items-start gap-2">
                        <span className="text-[#6683A0] mt-1">—</span>
                        {exp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tech Specs */}
              <div className="bg-[#444343]/20 border border-[#444343] p-4">
                <h3 className="text-[#FF00BF] font-mono text-sm mb-3 uppercase tracking-wider">
                  Technical Specifications
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm font-mono">
                  <div>
                    <span className="text-[#6683A0] block text-xs">PRIMARY FREQ</span>
                    <span className="text-white">{protocol.techSpecs.primaryFrequency}</span>
                  </div>
                  <div>
                    <span className="text-[#6683A0] block text-xs">BINAURAL RANGE</span>
                    <span className="text-white">{protocol.techSpecs.binauralRange}</span>
                  </div>
                  <div>
                    <span className="text-[#6683A0] block text-xs">NOISE BED</span>
                    <span className="text-white">{protocol.techSpecs.noiseBed}</span>
                  </div>
                  <div>
                    <span className="text-[#6683A0] block text-xs">SPATIAL MOVEMENT</span>
                    <span className="text-white">{protocol.techSpecs.spatialMovement}</span>
                  </div>
                  <div>
                    <span className="text-[#6683A0] block text-xs">MODULATION</span>
                    <span className="text-white">{protocol.techSpecs.rhythmicModulation}</span>
                  </div>
                  <div>
                    <span className="text-[#6683A0] block text-xs">LAYERS</span>
                    <span className="text-white">{protocol.techSpecs.layerCount}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Protocol Tab */}
            <TabsContent value="protocol" className="p-6 space-y-6 bg-black">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-[#FF00BF] font-mono text-sm mb-3 uppercase tracking-wider">
                    Before
                  </h3>
                  <ul className="space-y-2">
                    {protocol.preparationNotes.map((note, i) => (
                      <li key={i} className="text-[#A2A1A3] text-sm flex items-start gap-2">
                        <span className="text-[#6683A0] font-mono">{i + 1}.</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-[#FF00BF] font-mono text-sm mb-3 uppercase tracking-wider">
                    During
                  </h3>
                  <ul className="space-y-2">
                    {protocol.duringProtocol.map((note, i) => (
                      <li key={i} className="text-[#A2A1A3] text-sm flex items-start gap-2">
                        <span className="text-[#6683A0] font-mono">{i + 1}.</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-[#FF00BF] font-mono text-sm mb-3 uppercase tracking-wider">
                    After
                  </h3>
                  <ul className="space-y-2">
                    {protocol.afterProtocol.map((note, i) => (
                      <li key={i} className="text-[#A2A1A3] text-sm flex items-start gap-2">
                        <span className="text-[#6683A0] font-mono">{i + 1}.</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Audio Player */}
              <div className="bg-[#444343]/20 border border-[#444343] p-6">
                <h3 className="text-[#FF00BF] font-mono text-sm mb-4 uppercase tracking-wider text-center">
                  Audio Protocol — Real-Time Generation
                </h3>
                <ForbiddenAudioPlayer 
                  protocol={protocol}
                  onPlayStateChange={handlePlayStateChange}
                  onComplete={() => {}}
                />
                
                {/* Mark Complete Button */}
                {hasStartedListening && !isCompleted && (
                  <div className="mt-6 pt-4 border-t border-[#444343]">
                    <Button
                      onClick={handleMarkComplete}
                      className="w-full bg-[#6683A0]/20 hover:bg-[#6683A0]/30 text-[#6683A0] border border-[#6683A0]/50"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark Protocol as Completed
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Safety Tab */}
            <TabsContent value="safety" className="p-6 space-y-6 bg-black">
              {/* Contraindications */}
              <div className="bg-[#FF00BF]/5 border border-[#FF00BF]/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-[#FF00BF]" />
                  <h3 className="text-[#FF00BF] font-mono text-sm uppercase tracking-wider">
                    Contraindications
                  </h3>
                </div>
                <ul className="space-y-2">
                  {protocol.contraindications.map((item, i) => (
                    <li key={i} className="text-[#A2A1A3] text-sm flex items-start gap-2">
                      <span className="text-[#FF00BF]">—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Grounding Techniques */}
              <div className="bg-[#6683A0]/10 border border-[#6683A0]/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-[#6683A0]" />
                  <h3 className="text-[#6683A0] font-mono text-sm uppercase tracking-wider">
                    Grounding Techniques
                  </h3>
                </div>
                <p className="text-[#A2A1A3]/60 text-sm mb-3">
                  Use these if you feel ungrounded, disconnected, or uncomfortable:
                </p>
                <ul className="space-y-2">
                  {protocol.groundingTechniques.map((item, i) => (
                    <li key={i} className="text-[#A2A1A3] text-sm flex items-start gap-2">
                      <span className="text-[#6683A0]">—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* General Safety */}
              <div className="bg-[#444343]/20 border border-[#444343] p-4">
                <h3 className="text-white font-mono text-sm uppercase tracking-wider mb-3">
                  Remember
                </h3>
                <ul className="space-y-2 text-[#A2A1A3] text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-[#6683A0]">—</span>
                    This is experimental audio content, not a treatment
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6683A0]">—</span>
                    You can stop at any time by removing headphones
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6683A0]">—</span>
                    No experience is required or guaranteed
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6683A0]">—</span>
                    Your safety and comfort come first
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6683A0]">—</span>
                    If in doubt, do not proceed
                  </li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
