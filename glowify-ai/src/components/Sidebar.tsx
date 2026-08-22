// src/components/Sidebar.tsx
import React from 'react';
import { Home, Bot, BarChart2, Megaphone, Package, Users, Zap, Settings, LucideIcon, LogOut,  TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem: any = ({ icon: Icon, label, active, onClick }) => (
  <motion.div 
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group relative ${
      active 
        ? 'bg-gradient-to-r from-[#C9747A]/12 to-transparent text-white' 
        : 'text-[#6B5560] hover:text-[#D4A0A3] hover:bg-white/5'
    }`}
  >
    <Icon size={20} className={active ? 'text-[#C9747A]' : 'group-hover:text-[#B09AA0]'} />
    <span className={`text-[13px] font-bold tracking-tight ${active ? 'text-white' : ''}`}>{label}</span>
    
    {active && (
      <>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#C9747A] rounded-r-full shadow-[0_0_12px_rgba(201,116,122,0.5)]" />
        <motion.div 
          layoutId="sidebar-active"
          className="absolute inset-0 bg-gradient-to-r from-[#C9747A]/10 to-transparent rounded-xl -z-10"
        />
      </>
    )}
  </motion.div>
);

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: any = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'overview', icon: Home, label: 'Command Center' },
    { id: 'ai', icon: Bot, label: 'AI Agents' },
    { id: 'analytics', icon: BarChart2, label: 'Performance' },
    { id: 'marketing', icon: Megaphone, label: 'Marketing' },
    { id: 'products', icon: Package, label: 'Inventory' },
    { id: 'customers', icon: Users, label: 'Customers' },
    { id: 'automations', icon: Zap, label: 'Automations' },
  ];

  return (
    <aside className="w-[280px] h-screen bg-[#080608] border-r border-[#231820] flex flex-col shrink-0 relative z-20">
      <div className="px-7 pt-8 pb-6 border-b border-[#231820]">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div style={{
            width:'38px', height:'38px', borderRadius:'10px',
            background:'linear-gradient(135deg, #C9747A 0%, #8B4A6B 100%)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 20px rgba(201,116,122,0.3)',
          }} className="group-hover:scale-110 transition-transform duration-300">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <div>
            <span style={{
              fontSize:'17px', fontWeight:900, letterSpacing:'-0.04em',
              color:'#F5EEF0', display:'block', lineHeight:1,
            }}>
              GLOWIFY<span style={{color:'#C9747A'}}>AI</span>
            </span>
            <span style={{
              fontSize:'8px', fontWeight:700, color:'#6B5560',
              letterSpacing:'0.25em', textTransform:'uppercase', display:'block', marginTop:'3px',
            }}>
              BEAUTY OS v2.4
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pt-4">
        <p style={{
          fontSize:'9px', fontWeight:800, color:'#3D2B32',
          textTransform:'uppercase', letterSpacing:'0.25em',
          padding:'0 16px', marginBottom:'12px', marginTop:'8px',
        }}>
          Navigation
        </p>
        {menuItems.map(item => (
          <SidebarItem 
            key={item.id}
            {...item}
            active={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
          />
        ))}
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-[#100D10] border border-[#231820] rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#C9747A]/10 flex items-center justify-center">
              <TrendingUp size={16} className="text-[#C9747A]" />
            </div>
            <span className="text-[11px] font-bold text-white">Efficiency +24%</span>
          </div>
          <p className="text-[10px] text-[#6B5560] leading-relaxed">AI agents have automated 14 tasks in the last 24 hours.</p>
        </div>
        
        <div className="space-y-1">
          <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          <SidebarItem icon={LogOut} label="Logout" onClick={onLogout} />
        </div>
      </div>
    </aside>
  );
};
