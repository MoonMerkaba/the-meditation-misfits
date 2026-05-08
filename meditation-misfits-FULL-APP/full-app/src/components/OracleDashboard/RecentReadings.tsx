import { Card } from "@/components/ui/card";
import { FreqynReading, TarotReading } from "@/types/oracle";

interface RecentReadingsProps {
  freqynReadings: FreqynReading[];
  tarotReadings: TarotReading[];
}

export function RecentReadings({ freqynReadings, tarotReadings }: RecentReadingsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
        <h3 className="text-xl font-bold mb-4 text-purple-300">🔮 Recent Freqyn Readings</h3>
        <div className="space-y-3">
          {freqynReadings.slice(0, 3).map((reading) => (
            <div key={reading.id} className="p-3 bg-black/30 rounded-lg border border-purple-500/20">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-purple-400">{reading.frequency} Hz</span>
                <span className="text-xs text-gray-400">{new Date(reading.timestamp).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-300">{reading.guidance}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-indigo-900/20 to-violet-900/20 border-indigo-500/30">
        <h3 className="text-xl font-bold mb-4 text-indigo-300">✨ Recent Tarot Readings</h3>
        <div className="space-y-3">
          {tarotReadings.slice(0, 3).map((reading) => (
            <div key={reading.id} className="p-3 bg-black/30 rounded-lg border border-indigo-500/20">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-indigo-400">{reading.cards.join(', ')}</span>
                <span className="text-xs text-gray-400">{new Date(reading.timestamp).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-300">{reading.interpretation}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
