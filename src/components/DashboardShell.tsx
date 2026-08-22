// src/components/DashboardShell.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Bot, BarChart2, Megaphone, Package, Users, Zap, Settings, LucideIcon, TrendingUp, Bell, ChevronDown, User, LogOut, Store,
  LayoutDashboard, Shield, CreditCard
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Store/Workspace mock data
const MOCK_STORES = [
  { id: 'store-1', name: 'NEUROZEN LAB', domain: 'neurozen-lab.myshopify.com', isDefault: true },
  { id: 'store-2', name: 'BrandAlpha', domain: 'brand-alpha.myshopify.com', isDefault: false },
  { id: 'store-3', name: 'BrandBeta', domain: 'brand-beta.myshopify.com', isDefault: false },
];

// Sidebar item component
interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  badge?: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, badge, active, onClick }) => (
  <motion.div 
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 group relative ${
      active 
        ? 'bg-gradient-to-r from-[#C9747A]/15 to-transparent text-white' 
        : 'text-[#6B5560] hover:text-[#D4A0A3] hover:bg-white/5'
    }`}
  >
    <div className="flex items-center gap-3.5">
      <Icon size={19} className={active ? 'text-[#C9747A]' : 'group-hover:text-[#B09AA0]'} />
      <span className={`text-[13px] font-bold tracking-tight ${active ? 'text-white' : ''}`}>{label}</span>
    </div>
    {badge && (
      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#C9747A]/20 text-[#C9747A] rounded-full">
        {badge}
      </span>
    )}
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#C9747A] rounded-r-full shadow-[0_0_12px_rgba(201,116,122,0.5)]" />
    )}
  </motion.div>
);

// Workspace Store Selector
const WorkspaceSwitcher: React.FC<{
  stores: typeof MOCK_STORES;
  selectedStore: string;
  onSelect: (id: string) => void;
}> = ({ stores, selectedStore, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = stores.find(s => s.id === selectedStore) || stores[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-[#0F0F1E] border border-[#1E1E3A] rounded-xl hover:border-[#2A2A48] transition-all"
      >
        <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 flex items-center justify-center">
          <Store size={16} className="text-[#10B981]" />
        </div>
        <div className="text-left">
          <p className="text-[13px] font-bold text-[#F1F1F8]">{selected.name}</p>
          <p className="text-[10px] text-[#6B6B88]">{selected.domain}</p>
        </div>
        <ChevronDown size={16} className={`text-[#6B6B88] ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-72 bg-[#0F0F1E] border border-[#1E1E3A] rounded-xl overflow-hidden shadow-2xl z-50"
          >
            <div className="p-3 border-b border-[#1E1E3A]">
              <p className="text-[10px] font-bold text-[#6B6B88] uppercase tracking-widest">Switch Workspace</p>
            </div>
            {stores.map(store => (
              <button
                key={store.id}
                onClick={() => { onSelect(store.id); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors ${
                  store.id === selectedStore ? 'bg-white/5' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 flex items-center justify-center">
                    <Store size={16} className="text-[#10B981]" />
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-bold text-[#F1F1F8]">{store.name}</p>
                    <p className="text-[10px] text-[#6B6B88]">{store.domain}</p>
                  </div>
                </div>
                {store.isDefault && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] font-bold">Default</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// User Profile Dropdown
const UserProfile: React.FC<{ user: any; profile: any; onSignOut: () => void }> = ({ user, profile, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9747A] to-[#8B4A6B] flex items-center justify-center">
          <User size={18} className="text-white" />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-[13px] font-bold text-[#F1F1F8]">{profile?.displayName || user?.email?.split('@')[0] || 'User'}</p>
          <p className="text-[10px] text-[#6B6B88]">{user?.email}</p>
        </div>
        <ChevronDown size={16} className={`text-[#6B6B88] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-56 bg-[#0F0F1E] border border-[#1E1E3A] rounded-xl overflow-hidden shadow-2xl z-50"
          >
            <div className="p-3 border-b border-[#1E1E3A]">
              <p className="text-[11px] font-bold text-[#F1F1F8] truncate">{profile?.displayName || 'User'}</p>
              <p className="text-[10px] text-[#6B6B88] truncate">{user?.email}</p>
            </div>
            <div className="p-2">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-[#6B6B88] hover:text-white">
                <User size={16} />
                <span className="text-[12px] font-medium">Profile</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-[#6B6B88] hover:text-white">
                <CreditCard size={16} />
                <span className="text-[12px] font-medium">Billing</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-[#6B6B88] hover:text-white">
                <Shield size={16} />
                <span className="text-[12px] font-medium">Security</span>
              </button>
            </div>
            <div className="p-2 border-t border-[#1E1E3A]">
              <button 
                onClick={onSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#EF4444]/10 transition-colors text-[#EF4444]"
              >
                <LogOut size={16} />
                <span className="text-[12px] font-medium">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main Dashboard Shell Component
interface DashboardShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, profile, signOut } = useAuth();
  const [selectedStore, setSelectedStore] = useState(MOCK_STORES[0].id);
  const [notifications] = useState(3); // Mock notification count

  const menuItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Command Center' },
    { id: 'ai', icon: Bot, label: 'AI Agents' },
    { id: 'analytics', icon: BarChart2, label: 'Performance' },
    { id: 'marketing', icon: Megaphone, label: 'Marketing' },
    { id: 'products', icon: Package, label: 'Inventory' },
    { id: 'customers', icon: Users, label: 'Customers' },
    { id: 'automations', icon: Zap, label: 'Automations' },
  ];

  return (
    <div className="flex min-h-screen bg-[#0a0a0b] text-neutral-200">
      {/* Background Decorative Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#C9747A]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[#8B4A6B]/10 blur-[100px] rounded-full" />
      </div>

      {/* Persistent Left Sidebar */}
      <aside className="w-[280px] h-screen bg-[#080608] border-r border-[#1E1E3A] flex flex-col shrink-0 fixed left-0 top-0 z-30">
        {/* Logo / Brand */}
        <div className="px-6 pt-6 pb-5 border-b border-[#1E1E3A]">
          <div
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <motion.div 
              whileHover={{ scale: 1.03 }}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #C9747A 0%, #8B4A6B 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 24px rgba(201,116,122,0.35)',
              }}
              className="group-hover:scale-110 transition-transform duration-300"
            >
              <Zap size={22} className="text-white fill-white" />
            </motion.div>
            <div>
              <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.03em', color: '#F5EEF0' }}>
                GLOWIFY<span style={{ color: '#C9747A' }}>AI</span>
              </span>
              <span style={{ fontSize: '8px', fontWeight: 700, color: '#6B5560', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginTop: '2px' }}>
                BEAUTY OS
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto no-scrollbar">
          <p style={{ fontSize: '9px', fontWeight: 800, color: '#3D2B32', textTransform: 'uppercase', letterSpacing: '0.2em', padding: '0 16px', marginBottom: '12px' }}>
            Navigation
          </p>
          {menuItems.map(item => (
            <SidebarItem 
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </nav>

        {/* Efficiency Stats & Settings */}
        <div className="p-5 border-t border-[#1E1E3A]">
          <div className="bg-[#0D0D1A] border border-[#1E1E3A] rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 flex items-center justify-center">
                <TrendingUp size={16} className="text-[#10B981]" />
              </div>
              <span className="text-[12px] font-bold text-[#10B981]">Efficiency +24%</span>
            </div>
            <p className="text-[10px] text-[#6B5560] leading-relaxed">AI agents automated 14 tasks today</p>
          </div>
          
          <SidebarItem 
            icon={Settings} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-[280px] flex flex-col min-h-screen">
        {/* Top Navigation Bar */}
        <header className="h-[72px] border-b border-[#1E1E3A] bg-[#0a0a0b]/80 backdrop-blur-xl sticky top-0 z-20 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Workspace Switcher */}
            <WorkspaceSwitcher 
              stores={MOCK_STORES}
              selectedStore={selectedStore}
              onSelect={setSelectedStore}
            />
            
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-6 ml-6 pl-6 border-l border-[#1E1E3A]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-[11px] font-medium text-[#6B6B88]">All Systems Operational</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2.5 rounded-xl hover:bg-white/5 transition-colors">
              <Bell size={20} className="text-[#6B6B88]" />
              {notifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#C9747A] rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            {/* User Profile */}
            <UserProfile 
              user={user} 
              profile={profile} 
              onSignOut={signOut}
            />
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;