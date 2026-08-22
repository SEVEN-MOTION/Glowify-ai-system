import React, { useState } from 'react';
import { ShoppingBag, ArrowRight, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface ConnectStoreProps {
  onConnect?: () => void;
  title?: string;
  description?: string;
}

const SHOPIFY_DOMAIN_REGEX = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i;

export const ConnectStore: React.FC<ConnectStoreProps> = ({
  onConnect,
  title = 'Connect Your Store',
  description = 'Connect your Shopify store to unlock real-time analytics, AI insights, and automated inventory management.'
}) => {
  const { user } = useAuth();
  const [shop, setShop] = useState(import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setError('');
    const normalizedShop = shop.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!SHOPIFY_DOMAIN_REGEX.test(normalizedShop)) {
      setError('Enter your Shopify domain, for example: your-store.myshopify.com');
      return;
    }
    if (!user) {
      setError('Please sign in before connecting a store.');
      return;
    }

    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/shopify/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ shop: normalizedShop }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.authorizationUrl) {
        throw new Error(data.error || 'Unable to start Shopify connection');
      }
      onConnect?.();
      window.location.assign(data.authorizationUrl);
    } catch (err) {
      console.error('Shopify connection failed to start', err);
      setError(err instanceof Error ? err.message : 'Unable to start Shopify connection');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="w-20 h-20 rounded-3xl bg-[#C9747A]/10 flex items-center justify-center text-[#C9747A] mb-8 relative">
        <div className="absolute inset-0 rounded-3xl bg-[#C9747A]/20 animate-pulse" />
        <ShoppingBag size={40} className="relative z-10" />
      </div>

      <h2 className="text-2xl font-black text-[#F1F1F8] mb-4 tracking-tight">{title}</h2>
      <p className="text-[#6B6B88] max-w-md mx-auto mb-8 leading-relaxed font-medium">{description}</p>

      <div className="w-full max-w-md text-left mb-4">
        <label className="text-[10px] font-black text-[#6B6B88] uppercase tracking-widest ml-1 mb-2 block">Shopify store domain</label>
        <input
          value={shop}
          onChange={(event) => setShop(event.target.value)}
          placeholder="your-store.myshopify.com"
          autoComplete="url"
          disabled={loading}
          className="w-full bg-[#07070F] border border-[#1E1E3A] rounded-xl px-4 py-3.5 text-sm text-[#F1F1F8] placeholder:text-[#3D3D55] focus:outline-none focus:border-[#C9747A]/50 transition-all"
        />
      </div>

      {error && (
        <div className="w-full max-w-md flex items-start gap-2 mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs text-left">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={loading}
        className="px-8 py-4 bg-[#C9747A] hover:bg-[#D4A0A3] disabled:opacity-60 disabled:cursor-wait text-white text-sm font-black rounded-2xl transition-all shadow-xl shadow-[#C9747A]/20 flex items-center gap-2 group"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
        {loading ? 'Opening Shopify...' : 'Connect to Shopify'}
      </button>

      <div className="mt-12 flex items-center gap-6 opacity-50">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#10B981]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#6B6B88]">Secure OAuth</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-[#1E1E3A]" />
        <span className="text-[10px] font-black uppercase tracking-widest text-[#6B6B88]">Official Shopify API</span>
      </div>
    </motion.div>
  );
};
