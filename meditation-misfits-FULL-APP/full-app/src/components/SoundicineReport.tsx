import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ExternalLink, Play, Download } from 'lucide-react';
import NeuroFreqFixPlayer from './NeuroFreqFixPlayer';

interface SessionRequest {
  goal: 'calm' | 'focus' | 'sleep' | 'uplift' | 'abundance' | 'healing';
  minutes: number;
  headphones: boolean;
  sensitivity: 'high' | 'medium' | 'low';
}

interface Props {
  sessionRequest: SessionRequest;
}

const frequencyNames = {
  calm: "Aquamarine Serenity",
  focus: "Crystalline Clarity", 
  sleep: "Midnight Velvet",
  uplift: "Golden Ascension",
  abundance: "Emerald Prosperity",
  healing: "Rose Quartz Restoration"
};

const generateReport = (request: SessionRequest) => {
  const baseFreq = {
    calm: 7, focus: 14, sleep: 4.5, uplift: 12, abundance: 10, healing: 5
  }[request.goal];

  const irregularityIndex = Math.floor(Math.random() * 20) + 10;
  
  return {
    dominantFreq: baseFreq,
    name: frequencyNames[request.goal],
    envelope: ["expanding", "radiant", "balanced", "volatile", "collapsed"][Math.floor(Math.random() * 5)],
    blockages: `echoes below ${baseFreq - 2} Hz, karmic loops`,
    irregularityIndex,
    interpretation: getInterpretation(request.goal)
  };
};

const getInterpretation = (goal: string) => {
  const interpretations = {
    calm: "Your soul seeks the gentle embrace of tranquil waters. Ancient wisdom flows through your energy field, ready to dissolve the chaos of modern existence.",
    focus: "The crystalline pathways of your mind await activation. Your consciousness yearns to pierce through the veil of distraction into pure clarity.",
    sleep: "The cosmic lullaby calls to your weary spirit. Your energy signature reveals deep need for restoration in the sacred realm of dreams.",
    uplift: "Golden threads of joy weave through your aura. Your heart's frequency seeks alignment with the higher octaves of bliss and possibility.",
    abundance: "The emerald frequencies of prosperity resonate within your core. Your soul is ready to receive the universe's infinite gifts.",
    healing: "Rose-colored harmonics surround your wounded places. Your energy field calls for the gentle restoration of your divine wholeness."
  };
  return interpretations[goal] || "Your unique frequency signature reveals profound potential for transformation.";
};

const SoundicineReport: React.FC<Props> = ({ sessionRequest }) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const report = generateReport(sessionRequest);
  
  const mappings = {
    calm: { start: 10, end: 7, iso: 7, noise: "pink" },
    focus: { start: 11, end: 14, iso: 14, noise: "pink" },
    sleep: { start: 6, end: 4, iso: 4.5, noise: "brown" },
    uplift: { start: 10, end: 13, iso: 12, noise: "pink" },
    abundance: { start: 10, end: 10, iso: 10, noise: "pink" },
    healing: { start: 5, end: 5, iso: 5, noise: "brown" }
  };

  const mapping = mappings[sessionRequest.goal];
  const strength = { high: "gentle", medium: "medium", low: "strong" }[sessionRequest.sensitivity];
  
  const playUrl = `https://app.samanthabushika.com/freq?goal=${sessionRequest.goal}&minutes=${sessionRequest.minutes}&beatStart=${mapping.start}&beatEnd=${mapping.end}&isoHz=${mapping.iso}&noise=${mapping.noise}&strength=${strength}`;


  return (
    <>
      <div className="space-y-6">
        <Card className="bg-black/50 border-purple-500 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-purple-300">✨ Sound-icine Report ✨</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <div><strong className="text-purple-400">Dominant Frequency:</strong> {report.dominantFreq} Hz — {report.name}</div>
            <div><strong className="text-purple-400">Energy Envelope:</strong> {report.envelope}</div>
            <div><strong className="text-purple-400">Potential Blockages:</strong> {report.blockages}</div>
            <div><strong className="text-purple-400">Harmonic Irregularity Index:</strong> {report.irregularityIndex} (soul seeking alignment)</div>
            <div><strong className="text-purple-400">Interpretation:</strong> {report.interpretation}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/50 border-green-500 backdrop-blur-sm">
          <CardContent className="p-6">
            <p className="text-center text-lg mb-6 text-green-300">
              From this resonance, I have forged your Sound-icine. NeuroFreqFix is ready to deliver the dose.
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={() => setShowPlayer(true)}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Open Player → NeuroFreqFix
              </Button>
              
              <Button 
                asChild 
                variant="outline"
                className="w-full border-green-500 text-green-300 hover:bg-green-900"
              >
                <a href={playUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  External Link → New Tab
                </a>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-green-500 text-green-300"
                disabled
              >
                <Download className="w-4 h-4 mr-2" />
                Download → Coming Soon
              </Button>
            </div>

            {!sessionRequest.headphones && sessionRequest.goal !== 'sleep' && (
              <p className="text-sm text-yellow-400 mt-4 text-center">
                💫 For optimal resonance, consider using headphones to fully receive the harmonic frequencies.
              </p>
            )}

            <p className="text-xs text-gray-500 mt-6 text-center">
              Wellness audio only; not medical advice. Avoid use while driving or if you have a history of seizures/photosensitivity.
            </p>
          </CardContent>
        </Card>
      </div>

      {showPlayer && (
        <NeuroFreqFixPlayer 
          isOpen={showPlayer}
          playUrl={playUrl} 
          onClose={() => setShowPlayer(false)} 
        />
      )}

    </>
  );
};

export default SoundicineReport;