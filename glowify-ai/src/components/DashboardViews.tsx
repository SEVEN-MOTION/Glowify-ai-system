import React from 'react';
import { Package, Mail, AlertCircle, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { DS } from '../theme';
import { Card, Skeleton } from './CommonUI';
import { MetricCard } from './MetricCard';

const REVENUE_DATA = Array.from({length:60},(_,i)=>({date:i, revenue: Math.round(3000 + i*50 + Math.random()*500)}));
const CATEGORY_DATA = [
  { name: 'Serums', value: 45000, color: '#C9747A' },
  { name: 'Moisturizers', value: 32000, color: '#8B4A6B' },
  { name: 'Cleansers', value: 28000, color: '#D4A0A3' },
  { name: 'Treatments', value: 15000, color: '#F59E0B' },
];

const ActivityItem: any = ({ item }) => (
  <div className="flex items-center p-3 hover:bg-white/3 rounded-xl transition-colors">
    <div style={{
      width:'36px', height:'36px', borderRadius:'10px', flexShrink:0,
      background: `${item.color}14`,
      border:     `1px solid ${item.color}22`,
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      {item.type === 'order' && <Package size={16} style={{ color: item.color }} />}
      {item.type === 'marketing' && <Mail size={16} style={{ color: item.color }} />}
      {item.type === 'alert' && <AlertCircle size={16} style={{ color: item.color }} />}
      {item.type === 'automation' && <Zap size={16} style={{ color: item.color }} />}
    </div>
    <div className="flex-1 min-w-0 ml-3">
      <p className="text-[13px] font-semibold text-[#F5EEF0] truncate">{item.text}</p>
      <p className="text-[11px] text-[#6B5560]">{item.time}</p>
    </div>
    {item.amount && (
      <span className="glw-mono text-[12px] font-bold text-[#10B981] ml-auto">
        +${item.amount}
      </span>
    )}
  </div>
);

export const OverviewView: any = ({ loading }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard label="Total Revenue" value="$142,840" change="+12.4%" trend="up" loading={loading} />
      <MetricCard label="Active ROAS" value="4.2x" change="+0.8x" trend="up" loading={loading} />
      <MetricCard label="Conversion Rate" value="3.84%" change="-0.2%" trend="down" loading={loading} />
      <MetricCard label="AI Impact" value="$31,200" change="+18.5%" trend="up" loading={loading} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card className="min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-[#F5EEF0] tracking-tight">Revenue Growth</h3>
              <p className="text-xs text-[#6B5560]">Real-time performance across all channels</p>
            </div>
            <div className="flex items-center gap-2 bg-[#0C0A0C] rounded-lg p-1 border border-[#231820]">
              {['Daily', 'Weekly'].map(t => (
                <button 
                  key={t} 
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${t === 'Daily' ? 'bg-[#3A2530] text-[#F5EEF0]' : 'text-[#6B5560] hover:text-[#B09AA0]'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[280px] w-full">
            {loading ? <Skeleton h="100%" w="100%" r={12} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_DATA}>
                  <defs>
                    <linearGradient id="grad-revenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9747A" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C9747A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <Tooltip contentStyle={DS.chart.tooltip.contentStyle} />
                  <Area type="monotone" dataKey="revenue" stroke="#C9747A" strokeWidth={3} fill="url(#grad-revenue)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#F5EEF0] tracking-tight">Live Feed</h3>
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          </div>
          <div className="space-y-2">
            {[
              {type:'order',color:'#10B981',text:'New Order #8821',amount:'142.00',time:'1m ago'},
              {type:'order',color:'#10B981',text:'New Order #8820',amount:'89.00',time:'3m ago'},
              {type:'marketing',color:'#C9747A',text:'Email Campaign Sent',amount:null,time:'8m ago'},
              {type:'alert',color:'#F59E0B',text:'Low Stock Alert',amount:null,time:'12m ago'},
              {type:'automation',color:'#8B4A6B',text:'Cart Recovered',amount:'340.00',time:'15m ago'},
            ].map((item, i) => (
              <ActivityItem key={i} item={item} />
            ))}
          </div>
          <button className="w-full mt-6 py-3 border border-[#231820] rounded-xl text-xs font-bold text-[#B09AA0] hover:bg-white/3 transition-all">
            View All Activity
          </button>
        </Card>
      </div>
    </div>
  </div>
);

export const AnalyticsView: any = ({ loading }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="min-h-[400px]">
        <h3 className="text-lg font-bold text-[#F5EEF0] tracking-tight mb-8">Sales by Category</h3>
        <div className="h-[300px]">
          {loading ? <Skeleton h="100%" w="100%" r={12} /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CATEGORY_DATA}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B5560', fontSize: 12}} />
                <Tooltip contentStyle={DS.chart.tooltip.contentStyle} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
      <Card className="min-h-[400px]">
        <h3 className="text-lg font-bold text-[#F5EEF0] tracking-tight mb-8">Channel Performance</h3>
        <div className="space-y-6">
          {[
            { name: 'Direct', value: 85, color: '#C9747A' },
            { name: 'Social', value: 62, color: '#8B4A6B' },
            { name: 'Email', value: 48, color: '#D4A0A3' },
            { name: 'Search', value: 35, color: '#F59E0B' },
          ].map(channel => (
            <div key={channel.name} className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#F5EEF0]">{channel.name}</span>
                <span className="text-[#B09AA0]">{channel.value}%</span>
              </div>
              <div className="h-2 bg-[#1A0F14] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${channel.value}%` }}
                  className="h-full"
                  style={{ background: channel.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);
