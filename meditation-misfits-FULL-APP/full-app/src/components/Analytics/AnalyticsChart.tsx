import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp } from 'lucide-react';

interface DataPoint {
  date: string;
  sessions: number;
  minutes: number;
}

interface AnalyticsChartProps {
  data: DataPoint[];
  title: string;
  type: 'sessions' | 'minutes';
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data, title, type }) => {
  const maxValue = Math.max(...data.map(d => type === 'sessions' ? d.sessions : d.minutes));
  
  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#FF00BF]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((point, idx) => {
            const value = type === 'sessions' ? point.sessions : point.minutes;
            const percentage = (value / maxValue) * 100;
            
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">{point.date}</span>
                  <span className="text-[#FF00BF] font-bold">{value}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#FF00BF] to-[#6683a0] h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsChart;
