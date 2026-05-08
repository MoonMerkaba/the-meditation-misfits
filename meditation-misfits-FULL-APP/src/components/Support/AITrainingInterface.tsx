import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Brain, Plus, Edit, Trash2, TestTube, Upload, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { BulkImportModal } from './BulkImportModal';

export default function AITrainingInterface() {
  const [knowledgeBase, setKnowledgeBase] = useState<any[]>([]);
  const [systemPrompts, setSystemPrompts] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showABTest, setShowABTest] = useState(false);
  const [newEntry, setNewEntry] = useState({
    question: '',
    answer: '',
    category: '',
    tags: '',
    qualityScore: 5
  });
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    loadKnowledgeBase();
    loadSystemPrompts();
  }, []);

  const loadKnowledgeBase = async () => {
    const { data } = await supabase
      .from('ai_knowledge_base')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (data) setKnowledgeBase(data);
  };

  const loadSystemPrompts = async () => {
    const { data } = await supabase
      .from('ai_system_prompts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setSystemPrompts(data);
  };

  const addKnowledgeEntry = async () => {
    if (!newEntry.question || !newEntry.answer) {
      toast.error('Question and answer are required');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('ai_knowledge_base')
        .insert({
          question: newEntry.question,
          answer: newEntry.answer,
          category: newEntry.category,
          tags: newEntry.tags.split(',').map(t => t.trim()),
          quality_score: newEntry.qualityScore,
          created_by: user?.id
        });

      if (error) throw error;

      toast.success('Knowledge entry added');
      setShowAddModal(false);
      setNewEntry({ question: '', answer: '', category: '', tags: '', qualityScore: 5 });
      loadKnowledgeBase();
    } catch (error) {
      toast.error('Failed to add entry');
    } finally {
      setLoading(false);
    }
  };

  const testAI = async () => {
    if (!testMessage) return;

    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('ai-chat-assistant', {
        body: {
          message: testMessage,
          conversationHistory: [],
          isTest: true
        }
      });

      setTestResponse(data?.response || 'No response');
    } catch (error) {
      toast.error('Test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="h-8 w-8" />
          AI Training Center
        </h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowBulkImport(true)} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Button onClick={() => setShowABTest(true)} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            A/B Testing
          </Button>
          <Button onClick={() => setShowTestModal(true)} variant="outline">
            <TestTube className="h-4 w-4 mr-2" />
            Test AI
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Knowledge Base ({knowledgeBase.length} entries)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {knowledgeBase.map((entry) => (
              <Card key={entry.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-semibold">{entry.question}</p>
                    <p className="text-sm text-muted-foreground mt-1">{entry.answer}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  {entry.category && <Badge variant="secondary">{entry.category}</Badge>}
                  {entry.tags?.map((tag: string) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Prompts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {systemPrompts.map((prompt) => (
              <Card key={prompt.id} className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm">{prompt.name}</p>
                    <p className="text-xs text-muted-foreground">v{prompt.version}</p>
                  </div>
                  {prompt.is_active && <Badge>Active</Badge>}
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Knowledge Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Question"
              value={newEntry.question}
              onChange={(e) => setNewEntry({ ...newEntry, question: e.target.value })}
            />
            <Textarea
              placeholder="Answer"
              value={newEntry.answer}
              onChange={(e) => setNewEntry({ ...newEntry, answer: e.target.value })}
              rows={4}
            />
            <Input
              placeholder="Category"
              value={newEntry.category}
              onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
            />
            <Input
              placeholder="Tags (comma-separated)"
              value={newEntry.tags}
              onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
            />
            <Select value={newEntry.qualityScore.toString()} onValueChange={(v) => setNewEntry({ ...newEntry, qualityScore: parseInt(v) })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map(score => (
                  <SelectItem key={score} value={score.toString()}>Quality: {score}/5</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addKnowledgeEntry} disabled={loading} className="w-full">
              {loading ? 'Adding...' : 'Add Entry'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTestModal} onOpenChange={setShowTestModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test AI Response</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter test message..."
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              rows={3}
            />
            <Button onClick={testAI} disabled={loading} className="w-full">
              {loading ? 'Testing...' : 'Test'}
            </Button>
            {testResponse && (
              <Card className="p-4 bg-muted">
                <p className="text-sm font-semibold mb-2">AI Response:</p>
                <p className="text-sm">{testResponse}</p>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BulkImportModal 
        open={showBulkImport} 
        onOpenChange={setShowBulkImport}
        onImportComplete={loadKnowledgeBase}
      />

      <Dialog open={showABTest} onOpenChange={setShowABTest}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>A/B Testing Dashboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {systemPrompts.filter(p => p.is_active).map((prompt) => (
                <Card key={prompt.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{prompt.name}</p>
                      <Badge variant="outline" className="mt-1">Group {prompt.test_group}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Usage:</span>
                      <span className="font-medium">{prompt.usage_count || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Success Rate:</span>
                      <span className="font-medium">{prompt.success_rate || 0}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Satisfaction:</span>
                      <span className="font-medium">{prompt.avg_satisfaction || 0}/5</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
