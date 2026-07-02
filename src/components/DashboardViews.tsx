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

export { default as OverviewView } from './views/ExecutiveMissionControl';

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
