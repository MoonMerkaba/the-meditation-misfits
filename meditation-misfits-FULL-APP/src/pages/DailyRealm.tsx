import { TarotCard } from '@/components/DailyRealm/TarotCard';
import { RealityShiftReport } from '@/components/DailyRealm/RealityShiftReport';
import { MultiQuestDisplay } from '@/components/DailyRealm/MultiQuestDisplay';
import { QuestPreferences } from '@/components/DailyRealm/QuestPreferences';
import { ShadowMessenger } from '@/components/DailyRealm/ShadowMessenger';
import { ChakraPulse } from '@/components/DailyRealm/ChakraPulse';
import { DreamGate } from '@/components/DailyRealm/DreamGate';
import { FrequencyRx } from '@/components/DailyRealm/FrequencyRx';
import { Sparkles, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function DailyRealm() {
  const [prefsOpen, setPrefsOpen] = useState(false);

  return (
    <div className="min-h-screen py-8" style={{ background: '#000000' }}>

      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Daily Realm
            </h1>
            <Sparkles className="w-8 h-8 text-pink-400" />
          </div>
          <p className="text-gray-400 mb-4">Your personalized daily spiritual guidance</p>
          
          <Dialog open={prefsOpen} onOpenChange={setPrefsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Quest Preferences
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Quest Preferences</DialogTitle>
              </DialogHeader>
              <QuestPreferences />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <MultiQuestDisplay />
          </div>
          <RealityShiftReport />
          <TarotCard />
          <FrequencyRx />
          <ChakraPulse />
          <DreamGate />
        </div>

        <div className="mt-6">
          <ShadowMessenger />
        </div>
      </div>
    </div>
  );
}
