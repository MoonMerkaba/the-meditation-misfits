import { useRef, useEffect } from 'react';

interface QuoteCardGeneratorProps {
  text: string;
  type: 'win' | 'reflection';
  onGenerated: (dataUrl: string) => void;
}

export function QuoteCardGenerator({ text, type, onGenerated }: QuoteCardGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1080;
    canvas.height = 1080;

    // Gradient backgrounds
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (type === 'win') {
      gradient.addColorStop(0, '#8B5CF6');
      gradient.addColorStop(1, '#EC4899');
    } else {
      gradient.addColorStop(0, '#3B82F6');
      gradient.addColorStop(1, '#8B5CF6');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    
    // Word wrap
    const maxWidth = 900;
    const lineHeight = 70;
    const words = text.split(' ');
    let line = '';
    let y = canvas.height / 2 - 100;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, canvas.width / 2, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, canvas.width / 2, y);

    // Add branding
    ctx.font = '32px Arial';
    ctx.fillText('Meditation Misfits', canvas.width / 2, canvas.height - 100);

    // Convert to data URL
    onGenerated(canvas.toDataURL('image/png'));
  }, [text, type, onGenerated]);

  return <canvas ref={canvasRef} style={{ display: 'none' }} />;
}
