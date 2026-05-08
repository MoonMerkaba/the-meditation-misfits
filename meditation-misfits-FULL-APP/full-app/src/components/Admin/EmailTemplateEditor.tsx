import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface Props {
  template: EmailTemplate;
  onSave: (template: EmailTemplate) => void;
  onCancel: () => void;
}

export const EmailTemplateEditor: React.FC<Props> = ({ template, onSave, onCancel }) => {
  const [editedTemplate, setEditedTemplate] = useState(template);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Email Template: {template.template_name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Description</Label>
          <p className="text-sm text-gray-600">{template.description}</p>
        </div>

        <div>
          <Label>Available Variables</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {template.variables.map((v) => (
              <Badge key={v} variant="secondary">{`{{${v}}}`}</Badge>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="subject">Subject Line</Label>
          <Input
            id="subject"
            value={editedTemplate.subject}
            onChange={(e) => setEditedTemplate({ ...editedTemplate, subject: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="body">Email Body</Label>
          <Textarea
            id="body"
            rows={12}
            value={editedTemplate.body}
            onChange={(e) => setEditedTemplate({ ...editedTemplate, body: e.target.value })}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={() => onSave(editedTemplate)}>Save Template</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
};
