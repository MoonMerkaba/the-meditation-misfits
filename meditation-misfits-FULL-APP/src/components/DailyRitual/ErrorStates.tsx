import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, WifiOff, Cloud, Heart, Sparkles, Moon, AlertCircle } from 'lucide-react';

// Error-safe language for different scenarios
export const ERROR_MESSAGES = {
  ritual_load: {
    title: 'Ritual Loading',
    message: 'Your ritual is taking a moment to arrive.',
    subtext: 'In the meantime, breathe.',
    icon: Moon,
    color: 'purple'
  },
  checkin_save: {
    title: 'Check-In',
    message: "We couldn't save your check-in, but your awareness still happened.",
    subtext: 'The practice matters more than the record.',
    icon: Heart,
    color: 'pink'
  },
  pattern_analysis: {
    title: 'Pattern Insights',
    message: 'Insights are brewing.',
    subtext: 'Return soon.',
    icon: Sparkles,
    color: 'purple'
  },
  network_offline: {
    title: 'Offline Mode',
    message: "You're offline, but you're not alone.",
    subtext: 'Some features work offline.',
    icon: WifiOff,
    color: 'blue'
  },
  general: {
    title: 'Taking a Moment',
    message: 'Something needs a moment.',
    subtext: 'Your presence here still counts.',
    icon: Cloud,
    color: 'slate'
  },
  shadow_analysis: {
    title: 'Shadow Insights',
    message: 'The shadows are still forming.',
    subtext: 'Patterns reveal themselves in their own time.',
    icon: Moon,
    color: 'indigo'
  },
  energy_trends: {
    title: 'Energy Trends',
    message: 'Your energy data is gathering.',
    subtext: 'Check back in a moment.',
    icon: Heart,
    color: 'pink'
  },
  ritual_save: {
    title: 'Saving Ritual',
    message: "Your ritual couldn't be saved right now.",
    subtext: 'But the intention behind it is already real.',
    icon: Sparkles,
    color: 'purple'
  }
};

export type ErrorType = keyof typeof ERROR_MESSAGES;

interface ErrorStateProps {
  type: ErrorType;
  onRetry?: () => void;
  retrying?: boolean;
  showRetry?: boolean;
  className?: string;
  compact?: boolean;
}

export function ErrorState({ 
  type, 
  onRetry, 
  retrying = false, 
  showRetry = true,
  className = '',
  compact = false
}: ErrorStateProps) {
  const config = ERROR_MESSAGES[type] || ERROR_MESSAGES.general;
  const Icon = config.icon;
  
  const colorClasses = {
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400',
    pink: 'from-pink-500/20 to-pink-500/5 border-pink-500/20 text-pink-400',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400',
    slate: 'from-slate-500/20 to-slate-500/5 border-slate-500/20 text-slate-400',
    indigo: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/20 text-indigo-400'
  };

  const colors = colorClasses[config.color as keyof typeof colorClasses] || colorClasses.slate;

  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r ${colors} border ${className}`}>
        <Icon className="w-4 h-4 flex-shrink-0" />
        <p className="text-sm text-white/70 flex-1">{config.message}</p>
        {showRetry && onRetry && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRetry}
            disabled={retrying}
            className="text-white/60 hover:text-white h-7 px-2"
          >
            <RefreshCw className={`w-3 h-3 ${retrying ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-br ${colors} border text-center ${className}`}>
      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6" />
      </div>
      
      <h3 className="text-lg font-medium text-white mb-2">{config.title}</h3>
      <p className="text-white/80 mb-2">{config.message}</p>
      <p className="text-white/50 text-sm italic mb-4">{config.subtext}</p>
      
      {showRetry && onRetry && (
        <Button
          onClick={onRetry}
          disabled={retrying}
          variant="outline"
          className="border-white/20 text-white/70 hover:bg-white/10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${retrying ? 'animate-spin' : ''}`} />
          {retrying ? 'Trying again...' : 'Try Again'}
        </Button>
      )}
    </div>
  );
}

// Offline detector component
export function OfflineDetector({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Check initial state
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-blue-500/5 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-white/90 font-medium">You're offline, but you're not alone.</p>
              <p className="text-white/60 text-sm">Some features work offline. Others will sync when you reconnect.</p>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}

// Loading state with compassionate messaging
interface LoadingStateProps {
  type?: ErrorType;
  message?: string;
  className?: string;
}

export function LoadingState({ type, message, className = '' }: LoadingStateProps) {
  const config = type ? ERROR_MESSAGES[type] : null;
  const Icon = config?.icon || Moon;

  return (
    <div className={`p-6 rounded-2xl bg-white/5 border border-white/10 text-center ${className}`}>
      <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
        <Icon className="w-6 h-6 text-purple-400" />
      </div>
      <p className="text-white/70">
        {message || config?.message || 'Taking a moment...'}
      </p>
      <p className="text-white/50 text-sm mt-2 italic">
        {config?.subtext || 'Your presence here still counts.'}
      </p>
    </div>
  );
}

// Empty state with compassionate messaging
interface EmptyStateProps {
  title: string;
  message: string;
  subtext?: string;
  icon?: React.ElementType;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  title, 
  message, 
  subtext, 
  icon: Icon = Sparkles,
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`p-8 rounded-2xl bg-white/5 border border-white/10 text-center ${className}`}>
      <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-purple-400" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-white/70 mb-2">{message}</p>
      {subtext && (
        <p className="text-white/50 text-sm italic mb-4">{subtext}</p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Retry wrapper with automatic retry logic
interface RetryWrapperProps {
  children: React.ReactNode;
  error: Error | null;
  errorType: ErrorType;
  onRetry: () => Promise<void>;
  maxRetries?: number;
  retryDelay?: number;
}

export function RetryWrapper({
  children,
  error,
  errorType,
  onRetry,
  maxRetries = 3,
  retryDelay = 2000
}: RetryWrapperProps) {
  const [retrying, setRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = async () => {
    if (retryCount >= maxRetries) return;
    
    setRetrying(true);
    try {
      await onRetry();
      setRetryCount(0);
    } catch (e) {
      setRetryCount(prev => prev + 1);
    } finally {
      setRetrying(false);
    }
  };

  // Auto-retry on first error
  useEffect(() => {
    if (error && retryCount === 0) {
      const timer = setTimeout(handleRetry, retryDelay);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (error) {
    return (
      <ErrorState
        type={errorType}
        onRetry={handleRetry}
        retrying={retrying}
        showRetry={retryCount < maxRetries}
      />
    );
  }

  return <>{children}</>;
}

// Toast-style error notification
export function useCompassionateToast() {
  const showError = (type: ErrorType) => {
    const config = ERROR_MESSAGES[type] || ERROR_MESSAGES.general;
    // This would integrate with your toast system
    return {
      title: config.title,
      description: `${config.message} ${config.subtext}`,
      variant: 'default' as const
    };
  };

  return { showError };
}
