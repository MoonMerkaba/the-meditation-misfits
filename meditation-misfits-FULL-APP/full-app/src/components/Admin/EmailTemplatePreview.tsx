import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  subject: string;
  body: string;
  variables: Record<string, string>;
}

export const EmailTemplatePreview: React.FC<Props> = ({ subject, body, variables }) => {
  const replaceVariables = (text: string) => {
    let result = text;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return result;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-600">Subject:</p>
            <p className="text-lg font-medium">{replaceVariables(subject)}</p>
          </div>
          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-gray-600 mb-2">Body:</p>
            <div className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded">
              {replaceVariables(body)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
