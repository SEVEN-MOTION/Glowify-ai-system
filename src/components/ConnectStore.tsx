import React from 'react';
import { ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConnectStoreProps {
  onConnect: () => void;
  title?: string;
  description?: string;
}

export const ConnectStore: React.FC<ConnectStoreProps> = ({
  onConnect, 
  title = "Connect Your Store", 
  description = "Connect your Shopify store to unlock real-time analytics, AI insights, and automated inventory management."
}) => {
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
      
      <h2 className="text-2xl font-black text-[#F1F1F8] mb-4 tracking-tight">
        {title}
      </h2>
      <p className="text-[#6B6B88] max-w-md mx-auto mb-10 leading-relaxed font-medium">
        {description}
      </p>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={onConnect}
          className="px-8 py-4 bg-[#C9747A] hover:bg-[#D4A0A3] text-white text-sm font-black rounded-2xl transition-all shadow-xl shadow-[#C9747A]/20 flex items-center gap-2 group"
        >
          Go to Settings
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="mt-12 flex items-center gap-6 opacity-50">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#10B981]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#6B6B88]">Secure Connection</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-[#1E1E3A]" />
        <span className="text-[10px] font-black uppercase tracking-widest text-[#6B6B88]">Official Shopify API</span>
      </div>
    </motion.div>
  );
};
