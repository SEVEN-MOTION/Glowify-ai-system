// src/App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Bell, Zap, Package, Menu, X, ChevronRight, Activity, LogOut, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OverviewView, AnalyticsView } from './components/DashboardViews';
import { AIAgentsView } from './components/views/AIAgentsView';
import { MarketingView } from './components/views/MarketingView';
import { InventoryView } from './components/views/InventoryView';
import { CustomersView } from './components/views/CustomersView';
import { AutomationsView } from './components/views/AutomationsView';
import { ActivityCenter } from './components/ActivityCenter';
import { SettingsView } from './components/views/SettingsView';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardProvider } from './contexts/DashboardContext';
import { DataProvider } from './contexts/DataContext';
import { AuthScreen } from './components/AuthScreen';
import { DashboardShell } from './components/DashboardShell';
import { TechBackground } from './components/CommonUI';

// ─── Premium Auth Loading Screen ─────────────────────────────────────────
const AuthLoadingScreen: React.FC = () => (
  <div className="fixed inset-0 z-[9999] bg-[#080608] flex items-center justify-center overflow-hidden">
    <TechBackground />
    
    {/* Animated gradient background */}
    <div className="absolute inset-0 bg-gradient-radial from-[#C9747A]/10 via-transparent to-transparent" />
    
    {/* Central glow effect */}
    <motion.div
      animate={{ 
        scale: [1, 1.1, 1],
        opacity: [0.4, 0.6, 0.4]
      }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-[#C9747A]/20 to-transparent blur-3xl"
    />
    
    {/* Content */}
    <div className="relative z-10 flex flex-col items-center gap-6">
      {/* Logo with glow */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div 
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #C9747A, #8B4A6B)',
            boxShadow: '0 0 60px rgba(201,116,122,0.5), 0 0 120px rgba(201,116,122,0.3)'
          }}
        >
          <Zap size={40} className="text-white fill-white" />
        </div>
      </motion.div>
      
      {/* Brand name */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h1 className="text-4xl font-black text-white tracking-tight">
          GLOWIFY<span className="text-[#C9747A]">AI</span>
        </h1>
        <p className="text-sm text-[#6B6B88] mt-2 tracking-widest uppercase">
          Intelligent Operations Platform
        </p>
      </motion.div>
      
      {/* Loading spinner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col items-center gap-3"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#1E1E3A] border-t-[#C9747A] rounded-full"
        />
        <p className="text-xs font-bold text-[#6B6B88] uppercase tracking-widest">
          Verifying session...
        </p>
      </motion.div>
    </div>
  </div>
);

// ─── Animated Sign Out Overlay ────────────────────────────────────────────
const SignOutOverlay: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] bg-[#080608]/95 backdrop-blur-xl flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Animated lock icon */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full bg-[#C9747A]/10 border border-[#C9747A]/20 flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.5 }}
          >
            <LogOut size={32} className="text-[#C9747A]" />
          </motion.div>
        </motion.div>

        {/* Text */}
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-bold text-white mb-2"
          >
            Signing out securely...
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-[#6B6B88]"
          >
            Clearing session data
          </motion.p>
        </div>

        {/* Progress bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          className="h-1 bg-gradient-to-r from-[#C9747A] to-[#8B4A6B] rounded-full"
        />
      </motion.div>
    </motion.div>
  );
};



// ─── App Shell ──────────────────────────────────────────────────────────────
const AppShell: React.FC = () => {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
  }, []);

  const handleSignOutComplete = useCallback(async () => {
    await signOut();
    setIsSigningOut(false);
  }, [signOut]);

  // Global auth loading screen
  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  // Show sign out overlay if signing out
  if (isSigningOut) {
    return <SignOutOverlay onComplete={handleSignOutComplete} />;
  }

  if (!user) return <AuthScreen />;

  const renderView = () => {
    switch (activeTab) {
      case 'overview': return <OverviewView loading={authLoading} onNavigate={setActiveTab} />;
      case 'analytics': return <AnalyticsView onNavigate={setActiveTab} />;
      case 'marketing': return <MarketingView onNavigate={setActiveTab} />;
      case 'products': return <InventoryView onNavigate={setActiveTab} />;
      case 'customers': return <CustomersView />;
      case 'automations': return <AutomationsView />;
      case 'activity': return <ActivityCenter />;
      case 'ai': return <AIAgentsView />;
      case 'settings': return <SettingsView />;
      default: return <OverviewView loading={authLoading} onNavigate={setActiveTab} />;
    }
  };

  return (
    <DashboardShell activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderView()}
    </DashboardShell>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DashboardProvider>
        <DataProvider>
          <AppShell />
        </DataProvider>
      </DashboardProvider>
    </AuthProvider>
  );
}
