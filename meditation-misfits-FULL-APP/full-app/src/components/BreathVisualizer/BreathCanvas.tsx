import { useEffect, useRef } from 'react';

interface BreathCanvasProps {
  pattern: { inhale: number; hold1: number; exhale: number; hold2: number };
  isActive: boolean;
  onPhaseChange?: (phase: string) => void;
}

export function BreathCanvas({ pattern, isActive, onPhaseChange }: BreathCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const minRadius = 40;
    const maxRadius = 120;

    const totalCycle = pattern.inhale + pattern.hold1 + pattern.exhale + pattern.hold2;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = (timestamp - startTimeRef.current) / 1000;
      const cycleTime = elapsed % totalCycle;

      let phase = '';
      let progress = 0;
      let radius = minRadius;

      if (cycleTime < pattern.inhale) {
        phase = 'Inhale';
        progress = cycleTime / pattern.inhale;
        radius = minRadius + (maxRadius - minRadius) * progress;
      } else if (cycleTime < pattern.inhale + pattern.hold1) {
        phase = 'Hold';
        radius = maxRadius;
      } else if (cycleTime < pattern.inhale + pattern.hold1 + pattern.exhale) {
        phase = 'Exhale';
        progress = (cycleTime - pattern.inhale - pattern.hold1) / pattern.exhale;
        radius = maxRadius - (maxRadius - minRadius) * progress;
      } else {
        phase = 'Hold';
        radius = minRadius;
      }

      if (onPhaseChange) onPhaseChange(phase);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0.1)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'white';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(phase, centerX, centerY);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, pattern, onPhaseChange]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="mx-auto rounded-lg bg-black/20"
    />
  );
}
