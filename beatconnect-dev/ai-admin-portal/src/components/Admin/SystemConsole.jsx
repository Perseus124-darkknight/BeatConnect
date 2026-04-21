import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

const SystemConsole = () => {
  const [logs, setLogs] = useState([
    { id: 1, type: 'init', msg: 'Neural Interface Initialized...', time: '09:00:01' },
    { id: 2, type: 'success', msg: 'Security Handshake Protocol SEC-9 Verified.', time: '09:00:02' },
    { id: 3, type: 'msg', msg: 'System Administrator logged in to Authority Node.', time: '09:00:03' }
  ]);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Simulate incoming logs
  useEffect(() => {
    const interval = setInterval(() => {
      const types = ['msg', 'success', 'ping', 'query'];
      const msgs = [
        'Syncing artist roster...',
        'Checking cache integrity...',
        'Pinging database nodes...',
        'Identity sync successful.',
        'Asset catalog updated.',
        'Analyzing traffic patterns...'
      ];
      
      const newLog = {
        id: Date.now(),
        type: types[Math.floor(Math.random() * types.length)],
        msg: msgs[Math.floor(Math.random() * msgs.length)],
        time: new Date().toLocaleTimeString('en-GB', { hour12: false })
      };
      
      setLogs(prev => [...prev.slice(-15), newLog]);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card-premium rounded-[32px] border border-white/5 overflow-hidden flex flex-col h-[300px] mb-12">
      <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/40">
          <Terminal size={14} />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">Authority Console</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500/20" />
          <div className="w-2 h-2 rounded-full bg-amber-500/20" />
          <div className="w-2 h-2 rounded-full bg-emerald-500/20" />
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 p-6 font-mono text-[11px] overflow-y-auto custom-scrollbar bg-black/40"
      >
        <div className="flex flex-col gap-1.5">
          {logs.map(log => (
            <div key={log.id} className="flex gap-4 group/log">
              <span className="text-white/10 shrink-0">[{log.time}]</span>
              <span className={`
                ${log.type === 'success' ? 'text-emerald-400' : 
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'ping' ? 'text-secondary' : 'text-white/40'}
              `}>
                <span className="opacity-40 mr-2">{'>'}</span>
                {log.msg}
              </span>
            </div>
          ))}
          <div className="flex gap-2 items-center text-primary/60 animate-pulse">
            <span className="text-white/10">[{new Date().toLocaleTimeString('en-GB', { hour12: false })}]</span>
            <span>{'>'}</span>
            <div className="w-2 h-4 bg-primary/40" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConsole;
