import React from 'react';
import { cn } from '@/lib/utils';

interface RitualSectionProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  gradient?: string;
  className?: string;
  completed?: boolean;
  onComplete?: () => void;
  action?: React.ReactNode;
}

export function RitualSection({
  icon,
  title,
  subtitle,
  children,
  gradient = 'from-purple-500/20 to-indigo-500/20',
  className,
  completed,
  onComplete,
  action
}: RitualSectionProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br p-6 transition-all duration-300',
        gradient,
        completed && 'ring-2 ring-emerald-500/50',
        className
      )}
    >
      {/* Decorative glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-white/90">
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              {subtitle && (
                <p className="text-sm text-white/60">{subtitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {action}
            {onComplete && (
              <button
                onClick={onComplete}
                className={cn(
                  'p-2 rounded-lg transition-all',
                  completed
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                )}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="text-white/80">
          {children}
        </div>
      </div>
    </div>
  );
}
