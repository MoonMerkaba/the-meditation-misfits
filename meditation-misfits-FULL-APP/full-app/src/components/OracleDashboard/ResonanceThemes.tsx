import { Card } from "@/components/ui/card";
import { ResonancePattern } from "@/types/oracle";

interface ResonanceThemesProps {
  patterns: ResonancePattern[];
}

export function ResonanceThemes({ patterns }: ResonanceThemesProps) {
  const maxFreq = Math.max(...patterns.map(p => p.frequency), 1);

  return (
    <Card className="p-6 bg-gradient-to-br from-pink-900/20 to-purple-900/20 border-pink-500/30">
      <h3 className="text-xl font-bold mb-4 text-pink-300">🌟 Resonance Themes</h3>
      <div className="space-y-3">
        {patterns.map((pattern) => (
          <div key={pattern.theme}>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-300">{pattern.theme}</span>
              <span className="text-xs text-gray-400">
                {new Date(pattern.lastSeen).toLocaleDateString()}
              </span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(pattern.frequency / maxFreq) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
