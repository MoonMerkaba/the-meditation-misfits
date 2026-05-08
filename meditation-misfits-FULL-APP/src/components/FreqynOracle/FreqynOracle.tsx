import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { MessageCircle, X, Loader2 } from 'lucide-react';
import { storage } from '@/lib/storage';
import { SoundicineLinkButton } from './SoundicineLinkButton';
import { detectSoundicineLinks, fixSoundicineUrl } from '@/lib/soundicineParser';
import NeuroFreqFixPlayer from '../NeuroFreqFixPlayer';

const SUPABASE_URL = 'https://pjqkrfaauevhqrbvvmxn.supabase.co';

interface Message {
  role: 'user' | 'oracle';
  text: string;
  soundicineLinks?: string[];
}


export default function FreqynOracle() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [playUrl, setPlayUrl] = useState('');


  const getContext = () => {
    const dailyCardData = storage.get('mm.daily');
    const dailyCard = dailyCardData?.text || null;
    
    // Get most recent journal entry
    let lastJournal = null;
    const journalKeys = Object.keys(localStorage).filter(k => k.startsWith('mm.journal.'));
    if (journalKeys.length > 0) {
      const lastKey = journalKeys[journalKeys.length - 1];
      const journalText = storage.get(lastKey);
      if (journalText && journalText.length > 0) {
        lastJournal = journalText.substring(0, 200); // First 200 chars
      }
    }

    // Get pathway progress
    const progress = storage.get('mm.progress');
    let pathwayProgress = null;
    if (progress?.level) {
      pathwayProgress = `Level ${progress.level}`;
    }

    return {
      dailyCard,
      lastJournal,
      pathwayProgress,
      currentTone: null // Could be enhanced to track current playing tone
    };
  };

  const handlePlaySoundicine = (url: string) => {
    setPlayUrl(url);
    setShowPlayer(true);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const context = getContext();
      const response = await fetch(`${SUPABASE_URL}/functions/v1/freqyn-oracle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: userMsg,
          context
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || data.error || "I'm here to help guide you. What's on your mind? ✨";
      
      // Detect and fix Soundicine links
      const detectedLinks = detectSoundicineLinks(reply);
      const fixedLinks = detectedLinks.map(link => fixSoundicineUrl(link.url));
      
      // Remove URLs from text and add as buttons
      let cleanText = reply;
      detectedLinks.forEach(link => {
        cleanText = cleanText.replace(link.url, '');
      });
      
      setMessages(prev => [...prev, { 
        role: 'oracle', 
        text: cleanText.trim(),
        soundicineLinks: fixedLinks.length > 0 ? fixedLinks : undefined
      }]);

    } catch (error) {
      console.error('Oracle error:', error);
      setMessages(prev => [...prev, { 
        role: 'oracle', 
        text: "Having trouble connecting right now. Try asking again in a moment. 🌙" 
      }]);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        >
          <MessageCircle className="text-white" size={28} />
        </button>
      )}
      {open && (
        <Card className="fixed bottom-6 right-6 z-50 w-96 h-[500px] flex flex-col bg-card border-pink-500/50 shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b border-pink-500/30">
            <h3 className="font-bold text-pink-400">Freqyn Resonique</h3>
            <button onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                Hey there! 👋 I'm Freqyn. Ask me anything about tones, meditation, or your journey.
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`${msg.role === 'user' ? 'ml-8' : 'mr-8'}`}>
                <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-purple-900/30' : 'bg-pink-900/30'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
                {msg.soundicineLinks && msg.soundicineLinks.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.soundicineLinks.map((link, linkIdx) => (
                      <SoundicineLinkButton
                        key={linkIdx}
                        url={link}
                        onPlay={handlePlaySoundicine}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-pink-400 text-sm">
                <Loader2 className="animate-spin" size={16} />
                <span>Freqyn is thinking...</span>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-pink-500/30 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for guidance..."
              disabled={loading}
            />
            <Button onClick={handleSend} disabled={loading}>
              Send
            </Button>
          </div>
        </Card>
      )}
      
      {showPlayer && (
        <NeuroFreqFixPlayer 
          isOpen={showPlayer}
          onClose={() => setShowPlayer(false)}
          playUrl={playUrl}
        />
      )}
    </>
  );
}

