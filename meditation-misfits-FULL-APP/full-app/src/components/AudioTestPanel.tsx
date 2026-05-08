import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { testAudioFiles, AudioTestResult } from '../lib/audioLoader';

const BASE_URL = "https://b68a5bcd6bdd8d5e08d002edc5589e48.r2.cloudflarestorage.com/soundicine/";

const ALL_FILES = [
  "Classic-alpha-5-mins-(learning)-220-230.wav",
  "Classic-alpha-10-mins-(learning)-220-230.wav",
  "Classic-theta-5-mins-(meditation)-220-230.wav",
  "Classic-theta-10-mins-(meditation)-220-230.wav",
  "Classic-delta-5-mins-(sleep)-220-230.wav",
  "Classic-delta-10-mins-(sleep)-220-230.wav",
  "Classic-beta-5-mins-(focus)-220-230.wav",
  "Classic-beta-10-mins-(focus)-220-230.wav",
  "Classic-gamma-5-mins-(insight)-220-230.wav",
  "Heart-639hz-5-mins-220-230.wav",
  "Heart-639hz-10-mins-220-230.wav",
  "Root-396hz-5-mins-220-230.wav",
  "Schumann-7.83hz-5-mins-220-230.wav",
  "Jupiter-183hz-5-mins-220-230.wav",
  "Venus-221hz-5-mins-220-230.wav"
];

export const AudioTestPanel: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<AudioTestResult[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    
    const urls = ALL_FILES.map(file => `${BASE_URL}${file}`);
    const testResults = await testAudioFiles(urls);
    
    setResults(testResults);
    setTesting(false);
  };

  const accessibleCount = results.filter(r => r.accessible).length;
  const failedCount = results.filter(r => !r.accessible).length;

  return (
    <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg text-purple-300 flex items-center justify-between">
          <span>Audio File Status</span>
          <Button
            onClick={runTests}
            disabled={testing}
            size="sm"
            variant="outline"
            className="border-purple-500 text-purple-300"
          >
            {testing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Test All Files
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {results.length === 0 && !testing && (
          <p className="text-gray-400 text-sm text-center py-4">
            Click "Test All Files" to verify audio accessibility
          </p>
        )}

        {testing && (
          <div className="flex items-center justify-center gap-3 py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
            <span className="text-purple-300">Testing {ALL_FILES.length} audio files...</span>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 text-center">
                <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-300">{accessibleCount}</p>
                <p className="text-xs text-green-200/70">Accessible</p>
              </div>
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-center">
                <XCircle className="w-6 h-6 text-red-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-red-300">{failedCount}</p>
                <p className="text-xs text-red-200/70">Failed</p>
              </div>
            </div>

            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="outline"
              className="w-full"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>

            {showDetails && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.map((result, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      result.accessible
                        ? 'bg-green-900/10 border-green-500/20'
                        : 'bg-red-900/10 border-red-500/20'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {result.accessible ? (
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">
                          {result.filename}
                        </p>
                        {result.accessible && result.loadTime && (
                          <p className="text-xs text-green-300/70">
                            Loaded in {result.loadTime}ms
                          </p>
                        )}
                        {!result.accessible && result.error && (
                          <p className="text-xs text-red-300/70">{result.error}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
