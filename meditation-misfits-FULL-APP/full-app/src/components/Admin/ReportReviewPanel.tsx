import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ModerationActionDialog } from './ModerationActionDialog';
import { AlertCircle, User, Calendar, MessageSquare } from 'lucide-react';

interface Report {
  id: string;
  reason: string;
  details: string;
  created_at: string;
  reporter: { username: string; avatar_url: string };
  comment: {
    id: string;
    content: string;
    created_at: string;
    author: { username: string; avatar_url: string };
    collection: { name: string };
  };
}

export function ReportReviewPanel({ onActionTaken }: { onActionTaken: () => void }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('get-reported-content', {
        body: { status: 'pending' }
      });

      if (error) throw error;
      setReports(data.reports || []);
    } catch (error: any) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleActionComplete = () => {
    setActionDialogOpen(false);
    setSelectedReport(null);
    fetchReports();
    onActionTaken();
    toast.success('Action completed successfully');
  };

  if (loading) {
    return <div>Loading reports...</div>;
  }

  if (reports.length === 0) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Pending Reports</h3>
        <p className="text-gray-600">All reports have been reviewed</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <h3 className="font-semibold">Report: {report.reason}</h3>
                  <p className="text-sm text-gray-600">
                    Reported {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge variant="destructive">Pending</Badge>
            </div>

            {report.details && (
              <p className="text-sm text-gray-700 mb-4 p-3 bg-gray-50 rounded">
                {report.details}
              </p>
            )}

            <div className="border-t pt-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Reported Comment</span>
              </div>
              <p className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
                {report.comment.content}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                <span>By: {report.comment.author.username}</span>
                <span>On: {report.comment.collection.name}</span>
                <span>{new Date(report.comment.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setSelectedReport(report);
                  setActionDialogOpen(true);
                }}
              >
                Take Action
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {selectedReport && (
        <ModerationActionDialog
          open={actionDialogOpen}
          onOpenChange={setActionDialogOpen}
          report={selectedReport}
          onComplete={handleActionComplete}
        />
      )}
    </>
  );
}