// src/components/CommonUI.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { DS } from '../theme';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  metric?: {
    color?: string;
  };
}

export const Card: any = ({ children, className = "", metric }) => (
  <motion.div 
    className={`glw-card bg-[#140F14] border border-[#231820] rounded-2xl p-6 shadow-xl relative overflow-hidden ${className}`}
  >
    {metric && (
      <svg style={{position:'absolute',top:'10px',right:'10px',opacity:0.18}} width="32" height="32" viewBox="0 0 32 32">
        {[0,1,2].map(r=>[0,1,2].map(c=>(
          <circle key={`${r}-${c}`} cx={c*12+4} cy={r*12+4} r="1.5" fill={metric.color || DS.brand.primary}/>
        )))}
      </svg>
    )}
    {children}
    {metric && (
      <div className="absolute bottom-0 left-0 right-0 h-[1px] opacity-0 transition-opacity duration-300 group-hover:opacity-100" 
           style={{ background: `linear-gradient(90deg, transparent, ${metric.color || DS.brand.primary}, transparent)` }} />
    )}
  </motion.div>
);

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export const Toggle: any = ({ checked, onChange, disabled = false }) => (
  <div
    onClick={!disabled ? onChange : undefined}
    className="glw-toggle-track"
    style={{
      background: checked ? '#C9747A' : '#231820',
      boxShadow:  checked ? '0 0 12px rgba(201,116,122,0.4)' : 'none',
      opacity:    disabled ? 0.5 : 1,
      cursor:     disabled ? 'not-allowed' : 'pointer',
    }}
  >
    <div
      className="glw-toggle-thumb"
      style={{ left: checked ? '21px' : '3px' }}
    />
  </div>
);

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
}

export const ProgressBar: any = ({ value, max }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="glw-progress-track bg-[#1A1218] h-[6px] rounded-full overflow-hidden">
      <div
        className="glw-progress-fill h-full rounded-full transition-all duration-500"
        style={{
          width:      `${pct}%`,
          background: 'linear-gradient(90deg, #C9747A, #8B4A6B)',
        }}
      />
    </div>
  );
};

interface SkeletonProps {
  w?: string | number;
  h?: string | number;
  r?: string | number;
}

export const Skeleton: any = ({ w = '100%', h = 16, r = 6 }) => (
  <div className="glw-skeleton" style={{ width: w, height: h, borderRadius: r }} />
);

export const TechBackground: React.FC = () => (
  <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,overflow:'hidden'}}>
    <div className="glw-tech-grid" style={{position:'absolute',inset:0}}/>
    <div style={{
      position:'absolute', top:'-160px', right:'-120px',
      width:'600px', height:'600px',
      background:'radial-gradient(circle, rgba(201,116,122,0.06) 0%, transparent 65%)',
      borderRadius:'50%',
    }}/>
    <div style={{
      position:'absolute', bottom:'-80px', left:'10%',
      width:'480px', height:'480px',
      background:'radial-gradient(circle, rgba(139,74,107,0.05) 0%, transparent 65%)',
      borderRadius:'50%',
    }}/>
    <div style={{
      position:'absolute', top:'35%', left:'38%',
      width:'360px', height:'360px',
      background:'radial-gradient(circle, rgba(201,116,122,0.025) 0%, transparent 65%)',
      borderRadius:'50%',
    }}/>
    <div style={{
      position:'absolute', top:0, left:0, right:0, height:'1px',
      background:'linear-gradient(90deg, transparent, rgba(201,116,122,0.18), transparent)',
    }}/>
  </div>
);
