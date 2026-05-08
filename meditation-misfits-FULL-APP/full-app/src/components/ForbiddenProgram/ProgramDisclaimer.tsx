import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { programDisclaimer } from '@/data/forbiddenProtocols';
import { AlertTriangle, FileWarning, Headphones, Shield } from 'lucide-react';

interface ProgramDisclaimerProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function ProgramDisclaimer({ open, onAccept, onDecline }: ProgramDisclaimerProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 20) {
          setHasScrolledToBottom(true);
        }
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const canProceed = hasScrolledToBottom && hasAcknowledged;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden bg-black border border-[#444343] p-0 rounded-none [&>button]:hidden">
        {/* Header */}
        <div className="bg-black p-6 border-b border-[#444343]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#FF00BF]/10 border border-[#FF00BF]/30">
              <FileWarning className="w-6 h-6 text-[#FF00BF]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-mono tracking-wider">
                {programDisclaimer.title}
              </h2>
              <p className="text-[#A2A1A3] text-sm">
                Read completely before proceeding
              </p>
            </div>
          </div>

          {/* Warning badges */}
          <div className="flex flex-wrap gap-3 text-xs font-mono">
            <div className="flex items-center gap-1 text-[#FF00BF]">
              <AlertTriangle className="w-3 h-3" />
              <span>EXPERIMENTAL CONTENT</span>
            </div>
            <div className="flex items-center gap-1 text-[#6683A0]">
              <Headphones className="w-3 h-3" />
              <span>HEADPHONES REQUIRED</span>
            </div>
            <div className="flex items-center gap-1 text-[#A2A1A3]">
              <Shield className="w-3 h-3" />
              <span>USE AT OWN DISCRETION</span>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div 
          ref={scrollRef}
          className="overflow-y-auto max-h-[50vh] p-6 space-y-4 bg-black"
        >
          {programDisclaimer.paragraphs.map((paragraph, index) => (
            <p 
              key={index} 
              className={`text-sm leading-relaxed ${
                index === 0 ? 'text-white' : 'text-[#A2A1A3]'
              }`}
            >
              {paragraph}
            </p>
          ))}

          {/* Scroll indicator */}
          {!hasScrolledToBottom && (
            <div className="sticky bottom-0 left-0 right-0 py-4 bg-gradient-to-t from-black to-transparent text-center">
              <span className="text-[#FF00BF] text-xs font-mono animate-pulse">
                ↓ SCROLL TO CONTINUE ↓
              </span>
            </div>
          )}
        </div>

        {/* Acknowledgment section */}
        <div className="p-6 border-t border-[#444343] bg-[#444343]/10">
          <div className="flex items-start gap-3 mb-6">
            <Checkbox
              id="acknowledge"
              checked={hasAcknowledged}
              onCheckedChange={(checked) => setHasAcknowledged(checked as boolean)}
              disabled={!hasScrolledToBottom}
              className={`mt-1 border-[#444343] ${
                hasScrolledToBottom 
                  ? 'data-[state=checked]:bg-[#FF00BF] data-[state=checked]:border-[#FF00BF]' 
                  : 'opacity-50'
              }`}
            />
            <label 
              htmlFor="acknowledge" 
              className={`text-sm cursor-pointer ${
                hasScrolledToBottom ? 'text-[#A2A1A3]' : 'text-[#444343]'
              }`}
            >
              {programDisclaimer.acknowledgment}
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={onDecline}
              className="flex-1 bg-transparent border-[#444343] text-[#A2A1A3] hover:bg-[#444343]/30 hover:text-white"
            >
              Exit Program
            </Button>
            <Button
              onClick={onAccept}
              disabled={!canProceed}
              className={`flex-1 font-mono tracking-wider ${
                canProceed 
                  ? 'bg-[#FF00BF] hover:bg-[#FF00BF]/80 text-white' 
                  : 'bg-[#444343] text-[#444343] cursor-not-allowed'
              }`}
            >
              {canProceed ? 'ENTER PROGRAM' : 'READ & ACKNOWLEDGE'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
