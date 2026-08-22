// src/components/DashboardViews.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Package, Mail, AlertCircle, Zap, TrendingUp, TrendingDown, ArrowRight, X, Clock, Bot, Store, Sparkles, MessageSquare, FileText, Check, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, YAxis } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './CommonUI';
import { MetricCard } from './MetricCard';
import { ConnectStore } from './ConnectStore';
import { AIExecutiveSummary } from './AIExecutiveSummary';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../contexts/DashboardContext';
import { useData } from '../contexts/DataContext';
import { getDrafts, updateDraftContent, aiService, Draft } from '../services/aiService';

// Agent tag colors
const AGENT_TAGS = {
  shopify: { bg: '#10B981/15', border: '#10B981/30', text: '#10B981', label: 'Shopify Sync' },
  gemini: { bg: '#C9747A/15', border: '#C9747A/30', text: '#C9747A', label: 'Gemini AI Writer' },
  klaviyo: { bg: '#3B82F6/15', border: '#3B82F6/30', text: '#3B82F6', label: 'Klaviyo Flow' },
  inventory: { bg: '#F59E0B/15', border: '#F59E0B/30', text: '#F59E0B', label: 'Inventory AI' },
};

// Mock live system logs
const SYSTEM_LOGS = [
  { id: 1, time: '14:32:18', tag: 'shopify', message: 'Synced 47 orders from Shopify store', status: 'success' },
  { id: 2, time: '14:31:45', tag: 'gemini', message: 'Generated product descriptions for 12 items', status: 'success' },
  { id: 3, time: '14:30:22', tag: 'klaviyo', message: 'Triggered abandoned cart flow for 8 customers', status: 'success' },
  { id: 4, time: '14:28:56', tag: 'inventory', message: 'Detected low stock alert: Vitamin C Serum', status: 'warning' },
  { id: 5, time: '14:27:33', tag: 'shopify', message: 'Updated inventory levels for 156 products', status: 'success' },
  { id: 6, time: '14:25:11', tag: 'gemini', message: 'Analyzed customer reviews - 94% positive sentiment', status: 'success' },
  { id: 7, time: '14:23:08', tag: 'klaviyo', message: 'Sent win-back campaign to 23 lapsed customers', status: 'success' },
  { id: 8, time: '14:20:45', tag: 'shopify', message: 'Created 5 new customer profiles from orders', status: 'success' },
];

// AI Agent card component
const AgentCard: React.FC<{
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  isActive: boolean;
  onToggle: (id: string) => void;
  lastActive: string;
}> = ({ id, name, description, icon, accentColor, isActive, onToggle, lastActive }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#0F0F1E] border border-[#1E1E3A] rounded-2xl p-6 hover:border-[#2A2A48] transition-all group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}25` }}
        >
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#F1F1F8]">{name}</h4>
          <p className="text-[11px] text-[#6B6B88]">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onToggle(id)}
        className={`relative w-14 h-7 rounded-full transition-all duration-300 ${isActive ? 'bg-[#10B981]' : 'bg-[#1E1E3A]'}`}
      >
        <motion.div
          animate={{ x: isActive ? 28 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
        />
      </button>
    </div>
    <div className="flex items-center justify-between pt-4 border-t border-[#1E1E3A]/50">
      <div className="flex items-center gap-2">
        {isActive ? (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
          </span>
        ) : (
          <span className="w-2 h-2 rounded-full bg-[#6B5560]"></span>
        )}
        <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-[#10B981]' : 'text-[#6B5560]'}`}>
          {isActive ? 'Active' : 'Paused'}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-[#6B6B88]">
        <Clock size={12} />
        <span className="text-[10px] font-medium">Last active: {lastActive}</span>
      </div>
    </div>
  </motion.div>
);

// Time range filter button group
const TimeRangeFilter: React.FC<{ value: string; onChange: (range: string) => void; isLoading: boolean }> = ({ value, onChange, isLoading }) => {
  const ranges = ['24 Hours', '7 Days', '30 Days'];
  return (
    <div className="flex items-center gap-1 bg-[#0F0F1E] p-1 rounded-xl border border-[#1E1E3A]">
      {ranges.map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          disabled={isLoading}
          className={`relative px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            value === range
              ? 'bg-[#C9747A] text-white shadow-lg'
              : 'text-[#6B6B88] hover:text-white hover:bg-white/5'
          } ${isLoading ? 'opacity-50' : ''}`}
        >
          {range}
        </button>
      ))}
    </div>
  );
};

// Live System Logs Terminal
const LiveLogsTerminal: React.FC = () => (
  <div className="bg-[#07070F] border border-[#1E1E3A] rounded-2xl overflow-hidden">
    <div className="flex items-center justify-between px-4 py-3 bg-[#0F0F1E] border-b border-[#1E1E3A]">
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
          <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
          <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
        </div>
        <span className="text-[10px] font-bold text-[#6B6B88] uppercase tracking-widest ml-2">Live System Logs</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
        </span>
        <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider">Live</span>
      </div>
    </div>
    <div className="p-4 font-mono text-[11px] max-h-80 overflow-y-auto custom-scrollbar">
      <AnimatePresence mode="popLayout">
        {SYSTEM_LOGS.map((log) => {
          const tag = AGENT_TAGS[log.tag as keyof typeof AGENT_TAGS];
          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-start gap-3 py-2 hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-[#3D3D55] shrink-0">[{log.time}]</span>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0"
                style={{ background: tag.bg, color: tag.text, border: `1px solid ${tag.border}` }}
              >
                {tag.label}
              </span>
              <span className="text-[#B09AA0] flex-1">{log.message}</span>
              {log.status === 'success' && <span className="text-[#10B981]">✓</span>}
              {log.status === 'warning' && <span className="text-[#F59E0B]">⚠</span>}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  </div>
);

// ─── AI Drafts Widget ────────────────────────────────────────────────────────────
const DraftsWidget: React.FC = () => {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  // Fetch drafts on mount
  useEffect(() => {
    if (user) {
      loadDrafts();
    }
  }, [user]);

  const loadDrafts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const fetchedDrafts = await getDrafts(user.uid);
      setDrafts(fetchedDrafts.filter(d => d.status !== 'approved').slice(0, 5));
    } catch (error) {
      console.error('Failed to load drafts:', error);
    }
    setLoading(false);
  };

  const handleAutoGenerate = async (draft: Draft) => {
    if (!user || !draft.originalContent) return;
    setGeneratingId(draft.id);

    try {
      const result = await aiService.processWithAI(user.uid, {
        type: draft.type,
        content: draft.originalContent
      });

      if (result.success && result.content) {
        await updateDraftContent(user.uid, draft.id, result.content);
        await loadDrafts();
      }
    } catch (error) {
      console.error('Auto-generate failed:', error);
    }

    setGeneratingId(null);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#C9747A]/15 flex items-center justify-center">
            <FileText size={20} className="text-[#C9747A]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#F1F1F8]">AI Drafts</h3>
            <p className="text-xs text-[#6B6B88]">Pending approvals</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-[#0a0a0b] rounded-xl animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C9747A]/15 flex items-center justify-center">
            <FileText size={20} className="text-[#C9747A]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#F1F1F8]">AI Drafts</h3>
            <p className="text-xs text-[#6B6B88]">{drafts.length} pending {drafts.length === 1 ? 'item' : 'items'}</p>
          </div>
        </div>
        <button 
          onClick={loadDrafts}
          className="px-3 py-1.5 text-[10px] font-bold text-[#C9747A] uppercase tracking-wider hover:bg-white/5 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {drafts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 rounded-full bg-[#10B981]/10 mx-auto mb-3 flex items-center justify-center">
              <Check size={24} className="text-[#10B981]" />
            </div>
            <p className="text-sm text-[#6B6B88]">No pending drafts</p>
            <p className="text-xs text-[#3D3D55] mt-1">New products will appear here</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {drafts.map(draft => (
              <motion.div
                key={draft.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 bg-[#0a0a0b] rounded-xl border border-[#1E1E3A] hover:border-[#2A2A48] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#C9747A]/15 text-[#C9747A] rounded uppercase">
                        {draft.type.replace('_', ' ')}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-[#6B6B88]">
                        <Clock size={10} />
                        {draft.createdAt?.toDate?.() ? 
                          new Date(draft.createdAt.toDate()).toLocaleDateString() : 
                          'Just now'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#F1F1F8] truncate">{draft.title}</h4>
                    {draft.generatedContent && (
                      <p className="text-xs text-[#6B6B88] mt-1 line-clamp-2">
                        {draft.generatedContent.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleAutoGenerate(draft)}
                    disabled={generatingId === draft.id}
                    className="shrink-0 px-3 py-2 rounded-xl bg-[#C9747A]/15 hover:bg-[#C9747A]/25 text-[#C9747A] text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {generatingId === draft.id ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Generating
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} />
                        {draft.status === 'generated' ? 'Regenerate' : 'Auto-Generate'}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export const OverviewView: React.FC<{ loading: boolean; onNavigate: (tab: string) => void }> = ({ loading: authLoading, onNavigate }) => {
  const { profile } = useAuth();
  const { timeRange, setTimeRange } = useDashboard();
  const { metrics, loading } = useData();
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [agentStates, setAgentStates] = useState<Record<string, boolean>>({
    shopify: true,
    gemini: true,
    klaviyo: false,
    inventory: true,
  });

  const hasApiKey = !!profile?.shopifyApiKey;

  const handleTimeRangeChange = useCallback((range: string) => {
    setIsRecalculating(true);
    setTimeRange(range as any);
    setTimeout(() => setIsRecalculating(false), 1200);
  }, [setTimeRange]);

  const handleAgentToggle = useCallback((id: string) => {
    setAgentStates(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  if (!hasApiKey && !authLoading) {
    return <ConnectStore onConnect={() => onNavigate('settings')} />;
  }

  const chartData = [
    { label: 'Jan', revenue: 42000 },
    { label: 'Feb', revenue: 38000 },
    { label: 'Mar', revenue: 55000 },
    { label: 'Apr', revenue: 48000 },
    { label: 'May', revenue: 62000 },
    { label: 'Jun', revenue: 71000 },
  ];

  const displayedActivities = [
    { id: 1, type: 'order', text: 'New order from Sarah Chen', time: '2 min ago', color: '#10B981', amount: 124 },
    { id: 2, type: 'marketing', text: 'Email campaign sent to 1,234 subscribers', time: '15 min ago', color: '#3B82F6' },
    { id: 3, type: 'automation', text: 'Cart Recovery Flow completed', time: '1 hour ago', color: '#8B4A6B', amount: 89 },
    { id: 4, type: 'alert', text: 'Low stock alert: Vitamin C Serum', time: '3 hours ago', color: '#EF4444' },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header with Time Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Command Center</h2>
          <p className="text-sm text-[#6B6B88] mt-1">Real-time operations dashboard</p>
        </div>
        <TimeRangeFilter value={timeRange} onChange={handleTimeRangeChange} isLoading={isRecalculating} />
      </div>

      {/* Metric Cards with Shimmer Effect */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <motion.div animate={isRecalculating ? { opacity: [1, 0.5, 1] } : { opacity: 1 }} transition={{ duration: 0.6, repeat: isRecalculating ? 2 : 0 }}>
          <MetricCard label="Revenue" value={`$${metrics.revenue.value.toLocaleString()}`} change={`+${metrics.revenue.change}%`} trend={metrics.revenue.trend} loading={loading || authLoading || isRecalculating} onClick={() => onNavigate('analytics')} />
        </motion.div>
        <motion.div animate={isRecalculating ? { opacity: [1, 0.5, 1] } : { opacity: 1 }} transition={{ duration: 0.6, repeat: isRecalculating ? 2 : 0, delay: 0.1 }}>
          <MetricCard label="ROAS" value="4.2x" change="+0.4" trend="up" loading={loading || authLoading || isRecalculating} onClick={() => onNavigate('marketing')} />
        </motion.div>
        <motion.div animate={isRecalculating ? { opacity: [1, 0.5, 1] } : { opacity: 1 }} transition={{ duration: 0.6, repeat: isRecalculating ? 2 : 0, delay: 0.2 }}>
          <MetricCard label="Orders" value={metrics.orders.value.toString()} change={`+${metrics.orders.change}%`} trend={metrics.orders.trend} loading={loading || authLoading || isRecalculating} onClick={() => onNavigate('analytics')} />
        </motion.div>
        <motion.div animate={isRecalculating ? { opacity: [1, 0.5, 1] } : { opacity: 1 }} transition={{ duration: 0.6, repeat: isRecalculating ? 2 : 0, delay: 0.3 }}>
          <MetricCard label="AI Impact" value="$12,450" change="+8%" trend="up" loading={loading || authLoading || isRecalculating} onClick={() => onNavigate('ai')} />
        </motion.div>
      </div>

      <AIExecutiveSummary />

      {/* AI Drafts Widget */}
      <DraftsWidget />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <Card className="min-h-[350px] lg:min-h-[400px] flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#F1F1F8] tracking-tight">Revenue Growth</h3>
                <p className="text-xs text-[#6B6B88]">Omnichannel performance metrics</p>
              </div>
              <div className="flex items-center gap-1 bg-[#0D0D1A] rounded-xl p-1 border border-[#1E1E3A] self-start overflow-x-auto no-scrollbar max-w-[300px] sm:max-w-none">
                {(['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTimeRange(t)}
                    className={`px-3 py-1.5 text-[9px] font-black rounded-lg transition-all whitespace-nowrap ${
                      timeRange === t ? 'bg-[#C9747A] text-white shadow-lg' : 'text-[#6B6B88] hover:text-[#A0A0B8]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 min-h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9747A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C9747A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#6B6B88', fontSize: 10 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B6B88', fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} dx={-10} />
                  <Tooltip contentStyle={{ background: '#0F0F1E', border: '1px solid #1E1E3A', borderRadius: '12px', fontSize: '12px' }} labelStyle={{ color: '#F1F1F8' }} itemStyle={{ color: '#C9747A' }} formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#C9747A" strokeWidth={2} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Live Activity Feed */}
        <div className="space-y-6">
          <LiveLogsTerminal />
          
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#F1F1F8]">Recent Activity</h3>
              <button onClick={() => {}} className="text-[10px] font-bold text-[#C9747A] uppercase tracking-wider hover:underline">View All</button>
            </div>
            <div className="space-y-1">
              {displayedActivities.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center p-3 hover:bg-white/5 active:bg-white/10 rounded-2xl transition-colors cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}>
                    {item.type === 'order' && <Package size={18} style={{ color: item.color }} />}
                    {item.type === 'marketing' && <Mail size={18} style={{ color: item.color }} />}
                    {item.type === 'alert' && <AlertCircle size={18} style={{ color: item.color }} />}
                    {item.type === 'automation' && <Zap size={18} style={{ color: item.color }} />}
                  </div>
                  <div className="flex-1 min-w-0 ml-3">
                    <p className="text-[13px] font-bold text-[#F1F1F8] truncate">{item.text}</p>
                    <p className="text-[11px] text-[#6B6B88] font-medium">{item.time}</p>
                  </div>
                  {item.amount && <span className="text-[12px] font-black text-[#10B981] ml-2 tabular-nums">+${item.amount}</span>}
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* AI Agents Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-[#F1F1F8]">AI Agent Operations</h3>
            <p className="text-xs text-[#6B6B88]">Manage your automated AI agents</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AgentCard id="shopify" name="Shopify Sync" description="Order & inventory sync" icon={<Store size={24} className="text-[#10B981]" />} accentColor="#10B981" isActive={agentStates.shopify} onToggle={handleAgentToggle} lastActive="2 min ago" />
          <AgentCard id="gemini" name="AI Writer" description="Product descriptions" icon={<Sparkles size={24} className="text-[#C9747A]" />} accentColor="#C9747A" isActive={agentStates.gemini} onToggle={handleAgentToggle} lastActive="5 min ago" />
          <AgentCard id="klaviyo" name="Klaviyo Flow" description="Email automation" icon={<MessageSquare size={24} className="text-[#3B82F6]" />} accentColor="#3B82F6" isActive={agentStates.klaviyo} onToggle={handleAgentToggle} lastActive="1 hour ago" />
          <AgentCard id="inventory" name="Inventory AI" description="Stock monitoring" icon={<Bot size={24} className="text-[#F59E0B]" />} accentColor="#F59E0B" isActive={agentStates.inventory} onToggle={handleAgentToggle} lastActive="Just now" />
        </div>
      </section>
    </div>
  );
};

export const AnalyticsView: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const hasApiKey = !!profile?.shopifyApiKey;
  if (!hasApiKey) return <ConnectStore onConnect={() => onNavigate('settings')} />;
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white">Analytics</h2>
        <p className="text-sm text-[#6B6B88] mt-1">Deep insights into your store performance</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h3 className="text-lg font-bold text-[#F1F1F8] mb-6">Revenue by Channel</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: 'Direct', value: 85 }, { name: 'Organic', value: 62 }, { name: 'Paid', value: 45 }, { name: 'Social', value: 28 }]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B6B88', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B6B88', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ background: '#0F0F1E', border: '1px solid #1E1E3A', borderRadius: '12px' }} />
                <Bar dataKey="value" fill="#C9747A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-[#F1F1F8] mb-6">Customer Journey</h3>
          <div className="space-y-4">
            {[{ stage: 'Visitors', value: 12450, color: '#3B82F6' }, { stage: 'Add to Cart', value: 3240, color: '#F59E0B' }, { stage: 'Checkout', value: 1820, color: '#8B4A6B' }, { stage: 'Purchase', value: 890, color: '#10B981' }].map((item, i) => (
              <div key={item.stage} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B6B88]">{item.stage}</span>
                  <span className="font-bold text-[#F1F1F8]">{item.value.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-[#0F0F1E] rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(item.value / 12450) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} className="h-full rounded-full" style={{ background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
