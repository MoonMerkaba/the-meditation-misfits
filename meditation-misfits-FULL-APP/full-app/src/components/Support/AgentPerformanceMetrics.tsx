import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, Star, TrendingUp, MessageSquare, Clock, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AgentStats {
  id: string;
  name: string;
  conversations: number;
  avgResponseTime: number;
  satisfaction: number;
  resolutionRate: number;
  messagesPerHour: number;
}

export default function AgentPerformanceMetrics() {
  const [agents, setAgents] = useState<AgentStats[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [dateRange, setDateRange] = useState('30days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgentStats();
  }, [dateRange]);

  const loadAgentStats = async () => {
    setLoading(true);
    try {
      const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: conversations } = await supabase
        .from('chat_conversations')
        .select('*, chat_messages(*), chat_ratings(*), profiles!assigned_agent_id(*)')
        .gte('created_at', startDate.toISOString());

      const agentMap = new Map<string, AgentStats>();
      
      conversations?.forEach(conv => {
        const agentId = conv.assigned_agent_id;
        if (!agentId) return;

        if (!agentMap.has(agentId)) {
          agentMap.set(agentId, {
            id: agentId,
            name: conv.profiles?.display_name || 'Agent',
            conversations: 0,
            avgResponseTime: 0,
            satisfaction: 0,
            resolutionRate: 0,
            messagesPerHour: 0
          });
        }

        const stats = agentMap.get(agentId)!;
        stats.conversations++;
        if (conv.status === 'closed') stats.resolutionRate++;
        if (conv.chat_ratings?.[0]) stats.satisfaction += conv.chat_ratings[0].rating;
      });

      const agentStats = Array.from(agentMap.values()).map(stats => ({
        ...stats,
        satisfaction: stats.conversations > 0 ? stats.satisfaction / stats.conversations : 0,
        resolutionRate: stats.conversations > 0 ? (stats.resolutionRate / stats.conversations) * 100 : 0,
        avgResponseTime: Math.random() * 5 + 1, // Mock data
        messagesPerHour: Math.random() * 20 + 10 // Mock data
      }));

      setAgents(agentStats);
    } catch (error) {
      toast.error('Failed to load agent statistics');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (agentId?: string) => {
    try {
      const stats = agentId ? agents.find(a => a.id === agentId) : null;
      const csv = stats 
        ? `Metric,Value\nAgent,${stats.name}\nConversations,${stats.conversations}\nAvg Response Time,${stats.avgResponseTime.toFixed(1)} min\nSatisfaction,${stats.satisfaction.toFixed(1)}/5\nResolution Rate,${stats.resolutionRate.toFixed(1)}%\nMessages/Hour,${stats.messagesPerHour.toFixed(1)}`
        : agents.map(a => `${a.name},${a.conversations},${a.avgResponseTime.toFixed(1)},${a.satisfaction.toFixed(1)},${a.resolutionRate.toFixed(1)}`).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `agent-performance-${agentId || 'all'}.csv`;
      link.click();
      toast.success('Report exported');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const topAgents = [...agents].sort((a, b) => b.satisfaction - a.satisfaction).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Agent Performance</h2>
        <div className="flex gap-2">
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Agents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              {agents.map(agent => (
                <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <Button onClick={() => exportReport(selectedAgent === 'all' ? undefined : selectedAgent)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(selectedAgent === 'all' ? agents : agents.filter(a => a.id === selectedAgent)).map(agent => (
          <Card key={agent.id} className="p-4">
            <h3 className="font-semibold mb-3">{agent.name}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Conversations</span>
                <span className="font-medium">{agent.conversations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Response</span>
                <span className="font-medium">{agent.avgResponseTime.toFixed(1)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Satisfaction</span>
                <span className="font-medium flex items-center gap-1">
                  {agent.satisfaction.toFixed(1)} <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Resolution</span>
                <span className="font-medium">{agent.resolutionRate.toFixed(0)}%</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Top Performers</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topAgents}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="satisfaction" fill="#82ca9d" name="Satisfaction" />
            <Bar dataKey="resolutionRate" fill="#8884d8" name="Resolution %" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}