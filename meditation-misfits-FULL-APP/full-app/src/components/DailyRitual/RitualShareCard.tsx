import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, Share2, Eye, Heart, Sparkles, Moon, Flame } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface RitualShareCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: 'shadow_work' | 'recovery' | 'intention' | 'journal';
  contentText: string;
  additionalInfo?: {
    element?: string;
    moonPhase?: string;
    date?: string;
  };
}

const gradients: Record<string, { start: string; end: string }> = {
  shadow_work: { start: '#1e293b', end: '#334155' },
  recovery: { start: '#831843', end: '#be185d' },
  intention: { start: '#4c1d95', end: '#7c3aed' },
  journal: { start: '#0f766e', end: '#14b8a6' }
};

const titles: Record<string, string> = {
  shadow_work: 'Shadow Work Insight',
  recovery: 'Recovery Reflection',
  intention: 'Daily Intention',
  journal: 'Journal Entry'
};

export function RitualShareCard({ open, onOpenChange, contentType, contentText, additionalInfo }: RitualShareCardProps) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (open && contentText) {
      generateCard();
    }
  }, [open, contentText, contentType]);

  const generateCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for social media (1:1 aspect ratio)
    canvas.width = 1080;
    canvas.height = 1080;

    const gradient = gradients[contentType];

    // Create gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, gradient.start);
    bgGradient.addColorStop(1, gradient.end);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add decorative elements
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 200 + 50,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Add title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(titles[contentType], canvas.width / 2, 120);

    // Add decorative line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 100, 150);
    ctx.lineTo(canvas.width / 2 + 100, 150);
    ctx.stroke();

    // Add quote marks
    ctx.font = '120px Georgia, serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillText('"', 100, 280);
    ctx.fillText('"', canvas.width - 100, canvas.height - 200);

    // Add main text with word wrap
    ctx.fillStyle = '#ffffff';
    ctx.font = '42px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';

    const maxWidth = 900;
    const lineHeight = 60;
    const words = contentText.split(' ');
    let line = '';
    let y = canvas.height / 2 - 100;
    const lines: string[] = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    // Center the text block vertically
    const totalHeight = lines.length * lineHeight;
    y = (canvas.height - totalHeight) / 2;

    lines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, y + index * lineHeight);
    });

    // Add additional info
    if (additionalInfo) {
      ctx.font = '28px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      
      let infoText = '';
      if (additionalInfo.moonPhase) infoText += additionalInfo.moonPhase + ' ';
      if (additionalInfo.element) infoText += '• ' + additionalInfo.element + ' ';
      if (additionalInfo.date) infoText += '• ' + additionalInfo.date;
      
      if (infoText) {
        ctx.fillText(infoText.trim(), canvas.width / 2, canvas.height - 180);
      }
    }

    // Add branding
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('Meditation Misfits', canvas.width / 2, canvas.height - 100);
    
    ctx.font = '24px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('Daily Misfit Ritual', canvas.width / 2, canvas.height - 60);

    // Convert to data URL
    setImageUrl(canvas.toDataURL('image/png'));
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.download = `misfit-ritual-${contentType}-${Date.now()}.png`;
    link.href = imageUrl;
    link.click();
    toast.success('Image downloaded!');
  };

  const handleShareToCommunity = async () => {
    if (!user) {
      toast.error('Please sign in to share');
      return;
    }

    setSharing(true);
    try {
      const { data, error } = await supabase.functions.invoke('share-ritual-content', {
        body: {
          action: 'share',
          contentType,
          contentText,
          isAnonymous
        }
      });

      if (error) throw error;

      toast.success('Shared to community!');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to share');
    } finally {
      setSharing(false);
    }
  };

  const handleNativeShare = async () => {
    if (!imageUrl) return;

    try {
      const blob = await (await fetch(imageUrl)).blob();
      const file = new File([blob], 'ritual-share.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: titles[contentType],
          text: contentText,
          files: [file]
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(contentText);
        toast.success('Text copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-slate-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-400" />
            Share Your Insight
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          {imageUrl && (
            <div className="rounded-xl overflow-hidden border border-white/10">
              <img src={imageUrl} alt="Share card preview" className="w-full" />
            </div>
          )}

          {/* Hidden canvas for generation */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Anonymous toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-white/60" />
              <Label className="text-white/80">Share anonymously</Label>
            </div>
            <Switch
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={handleNativeShare}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          <Button
            onClick={handleShareToCommunity}
            disabled={sharing || !user}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
          >
            <Heart className="w-4 h-4 mr-2" />
            {sharing ? 'Sharing...' : 'Share to Community'}
          </Button>

          {!user && (
            <p className="text-center text-sm text-white/50">
              Sign in to share with the community
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
