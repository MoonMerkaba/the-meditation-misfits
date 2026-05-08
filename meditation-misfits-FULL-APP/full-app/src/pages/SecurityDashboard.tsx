import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, AlertTriangle, AlertCircle, Info, Download, RefreshCw, Search,
  Calendar, Activity, Lock, Eye, ChevronLeft, ChevronRight, Bell, Settings,
  Ban, Unlock, Mail, Clock, Plus, Globe, Webhook, MapPin, Trash2, ExternalLink,
  Check, X, Zap, Send
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metadata: Record<string, any>;
  ip_address: string | null;
  user_id: string | null;
  function_name: string | null;
  created_at: string;
}

interface AlertConfig {
  id: string;
  alert_type: string;
  threshold: number;
  time_window_minutes: number;
  cooldown_minutes: number;
  last_alert_sent: string | null;
  enabled: boolean;
}

interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string;
  blocked_at: string;
  expires_at: string | null;
  auto_blocked: boolean;
}

interface BlockedCountry {
  id: string;
  country_code: string;
  country_name: string;
  reason: string;
  enabled: boolean;
  created_at: string;
}

interface SecurityWebhook {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  enabled: boolean;
  last_triggered_at: string | null;
  last_status: number | null;
  failure_count: number;
  created_at: string;
}

interface RateLimit {
  id: string;
  endpoint: string;
  requests_per_minute: number;
  requests_per_hour: number;
  burst_limit: number;
  enabled: boolean;
}

interface GeoStats {
  [countryCode: string]: {
    count: number;
    blocked: number;
    lat: number;
    lon: number;
    name: string;
  };
}

interface EventStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  byType: Record<string, number>;
  byHour: { hour: string; count: number }[];
}

const SEVERITY_COLORS = {
  critical: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-black',
  low: 'bg-blue-500 text-white'
};

const SEVERITY_ICONS = {
  critical: AlertCircle,
  high: AlertTriangle,
  medium: Info,
  low: Shield
};

const COUNTRY_LIST = [
  { code: 'CN', name: 'China' }, { code: 'RU', name: 'Russia' }, { code: 'KP', name: 'North Korea' },
  { code: 'IR', name: 'Iran' }, { code: 'SY', name: 'Syria' }, { code: 'CU', name: 'Cuba' },
  { code: 'VE', name: 'Venezuela' }, { code: 'BY', name: 'Belarus' }, { code: 'MM', name: 'Myanmar' },
  { code: 'AF', name: 'Afghanistan' }, { code: 'IQ', name: 'Iraq' }, { code: 'LY', name: 'Libya' },
  { code: 'SD', name: 'Sudan' }, { code: 'SO', name: 'Somalia' }, { code: 'YE', name: 'Yemen' }
];

export default function SecurityDashboard() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [blockedCountries, setBlockedCountries] = useState<BlockedCountry[]>([]);
  const [webhooks, setWebhooks] = useState<SecurityWebhook[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const [geoStats, setGeoStats] = useState<GeoStats>({});
  const [stats, setStats] = useState<EventStats | null>(null);
  const [filters, setFilters] = useState({ severity: 'all', eventType: 'all', dateRange: '7d', search: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [newBlockIP, setNewBlockIP] = useState('');
  const [blockingIP, setBlockingIP] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '', events: ['all'] });
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const pageSize = 20;

  useEffect(() => {
    async function checkAdmin() {
      if (!user) { setLoading(false); return; }
      const { data: role } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single();
      if (role && ['admin', 'super_admin'].includes(role.role)) setIsAdmin(true);
      setLoading(false);
    }
    checkAdmin();
  }, [user]);

  const fetchData = useCallback(async () => {
    if (!isAdmin) return;
    setRefreshing(true);
    try {
      let startDate: Date;
      switch (filters.dateRange) {
        case '24h': startDate = subDays(new Date(), 1); break;
        case '7d': startDate = subDays(new Date(), 7); break;
        case '30d': startDate = subDays(new Date(), 30); break;
        default: startDate = subDays(new Date(), 7);
      }

      let query = supabase.from('security_audit_log').select('*', { count: 'exact' })
        .gte('created_at', startOfDay(startDate).toISOString())
        .lte('created_at', endOfDay(new Date()).toISOString())
        .order('created_at', { ascending: false });

      if (filters.severity !== 'all') query = query.eq('severity', filters.severity);
      if (filters.eventType !== 'all') query = query.eq('event_type', filters.eventType);
      if (filters.search) query = query.or(`message.ilike.%${filters.search}%,ip_address.ilike.%${filters.search}%`);

      const from = (page - 1) * pageSize;
      query = query.range(from, from + pageSize - 1);

      const { data: eventsData, count } = await query;
      setEvents(eventsData || []);
      setTotalPages(Math.ceil((count || 0) / pageSize));

      // Stats
      const { data: allEvents } = await supabase.from('security_audit_log')
        .select('severity, event_type, created_at')
        .gte('created_at', startOfDay(startDate).toISOString());

      if (allEvents) {
        const statsData: EventStats = {
          total: allEvents.length,
          critical: allEvents.filter(e => e.severity === 'critical').length,
          high: allEvents.filter(e => e.severity === 'high').length,
          medium: allEvents.filter(e => e.severity === 'medium').length,
          low: allEvents.filter(e => e.severity === 'low').length,
          byType: {},
          byHour: []
        };
        allEvents.forEach(e => { statsData.byType[e.event_type] = (statsData.byType[e.event_type] || 0) + 1; });
        
        const hourCounts: Record<string, number> = {};
        const now = new Date();
        for (let i = 23; i >= 0; i--) {
          const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
          hourCounts[format(hour, 'HH:00')] = 0;
        }
        allEvents.forEach(e => {
          const eventDate = new Date(e.created_at);
          if (now.getTime() - eventDate.getTime() < 24 * 60 * 60 * 1000) {
            const hourKey = format(eventDate, 'HH:00');
            if (hourCounts[hourKey] !== undefined) hourCounts[hourKey]++;
          }
        });
        statsData.byHour = Object.entries(hourCounts).map(([hour, count]) => ({ hour, count }));
        setStats(statsData);
      }

      // Other data
      const [configsRes, blockedRes, countriesRes, webhooksRes, limitsRes] = await Promise.all([
        supabase.from('security_alert_config').select('*').order('alert_type'),
        supabase.from('blocked_ips').select('*').order('blocked_at', { ascending: false }),
        supabase.from('blocked_countries').select('*').order('country_name'),
        supabase.from('security_webhooks').select('*').order('created_at', { ascending: false }),
        supabase.from('rate_limits').select('*').order('endpoint')
      ]);

      setAlertConfigs(configsRes.data || []);
      setBlockedIPs(blockedRes.data || []);
      setBlockedCountries(countriesRes.data || []);
      setWebhooks(webhooksRes.data || []);
      setRateLimits(limitsRes.data || []);

      // Geo stats
      const { data: geoData } = await supabase.functions.invoke('security-alert-monitor', { body: { action: 'get_geo_stats' } });
      if (geoData?.stats) setGeoStats(geoData.stats);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [isAdmin, filters, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const triggerAlertCheck = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase.functions.invoke('security-alert-monitor', { body: { manual: true } });
      if (error) throw error;
      alert(`Alert check complete!\nNotifications: ${data.notifications_sent?.join(', ') || 'None'}\nAlerts: ${data.alerts_triggered}\nBlocked: ${data.blocked_ips?.length || 0}`);
      fetchData();
    } catch (error) {
      alert('Failed: ' + (error as Error).message);
    } finally {
      setRefreshing(false);
    }
  };

  const testAlerts = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase.functions.invoke('security-alert-monitor', { body: { test: true } });
      if (error) throw error;
      alert(data.message || `Test sent via: ${data.sent?.join(', ') || 'none'}`);
    } catch (error) {
      alert('Test failed: ' + (error as Error).message);
    } finally {
      setRefreshing(false);
    }
  };

  const blockIP = async (ip: string) => {
    if (!ip.trim()) return;
    try {
      setBlockingIP(true);
      const { error } = await supabase.functions.invoke('security-alert-monitor', { body: { blockIp: ip.trim() } });
      if (error) throw error;
      setNewBlockIP('');
      fetchData();
    } catch (error) {
      alert('Failed: ' + (error as Error).message);
    } finally {
      setBlockingIP(false);
    }
  };

  const unblockIP = async (ip: string) => {
    if (!confirm(`Unblock ${ip}?`)) return;
    try {
      await supabase.functions.invoke('security-alert-monitor', { body: { unblockIp: ip } });
      fetchData();
    } catch (error) {
      alert('Failed: ' + (error as Error).message);
    }
  };

  const blockCountry = async () => {
    if (!selectedCountry) return;
    const country = COUNTRY_LIST.find(c => c.code === selectedCountry);
    if (!country) return;
    try {
      await supabase.functions.invoke('security-alert-monitor', { 
        body: { block_country: true, country_code: country.code, country_name: country.name } 
      });
      setSelectedCountry('');
      fetchData();
    } catch (error) {
      alert('Failed: ' + (error as Error).message);
    }
  };

  const unblockCountry = async (code: string) => {
    if (!confirm(`Unblock country ${code}?`)) return;
    try {
      await supabase.functions.invoke('security-alert-monitor', { body: { unblock_country: true, country_code: code } });
      fetchData();
    } catch (error) {
      alert('Failed: ' + (error as Error).message);
    }
  };

  const createWebhook = async () => {
    if (!newWebhook.name || !newWebhook.url) return;
    try {
      await supabase.functions.invoke('security-alert-monitor', {
        body: { action: 'create_webhook', webhook_name: newWebhook.name, webhook_url: newWebhook.url, webhook_events: newWebhook.events }
      });
      setNewWebhook({ name: '', url: '', events: ['all'] });
      setShowWebhookForm(false);
      fetchData();
    } catch (error) {
      alert('Failed: ' + (error as Error).message);
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm('Delete this webhook?')) return;
    try {
      await supabase.functions.invoke('security-alert-monitor', { body: { action: 'delete_webhook', webhook_id: id } });
      fetchData();
    } catch (error) {
      alert('Failed: ' + (error as Error).message);
    }
  };

  const toggleWebhook = async (id: string) => {
    try {
      await supabase.functions.invoke('security-alert-monitor', { body: { action: 'toggle_webhook', webhook_id: id } });
      fetchData();
    } catch (error) {
      alert('Failed: ' + (error as Error).message);
    }
  };

  const testWebhook = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('security-alert-monitor', { body: { action: 'test_webhook', webhook_id: id } });
      if (error) throw error;
      alert(data.success ? 'Test delivered!' : 'Test failed');
      fetchData();
    } catch (error) {
      alert('Test failed: ' + (error as Error).message);
    }
  };

  const updateRateLimit = async (id: string, updates: Partial<RateLimit>) => {
    try {
      await supabase.from('rate_limits').update(updates).eq('id', id);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateAlertConfig = async (id: string, updates: Partial<AlertConfig>) => {
    try {
      await supabase.from('security_alert_config').update(updates).eq('id', id);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const exportToCSV = async () => {
    const { data } = await supabase.from('security_audit_log').select('*').order('created_at', { ascending: false }).limit(1000);
    if (!data?.length) return alert('No data');
    const csv = [
      ['ID', 'Type', 'Severity', 'Message', 'IP', 'Time'].join(','),
      ...data.map(e => [e.id, e.event_type, e.severity, `"${e.message}"`, e.ip_address || '', e.created_at].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `security-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="max-w-md"><CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />Access Denied</CardTitle></CardHeader></Card>
      </div>
    );
  }

  const eventTypes = [...new Set(events.map(e => e.event_type))];
  const activeBlockedIPs = blockedIPs.filter(b => !b.expires_at || new Date(b.expires_at) > new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-400" />
              Security Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Monitor events, manage alerts, webhooks, and geo-blocking</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={testAlerts} disabled={refreshing} className="bg-[#4A154B]/30 border-[#4A154B]">
              <Send className="h-4 w-4 mr-2" />Test Alerts
            </Button>
            <Button variant="outline" onClick={triggerAlertCheck} disabled={refreshing} className="bg-purple-600/20 border-purple-500/50">
              <Bell className="h-4 w-4 mr-2" />Check Alerts
            </Button>
            <Button variant="outline" onClick={() => fetchData()} disabled={refreshing} className="bg-purple-600/20 border-purple-500/50">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />Refresh
            </Button>
            <Button variant="outline" onClick={exportToCSV} className="bg-green-600/20 border-green-500/50">
              <Download className="h-4 w-4 mr-2" />Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card className="bg-slate-800/50 border-slate-700"><CardContent className="p-4">
              <div className="flex items-center justify-between"><div><p className="text-sm text-gray-400">Total</p><p className="text-2xl font-bold">{stats.total}</p></div><Activity className="h-8 w-8 text-purple-400" /></div>
            </CardContent></Card>
            <Card className="bg-red-900/30 border-red-700/50"><CardContent className="p-4">
              <div className="flex items-center justify-between"><div><p className="text-sm text-red-300">Critical</p><p className="text-2xl font-bold text-red-400">{stats.critical}</p></div><AlertCircle className="h-8 w-8 text-red-400" /></div>
            </CardContent></Card>
            <Card className="bg-orange-900/30 border-orange-700/50"><CardContent className="p-4">
              <div className="flex items-center justify-between"><div><p className="text-sm text-orange-300">High</p><p className="text-2xl font-bold text-orange-400">{stats.high}</p></div><AlertTriangle className="h-8 w-8 text-orange-400" /></div>
            </CardContent></Card>
            <Card className="bg-yellow-900/30 border-yellow-700/50"><CardContent className="p-4">
              <div className="flex items-center justify-between"><div><p className="text-sm text-yellow-300">Medium</p><p className="text-2xl font-bold text-yellow-400">{stats.medium}</p></div><Info className="h-8 w-8 text-yellow-400" /></div>
            </CardContent></Card>
            <Card className="bg-purple-900/30 border-purple-700/50"><CardContent className="p-4">
              <div className="flex items-center justify-between"><div><p className="text-sm text-purple-300">Blocked IPs</p><p className="text-2xl font-bold text-purple-400">{activeBlockedIPs.length}</p></div><Ban className="h-8 w-8 text-purple-400" /></div>
            </CardContent></Card>
            <Card className="bg-blue-900/30 border-blue-700/50"><CardContent className="p-4">
              <div className="flex items-center justify-between"><div><p className="text-sm text-blue-300">Webhooks</p><p className="text-2xl font-bold text-blue-400">{webhooks.filter(w => w.enabled).length}</p></div><Webhook className="h-8 w-8 text-blue-400" /></div>
            </CardContent></Card>
          </div>
        )}

        {/* Activity Chart */}
        {stats && stats.byHour.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader><CardTitle className="text-lg">Activity (24h)</CardTitle></CardHeader>
            <CardContent>
              <div className="h-24 flex items-end gap-1">
                {stats.byHour.map((item, i) => {
                  const maxCount = Math.max(...stats.byHour.map(h => h.count), 1);
                  const height = (item.count / maxCount) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group">
                      <div className="relative w-full">
                        <div className="w-full bg-purple-500/50 hover:bg-purple-500/80 rounded-t" style={{ height: `${Math.max(height, 2)}px` }} />
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-700 px-2 py-1 rounded text-xs">{item.count}</div>
                      </div>
                      {i % 6 === 0 && <span className="text-xs text-gray-500 mt-1">{item.hour}</span>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="events" className="space-y-4">
          <TabsList className="bg-slate-800/50 flex-wrap">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="blocked">Blocked IPs {activeBlockedIPs.length > 0 && <Badge className="ml-2 bg-red-500">{activeBlockedIPs.length}</Badge>}</TabsTrigger>
            <TabsTrigger value="geo">Geo-Blocking</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Search..." value={filters.search} onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))} className="pl-10 bg-slate-700/50 border-slate-600" />
                    </div>
                  </div>
                  <Select value={filters.severity} onValueChange={(v) => setFilters(f => ({ ...f, severity: v }))}>
                    <SelectTrigger className="w-[140px] bg-slate-700/50 border-slate-600"><SelectValue placeholder="Severity" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.dateRange} onValueChange={(v) => setFilters(f => ({ ...f, dateRange: v }))}>
                    <SelectTrigger className="w-[140px] bg-slate-700/50 border-slate-600"><Calendar className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <table className="w-full">
                    <thead className="bg-slate-700/50 sticky top-0">
                      <tr>
                        <th className="text-left p-3 text-sm">Severity</th>
                        <th className="text-left p-3 text-sm">Type</th>
                        <th className="text-left p-3 text-sm">Message</th>
                        <th className="text-left p-3 text-sm">IP</th>
                        <th className="text-left p-3 text-sm">Time</th>
                        <th className="text-left p-3 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event) => {
                        const Icon = SEVERITY_ICONS[event.severity];
                        const isBlocked = event.ip_address && blockedIPs.some(b => b.ip_address === event.ip_address);
                        return (
                          <tr key={event.id} className="border-t border-slate-700/50 hover:bg-slate-700/30">
                            <td className="p-3"><Badge className={SEVERITY_COLORS[event.severity]}><Icon className="h-3 w-3 mr-1" />{event.severity}</Badge></td>
                            <td className="p-3 text-sm font-mono text-purple-300">{event.event_type}</td>
                            <td className="p-3 text-sm max-w-xs truncate">{event.message}</td>
                            <td className="p-3 text-sm font-mono text-gray-400">
                              <div className="flex items-center gap-2">{event.ip_address || '-'}{isBlocked && <Badge className="bg-red-500/20 text-red-300 text-xs">Blocked</Badge>}</div>
                            </td>
                            <td className="p-3 text-sm text-gray-400">{format(new Date(event.created_at), 'MMM d, HH:mm')}</td>
                            <td className="p-3">
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(event)}><Eye className="h-4 w-4" /></Button>
                                {event.ip_address && !isBlocked && <Button variant="ghost" size="sm" onClick={() => blockIP(event.ip_address!)} className="text-red-400"><Ban className="h-4 w-4" /></Button>}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </TabsContent>

          {/* Blocked IPs Tab */}
          <TabsContent value="blocked" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader><CardTitle className="flex items-center gap-2"><Ban className="h-5 w-5 text-red-400" />Block IP</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input placeholder="IP address" value={newBlockIP} onChange={(e) => setNewBlockIP(e.target.value)} className="flex-1 bg-slate-700/50 border-slate-600" />
                  <Button onClick={() => blockIP(newBlockIP)} disabled={blockingIP || !newBlockIP.trim()} className="bg-red-600 hover:bg-red-700">
                    {blockingIP ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}Block
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader><CardTitle>Blocked IPs ({blockedIPs.length})</CardTitle></CardHeader>
              <CardContent>
                {blockedIPs.length === 0 ? (
                  <div className="text-center py-8 text-gray-400"><Ban className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No blocked IPs</p></div>
                ) : (
                  <div className="space-y-3">
                    {blockedIPs.map((b) => {
                      const expired = b.expires_at && new Date(b.expires_at) < new Date();
                      return (
                        <div key={b.id} className={`flex items-center justify-between p-4 rounded-lg ${expired ? 'bg-slate-700/20 opacity-60' : 'bg-slate-700/50'}`}>
                          <div>
                            <div className="flex items-center gap-3">
                              <code className="text-lg font-mono text-purple-300">{b.ip_address}</code>
                              {b.auto_blocked && <Badge className="bg-orange-500/20 text-orange-300">Auto</Badge>}
                              {expired && <Badge className="bg-gray-500/20 text-gray-300">Expired</Badge>}
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{b.reason}</p>
                            <div className="flex gap-4 mt-2 text-xs text-gray-500">
                              <span><Clock className="h-3 w-3 inline mr-1" />{format(new Date(b.blocked_at), 'MMM d, HH:mm')}</span>
                              {b.expires_at && <span><Calendar className="h-3 w-3 inline mr-1" />Expires: {format(new Date(b.expires_at), 'MMM d, HH:mm')}</span>}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => unblockIP(b.ip_address)} className="bg-green-600/20 border-green-500/50">
                            <Unlock className="h-4 w-4 mr-2" />Unblock
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Geo-Blocking Tab */}
          <TabsContent value="geo" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-blue-400" />Block Country</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="flex-1 bg-slate-700/50 border-slate-600"><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent>
                      {COUNTRY_LIST.filter(c => !blockedCountries.some(bc => bc.country_code === c.code)).map(c => (
                        <SelectItem key={c.code} value={c.code}>{c.name} ({c.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={blockCountry} disabled={!selectedCountry} className="bg-red-600 hover:bg-red-700"><Plus className="h-4 w-4 mr-2" />Block</Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader><CardTitle>Blocked Countries ({blockedCountries.length})</CardTitle></CardHeader>
                <CardContent>
                  {blockedCountries.length === 0 ? (
                    <div className="text-center py-8 text-gray-400"><Globe className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No blocked countries</p></div>
                  ) : (
                    <div className="space-y-2">
                      {blockedCountries.map((c) => (
                        <div key={c.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{String.fromCodePoint(...c.country_code.split('').map(char => 127397 + char.charCodeAt(0)))}</span>
                            <div>
                              <p className="font-medium">{c.country_name}</p>
                              <p className="text-xs text-gray-400">{c.country_code}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => unblockCountry(c.country_code)} className="text-green-400"><Unlock className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader><CardTitle>Geographic Activity (24h)</CardTitle></CardHeader>
                <CardContent>
                  {Object.keys(geoStats).length === 0 ? (
                    <div className="text-center py-8 text-gray-400"><MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No geo data</p></div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {Object.entries(geoStats).sort(([, a], [, b]) => b.count - a.count).slice(0, 15).map(([code, data]) => (
                        <div key={code} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                          <div className="flex items-center gap-2">
                            <span>{String.fromCodePoint(...code.split('').map(char => 127397 + char.charCodeAt(0)))}</span>
                            <span className="text-sm">{data.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-500/20 text-blue-300">{data.count}</Badge>
                            {data.blocked > 0 && <Badge className="bg-red-500/20 text-red-300">{data.blocked} blocked</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Webhook className="h-5 w-5 text-blue-400" />Security Webhooks</CardTitle>
                  <Button onClick={() => setShowWebhookForm(!showWebhookForm)} className="bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 mr-2" />Add Webhook</Button>
                </div>
              </CardHeader>
              {showWebhookForm && (
                <CardContent className="border-t border-slate-700 pt-4">
                  <div className="space-y-4">
                    <Input placeholder="Webhook name" value={newWebhook.name} onChange={(e) => setNewWebhook(w => ({ ...w, name: e.target.value }))} className="bg-slate-700/50 border-slate-600" />
                    <Input placeholder="Webhook URL (https://...)" value={newWebhook.url} onChange={(e) => setNewWebhook(w => ({ ...w, url: e.target.value }))} className="bg-slate-700/50 border-slate-600" />
                    <div className="flex gap-2">
                      <Button onClick={createWebhook} disabled={!newWebhook.name || !newWebhook.url} className="bg-green-600 hover:bg-green-700"><Check className="h-4 w-4 mr-2" />Create</Button>
                      <Button variant="outline" onClick={() => setShowWebhookForm(false)}><X className="h-4 w-4 mr-2" />Cancel</Button>
                    </div>
                  </div>
                </CardContent>
              )}
              <CardContent>
                {webhooks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400"><Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No webhooks configured</p></div>
                ) : (
                  <div className="space-y-3">
                    {webhooks.map((wh) => (
                      <div key={wh.id} className={`p-4 rounded-lg ${wh.enabled ? 'bg-slate-700/50' : 'bg-slate-700/20 opacity-60'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{wh.name}</span>
                              <Badge className={wh.enabled ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}>{wh.enabled ? 'Active' : 'Disabled'}</Badge>
                              {wh.last_status && <Badge className={wh.last_status < 300 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>{wh.last_status}</Badge>}
                              {wh.failure_count > 0 && <Badge className="bg-orange-500/20 text-orange-300">{wh.failure_count} failures</Badge>}
                            </div>
                            <p className="text-sm text-gray-400 mt-1 font-mono truncate">{wh.url}</p>
                            <p className="text-xs text-gray-500 mt-1">Events: {wh.events.join(', ')} | Last: {wh.last_triggered_at ? format(new Date(wh.last_triggered_at), 'MMM d, HH:mm') : 'Never'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => testWebhook(wh.id)}><Zap className="h-4 w-4" /></Button>
                            <Switch checked={wh.enabled} onCheckedChange={() => toggleWebhook(wh.id)} />
                            <Button variant="ghost" size="sm" onClick={() => deleteWebhook(wh.id)} className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rate Limits Tab */}
          <TabsContent value="rate-limits" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-yellow-400" />Rate Limits</CardTitle>
                <CardDescription>Configure request limits per endpoint using sliding window algorithm</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rateLimits.map((limit) => (
                    <div key={limit.id} className={`p-4 rounded-lg ${limit.enabled ? 'bg-slate-700/50' : 'bg-slate-700/20 opacity-60'}`}>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[150px]">
                          <p className="font-mono text-purple-300">{limit.endpoint}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">Per min:</span>
                          <Input type="number" value={limit.requests_per_minute} onChange={(e) => updateRateLimit(limit.id, { requests_per_minute: parseInt(e.target.value) })} className="w-20 bg-slate-600/50 border-slate-500" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">Per hour:</span>
                          <Input type="number" value={limit.requests_per_hour} onChange={(e) => updateRateLimit(limit.id, { requests_per_hour: parseInt(e.target.value) })} className="w-24 bg-slate-600/50 border-slate-500" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">Burst:</span>
                          <Input type="number" value={limit.burst_limit} onChange={(e) => updateRateLimit(limit.id, { burst_limit: parseInt(e.target.value) })} className="w-16 bg-slate-600/50 border-slate-500" />
                        </div>
                        <Switch checked={limit.enabled} onCheckedChange={(checked) => updateRateLimit(limit.id, { enabled: checked })} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Alert Configuration</CardTitle>
                <CardDescription>Configure thresholds for Slack, Email, and Webhook alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alertConfigs.map((config) => (
                    <div key={config.id} className="flex flex-wrap items-center gap-4 p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex-1 min-w-[200px]">
                        <p className="font-medium">{config.alert_type}</p>
                        <p className="text-sm text-gray-400">Last: {config.last_alert_sent ? format(new Date(config.last_alert_sent), 'MMM d, HH:mm') : 'Never'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Threshold:</span>
                        <Input type="number" value={config.threshold} onChange={(e) => updateAlertConfig(config.id, { threshold: parseInt(e.target.value) })} className="w-20 bg-slate-600/50 border-slate-500" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Window:</span>
                        <Input type="number" value={config.time_window_minutes} onChange={(e) => updateAlertConfig(config.id, { time_window_minutes: parseInt(e.target.value) })} className="w-20 bg-slate-600/50 border-slate-500" />
                        <span className="text-xs text-gray-500">min</span>
                      </div>
                      <Button variant={config.enabled ? "default" : "outline"} size="sm" onClick={() => updateAlertConfig(config.id, { enabled: !config.enabled })} className={config.enabled ? "bg-green-600" : ""}>
                        {config.enabled ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Notification Channels</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"/></svg>
                      <span className="font-medium">Slack</span>
                    </div>
                    <p className="text-sm text-gray-400">Real-time alerts to #security-alerts</p>
                    <p className="text-xs text-green-400 mt-2">SLACK_WEBHOOK_URL</p>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-2"><Mail className="h-6 w-6" /><span className="font-medium">Email</span></div>
                    <p className="text-sm text-gray-400">HTML alerts to admin@freqyn.com</p>
                    <p className="text-xs text-green-400 mt-2">SENDGRID_API_KEY</p>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-2"><Webhook className="h-6 w-6" /><span className="font-medium">Webhooks</span></div>
                    <p className="text-sm text-gray-400">{webhooks.filter(w => w.enabled).length} active webhooks</p>
                    <p className="text-xs text-blue-400 mt-2">HMAC-SHA256 signed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" />Event Details</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>Close</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-gray-400">Type</p><p className="font-mono">{selectedEvent.event_type}</p></div>
                  <div><p className="text-sm text-gray-400">Severity</p><Badge className={SEVERITY_COLORS[selectedEvent.severity]}>{selectedEvent.severity}</Badge></div>
                  <div><p className="text-sm text-gray-400">IP</p><p className="font-mono">{selectedEvent.ip_address || 'N/A'}</p></div>
                  <div><p className="text-sm text-gray-400">Time</p><p>{format(new Date(selectedEvent.created_at), 'PPpp')}</p></div>
                </div>
                <div><p className="text-sm text-gray-400">Message</p><p className="mt-1">{selectedEvent.message}</p></div>
                <div><p className="text-sm text-gray-400">Metadata</p><pre className="mt-1 p-3 bg-slate-900 rounded text-xs overflow-auto max-h-48">{JSON.stringify(selectedEvent.metadata, null, 2)}</pre></div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
