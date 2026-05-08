import React from 'react';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Download, CheckCircle, AlertCircle, Loader2, Zap, Star } from 'lucide-react';
import { PreloadProgress } from '../lib/audioPreloader';

interface AudioPreloadProgressProps {
  progress: PreloadProgress;
  isComplete: boolean;
}

export const AudioPreloadProgress: React.FC<AudioPreloadProgressProps> = ({ progress, isComplete }) => {
  if (isComplete && progress.failed === 0) {
    return (
      <Card className="bg-green-900/30 border-green-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-green-300">
            <CheckCircle className="w-5 h-5" />
            <div className="flex-1">
              <p className="font-medium">All audio files ready!</p>
              <p className="text-xs text-green-200/70">
                {progress.loaded} files cached for instant playback
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const phaseIcon = progress.phase === 'priority' ? (
    <Star className="w-5 h-5 text-yellow-300" />
  ) : (
    <Loader2 className="w-5 h-5 animate-spin text-blue-300" />
  );

  const phaseText = progress.phase === 'priority' 
    ? 'Loading priority files (most used)...'
    : 'Loading remaining files...';

  return (
    <Card className="bg-blue-900/30 border-blue-500/30">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {phaseIcon}
            <div className="flex-1">
              <p className="font-medium text-blue-300">{phaseText}</p>
              <p className="text-xs text-blue-200/70">
                {progress.loaded} of {progress.total} files loaded
                {progress.failed > 0 && ` (${progress.failed} failed)`}
              </p>
            </div>
            <span className="text-sm font-medium text-blue-300">
              {Math.round(progress.percentage)}%
            </span>
          </div>
          
          <Progress value={progress.percentage} className="h-2" />
          
          {progress.currentFile && (
            <p className="text-xs text-blue-200/50 truncate">
              Loading: {progress.currentFile}
            </p>
          )}
          
          {progress.failed > 0 && (
            <div className="flex items-center gap-2 text-yellow-400 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>Some files failed to load</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
