import React, { useEffect, useState } from 'react';
import { fetchSessions } from '../../lib/sessions';
import { Session } from '../../types/session';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Play } from 'lucide-react';

interface PlayerGridProps {
  onSelectSession: (session: Session) => void;
}

export default function PlayerGrid({ onSelectSession }: PlayerGridProps) {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const data = await fetchSessions();
    setSessions(data);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-pink-400">Sensory Sessions</h2>
        <Button onClick={loadSessions} variant="outline" size="sm">Reload</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((session) => (
          <Card key={session.key} className="p-4 bg-card border-purple-500/30 hover:border-pink-500/50 transition-all cursor-pointer" onClick={() => onSelectSession(session)}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{session.title}</h3>
                {session.tag && <span className="text-xs text-muted-foreground">{session.tag}</span>}
                {session.desc && <p className="text-sm text-gray-400 mt-1">{session.desc}</p>}
              </div>
              <Play className="text-pink-400" size={24} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
