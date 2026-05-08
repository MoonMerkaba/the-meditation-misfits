import { Card } from "@/components/ui/card";
import { ArchetypeFrequency } from "@/types/oracle";

interface ArchetypeChartProps {
  data: ArchetypeFrequency[];
}

export function ArchetypeChart({ data }: ArchetypeChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <Card className="p-6 bg-gradient-to-br from-violet-900/20 to-purple-900/20 border-violet-500/30">
      <h3 className="text-xl font-bold mb-4 text-violet-300">🃏 Archetype Frequency</h3>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.archetype}>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-300">{item.archetype}</span>
              <span className="text-sm text-violet-400">{item.count}</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
