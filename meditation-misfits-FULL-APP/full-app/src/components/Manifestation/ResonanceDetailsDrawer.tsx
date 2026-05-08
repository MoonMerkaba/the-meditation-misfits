import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';

interface ResonanceDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  resonanceData: {
    score: number;
    components: {
      uniqueListenDays: number;
      actions7: number;
      refl7: number;
      wins14: number;
    };
    hint: string;
  };
}

export function ResonanceDetailsDrawer({ open, onClose, resonanceData }: ResonanceDetailsDrawerProps) {
  const { score, components, hint } = resonanceData;

  const metrics = [
    { label: 'Listening Consistency', value: components.uniqueListenDays, max: 14, unit: 'of last 14 days' },
    { label: 'Aligned Actions', value: components.actions7, max: 10, unit: 'in the last 7 days' },
    { label: 'Reflections', value: components.refl7, max: 7, unit: 'in the last 7 days' },
    { label: 'Wins / Syncs', value: components.wins14, max: 5, unit: 'in the last 14 days' }
  ];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Your Resonance: {score}/100</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <p className="text-sm text-muted-foreground">
            Resonance rises as you tune in, act, reflect, and notice your wins.
          </p>
          
          <div className="space-y-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{metric.label}</span>
                  <span className="text-muted-foreground">{metric.value} {metric.unit}</span>
                </div>
                <Progress value={(metric.value / metric.max) * 100} />
              </div>
            ))}
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-900">{hint}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
