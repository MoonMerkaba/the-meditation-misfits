import React, { useState } from 'react';
import { Button } from './ui/button';
import { Download, CheckCircle, Loader2 } from 'lucide-react';
import { audioPreloader } from '../lib/audioPreloader';

export const AudioDownloadButton: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    
    try {
      const cachedFiles = audioPreloader.getAllCached();
      
      if (cachedFiles.length === 0) {
        alert('No audio files cached. Please wait for preloading to complete.');
        setDownloading(false);
        return;
      }

      // Download each file
      for (const file of cachedFiles) {
        const url = URL.createObjectURL(file.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download files. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={downloading || downloaded}
      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
    >
      {downloading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {downloaded && <CheckCircle className="w-4 h-4 mr-2" />}
      {!downloading && !downloaded && <Download className="w-4 h-4 mr-2" />}
      {downloading ? 'Downloading...' : downloaded ? 'Downloaded!' : 'Download All for Offline'}
    </Button>
  );
};
