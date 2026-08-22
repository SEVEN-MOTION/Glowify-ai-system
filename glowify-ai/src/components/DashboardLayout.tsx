import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: any = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-neutral-200 selection:bg-indigo-500/30 selection:text-white antialiased">
      {/* Background Decorative Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-500/10 blur-[100px] rounded-full" />
      </div>

      {/* Enterprise Sidebar/Nav Container */}
      <div className="relative z-10 flex flex-col">
        <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <span className="text-black font-black text-xl tracking-tighter">N</span>
            </div>
            <div>
              <h1 className="text-sm font-black tracking-widest uppercase text-white leading-none">Neurozen Lab</h1>
              <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-[0.3em]">Neural Ops Core</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Fleet Synchronized</span>
              </div>
              <span className="text-[9px] text-neutral-600 font-mono">v4.0.2-prod-stable</span>
            </div>
            <div className="h-8 w-[1px] bg-white/5" />
            <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
              <span className="text-xs font-bold text-neutral-300 group-hover:text-white transition-colors">Administrator</span>
            </div>
          </div>
        </nav>

        <main className="max-w-[1600px] mx-auto w-full px-8 py-10">
          {children}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}} />
    </div>
  );
};
