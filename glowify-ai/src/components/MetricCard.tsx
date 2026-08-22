// src/components/MetricCard.tsx
import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

export const MetricCard: any = ({ label, value, change, trend, loading }) => {
  return (
    <div 
      className="relative group overflow-hidden rounded-2xl p-6 transition-all shadow-xl"
      style={{
        background: 'linear-gradient(135deg, #140F14 0%, #100D10 100%)',
        border: '1px solid #231820',
      }}
    >
      <div 
        className="absolute -inset-1 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: 'linear-gradient(135deg, rgba(201,116,122,0.08), rgba(139,74,107,0.06))' }}
      />

      <div className="relative z-10 flex flex-col gap-1">
        <span className="text-[11px] font-black text-[#6B5560] uppercase tracking-[0.15em] mb-2">
          {label}
        </span>
        
        <div className="flex items-baseline justify-between mt-2">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg" style={{ background: '#231820' }} />
          ) : (
            <h2 className="text-3xl font-black text-[#F5EEF0] tracking-tight tabular-nums">
              {value}
            </h2>
          )}
          
          {change && !loading && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              trend === 'up' ? 'bg-[#10B981]/10 text-[#10B981]' : 
              trend === 'down' ? 'bg-[#EF4444]/10 text-[#EF4444]' : 
              'bg-[#3D2B32]/10 text-[#6B5560]'
            }`}>
              {change}
            </span>
          )}
        </div>

        <div className="mt-4 h-[2px] w-full bg-[#231820] rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${
              trend === 'up' ? 'bg-[#C9747A]/40' : trend === 'down' ? 'bg-[#EF4444]/40' : 'bg-[#3A2530]/40'
            }`}
            style={{ width: loading ? '10%' : '100%' }}
          />
        </div>
      </div>
    </div>
  );
};
