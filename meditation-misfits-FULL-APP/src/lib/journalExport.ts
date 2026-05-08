import { Reflection } from '@/hooks/useReflections';
import { format } from 'date-fns';

export function exportToCSV(reflections: Reflection[]) {
  const headers = ['Date', 'Frequency', 'Hz Value', 'Reflection'];
  const rows = reflections.map(r => [
    format(new Date(r.created_at), 'MMM dd, yyyy'),
    r.frequency_name,
    `${r.hz_value} Hz`,
    `"${r.text.replace(/"/g, '""')}"` // Escape quotes
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `freqyn-journal-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
