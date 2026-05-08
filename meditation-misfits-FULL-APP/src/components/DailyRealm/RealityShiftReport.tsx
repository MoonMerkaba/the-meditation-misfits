import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { invokeEdgeFunction } from '@/lib/edgeFunctionHelper';
import { Loader2 } from 'lucide-react';

export function RealityShiftReport() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await invokeEdgeFunction('get-reality-shift-report', { user_id: user.id });
      if (!error && data) {
        setReport(data);
      }
    } catch (err) {
      console.error('Error loading report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-cyan-900/20">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </Card>
    );
  }

  if (!report) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-cyan-500/30">
      <h3 className="text-xl font-bold mb-4 text-cyan-300">Reality Shift Report</h3>
      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold text-cyan-200 mb-2">{report.theme}</h4>
          <p className="text-sm text-gray-300 mb-4">{report.energy_overview}</p>
          {report.supportive_insights && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-cyan-300 mb-2">Insights:</p>
              <ul className="space-y-1">
                {report.supportive_insights.map((insight: string, i: number) => (
                  <li key={i} className="text-sm text-gray-300">{insight}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="p-3 bg-cyan-500/10 rounded mb-3">
            <p className="text-xs font-semibold text-cyan-300 mb-1">Today's Action:</p>
            <p className="text-sm text-gray-200">{report.suggested_action}</p>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-cyan-300">Frequency Goal:</p>
              <p className="text-sm font-semibold">{report.suggested_frequency_goal}</p>
            </div>
          </div>
          <p className="text-sm italic text-green-200 mt-3">"{report.affirmation}"</p>
        </div>
      </div>
    </Card>
  );
}
