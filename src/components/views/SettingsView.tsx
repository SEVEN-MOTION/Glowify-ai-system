// src/components/views/SettingsView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Store, Lock, Plug, CreditCard, Eye, EyeOff, CheckCircle, AlertCircle, Save, Loader2, LogOut, X, Sparkles, MessageSquare, RefreshCw, Bell, SlidersHorizontal } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { updateProfile, linkWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { ConnectStore } from '../ConnectStore';
import { getSavedStoreDetails } from '../../utils/stores';

// Shopify domain validation regex
const SHOPIFY_DOMAIN_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9]\.myshopify\.com$/;

// Integration status with animated indicators
type IntegrationState = 'verified' | 'configured' | 'checking' | 'failed' | 'not_configured';

const IntegrationStatus: React.FC<{ status: IntegrationState }> = ({ status }) => {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
        </span>
        Verified
      </span>
    );
  }
  if (status === 'checking') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-dashed border-amber-500/30">
        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        Checking
      </span>
    );
  }
  if (status === 'configured') return <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-[10px] font-bold text-amber-100">Configured · not verified</span>;
  if (status === 'failed') return <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300/30 bg-red-300/10 px-2.5 py-1 text-[10px] font-bold text-red-200">Verification failed</span>;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#6B5560]/10 text-[#6B5560] border border-[#6B5560]/20">
      Not configured
    </span>
  );
};

// Toast notification
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      role={type === 'error' ? 'alert' : 'status'}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border ${
        type === 'success' ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]' : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
      }`}
    >
      {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      <span className="text-sm font-bold">{message}</span>
        <button type="button" aria-label="Dismiss notification" onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity"><X size={16} /></button>
    </motion.div>
  );
};

// Unsaved changes confirmation dialog
const UnsavedDialog: React.FC<{ onSave: () => void; onDiscard: () => void; onCancel: () => void }> = ({ onSave, onDiscard, onCancel }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <motion.div role="alertdialog" aria-modal="true" aria-labelledby="unsaved-title" aria-describedby="unsaved-description" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#0F0F1E] border border-[#1E1E3A] rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center"><AlertCircle size={24} className="text-amber-500" /></div>
        <h3 id="unsaved-title" className="text-lg font-bold text-white">Unsaved Changes</h3>
      </div>
      <p id="unsaved-description" className="text-sm text-[#B09AA0] mb-6">You have unsaved changes. Are you sure you want to leave? Your changes will be lost.</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-[#6B6B88] border border-[#1E1E3A] hover:bg-white/5 transition-all">Cancel</button>
        <button onClick={onDiscard} className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-white bg-[#1E1E3A] hover:bg-[#2A2A48] transition-all">Discard</button>
        <button onClick={onSave} className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-white bg-gradient-to-r from-[#C9747A] to-[#8B4A6B] hover:opacity-90 transition-all">Save & Leave</button>
      </div>
    </motion.div>
  </motion.div>
);

// Skeleton loader for form fields
const SkeletonField: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="h-3 w-20 bg-[#1E1E3A] rounded mb-2"></div>
    <div className="h-12 bg-[#1E1E3A] rounded-xl"></div>
  </div>
);

// API Key field with test connection button
const ApiKeyField: React.FC<{
  label: string;
  description: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  accentColor: string;
  status: IntegrationState;
  isLoading?: boolean;
  onTestConnection: () => void;
  isTesting?: boolean;
}> = ({ label, description, placeholder, value, onChange, icon, accentColor, status, isLoading, onTestConnection, isTesting }) => {
  const [show, setShow] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-[#0F0F1E] border border-[#1E1E3A] rounded-2xl p-5 animate-pulse">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#1E1E3A]"></div>
          <div className="flex-1"><div className="h-4 w-32 bg-[#1E1E3A] rounded mb-2"></div><div className="h-3 w-48 bg-[#1E1E3A] rounded"></div></div>
        </div>
        <div className="h-11 bg-[#1E1E3A] rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#0F0F1E] border border-[#1E1E3A] rounded-2xl p-5 hover:border-[#2A2A48] transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}25` }}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <label htmlFor={`${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-credential`} className="text-sm font-bold text-[#F1F1F8]">{label}</label>
              <IntegrationStatus status={status} />
            </div>
            <p className="text-xs text-[#6B6B88] mt-0.5 leading-relaxed">{description}</p>
          </div>
        </div>
        <button
          type="button"
          aria-label={`Test ${label} connection`}
          onClick={onTestConnection}
          disabled={isTesting || !value}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-30"
          style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}25` }}
        >
          {isTesting ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          {isTesting ? 'Testing...' : 'Test'}
        </button>
      </div>
      <div className="relative">
        <input id={`${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-credential`} type={show ? 'text' : 'password'} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-[#07070F] border border-[#1E1E3A] rounded-xl px-4 py-3 pr-11 text-sm text-[#F1F1F8] placeholder:text-[#3D3D55] font-mono focus:outline-none focus:border-[#C9747A]/50 transition-all" />
        <button type="button" aria-label={`${show ? 'Hide' : 'Show'} ${label}`} onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3D3D55] hover:text-[#A0A0B8] transition-colors p-1">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
};

type TabId = 'profile' | 'integrations' | 'notifications' | 'preferences' | 'billing';

export const SettingsView: React.FC = () => {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingTab, setPendingTab] = useState<TabId | null>(null);
  const [testingConnections, setTestingConnections] = useState<Record<string, boolean>>({});

  const [originalValues, setOriginalValues] = useState({
    displayName: '', storeName: '', shopifyApiKey: '', shopifyStoreDomain: '', klaviyoApiKey: '', geminiApiKey: ''
  });

  const [displayName, setDisplayName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfPwd, setShowConfPwd] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdResult, setPwdResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [passwordAlreadySet, setPasswordAlreadySet] = useState(false);
  const [shopifyApiKey, setShopifyApiKey] = useState('');
  const [shopifyStoreDomain, setShopifyStoreDomain] = useState('');
  const [shopifyDomainError, setShopifyDomainError] = useState('');
  const [klaviyoApiKey, setKlaviyoApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [savingKeys, setSavingKeys] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  
  // Connection status state for each integration (dynamically updated after test)
  const [connectionStatus, setConnectionStatus] = useState<Record<string, IntegrationState>>({
    shopify: 'not_configured',
    klaviyo: 'not_configured',
    gemini: 'not_configured'
  });

  const isDirty = displayName !== originalValues.displayName || storeName !== originalValues.storeName || shopifyApiKey !== originalValues.shopifyApiKey || shopifyStoreDomain !== originalValues.shopifyStoreDomain || klaviyoApiKey !== originalValues.klaviyoApiKey || geminiApiKey !== originalValues.geminiApiKey;

  const validateShopifyDomain = useCallback((domain: string) => {
    if (!domain) { setShopifyDomainError(''); return true; }
    if (!SHOPIFY_DOMAIN_REGEX.test(domain)) { setShopifyDomainError('Must be in format: your-store.myshopify.com'); return false; }
    setShopifyDomainError(''); return true;
  }, []);

  // API Key format validators
  const isValidShopifyKey = (key: string) => key.startsWith('shpat_') || key.startsWith('shpatla_');
  const isValidKlaviyoKey = (key: string) => key.startsWith('pk_');
  const isValidGeminiKey = (key: string) => key.startsWith('AIza');

  const handleShopifyDomainChange = (value: string) => {
    setShopifyStoreDomain(value);
    validateShopifyDomain(value);
  };

  // Active Data Hydration on Mount: Fetch workspace configuration from Firestore
  useEffect(() => {
    const hydrateFromProfile = () => {
      if (profile) {
        const values = {
          displayName: profile.displayName || '',
          storeName: profile.storeName || '',
          shopifyApiKey: profile.shopifyApiKey || '',
          shopifyStoreDomain: profile.shopifyStoreDomain || '',
          klaviyoApiKey: profile.klaviyoApiKey || '',
          geminiApiKey: profile.geminiApiKey || ''
        };
        setDisplayName(values.displayName);
        setStoreName(values.storeName);
        setShopifyApiKey(values.shopifyApiKey);
        setShopifyStoreDomain(values.shopifyStoreDomain);
        setKlaviyoApiKey(values.klaviyoApiKey);
        setGeminiApiKey(values.geminiApiKey);
        setOriginalValues(values);
      }
      // Ensure skeleton loaders display smoothly while initial fetch is unresolved
      setIsLoading(false);
    };

    const checkUserProvider = () => {
      if (user) {
        if (user.providerData?.some(p => p?.providerId === 'password')) {
          setPasswordAlreadySet(true);
        }
      }
    };

    // If profile is already available (from AuthContext), hydrate immediately
    // Otherwise, wait for AuthContext to fetch it (skeleton loaders will display)
    if (profile !== undefined) {
      hydrateFromProfile();
    } else if (!user) {
      // No user logged in, stop loading
      setIsLoading(false);
    }
    // If user exists but profile is still loading, isLoading remains true (skeletons shown)

    checkUserProvider();
  }, [profile, user]);

  // Separate effect to handle profile changes after initial load
  useEffect(() => {
    if (profile) {
      const values = {
        displayName: profile.displayName || '',
        storeName: profile.storeName || '',
        shopifyApiKey: profile.shopifyApiKey || '',
        shopifyStoreDomain: profile.shopifyStoreDomain || '',
        klaviyoApiKey: profile.klaviyoApiKey || '',
        geminiApiKey: profile.geminiApiKey || ''
      };
      setDisplayName(values.displayName);
      setStoreName(values.storeName);
      setShopifyApiKey(values.shopifyApiKey);
      setShopifyStoreDomain(values.shopifyStoreDomain);
      setKlaviyoApiKey(values.klaviyoApiKey);
      setGeminiApiKey(values.geminiApiKey);
      setOriginalValues(values);
      
      // Update connection status based on saved API keys
      setConnectionStatus({
        shopify: values.shopifyApiKey || values.shopifyStoreDomain ? 'configured' : 'not_configured',
        klaviyo: values.klaviyoApiKey ? 'configured' : 'not_configured',
        gemini: values.geminiApiKey ? 'configured' : 'not_configured'
      });
    }
  }, [profile]);

  const handleTabChange = (newTab: TabId) => {
    if (isDirty) { setPendingTab(newTab); setShowUnsavedDialog(true); }
    else setActiveTab(newTab);
  };

  const handleSaveAndSwitch = async () => {
    setShowUnsavedDialog(false);
    await handleSaveProfile();
    if (pendingTab) setActiveTab(pendingTab);
    setPendingTab(null);
  };

  const handleDiscardAndSwitch = () => {
    setDisplayName(originalValues.displayName);
    setStoreName(originalValues.storeName);
    setShopifyApiKey(originalValues.shopifyApiKey);
    setShopifyStoreDomain(originalValues.shopifyStoreDomain);
    setKlaviyoApiKey(originalValues.klaviyoApiKey);
    setGeminiApiKey(originalValues.geminiApiKey);
    setShopifyDomainError('');
    setShowUnsavedDialog(false);
    if (pendingTab) setActiveTab(pendingTab);
    setPendingTab(null);
  };

  const handleCancelDialog = () => { setShowUnsavedDialog(false); setPendingTab(null); };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      await updateProfile(user, { displayName });
      await setDoc(doc(db, 'users', user.uid), { displayName, storeName, updatedAt: serverTimestamp() }, { merge: true });
      await refreshProfile();
      setOriginalValues(prev => ({ ...prev, displayName, storeName }));
      setToast({ message: 'Profile updated successfully', type: 'success' });
    } catch { setToast({ message: 'Failed to update profile', type: 'error' }); }
    finally { setSavingProfile(false); }
  };

  const handleSetPassword = async () => {
    setPwdResult(null);
    if (newPassword.length < 8) { setPwdResult({ type: 'error', msg: 'Password must be at least 8 characters.' }); return; }
    if (newPassword !== confirmPassword) { setPwdResult({ type: 'error', msg: 'Passwords do not match.' }); return; }
    if (!user?.email) { setPwdResult({ type: 'error', msg: 'No email address found.' }); return; }
    setSavingPwd(true);
    try {
      if (passwordAlreadySet) await updatePassword(user, newPassword);
      else await linkWithCredential(user, EmailAuthProvider.credential(user.email, newPassword));
      await setDoc(doc(db, 'users', user.uid), { passwordSet: true, updatedAt: serverTimestamp() }, { merge: true });
      setPasswordAlreadySet(true);
      setPwdResult({ type: 'success', msg: 'Security updated successfully.' });
      setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      setPwdResult({ type: 'error', msg: err.code === 'auth/requires-recent-login' ? 'Please sign out and sign in again.' : 'Failed to update security.' });
    } finally { setSavingPwd(false); }
  };

  const handleSaveApiKeys = async () => {
    setToast({ message: 'Use the secure Shopify OAuth flow. Other integration connections are not available yet.', type: 'error' });
  };

  const handleTestConnection = async (type: 'shopify' | 'klaviyo' | 'gemini') => {
    setToast({ message: `${type} connection checks are not available from this screen.`, type: 'error' });
  };

  const isSaveDisabled = Boolean(shopifyStoreDomain && !SHOPIFY_DOMAIN_REGEX.test(shopifyStoreDomain)) || savingKeys;

  const tabs = [
    { id: 'profile' as TabId, label: 'Account', icon: <User size={16} /> },
    { id: 'integrations' as TabId, label: 'Integrations', icon: <Plug size={16} /> },
    { id: 'notifications' as TabId, label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'preferences' as TabId, label: 'Preferences', icon: <SlidersHorizontal size={16} /> },
    { id: 'billing' as TabId, label: 'Billing', icon: <CreditCard size={16} /> },
  ];
  const profileStore = getSavedStoreDetails(profile);

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showUnsavedDialog && <UnsavedDialog onSave={handleSaveAndSwitch} onDiscard={handleDiscardAndSwitch} onCancel={handleCancelDialog} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-black text-white">Settings</h2><p className="text-sm text-[#6B6B88] mt-1">Manage your Glowify AI account</p></div>
        <div role="tablist" aria-label="Settings sections" className="flex flex-wrap items-center gap-1 bg-[#0F0F1E] p-1 rounded-2xl border border-[#1E1E3A]">
          {tabs.map(tab => (
            <button key={tab.id} id={`settings-tab-${tab.id}`} type="button" role="tab" aria-label={tab.label} aria-controls={`settings-panel-${tab.id}`} aria-selected={activeTab === tab.id} tabIndex={activeTab === tab.id ? 0 : -1} onKeyDown={event => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault();
                const direction = event.key === 'ArrowRight' ? 1 : -1;
                const nextIndex = (tabs.findIndex(item => item.id === tab.id) + direction + tabs.length) % tabs.length;
                document.getElementById(`settings-tab-${tabs[nextIndex].id}`)?.focus();
                handleTabChange(tabs[nextIndex].id);
              }
            }} onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab.id ? 'bg-[#C9747A] text-white shadow-lg' : 'text-[#6B6B88] hover:text-white hover:bg-white/5'}`}>
              {tab.icon}<span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div id="settings-panel-profile" role="tabpanel" aria-labelledby="settings-tab-profile" key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <section className="bg-[#0F0F1E] border border-[#1E1E3A] rounded-[24px] p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#C9747A]/10 flex items-center justify-center"><User size={24} className="text-[#C9747A]" /></div>
                <div><h3 className="text-[15px] font-bold text-[#F5EEF0]">Account Profile</h3><p className="text-[11px] text-[#6B5560]">Your personal information</p></div>
              </div>
              {isLoading ? (
                <div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><SkeletonField /><SkeletonField /></div><SkeletonField /></div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="settings-display-name" className="text-[10px] font-black text-[#C2B4B9] uppercase tracking-widest ml-1">Display Name</label>
                      <input id="settings-display-name" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name"
                        className="w-full bg-[#07070F] border border-[#1E1E3A] rounded-xl px-4 py-3.5 text-sm text-[#F1F1F8] placeholder:text-[#3D3D55] focus:outline-none focus:border-[#C9747A]/50 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="settings-email" className="text-[10px] font-black text-[#C2B4B9] uppercase tracking-widest ml-1">Email</label>
                      <input id="settings-email" type="email" value={user?.email || ''} disabled className="w-full bg-[#0A0A14] border border-[#1E1E3A] rounded-xl px-4 py-3.5 text-sm text-[#D1C6CB] cursor-not-allowed" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="settings-store-name" className="text-[10px] font-black text-[#C2B4B9] uppercase tracking-widest ml-1">Store name</label>
                    <input id="settings-store-name" type="text" value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="Your store name"
                      className="w-full rounded-xl border border-[#1E1E3A] bg-[#07070F] px-4 py-3.5 text-sm text-[#F1F1F8] placeholder:text-[#8C7B82] focus:border-[#C9747A]/50 focus:outline-none" />
                  </div>
                  <div className="rounded-xl border border-[#1E1E3A] bg-[#080608]/50 p-4" aria-live="polite">
                    <div className="flex items-start gap-3"><Store size={18} className="mt-0.5 shrink-0 text-[#D4A0A3]" aria-hidden="true" /><div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#F5EEF0]">Shopify store details</h4>
                      {profileStore ? <p className="mt-1 break-all text-sm text-[#D1C6CB]">{profileStore.name} · {profileStore.domain}<span className="block text-xs text-amber-100">Saved profile details; OAuth connection status is not available here.</span></p> : <p className="mt-1 text-sm text-[#D1C6CB]">No Shopify domain is saved in this account profile. This screen cannot confirm store connection status.</p>}
                      <button type="button" onClick={() => handleTabChange('integrations')} className="mt-3 rounded text-sm font-bold text-[#E3A7AA] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4A0A3]">Open store integrations</button>
                    </div></div>
                  </div>
                  <button onClick={handleSaveProfile} disabled={savingProfile}
                    className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest text-white transition-all disabled:opacity-50"
                    style={{ background: savingProfile ? '#6B5560' : 'linear-gradient(135deg, #C9747A, #8B4A6B)' }}>
                    {savingProfile ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Profile</>}
                  </button>
                </div>
              )}
            </section>

            <section className="bg-[#0F0F1E] border border-[#1E1E3A] rounded-[24px] p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#8B4A6B]/10 flex items-center justify-center"><Lock size={24} className="text-[#8B4A6B]" /></div>
                <div><h3 className="text-[15px] font-bold text-[#F5EEF0]">Security</h3><p className="text-[11px] text-[#6B5560]">Update your password</p></div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="settings-new-password" className="text-[10px] font-black text-[#C2B4B9] uppercase tracking-widest ml-1">New Password</label>
                    <div className="relative">
                      <input id="settings-new-password" type={showNewPwd ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters"
                        className="w-full bg-[#07070F] border border-[#1E1E3A] rounded-xl px-4 py-3.5 pr-11 text-sm text-[#F1F1F8] placeholder:text-[#3D3D55] focus:outline-none focus:border-[#C9747A]/50 transition-all" />
                      <button type="button" aria-label={`${showNewPwd ? 'Hide' : 'Show'} new password`} onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3D3D55] hover:text-[#A0A0B8]">{showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="settings-confirm-password" className="text-[10px] font-black text-[#C2B4B9] uppercase tracking-widest ml-1">Confirm Password</label>
                    <div className="relative">
                      <input id="settings-confirm-password" type={showConfPwd ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password"
                        className="w-full bg-[#07070F] border border-[#1E1E3A] rounded-xl px-4 py-3.5 pr-11 text-sm text-[#F1F1F8] placeholder:text-[#3D3D55] focus:outline-none focus:border-[#C9747A]/50 transition-all" />
                      <button type="button" aria-label={`${showConfPwd ? 'Hide' : 'Show'} confirmation password`} onClick={() => setShowConfPwd(!showConfPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3D3D55] hover:text-[#A0A0B8]">{showConfPwd ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                  </div>
                </div>
                <AnimatePresence>{pwdResult && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className={`p-4 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-3 ${pwdResult.type === 'success' ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' : 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20'}`}>
                    {pwdResult.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}{pwdResult.msg}
                  </motion.div>
                )}</AnimatePresence>
                <button onClick={handleSetPassword} disabled={savingPwd || !newPassword}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest text-white bg-[#1E1E3A] hover:bg-[#2A2A48] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {savingPwd ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : <><Lock size={16} /> Update Security</>}
                </button>
              </div>
            </section>

            <section className="bg-[#EF4444]/5 border border-[#EF4444]/10 rounded-[24px] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/10 flex items-center justify-center"><LogOut size={24} className="text-[#EF4444]" /></div>
                <div><h3 className="text-[15px] font-bold text-[#F5EEF0]">Sign Out</h3><p className="text-[11px] text-[#6B5560]">Securely end your current session</p></div>
              </div>
              {!confirmSignOut ? (
                <button onClick={() => setConfirmSignOut(true)} className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-[#EF4444] border border-[#EF4444]/20 hover:bg-[#EF4444]/10 transition-all">Terminate Session</button>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                  <button onClick={async () => { await signOut(); }} className="px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-[#EF4444] hover:bg-[#DC2626] transition-all">Confirm Logout</button>
                  <button onClick={() => setConfirmSignOut(false)} className="px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-[#6B5560] border border-[#1E1E3A] hover:bg-white/5 transition-all">Cancel</button>
                </motion.div>
              )}
            </section>
          </motion.div>
        )}

        {activeTab === 'integrations' && (
          <motion.div id="settings-panel-integrations" role="tabpanel" aria-labelledby="settings-tab-integrations" key="integrations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <ConnectStore
              title="Connect Shopify securely"
              description="Glowify uses Shopify OAuth. Your store access token stays on the server and is encrypted; you do not need to paste an API key here."
            />
            <section className="rounded-[24px] border border-[#1E1E3A] bg-[#0F0F1E] p-6">
              <div className="mb-4 flex items-center gap-3"><Plug size={20} className="text-[#D4A0A3]" aria-hidden="true" /><div><h3 className="text-[15px] font-bold text-[#F5EEF0]">Other integrations</h3><p className="mt-1 text-xs text-[#C2B4B9]">These connections are not active until their secure authorization and data sync are implemented.</p></div></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[#1E1E3A] p-4"><div><p className="text-sm font-semibold text-[#F5EEF0]">Klaviyo</p><p className="mt-1 text-xs text-[#8A7A81]">No verified connection or live campaign data is available.</p></div><span className="rounded-full bg-slate-400/10 px-2.5 py-1 text-[10px] font-semibold text-[#BCA8AE]">Not connected</span></div>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[#1E1E3A] p-4"><div><p className="text-sm font-semibold text-[#F5EEF0]">Meta</p><p className="mt-1 text-xs text-[#8A7A81]">Meta OAuth and reporting are not configured in this app yet.</p></div><span className="rounded-full bg-slate-400/10 px-2.5 py-1 text-[10px] font-semibold text-[#BCA8AE]">Not connected</span></div>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[#1E1E3A] p-4"><div><p className="text-sm font-semibold text-[#F5EEF0]">AI services</p><p className="mt-1 text-xs text-[#8A7A81]">Configured by the app server; availability is not verified from this screen.</p></div><span className="rounded-full bg-slate-400/10 px-2.5 py-1 text-[10px] font-semibold text-[#BCA8AE]">Server managed</span></div>
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.section id="settings-panel-notifications" role="tabpanel" aria-labelledby="settings-tab-notifications" key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-[24px] border border-[#1E1E3A] bg-[#0F0F1E] p-6">
            <div className="mb-3 flex items-center gap-3"><Bell size={20} className="text-[#D4A0A3]" aria-hidden="true" /><h3 className="text-[15px] font-bold text-[#F5EEF0]">Notifications</h3></div>
            <p className="text-sm text-[#D1C6CB]">Notification preferences are not available yet. Notifications appear here only when the app receives them.</p>
          </motion.section>
        )}
        {activeTab === 'preferences' && (
          <motion.section id="settings-panel-preferences" role="tabpanel" aria-labelledby="settings-tab-preferences" key="preferences" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-[24px] border border-[#1E1E3A] bg-[#0F0F1E] p-6">
            <div className="mb-3 flex items-center gap-3"><SlidersHorizontal size={20} className="text-[#D4A0A3]" aria-hidden="true" /><h3 className="text-[15px] font-bold text-[#F5EEF0]">Preferences</h3></div>
            <p className="text-sm text-[#D1C6CB]">Display and workspace preferences are not available yet.</p>
          </motion.section>
        )}
        {activeTab === 'billing' && (
          <motion.section id="settings-panel-billing" role="tabpanel" aria-labelledby="settings-tab-billing" key="billing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-[24px] border border-[#1E1E3A] bg-[#0F0F1E] p-6">
            <div className="mb-3 flex items-center gap-3"><CreditCard size={20} className="text-[#D4A0A3]" aria-hidden="true" /><h3 className="text-[15px] font-bold text-[#F5EEF0]">Billing</h3></div>
            <p className="text-sm text-[#D1C6CB]">Billing details are not available in this app yet.</p>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};
