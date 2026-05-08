import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, TrendingUp, MessageSquare, Users, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import AgentPerformanceMetrics from './AgentPerformanceMetrics';

export default function SupportAnalyticsDashboard() {
  const [metrics, setMetrics] = useState({
    avgResponseTime: 2.5,
    totalConversations: 150,
    activeAgents: 5,
    satisfactionScore: 4.7
  });
  const [dateRange, setDateRange] = useState('7days');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  const volumeData = [
    { day: 'Mon', count: 25 },
    { day: 'Tue', count: 32 },
    { day: 'Wed', count: 28 },
    { day: 'Thu', count: 35 },
    { day: 'Fri', count: 40 },
    { day: 'Sat', count: 18 },
    { day: 'Sun', count: 15 }
  ];

  const satisfactionData = [
    { date: 'Week 1', score: 4.5 },
    { date: 'Week 2', score: 4.6 },
    { date: 'Week 3', score: 4.7 },
    { date: 'Week 4', score: 4.8 }
  ];

  const exportReport = () => {
    const csv = `Metric,Value\nAvg Response Time,${metrics.avgResponseTime} min\nTotal Conversations,${metrics.totalConversations}\nActive Agents,${metrics.activeAgents}\nSatisfaction,${metrics.satisfactionScore}/5`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'support-analytics.csv';
    a.click();
    toast.success('Report exported');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Support Analytics</h1>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Clock className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  <p className="text-2xl font-bold">{metrics.avgResponseTime} min</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <MessageSquare className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Conversations</p>
                  <p className="text-2xl font-bold">{metrics.totalConversations}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Agents</p>
                  <p className="text-2xl font-bold">{metrics.activeAgents}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Satisfaction Score</p>
                  <p className="text-2xl font-bold">{metrics.satisfactionScore}/5</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Conversation Volume</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Satisfaction Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={satisfactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="mt-6">
          <AgentPerformanceMetrics />
        </TabsContent>
      </Tabs>
    </div>
  );
}