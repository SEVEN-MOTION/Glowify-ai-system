import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Users, Zap, Settings, LucideIcon, BarChart2, Megaphone, Home } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen: propIsOpen, onClose, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(propIsOpen);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    setIsOpen(propIsOpen);
  }, [propIsOpen]);

  const commands = [
    { id: 'overview', label: 'Command Center', icon: Home, category: 'Navigation' },
    { id: 'analytics', label: 'Performance Analytics', icon: BarChart2, category: 'Navigation' },
    { id: 'marketing', label: 'Marketing Hub', icon: Megaphone, category: 'Navigation' },
    { id: 'products', label: 'Inventory Intelligence', icon: Package, category: 'Navigation' },
    { id: 'customers', label: 'Customer Intelligence', icon: Users, category: 'Navigation' },
    { id: 'automations', label: 'Automation Center', icon: Zap, category: 'Navigation' },
    { id: 'settings', label: 'System Settings', icon: Settings, category: 'System' },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleAction = (id: string) => {
    onNavigate(id);
    setIsOpen(false);
    onClose();
    setQuery('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[15vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => { setIsOpen(false); onClose(); }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-[#0D0D1A] border border-[#1E1E3A] rounded-[24px] shadow-2xl overflow-hidden"
          >
            <div className="flex items-center px-6 py-4 border-b border-[#1E1E3A]">
              <Search size={20} className="text-[#6B6B88] mr-4" />
              <input 
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search for pages, customers, products..."
                className="flex-1 bg-transparent border-none text-white text-lg placeholder:text-[#3D3D55] focus:outline-none"
              />
              <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-[#6B6B88] uppercase tracking-widest">ESC</div>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto p-4 custom-scrollbar">
              {filteredCommands.length > 0 ? (
                <div className="space-y-4">
                  <p className="px-2 text-[10px] font-black text-[#3D3D55] uppercase tracking-widest">Actions</p>
                  <div className="space-y-1">
                    {filteredCommands.map(cmd => (
                      <button
                        key={cmd.id}
                        onClick={() => handleAction(cmd.id)}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 text-[#F1F1F8] transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#6B6B88] group-hover:text-[#C9747A] transition-colors">
                          <cmd.icon size={18} />
                        </div>
                        <span className="text-sm font-bold">{cmd.label}</span>
                        <span className="ml-auto text-[10px] font-medium text-[#3D3D55]">{cmd.category}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center opacity-40">
                  <Search size={40} className="mx-auto mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest">No results found for "{query}"</p>
                </div>
              )}
            </div>
            
            <div className="px-6 py-3 border-t border-[#1E1E3A] bg-white/[0.02] flex items-center justify-between">
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#6B6B88]">
                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[8px]">↑↓</span> Navigate
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#6B6B88]">
                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[8px]">ENTER</span> Select
                </div>
              </div>
              <p className="text-[10px] font-black text-[#3D3D55] uppercase tracking-widest">Glowify Command Palette</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
