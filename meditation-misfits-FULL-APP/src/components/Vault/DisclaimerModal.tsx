import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Lock, AlertTriangle, Eye } from 'lucide-react';

interface DisclaimerModalProps {
  open: boolean;
  onAccept: () => void;
}

export function DisclaimerModal({ open, onAccept }: DisclaimerModalProps) {
  const [accepted, setAccepted] = useState(false);
  const [typedText, setTypedText] = useState('');
  const fullText = 'INITIALIZING SECURE CONNECTION...';

  useEffect(() => {
    if (open) {
      let index = 0;
      const interval = setInterval(() => {
        if (index <= fullText.length) {
          setTypedText(fullText.slice(0, index));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-black border-2 border-red-600 text-green-400 max-w-2xl font-mono p-0 overflow-hidden">
        {/* Scanline effect */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none z-10" />
        
        {/* Header with warning stripes */}
        <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 p-4 border-b-2 border-red-600">
          <div className="flex items-center justify-center gap-3">
            <Shield className="w-8 h-8 text-red-400 animate-pulse" />
            <DialogTitle className="text-3xl font-bold text-red-400 tracking-[0.3em]">
              CLASSIFIED ACCESS
            </DialogTitle>
            <Lock className="w-8 h-8 text-red-400 animate-pulse" />
          </div>
        </div>
        
        <div className="p-6 space-y-6 relative">
          {/* Loading text */}
          <div className="text-center text-green-500 text-sm mb-4">
            {typedText}
            <span className="animate-pulse">_</span>
          </div>

          {/* Main message */}
          <div className="border border-green-600 p-6 bg-green-950/20 relative">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-500" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-500" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-500" />

            <div className="flex items-start gap-4">
              <Eye className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-lg leading-relaxed text-green-300">
                  You are entering a restricted archive containing recovered cognitive research protocols.
                </p>
                <p className="text-2xl mt-4 text-green-400 font-bold tracking-wider">
                  For Misfit Eyes Only.
                </p>
              </div>
            </div>
          </div>

          {/* Warning box */}
          <div className="flex items-start space-x-3 p-4 border-2 border-yellow-500 bg-yellow-950/20">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <p className="text-yellow-400 text-sm font-bold mb-2">ACKNOWLEDGMENT REQUIRED</p>
              <div className="flex items-start gap-3">
                <Checkbox 
                  id="accept" 
                  checked={accepted}
                  onCheckedChange={(checked) => setAccepted(checked as boolean)}
                  className="border-green-500 data-[state=checked]:bg-green-500 mt-0.5"
                />
                <label htmlFor="accept" className="text-sm leading-relaxed cursor-pointer text-green-300">
                  I understand this is for <span className="text-green-400 font-bold">entertainment</span>, <span className="text-green-400 font-bold">relaxation</span>, and <span className="text-green-400 font-bold">exploration</span> only.
                </label>
              </div>
            </div>
          </div>

          {/* Enter button */}
          <Button
            onClick={onAccept}
            disabled={!accepted}
            className={`w-full font-mono text-lg py-6 tracking-widest transition-all ${
              accepted 
                ? 'bg-green-600 hover:bg-green-500 text-black shadow-lg shadow-green-500/30' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {accepted ? (
              <>
                <Lock className="w-5 h-5 mr-2" />
                ENTER VAULT
              </>
            ) : (
              'AUTHORIZATION REQUIRED'
            )}
          </Button>

          {/* Footer text */}
          <div className="text-center text-green-700 text-xs">
            <p>MISFIT FREQUENCY DIVISION • CLASSIFIED ARCHIVE</p>
            <p className="mt-1">SESSION ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
