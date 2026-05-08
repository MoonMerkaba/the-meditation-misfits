import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { VaultProtocol } from '@/data/vaultProtocols';
import { AlertTriangle, Radio, Activity, FileText, Target, Clipboard, Eye, HelpCircle, BookOpen, ShieldAlert } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VaultAudioPlayer } from './VaultAudioPlayer';

interface ProtocolDetailProps {
  protocol: VaultProtocol | null;
  open: boolean;
  onClose: () => void;
}

export function ProtocolDetail({ protocol, open, onClose }: ProtocolDetailProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!protocol) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-black border-2 border-green-500 text-green-400 max-w-4xl max-h-[90vh] p-0">
        <ScrollArea className="h-[85vh]">
          <div className="space-y-6 font-mono p-6">
            {/* Header Section */}
            <div className={`border-2 p-4 ${isPlaying ? 'border-red-500 bg-red-950/30 animate-pulse' : 'border-red-600 bg-red-950/20'}`}>
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-red-600 text-white">{protocol.classification}</Badge>
                <Badge className="bg-orange-600 text-black">
                  <AlertTriangle className="w-3 h-3 mr-1" />{protocol.threat_level}
                </Badge>
              </div>
              <h2 className="text-3xl text-green-300 mb-2 glitch-text">{protocol.name}</h2>
              <p className="text-sm text-gray-400">{protocol.status}</p>
              
              {/* Glitch effect during playback */}
              {isPlaying && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/5 to-transparent animate-scan" />
                </div>
              )}
            </div>

            {/* Audio Player Section */}
            <VaultAudioPlayer 
              audioUrl={protocol.audioFile}
              protocolName={protocol.name}
              onPlayStateChange={setIsPlaying}
            />

            {/* File Summary */}
            <Section title="FILE SUMMARY" icon={<FileText className="w-5 h-5" />}>
              <p className="text-green-300/90 leading-relaxed">{protocol.file_summary}</p>
            </Section>

            {/* Operational Purpose */}
            <Section title="OPERATIONAL PURPOSE" icon={<Target className="w-5 h-5" />}>
              <ul className="list-disc list-inside space-y-1">
                {protocol.operational_purpose.map((item, i) => (
                  <li key={i} className="text-green-300/90">{item}</li>
                ))}
              </ul>
            </Section>

            {/* Research Notes */}
            <Section title="RESEARCH NOTES" icon={<Clipboard className="w-5 h-5" />}>
              <ul className="space-y-2">
                {protocol.research_notes.map((note, i) => (
                  <li key={i} className="text-green-300/90 pl-4 border-l-2 border-green-700">
                    <span className="text-green-500 text-xs mr-2">[MEMO {String(i + 1).padStart(3, '0')}]</span>
                    {note}
                  </li>
                ))}
              </ul>
            </Section>

            {/* Tech Specs */}
            <Section title="TECH SPECS" icon={<Radio className="w-5 h-5" />} className="bg-green-950/30">
              <div className="grid grid-cols-2 gap-4">
                <SpecItem label="Duration" value={protocol.duration} />
                <SpecItem label="Beat Range" value={`${protocol.tech_specs.beatStart} → ${protocol.tech_specs.beatEnd}`} />
                <SpecItem label="Iso Hz" value={protocol.tech_specs.isoHz} />
                <SpecItem label="Noise Type" value={protocol.tech_specs.noise} />
                <SpecItem label="Intensity" value={protocol.tech_specs.intensity} />
              </div>
            </Section>

            {/* Activation Procedure */}
            <Section title="ACTIVATION PROCEDURE" icon={<Activity className="w-5 h-5" />}>
              <ol className="space-y-2">
                {protocol.activation_procedure.map((step, i) => (
                  <li key={i} className="text-green-300/90 flex items-start gap-3">
                    <span className="bg-green-700 text-black px-2 py-0.5 text-xs font-bold rounded">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </Section>

            {/* Observed Effects */}
            <Section title="OBSERVED EFFECTS" icon={<Eye className="w-5 h-5" />}>
              <div className="flex flex-wrap gap-2">
                {protocol.observed_effects.map((effect, i) => (
                  <Badge key={i} className="bg-green-700 text-black">{effect}</Badge>
                ))}
              </div>
            </Section>

            {/* Unconfirmed Theories */}
            <Section title="UNCONFIRMED THEORIES" icon={<HelpCircle className="w-5 h-5" />} className="border-yellow-600 bg-yellow-950/20">
              <div className="flex items-center gap-2 text-yellow-400 text-xs mb-3">
                <AlertTriangle className="w-4 h-4" />
                <span>SPECULATIVE - NOT VERIFIED - HANDLE AS THEORY ONLY</span>
              </div>
              <ul className="space-y-1">
                {protocol.unconfirmed_theories.map((theory, i) => (
                  <li key={i} className="text-yellow-300/90 text-sm pl-4 border-l border-yellow-600">
                    {theory}
                  </li>
                ))}
              </ul>
            </Section>

            {/* Integration Notes */}
            <Section title="INTEGRATION NOTES" icon={<BookOpen className="w-5 h-5" />}>
              <ul className="space-y-1">
                {protocol.integration_notes.map((note, i) => (
                  <li key={i} className="text-green-300/90 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    {note}
                  </li>
                ))}
              </ul>
            </Section>

            {/* Warnings */}
            <Section title="MANDATORY WARNINGS" icon={<ShieldAlert className="w-5 h-5" />} className="border-red-600 bg-red-950/30">
              <ul className="space-y-2">
                {protocol.warnings.map((warning, i) => (
                  <li key={i} className="text-red-300 font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    {warning}
                  </li>
                ))}
              </ul>
            </Section>

            {/* Footer */}
            <div className="border-t border-green-700 pt-4 text-center">
              <p className="text-green-600 text-xs">
                FILE ACCESS LOGGED | SESSION ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
              </p>
              <p className="text-green-700 text-xs mt-1">
                MISFIT FREQUENCY DIVISION | CLASSIFIED ARCHIVE
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, icon, children, className = "" }: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border border-green-600 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className="text-green-500">{icon}</span>}
        <h3 className="text-lg text-green-300 font-bold tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-green-500 text-xs uppercase tracking-wider">{label}</span>
      <span className="text-green-300 font-bold">{value}</span>
    </div>
  );
}
