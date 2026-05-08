import { Reflection } from '@/hooks/useReflections';
import { format } from 'date-fns';

export function exportToPDF(reflections: Reflection[]) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Freqyn Journal - ${format(new Date(), 'MMM dd, yyyy')}</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { color: #9333ea; margin-bottom: 10px; }
        .subtitle { color: #666; margin-bottom: 30px; }
        .entry { margin-bottom: 30px; page-break-inside: avoid; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; }
        .date { font-weight: 600; color: #374151; }
        .frequency { display: inline-block; background: #f3e8ff; color: #7c3aed; padding: 4px 12px; border-radius: 12px; font-size: 14px; margin: 8px 0; }
        .text { color: #1f2937; line-height: 1.6; margin-top: 12px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>My Freqyn Journal</h1>
      <div class="subtitle">Exported ${format(new Date(), 'MMMM dd, yyyy')}</div>
      ${reflections.map(r => `
        <div class="entry">
          <div class="date">${format(new Date(r.created_at), 'EEEE, MMMM dd, yyyy')}</div>
          <div class="frequency">${r.frequency_name} • ${r.hz_value} Hz</div>
          <div class="text">${r.text}</div>
        </div>
      `).join('')}
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}
