import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  RefreshCw, 
  Play, 
  Send, 
  AlertTriangle,
  Clock,
  Key,
  Link,
  Terminal,
  Mail,
  Shield,
  ExternalLink,
  Copy,
  Check,
  ArrowLeft
} from 'lucide-react';

interface LogEntry {
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

interface TokenStatus {
  connected: boolean;
  expiresAt: string | null;
  lastUpdated: string | null;
  isExpired: boolean;
  timeRemaining: string | null;
}

export default function OAuthTestPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('status');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  
  // Connection Status State
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>({
    connected: false,
    expiresAt: null,
    lastUpdated: null,
    isExpired: true,
    timeRemaining: null
  });
  const [statusLoading, setStatusLoading] = useState(true);
  
  // OAuth Flow State
  const [clientId, setClientId] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [oauthUrl, setOauthUrl] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [exchangeLoading, setExchangeLoading] = useState(false);
  
  // Logs State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // Email Test State
  const [testEmail, setTestEmail] = useState('');
  const [testFirstName, setTestFirstName] = useState('Test');
  const [testLastName, setTestLastName] = useState('User');
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Clipboard state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          setIsAdmin(false);
          setAdminLoading(false);
          return;
        }

        const { data: role } = await supabase
          .from('admin_roles')
          .select('role')
          .eq('user_id', authUser.id)
          .single();

        setIsAdmin(!!role);
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setAdminLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  // Add log entry helper
  const addLog = (level: LogEntry['level'], message: string, details?: string) => {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      details
    };
    setLogs(prev => [...prev, entry]);
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
    addLog('info', 'Logs cleared');
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      addLog('error', 'Failed to copy to clipboard');
    }
  };

  // Check connection status
  const checkConnectionStatus = async () => {
    setStatusLoading(true);
    addLog('info', 'Checking Constant Contact connection status...');
    
    try {
      const { data, error } = await supabase
        .from('constant_contact_tokens')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setTokenStatus({
            connected: false,
            expiresAt: null,
            lastUpdated: null,
            isExpired: true,
            timeRemaining: null
          });
          addLog('warning', 'No Constant Contact token found in database');
        } else {
          throw error;
        }
      } else if (data) {
        const expiresAt = new Date(data.expires_at);
        const now = new Date();
        const isExpired = expiresAt <= now;
        const timeRemaining = isExpired 
          ? null 
          : formatTimeRemaining(expiresAt.getTime() - now.getTime());

        setTokenStatus({
          connected: !isExpired,
          expiresAt: data.expires_at,
          lastUpdated: data.updated_at,
          isExpired,
          timeRemaining
        });

        if (isExpired) {
          addLog('warning', 'Token is expired', `Expired at: ${expiresAt.toLocaleString()}`);
        } else {
          addLog('success', 'Token is valid', `Expires in: ${timeRemaining}`);
        }
      }
    } catch (err: any) {
      addLog('error', 'Failed to check connection status', err.message);
      setTokenStatus({
        connected: false,
        expiresAt: null,
        lastUpdated: null,
        isExpired: true,
        timeRemaining: null
      });
    } finally {
      setStatusLoading(false);
    }
  };

  // Format time remaining
  const formatTimeRemaining = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''}, ${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  // Generate OAuth URL
  const generateOAuthUrl = () => {
    if (!clientId) {
      addLog('error', 'Client ID is required to generate OAuth URL');
      return;
    }

    const baseUrl = 'https://authz.constantcontact.com/oauth2/default/v1/authorize';
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'contact_data offline_access',
      state: crypto.randomUUID()
    });

    const url = `${baseUrl}?${params.toString()}`;
    setOauthUrl(url);
    addLog('success', 'OAuth URL generated', url);
  };

  // Start OAuth flow
  const startOAuthFlow = () => {
    if (!oauthUrl) {
      addLog('error', 'Generate OAuth URL first');
      return;
    }
    
    addLog('info', 'Opening Constant Contact authorization page...');
    window.open(oauthUrl, '_blank');
  };

  // Exchange authorization code for token
  const exchangeCodeForToken = async () => {
    if (!authCode) {
      addLog('error', 'Authorization code is required');
      return;
    }

    setExchangeLoading(true);
    addLog('info', 'Exchanging authorization code for access token...');

    try {
      addLog('info', 'Calling constant-contact-oauth edge function...');
      
      const { data, error } = await supabase.functions.invoke('constant-contact-oauth', {
        body: { code: authCode }
      });

      if (error) {
        addLog('error', 'Edge function error', error.message);
        throw error;
      }

      if (data.success) {
        addLog('success', 'Token exchange successful!', 'Access token has been stored in the database');
        setAuthCode('');
        await checkConnectionStatus();
      } else {
        addLog('error', 'Token exchange failed', data.error || 'Unknown error');
      }
    } catch (err: any) {
      addLog('error', 'Failed to exchange code', err.message);
    } finally {
      setExchangeLoading(false);
    }
  };

  // Test email sending
  const sendTestEmail = async () => {
    if (!testEmail) {
      addLog('error', 'Test email address is required');
      return;
    }

    setEmailSending(true);
    setEmailResult(null);
    addLog('info', `Sending test contact to Constant Contact: ${testEmail}`);

    try {
      addLog('info', 'Calling add-to-constant-contact edge function...');
      
      const { data, error } = await supabase.functions.invoke('add-to-constant-contact', {
        body: {
          email: testEmail,
          firstName: testFirstName,
          lastName: testLastName
        }
      });

      if (error) {
        addLog('error', 'Edge function error', error.message);
        setEmailResult({ success: false, message: error.message });
        return;
      }

      if (data.success) {
        addLog('success', 'Contact added successfully!', `${testFirstName} ${testLastName} <${testEmail}>`);
        setEmailResult({ success: true, message: 'Contact added to Constant Contact successfully!' });
      } else {
        addLog('error', 'Failed to add contact', data.error || 'Unknown error');
        setEmailResult({ success: false, message: data.error || 'Failed to add contact' });
      }
    } catch (err: any) {
      addLog('error', 'Failed to send test', err.message);
      setEmailResult({ success: false, message: err.message });
    } finally {
      setEmailSending(false);
    }
  };

  // Refresh token manually
  const refreshToken = async () => {
    addLog('info', 'Attempting to refresh access token...');
    
    try {
      await checkConnectionStatus();
      addLog('info', 'Token refresh check complete');
    } catch (err: any) {
      addLog('error', 'Failed to refresh token', err.message);
    }
  };

  // Initialize
  useEffect(() => {
    setRedirectUri(window.location.origin + '/the-meditation-misfits/verify');
    checkConnectionStatus();
    addLog('info', 'OAuth Test Page initialized');
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Loading state
  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  // Access denied for non-admins
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-black">
        <Card className="max-w-md w-full bg-slate-900/90 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <Shield className="h-6 w-6" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">You must be an administrator to access this page.</p>
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                <Key className="h-8 w-8 text-purple-400" />
                OAuth Testing Dashboard
              </h1>
              <p className="text-gray-400 mt-1">Test and debug Constant Contact integration</p>
            </div>
          </div>
          <Badge variant={tokenStatus.connected ? 'default' : 'destructive'} className="text-sm">
            {tokenStatus.connected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-white/10">
            <TabsTrigger value="status" className="data-[state=active]:bg-purple-600">
              <CheckCircle className="h-4 w-4 mr-2 hidden sm:inline" />
              Status
            </TabsTrigger>
            <TabsTrigger value="oauth" className="data-[state=active]:bg-purple-600">
              <Link className="h-4 w-4 mr-2 hidden sm:inline" />
              OAuth
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-purple-600">
              <Terminal className="h-4 w-4 mr-2 hidden sm:inline" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="test" className="data-[state=active]:bg-purple-600">
              <Mail className="h-4 w-4 mr-2 hidden sm:inline" />
              Test
            </TabsTrigger>
          </TabsList>

          {/* Status Tab */}
          <TabsContent value="status" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-400" />
                  Connection Status
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Current Constant Contact integration status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {statusLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg border ${
                        tokenStatus.connected 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-red-500/10 border-red-500/30'
                      }`}>
                        <div className="flex items-center gap-3">
                          {tokenStatus.connected ? (
                            <CheckCircle className="h-8 w-8 text-green-500" />
                          ) : (
                            <XCircle className="h-8 w-8 text-red-500" />
                          )}
                          <div>
                            <p className="text-lg font-semibold text-white">
                              {tokenStatus.connected ? 'Connected' : 'Not Connected'}
                            </p>
                            <p className="text-sm text-gray-400">
                              {tokenStatus.connected ? 'Integration is active' : 'Authorization required'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className={`p-4 rounded-lg border ${
                        tokenStatus.isExpired 
                          ? 'bg-yellow-500/10 border-yellow-500/30' 
                          : 'bg-blue-500/10 border-blue-500/30'
                      }`}>
                        <div className="flex items-center gap-3">
                          <Clock className={`h-8 w-8 ${tokenStatus.isExpired ? 'text-yellow-500' : 'text-blue-500'}`} />
                          <div>
                            <p className="text-lg font-semibold text-white">
                              {tokenStatus.isExpired ? 'Token Expired' : 'Token Valid'}
                            </p>
                            <p className="text-sm text-gray-400">
                              {tokenStatus.timeRemaining 
                                ? `Expires in ${tokenStatus.timeRemaining}` 
                                : tokenStatus.expiresAt 
                                  ? `Expired: ${new Date(tokenStatus.expiresAt).toLocaleString()}`
                                  : 'No token found'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {tokenStatus.expiresAt && (
                      <div className="space-y-3 p-4 bg-white/5 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-300">Token Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Expires At:</span>
                            <p className="text-white">{new Date(tokenStatus.expiresAt).toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Last Updated:</span>
                            <p className="text-white">
                              {tokenStatus.lastUpdated ? new Date(tokenStatus.lastUpdated).toLocaleString() : 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 flex-wrap">
                      <Button onClick={checkConnectionStatus} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Status
                      </Button>
                      {tokenStatus.connected && (
                        <Button onClick={refreshToken} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          <Key className="h-4 w-4 mr-2" />
                          Refresh Token
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* OAuth Flow Tab */}
          <TabsContent value="oauth" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Link className="h-5 w-5 text-purple-400" />
                  OAuth Authorization Flow
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manually trigger and test the OAuth authorization process
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-purple-400 border-purple-400">Step 1</Badge>
                    <h4 className="text-white font-medium">Configure OAuth Settings</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientId" className="text-gray-300">Client ID</Label>
                      <Input
                        id="clientId"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="Enter your Constant Contact Client ID"
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="redirectUri" className="text-gray-300">Redirect URI</Label>
                      <div className="flex gap-2">
                        <Input
                          id="redirectUri"
                          value={redirectUri}
                          onChange={(e) => setRedirectUri(e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(redirectUri, 'redirectUri')}
                          className="text-gray-400 hover:text-white shrink-0"
                        >
                          {copiedField === 'redirectUri' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">Use this exact URI in your Constant Contact app settings</p>
                    </div>
                  </div>

                  <Button onClick={generateOAuthUrl} disabled={!clientId} className="bg-purple-600 hover:bg-purple-700">
                    Generate OAuth URL
                  </Button>
                </div>

                <Separator className="bg-white/10" />

                {/* Step 2 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-purple-400 border-purple-400">Step 2</Badge>
                    <h4 className="text-white font-medium">Authorize with Constant Contact</h4>
                  </div>

                  {oauthUrl ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Generated OAuth URL:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(oauthUrl, 'oauthUrl')}
                            className="text-gray-400 hover:text-white"
                          >
                            {copiedField === 'oauthUrl' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-300 break-all font-mono">{oauthUrl}</p>
                      </div>
                      <Button onClick={startOAuthFlow} className="bg-blue-600 hover:bg-blue-700">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Authorization Page
                      </Button>
                    </div>
                  ) : (
                    <Alert className="bg-yellow-500/10 border-yellow-500/30">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <AlertDescription className="text-gray-300">
                        Generate the OAuth URL first by entering your Client ID above.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <Separator className="bg-white/10" />

                {/* Step 3 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-purple-400 border-purple-400">Step 3</Badge>
                    <h4 className="text-white font-medium">Exchange Authorization Code</h4>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="authCode" className="text-gray-300">Authorization Code</Label>
                    <Textarea
                      id="authCode"
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                      placeholder="Paste the authorization code from the callback URL here..."
                      className="bg-white/5 border-white/20 text-white min-h-[80px] font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      After authorizing, you'll be redirected. Copy the 'code' parameter from the URL.
                    </p>
                  </div>

                  <Button 
                    onClick={exchangeCodeForToken}
                    disabled={!authCode || exchangeLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {exchangeLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Exchanging...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Exchange Code for Token
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Terminal className="h-5 w-5 text-purple-400" />
                      Activity Logs
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Detailed logs of OAuth operations and API calls
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={clearLogs} className="border-white/20 text-white hover:bg-white/10">
                    Clear Logs
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full rounded-lg bg-black/50 p-4 font-mono text-sm">
                  {logs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No logs yet. Perform an action to see logs.</p>
                  ) : (
                    <div className="space-y-2">
                      {logs.map((log, index) => (
                        <div key={index} className="flex gap-3">
                          <span className="text-gray-500 shrink-0">{log.timestamp.toLocaleTimeString()}</span>
                          <span className={`shrink-0 ${
                            log.level === 'success' ? 'text-green-400' :
                            log.level === 'error' ? 'text-red-400' :
                            log.level === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                          }`}>
                            [{log.level.toUpperCase()}]
                          </span>
                          <div className="flex-1">
                            <span className="text-gray-200">{log.message}</span>
                            {log.details && <p className="text-gray-500 text-xs mt-1 break-all">{log.details}</p>}
                          </div>
                        </div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Email Tab */}
          <TabsContent value="test" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Mail className="h-5 w-5 text-purple-400" />
                  Test Email Integration
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Send a test contact to verify the Constant Contact integration is working
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!tokenStatus.connected && (
                  <Alert className="bg-yellow-500/10 border-yellow-500/30">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <AlertTitle className="text-yellow-500">Not Connected</AlertTitle>
                    <AlertDescription className="text-gray-300">
                      You need to complete the OAuth flow first before testing email integration.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="testEmail" className="text-gray-300">Email Address</Label>
                    <Input
                      id="testEmail"
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="test@example.com"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="testFirstName" className="text-gray-300">First Name</Label>
                    <Input
                      id="testFirstName"
                      value={testFirstName}
                      onChange={(e) => setTestFirstName(e.target.value)}
                      placeholder="Test"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="testLastName" className="text-gray-300">Last Name</Label>
                    <Input
                      id="testLastName"
                      value={testLastName}
                      onChange={(e) => setTestLastName(e.target.value)}
                      placeholder="User"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                </div>

                <Button 
                  onClick={sendTestEmail}
                  disabled={!testEmail || emailSending || !tokenStatus.connected}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {emailSending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Add Test Contact
                    </>
                  )}
                </Button>

                {emailResult && (
                  <Alert className={emailResult.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}>
                    {emailResult.success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                    <AlertTitle className={emailResult.success ? 'text-green-500' : 'text-red-500'}>
                      {emailResult.success ? 'Success!' : 'Error'}
                    </AlertTitle>
                    <AlertDescription className="text-gray-300">{emailResult.message}</AlertDescription>
                  </Alert>
                )}

                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">What this test does:</h4>
                  <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                    <li>Calls the <code className="text-purple-400">add-to-constant-contact</code> edge function</li>
                    <li>Uses the stored OAuth token to authenticate with Constant Contact API</li>
                    <li>Creates a new contact in your Constant Contact account</li>
                    <li>Returns success/failure status with detailed error messages</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
