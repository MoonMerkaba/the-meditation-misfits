import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, SkipForward, Home } from 'lucide-react';
import FrequencyVisualizer from './FrequencyVisualizer';

interface Choice {
  id: string;
  text: string;
  nextStep: string;
}

interface Step {
  id: string;
  title: string;
  content: string;
  choices?: Choice[];
  isEnd?: boolean;
}

const sampleJourney: Step[] = [
  {
    id: 'start',
    title: 'Welcome, Misfit',
    content: 'You\'re here because traditional meditation hasn\'t worked for you. That\'s perfect—you\'re exactly where you need to be. How are you feeling right now?',
    choices: [
      { id: 'overwhelmed', text: 'Overwhelmed & scattered', nextStep: 'overwhelmed-path' },
      { id: 'restless', text: 'Restless & fidgety', nextStep: 'restless-path' },
      { id: 'skeptical', text: 'Skeptical but curious', nextStep: 'skeptical-path' }
    ]
  },
  {
    id: 'overwhelmed-path',
    title: 'Embracing the Chaos',
    content: 'Your overwhelm isn\'t a bug—it\'s a feature. Let\'s work WITH your busy mind, not against it. Take three breaths, but don\'t worry about making them perfect. Just notice them.',
    choices: [
      { id: 'continue', text: 'I\'m breathing (sort of)', nextStep: 'grounding' },
      { id: 'struggling', text: 'My mind is still racing', nextStep: 'racing-mind' }
    ]
  },
  {
    id: 'restless-path',
    title: 'Movement Medicine',
    content: 'Who said meditation requires sitting still? Your body wants to move—let\'s honor that. Wiggle your toes, roll your shoulders, or tap your fingers. Movement IS meditation.',
    choices: [
      { id: 'moving', text: 'I\'m moving and it feels good', nextStep: 'body-awareness' },
      { id: 'still-fidgety', text: 'Still feeling antsy', nextStep: 'fidget-friendly' }
    ]
  },
  {
    id: 'grounding',
    title: 'Grounding Through Sensation',
    content: 'Feel your feet on the ground. Notice the temperature of the air on your skin. You\'re not trying to empty your mind—you\'re filling it with the present moment.',
    choices: [
      { id: 'grounded', text: 'I feel more grounded', nextStep: 'completion' },
      { id: 'distracted', text: 'Still distracted', nextStep: 'distraction-ok' }
    ]
  },
  {
    id: 'completion',
    title: 'You Did It, Misfit',
    content: 'You just meditated—YOUR way. There was no perfect posture, no empty mind, no mystical experience required. You showed up as you are, and that\'s revolutionary.',
    isEnd: true
  }
];

interface MeditationSessionProps {
  journeyId: string;
  onComplete: () => void;
  onExit: () => void;
}

const MeditationSession: React.FC<MeditationSessionProps> = ({ journeyId, onComplete, onExit }) => {
  const [currentStep, setCurrentStep] = useState('start');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepHistory, setStepHistory] = useState<string[]>(['start']);

  const currentStepData = sampleJourney.find(step => step.id === currentStep);
  
  useEffect(() => {
    const totalSteps = sampleJourney.length;
    const currentIndex = sampleJourney.findIndex(step => step.id === currentStep);
    setProgress((currentIndex + 1) / totalSteps * 100);
  }, [currentStep]);

  const handleChoice = (nextStep: string) => {
    setCurrentStep(nextStep);
    setStepHistory([...stepHistory, nextStep]);
  };

  const handleComplete = () => {
    onComplete();
  };

  if (!currentStepData) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{
      background: 'linear-gradient(135deg, #1a0b2e 0%, #0d0616 50%, #1a0b2e 100%)'
    }}>

      <div className="w-full max-w-4xl">
        {/* Progress bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 bg-white/20" />
          <p className="text-white/70 text-sm mt-2 text-center">{Math.round(progress)}% complete</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardContent className="p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
              {currentStepData.title}
            </h2>
            
            <div className="bg-white/5 rounded-xl p-6 mb-8">
              <p className="text-white/90 text-lg leading-relaxed text-center">
                {currentStepData.content}
              </p>
            </div>

            {/* Choices */}
            {currentStepData.choices && (
              <div className="space-y-4 mb-6">
                {currentStepData.choices.map((choice) => (
                  <Button
                    key={choice.id}
                    onClick={() => handleChoice(choice.nextStep)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-4 text-left justify-start rounded-xl"
                  >
                    {choice.text}
                  </Button>
                ))}
              </div>
            )}

            {/* End screen */}
            {currentStepData.isEnd && (
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">🎉</div>
                <Button
                  onClick={handleComplete}
                  className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold px-8 py-4 text-lg rounded-xl"
                >
                  Complete Session
                </Button>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/20">
              <Button
                onClick={onExit}
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Home className="w-4 h-4 mr-2" />
                Exit
              </Button>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MeditationSession;