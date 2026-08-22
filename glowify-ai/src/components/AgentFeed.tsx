import React from 'react';
import { AgentLog } from '../utils/neurozenMockData';

interface AgentFeedProps {
  logs: AgentLog[];
  loading?: boolean;
}

export const AgentFeed: any = ({ logs, loading }) => {
  return (
    <div className="bg-neutral-950/80 border border-white/5 rounded-2xl overflow-hidden flex flex-col h-[500px]">
      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-neutral-900/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Agent Telemetry Stream</h3>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-[13px] selection:bg-indigo-500/30 custom-scrollbar">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 w-1/3 bg-neutral-800 rounded" />
                <div className="h-4 w-full bg-neutral-900 rounded" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-neutral-600 italic">
            Waiting for neural data link...
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="group border-l border-white/5 pl-4 py-1 hover:border-indigo-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-indigo-400 font-bold">[{log.agent}]</span>
                <span className="text-neutral-600 text-[11px]">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className="text-emerald-500/80 text-[10px] font-bold">IMP:{log.impactScore.toFixed(1)}</span>
              </div>
              <p className="text-neutral-400 leading-relaxed mb-1 italic">
                {log.reasoning}
              </p>
              <p className="text-white/90">
                <span className="text-neutral-500">&gt;&gt;&gt;</span> {log.action}
              </p>
            </div>
          ))
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}} />
    </div>
  );
};
