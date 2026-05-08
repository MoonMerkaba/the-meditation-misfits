import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmailTemplateEditor } from './EmailTemplateEditor';
import { EmailTemplatePreview } from './EmailTemplatePreview';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EmailTemplate {
  id: string;
  template_key: string;
  template_name: string;
  subject: string;
  body: string;
  description: string;
  variables: string[];
  is_active: boolean;
}

export const EmailTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const sampleVariables = {
    user_name: 'John Doe',
    plan_name: 'Premium Monthly',
    days_remaining: '2',
    trial_end_date: 'November 10, 2025',
    plan_price: '$19.99',
    billing_period: 'month',
    next_billing_date: 'November 10, 2025',
    access_end_date: 'December 10, 2025'
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('template_name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      toast({ title: 'Error loading templates', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (template: EmailTemplate) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({
          subject: template.subject,
          body: template.body,
          updated_at: new Date().toISOString()
        })
        .eq('id', template.id);

      if (error) throw error;

      toast({ title: 'Template saved successfully' });
      setSelectedTemplate(null);
      loadTemplates();
    } catch (error) {
      toast({ title: 'Error saving template', variant: 'destructive' });
    }
  };

  if (loading) return <div>Loading templates...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Email Template Manager</h2>
      
      {selectedTemplate ? (
        <Tabs defaultValue="edit" className="w-full">
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="edit">
            <EmailTemplateEditor
              template={selectedTemplate}
              onSave={handleSave}
              onCancel={() => setSelectedTemplate(null)}
            />
          </TabsContent>
          <TabsContent value="preview">
            <EmailTemplatePreview
              subject={selectedTemplate.subject}
              body={selectedTemplate.body}
              variables={sampleVariables}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {template.template_name}
                  <Button onClick={() => setSelectedTemplate(template)}>Edit</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{template.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
