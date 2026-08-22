import React, { useState } from 'react';
import { Users, UserPlus, Heart, MapPin, Star, Sparkles, Search, Filter, Download, MoreHorizontal, Mail, Tag, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { MetricCard } from '../MetricCard';
import { useData } from '../../contexts/DataContext';

const RETENTION_DATA = Array.from({length: 12}, (_, i) => ({
  month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  retention: Math.round(62 - i * 2 + Math.random() * 8),
  newCustomers: Math.round(180 + i * 15 + Math.random() * 40),
}));

const GEO_DATA = [
  { country: 'United States', flag: '🇺🇸', revenue: 68200, customers: 1842, pct: 48 },
  { country: 'United Kingdom', flag: '🇬🇧', revenue: 24800, customers: 612, pct: 17 },
  { country: 'Canada', flag: '🇨🇦', revenue: 18400, customers: 448, pct: 13 },
  { country: 'Australia', flag: '🇦🇺', revenue: 14200, customers: 310, pct: 10 },
  { country: 'Germany', flag: '🇩🇪', revenue: 9600, customers: 188, pct: 7 },
  { country: 'Other', flag: '🌍', revenue: 7640, customers: 156, pct: 5 },
];

const TOP_CUSTOMERS = [
  { name: 'Priya Mehta', email: 'p.mehta@...', orders: 12, ltv: 1248, segment: 'VIP', lastOrder: '2d ago' },
  { name: 'Claire Fontaine', email: 'c.f@...', orders: 9, ltv: 967, segment: 'VIP', lastOrder: '5d ago' },
  { name: 'Amara Osei', email: 'a.osei@...', orders: 8, ltv: 842, segment: 'VIP', lastOrder: '1d ago' },
  { name: 'Sophie Laurent', email: 's.l@...', orders: 7, ltv: 743, segment: 'Active', lastOrder: '8d ago' },
  { name: 'Yuki Tanaka', email: 'y.t@...', orders: 6, ltv: 618, segment: 'Active', lastOrder: '3d ago' },
];


export const CustomersView: React.FC = () => {
  const { customers, loading } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const SEGMENTS = [
    { name: 'VIP / High LTV', count: customers.filter(c => c.segment === 'VIP').length, pct: 8, ltv: 680, color: '#C9747A' },
    { name: 'Active Subscribers', count: customers.filter(c => c.segment === 'Active').length, pct: 35, ltv: 310, color: '#8B4A6B' },
    { name: 'One-Time Buyers', count: customers.filter(c => c.segment === 'New').length, pct: 53, ltv: 89, color: '#3B82F6' },
    { name: 'Lapsed (90d+)', count: 0, pct: 4, ltv: 95, color: '#F59E0B' },
  ];

  const GEO_DATA = [
    { country: 'United States', flag: '🇺🇸', revenue: 68200, customers: 1842, pct: 48 },
    { country: 'United Kingdom', flag: '🇬🇧', revenue: 24800, customers: 612, pct: 17 },
    { country: 'Canada', flag: '🇨🇦', revenue: 18400, customers: 448, pct: 13 },
    { country: 'Australia', flag: '🇦🇺', revenue: 14200, customers: 310, pct: 10 },
    { country: 'Germany', flag: '🇩🇪', revenue: 9600, customers: 188, pct: 7 },
    { country: 'Other', flag: '🌍', revenue: 7640, customers: 156, pct: 5 },
  ];

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#F5EEF0] tracking-tight">Customer Intelligence</h2>
          <p className="text-xs text-[#6B5560] font-bold mt-1 uppercase tracking-widest">3,556 Total Profiles Analyzed</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D3D55]" />
            <input 
              type="text"
              placeholder="Search customers..."
              className="bg-[#080608] border border-[#231820] rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#C9747A] transition-all w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="p-2 bg-[#080608] border border-[#231820] rounded-xl text-[#6B5560] hover:text-white transition-all">
            <Filter size={18} />
          </button>
          <button className="px-4 py-2 bg-[#C9747A] text-white text-xs font-black rounded-xl hover:bg-[#D4A0A3] transition-all flex items-center gap-2">
            <Plus size={16} /> Create Segment
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Total Customers" value="3,556" change="+12.4%" trend="up" />
        <MetricCard label="Avg LTV" value="$312" change="+$18" trend="up" />
        <MetricCard label="Retention Rate" value="68%" change="+4.2%" trend="up" />
        <MetricCard label="Repeat Customer %" value="42%" change="+2.1%" trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Segments */}
        <div className="bg-[#140F14] border border-[#231820] rounded-3xl p-8 shadow-2xl">
          <h3 className="text-sm font-black text-[#F5EEF0] uppercase tracking-widest mb-8 flex items-center gap-2">
            <Users size={16} className="text-[#C9747A]" />
            Customer Segments
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SEGMENTS}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {SEGMENTS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#080608', border: '1px solid #231820', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {SEGMENTS.map((seg) => (
                <div key={seg.name} className="flex items-center justify-between p-3 rounded-xl bg-[#080608] border border-[#231820]">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: seg.color }} />
                    <span className="text-xs font-bold text-[#B09AA0]">{seg.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-[#F5EEF0]">{seg.count}</p>
                    <p className="text-[10px] text-[#6B5560]">Avg LTV: ${seg.ltv}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Acquisition vs Retention */}
        <div className="bg-[#140F14] border border-[#231820] rounded-3xl p-8 shadow-2xl">
          <h3 className="text-sm font-black text-[#F5EEF0] uppercase tracking-widest mb-8 flex items-center gap-2">
            <UserPlus size={16} className="text-[#C9747A]" />
            Acquisition vs Retention
          </h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={RETENTION_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#231820" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6B5560', fontSize: 10}} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#6B5560', fontSize: 10}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#C9747A', fontSize: 10}} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ background: '#080608', border: '1px solid #231820', borderRadius: '12px' }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="newCustomers" name="New Customers" fill="#8B4A6B" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="retention" name="Retention %" stroke="#C9747A" strokeWidth={3} dot={{r: 4, fill: '#C9747A', stroke: '#080608', strokeWidth: 2}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Geographic Revenue */}
        <div className="bg-[#140F14] border border-[#231820] rounded-3xl p-8 shadow-2xl">
          <h3 className="text-sm font-black text-[#F5EEF0] uppercase tracking-widest mb-8 flex items-center gap-2">
            <MapPin size={16} className="text-[#C9747A]" />
            Geographic Revenue
          </h3>
          <div className="space-y-6">
            {GEO_DATA.map((item) => (
              <div key={item.country} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span>{item.flag}</span>
                    <span className="text-[#F5EEF0]">{item.country}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[#6B5560]">{item.customers.toLocaleString()} customers</span>
                    <span className="text-[#F5EEF0]">${item.revenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-[#080608] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    className="h-full bg-gradient-to-r from-[#C9747A] to-[#8B4A6B]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-[#140F14] border border-[#231820] rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-[#231820] bg-[#100D10]/50">
            <h3 className="text-sm font-black text-[#F5EEF0] uppercase tracking-widest flex items-center gap-2">
              <Star size={16} className="text-[#C9747A]" />
              Top 5 Customers
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#231820]">
                  <th className="px-6 py-4 text-[10px] font-black text-[#6B5560] uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#6B5560] uppercase tracking-widest text-center">Orders</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#6B5560] uppercase tracking-widest">LTV</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#6B5560] uppercase tracking-widest">Segment</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#6B5560] uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {TOP_CUSTOMERS.map((cust) => (
                  <tr key={cust.email} className="border-b border-[#231820]/50 hover:bg-[#1A1218] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9747A] to-[#8B4A6B] flex items-center justify-center text-[10px] font-black text-white">
                          {cust.name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#F5EEF0]">{cust.name}</p>
                          <p className="text-[10px] text-[#6B5560]">{cust.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-[#B09AA0] text-center">{cust.orders}</td>
                    <td className="px-6 py-4 text-xs font-bold text-[#F5EEF0]">${cust.ltv.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        cust.segment === 'VIP' ? 'bg-[#C9747A]/10 text-[#C9747A] border-[#C9747A]/20' : 
                        cust.segment === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {cust.segment}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-lg bg-white/5 text-[#6B5560] hover:text-white transition-all" title="Send Email"><Mail size={14} /></button>
                        <button className="p-1.5 rounded-lg bg-white/5 text-[#6B5560] hover:text-white transition-all" title="Add Tag"><Tag size={14} /></button>
                        <button className="p-1.5 rounded-lg bg-white/5 text-[#6B5560] hover:text-white transition-all"><MoreHorizontal size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Customer Insight */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#140F14] border-l-4 border-[#C9747A] rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[#C9747A]/10 text-[#C9747A]">
            <Sparkles size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black text-[#F5EEF0] uppercase tracking-widest mb-2">AI Customer Intelligence</h4>
            <p className="text-[13px] text-[#B09AA0] leading-relaxed">
              💡 <span className="font-bold text-[#F5EEF0]">Segment Opportunity:</span> 142 lapsed customers (90d+) have avg LTV of $95 — above acquisition cost. A win-back email sequence targeting this cohort with a 15% discount is projected to recover <span className="text-[#10B981] font-bold">$4,200</span> in revenue (22% reactivation rate).
            </p>
          </div>
        </div>
        <button className="px-6 py-3 bg-[#C9747A] hover:bg-[#D4A0A3] text-white text-xs font-black rounded-xl transition-all shrink-0">
          Execute Campaign
        </button>
      </motion.div>
    </div>
  );
};
