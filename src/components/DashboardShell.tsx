import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart2, Bell, Bot, ChevronDown, LayoutDashboard, LogOut, Megaphone,
  Menu, Moon, Package, Settings, Store, Sun, Users, X, Zap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { getSavedStoreDetails } from '../utils/stores';
import { NotificationCenter } from './NotificationCenter';
import { useTheme } from '../contexts/ThemeContext';

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

interface SidebarItemProps {
  icon: IconComponent;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick }) => (
  <motion.button
    type="button"
    whileHover={{ x: 3 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    className={`relative flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-left transition-colors group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A0A3] ${active ? 'bg-gradient-to-r from-[#C9747A]/15 to-transparent text-white' : 'text-[#C2B4B9] hover:bg-white/5 hover:text-white'}`}
  >
    <Icon size={19} aria-hidden="true" className={active ? 'text-[#C9747A]' : 'group-hover:text-[#D4A0A3]'} />
    <span className="text-[13px] font-bold tracking-tight">{label}</span>
    {active && <span aria-hidden="true" className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#C9747A]" />}
  </motion.button>
);

const NAV_ITEMS = [
  { id: 'overview', icon: LayoutDashboard, label: 'Command Center' },
  { id: 'ai', icon: Bot, label: 'AI Agents' },
  { id: 'analytics', icon: BarChart2, label: 'Analytics' },
  { id: 'marketing', icon: Megaphone, label: 'Marketing' },
  { id: 'products', icon: Package, label: 'Inventory' },
  { id: 'customers', icon: Users, label: 'Customers' },
  { id: 'automations', icon: Zap, label: 'Automations' },
  { id: 'activity', icon: Bell, label: 'Activity' },
];

const StoreSummary: React.FC<{
  store: ReturnType<typeof getSavedStoreDetails>;
  onOpenSettings: () => void;
}> = ({ store, onOpenSettings }) => (
  <button
    type="button"
    onClick={onOpenSettings}
    aria-label={store ? `Saved store details for ${store.name}; connection unverified. Open Settings` : 'Store details unavailable. Open Settings'}
    className="flex min-w-0 items-center gap-2 rounded-xl border border-[#1E1E3A] bg-[#0F0F1E] px-2 py-2 text-left hover:border-[#C9747A]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A0A3] sm:gap-3 sm:px-3"
  >
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C9747A]/10"><Store size={16} className="text-[#D4A0A3]" aria-hidden="true" /></span>
    <span className="min-w-0">
      <span className="block max-w-[155px] truncate text-[12px] font-bold text-[#F1F1F8] sm:max-w-[230px]">{store?.name ?? 'Store details unavailable'}</span>
      <span className="block max-w-[155px] truncate text-[10px] text-[#C2B4B9] sm:max-w-[230px]">{store ? `${store.domain} · saved, unverified` : 'Open Settings for store details'}</span>
    </span>
  </button>
);

export const DashboardShell: React.FC<{
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}> = ({ children, activeTab, setActiveTab }) => {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, markNotificationRead, clearNotifications } = useData();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const store = getSavedStoreDetails(profile);
  const unreadCount = notifications.filter(notification => !notification.read).length;
  const displayName = profile?.displayName || user?.email?.split('@')[0] || 'Account';
  const navigate = (tab: string) => {
    setActiveTab(tab);
    setMobileNavOpen(false);
    setAccountMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0a0a0b] text-neutral-200">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-black">Skip to main content</a>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden opacity-10">
        <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-[#C9747A]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[30%] w-[30%] rounded-full bg-[#8B4A6B]/10 blur-[100px]" />
      </div>

      {mobileNavOpen && <button type="button" aria-label="Close navigation menu" onClick={() => setMobileNavOpen(false)} className="fixed inset-0 z-30 bg-black/70 md:hidden" />}

      <aside aria-label="Primary navigation" className={`fixed left-0 top-0 z-40 h-[100dvh] w-[min(280px,86vw)] flex-col border-r border-[#1E1E3A] bg-[#080608] transition-transform duration-200 motion-reduce:transition-none ${mobileNavOpen ? 'flex translate-x-0' : 'hidden md:flex md:translate-x-0'}`}>
        <div className="flex items-center justify-between border-b border-[#1E1E3A] px-6 pb-5 pt-6">
          <button type="button" onClick={() => navigate('overview')} aria-label="Glowify AI home" className="flex items-center gap-3 rounded-lg text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A0A3]">
            <span className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-gradient-to-br from-[#C9747A] to-[#8B4A6B]"><Zap size={22} className="fill-white text-white" aria-hidden="true" /></span>
            <span><span className="block text-[18px] font-black tracking-[-0.03em] text-[#F5EEF0]">GLOWIFY<span className="text-[#C9747A]">AI</span></span><span className="block text-[8px] font-bold tracking-[0.2em] text-[#C2B4B9]">BEAUTY OS</span></span>
          </button>
          <button type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" className="rounded-lg p-2 text-[#C2B4B9] hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4A0A3] md:hidden"><X size={18} /></button>
        </div>

        <nav aria-label="Dashboard sections" className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
          <p className="mb-3 px-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#C2B4B9]">Navigation</p>
          {NAV_ITEMS.map(item => <SidebarItem key={item.id} {...item} active={activeTab === item.id} onClick={() => navigate(item.id)} />)}
        </nav>

        <div className="border-t border-[#1E1E3A] p-4">
          <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => navigate('settings')} />
        </div>
      </aside>

      <div className="flex min-h-screen flex-col md:ml-[280px]">
        <header className="sticky top-0 z-20 flex min-h-[72px] items-center justify-between gap-2 border-b border-[#1E1E3A] bg-[#0a0a0b]/95 px-3 backdrop-blur-xl sm:px-5 lg:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <button type="button" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation menu" aria-expanded={mobileNavOpen} className="rounded-lg p-2 text-[#F1F1F8] hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4A0A3] md:hidden"><Menu size={20} /></button>
            <StoreSummary store={store} onOpenSettings={() => navigate('settings')} />
            <span className="hidden rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold text-amber-200 sm:inline-flex">Sample data</span>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-pressed={theme === 'dark'}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="rounded-xl p-2.5 text-[#D1C6CB] hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A0A3]"
            >
              {theme === 'dark' ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
            </button>
            <button type="button" onClick={() => setNotificationsOpen(true) aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} aria-expanded={notificationsOpen} className="relative rounded-xl p-2.5 text-[#D1C6CB] hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4A0A3]">
              <Bell size={19} aria-hidden="true" />
              {unreadCount > 0 && <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C9747A] px-1 text-[10px] font-bold text-white">{unreadCount}</span>}
            </button>
            <div className="relative">
              <button type="button" onClick={() => setAccountMenuOpen(open => !open)} aria-label={`Account menu for ${displayName}`} aria-haspopup="true" aria-expanded={accountMenuOpen} className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A0A3]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#C9747A] to-[#8B4A6B]"><Users size={17} className="text-white" aria-hidden="true" /></span>
                <span className="hidden min-w-0 text-left sm:block"><span className="block max-w-36 truncate text-[12px] font-bold text-[#F1F1F8]">{displayName}</span><span className="block max-w-36 truncate text-[10px] text-[#C2B4B9]">{user?.email || 'Signed-in account'}</span></span>
                <ChevronDown size={16} aria-hidden="true" className={`text-[#C2B4B9] transition-transform motion-reduce:transition-none ${accountMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {accountMenuOpen && <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-[#1E1E3A] bg-[#0F0F1E] p-2 shadow-2xl">
                <p className="truncate border-b border-[#1E1E3A] px-3 py-2 text-xs text-[#C2B4B9]">{user?.email || 'Signed-in account'}</p>
                <button type="button" onClick={() => navigate('settings')} className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-[#F1F1F8] hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4A0A3]">Settings</button>
                <button type="button" onClick={() => { setAccountMenuOpen(false); void signOut(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-200 hover:bg-red-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-300"><LogOut size={15} aria-hidden="true" /> Sign out</button>
              </div>}
            </div>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px]">
            <div role="status" className="mb-6 flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] p-4 text-sm text-[#F1E8D5]">
              <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-300" aria-hidden="true" />
              <p><strong className="font-bold">Sample dashboard data.</strong> Dashboard examples do not represent a live store sync.</p>
            </div>
            {children}
          </div>
        </main>
      </div>

      <NotificationCenter isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} notifications={notifications} onMarkAsRead={markNotificationRead} onClearAll={clearNotifications} />
    </div>
  );
};

export default DashboardShell;
