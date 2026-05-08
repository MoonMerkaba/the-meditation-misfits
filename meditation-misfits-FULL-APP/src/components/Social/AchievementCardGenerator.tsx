import { useRef, useEffect } from 'react';

interface AchievementCardGeneratorProps {
  streakCount: number;
  milestoneName?: string;
  totalQuests: number;
  longestStreak: number;
  badgeEmoji?: string;
  onGenerated: (dataUrl: string) => void;
}

export function AchievementCardGenerator({ 
  streakCount, 
  milestoneName,
  totalQuests,
  longestStreak,
  badgeEmoji,
  onGenerated 
}: AchievementCardGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1080;

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#6366F1');
    gradient.addColorStop(0.5, '#8B5CF6');
    gradient.addColorStop(1, '#EC4899');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add decorative circles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(200, 200, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(880, 880, 200, 0, Math.PI * 2);
    ctx.fill();

    // Main content
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';

    // Badge emoji
    if (badgeEmoji) {
      ctx.font = 'bold 120px Arial';
      ctx.fillText(badgeEmoji, canvas.width / 2, 280);
    }

    // Milestone name
    if (milestoneName) {
      ctx.font = 'bold 56px Arial';
      ctx.fillText(milestoneName, canvas.width / 2, 400);
    }

    // Streak count
    ctx.font = 'bold 80px Arial';
    ctx.fillText(`${streakCount} Day Streak!`, canvas.width / 2, 520);

    // Stats
    ctx.font = '36px Arial';
    ctx.fillText(`Total Quests: ${totalQuests}`, canvas.width / 2, 640);
    ctx.fillText(`Longest Streak: ${longestStreak}`, canvas.width / 2, 700);

    // Branding
    ctx.font = 'bold 40px Arial';
    ctx.fillText('MEDITATION MISFITS', canvas.width / 2, 880);
    ctx.font = '28px Arial';
    ctx.fillText('Daily Quest Master', canvas.width / 2, 930);

    onGenerated(canvas.toDataURL('image/png'));
  }, [streakCount, milestoneName, totalQuests, longestStreak, badgeEmoji, onGenerated]);

  return <canvas ref={canvasRef} style={{ display: 'none' }} />;
}
