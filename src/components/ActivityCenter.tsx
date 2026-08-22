import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Calendar, User, Zap, Package, Users, Settings, LucideIcon, Shield } from 'lucide-react';

interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: 'user' | 'team' | 'integration' | 'automation' | 'security' | 'billing';
  details: string;
  status: 'success' | 'pending' | 'failed';
}

const MOCK_ACTIVITIES: ActivityLog[] = [
  { id: 'a1', timestamp: '2 mins ago', user: 'Sarah Chen', action: 'Updated campaign budget', category: 'automation', details: 'Meta campaign budget increased by $500', status: 'success' },
  { id: 'a2', timestamp: '15 mins ago', user: 'System', action: 'Shopify sync completed', category: 'integration', details: '1,247 orders synced, 3,556 customers updated', status: 'success' },
  { id: 'a3', timestamp: '1 hour ago', user: 'Alex Rodriguez', action: 'Created customer segment', category: 'user', details: 'Segment VIP Q2 2024 created with 284 customers', status: 'success' },
  { id: 'a4', timestamp: '3 hours ago', user: 'System', action: 'Automation executed', category: 'automation', details: 'Cart Recovery Flow ran 47 times, generated $2,100', status: 'success' },
  { id: 'a5', timestamp: '5 hours ago', user: 'Jamie Park', action: 'Added team member', category: 'team', details: 'emma.wilson@glowify.com added as Analyst', status: 'success' },
  { id: 'a6', timestamp: '1 day ago', user: 'System', action: 'Security alert', category: 'security', details: 'New login from 203.0.113.42 (New York, US)', status: 'pending' },
];

export const ActivityCenter: React.FC = () => {
  const [activities] = useState(MOCK_ACTIVITIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | ActivityLog['category']>('all');

  const categories = [
    { id: 'all', label: 'All Activity', icon: Zap },
    { id: 'user', label: 'User Actions', icon: User },
    { id: 'team', label: 'Team Activity', icon: Users },
    { id: 'integration', label: 'Integrations', icon: Package },
    { id: 'automation', label: 'Automations', icon: Zap },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: Settings },
  ];

  const filteredActivities = activities.filter(a => {
    const matchesSearch = a.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         a.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         a.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getIcon = (category: string) => {
    switch (category) {
      case 'user': return <User size={16} className="text-blue-500" />;
      case 'team': return <Users size={16} className="text-purple-500" />;
      case 'integration': return <Package size={16} className="text-emerald-500" />;
      case 'automation': return <Zap size={16} className="text-amber-500" />;
      case 'security': return <Shield size={16} className="text-red-500" />;
      case 'billing': return <Settings size={16} className="text-indigo-500" />;
      default: return <Zap size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-white/5 text-white';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#F5EEF0] tracking-tight">Activity Center</h2>
          <p className="text-xs text-[#6B5560] font-bold mt-1 uppercase tracking-widest">Complete audit trail of all system actions</p>
        </div>
        <button className="px-4 py-2 bg-white/5 border border-white/10 text-[#F1F1F8] text-xs font-black rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
          <Download size={16} /> Export Report
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3D3D55]" />
          <input
            type="text"
            placeholder="Search activities, users, or actions..."
            className="w-full bg-[#080608] border border-[#231820] rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#C9747A] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="px-4 py-3 bg-[#080608] border border-[#231820] rounded-xl text-[#6B5560] hover:text-white transition-all flex items-center gap-2">
          <Calendar size={18} />
        </button>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-[#C9747A] text-white shadow-lg'
                  : 'bg-white/5 text-[#6B5560] hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={14} />
              {cat.label}
            </button>
          );
        })}
      </div>
      <div className="bg-[#140F14] border border-[#231820] rounded-[32px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#231820] bg-[#100D10]/50">
                <th className="px-8 py-5 text-[10px] font-black text-[#6B5560] uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#6B5560] uppercase tracking-widest">User</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#6B5560] uppercase tracking-widest">Action</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#6B5560] uppercase tracking-widest">Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#6B5560] uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map((activity) => (
                <motion.tr
                  key={activity.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-[#231820]/50 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-[#B09AA0]">{activity.timestamp}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        {getIcon(activity.category)}
                      </div>
                      <span className="text-xs font-bold text-[#F5EEF0]">{activity.user}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-[#F5EEF0]">{activity.action}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs text-[#B09AA0]">{activity.details}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredActivities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 opacity-40">
            <Zap size={40} className="mb-4" />
            <p className="text-[11px] font-bold uppercase tracking-widest">No activities found</p>
          </div>
        )}
      </div>
    </div>
  );
};
