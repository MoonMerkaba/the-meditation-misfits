import { Crown } from 'lucide-react';

interface PremiumBadgeProps {
  variant?: 'default' | 'compact';
}

export const PremiumBadge = ({ variant = 'default' }: PremiumBadgeProps) => {
  if (variant === 'compact') {
    return (
      <Crown className="w-4 h-4 text-yellow-400 fill-yellow-400" />
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full">
      <Crown className="w-4 h-4 text-white" />
      <span className="text-xs font-semibold text-white">Premium</span>
    </div>
  );
};
