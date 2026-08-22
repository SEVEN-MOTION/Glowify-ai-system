import React, { useState, useEffect, useRef } from 'react';
import { Bot, Zap, Send, Loader2, ShieldAlert, Cpu, Activity, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/genai';
import { AGENT_FLEET_LOGS } from '../../utils/neurozenMockData';
import { AgentFeed } from '../AgentFeed';

// Gemini Integration
const callGemini = async (prompt: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("No API key");
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  const systemContext = `You are the Glowify AI Fleet Operator for a beauty eCommerce brand called GLOWIFY. 
  You manage inventory intelligence, pricing decisions, and marketing automation.
  Current store data: Products include skincare serums ($89), moisturizers ($65), cleansers ($45), treatments ($120).
  Total revenue this month: $142,840. Top channel: Direct (85% share). ROAS: 4.2x.
  Respond concisely in 2-3 sentences. Be specific and actionable like a real ops AI.`;
  
  const result = await model.generateContent(`${systemContext}\n\nOperator query: ${prompt}`);
  return result.response.text();
};

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export const AIAgentsView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'System initialized. All 4 neural agents are online and monitoring the GLOWIFY ecosystem. How can I assist with operations today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;
    
    const userMsg = text.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setPrompt('');
    setIsTyping(true);
    setError(null);

    try {
      const response = await callGemini(userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (err: any) {
      console.error(err);
      if (err.message === "No API key") {
        setError("API Key Missing");
      } else {
        setError("Network Error");
      }
      // Simulated response on error
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: "I've analyzed the current data stream. Our Inventory-Sentinel reports high velocity on 'Vitamin C Serum', while Pricing-Optimizer has detected a 5% margin opportunity on 'Retinol Cream' based on competitor stockouts. Shall I execute these optimizations?" 
        }]);
      }, 1000);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    "Stock Alert Status",
    "Revenue Optimization",
    "Marketing Insights",
    "Competitor Watch"
  ];

  const agentStats = [
    { name: 'Inventory-Sentinel', icon: ShieldAlert, status: 'Active', impact: 92 },
    { name: 'Pricing-Optimizer', icon: Cpu, status: 'Active', impact: 78 },
    { name: 'SEO-Architect', icon: Activity, status: 'Active', impact: 65 },
    { name: 'Neuro-Core', icon: BrainCircuit, status: 'Active', impact: 98 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black text-[#F5EEF0] tracking-tight">AI Fleet Command</h2>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            4 Agents Active
          </span>
        </div>
        <button className="px-4 py-2 bg-[#C9747A] hover:bg-[#D4A0A3] text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-[#C9747A]/20">
          Run Full Fleet Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Feed & Status */}
        <div className="lg:col-span-2 space-y-8">
          <AgentFeed logs={AGENT_FLEET_LOGS} />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {agentStats.map((agent) => (
              <div key={agent.name} className="bg-[#140F14] border border-[#231820] rounded-2xl p-4 hover:border-[#C9747A]/30 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-[#080608] text-[#6B5560] group-hover:text-[#C9747A] transition-colors">
                    <agent.icon size={18} />
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <h4 className="text-[11px] font-black text-[#F5EEF0] uppercase tracking-wider mb-1">{agent.name.split('-')[0]}</h4>
                <p className="text-[10px] text-[#6B5560] mb-3">Last action: 2m ago</p>
                <div className="h-1 w-full bg-[#080608] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${agent.impact}%` }}
                    className="h-full bg-gradient-to-r from-[#C9747A] to-[#8B4A6B]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Command Console */}
        <div className="lg:col-span-1 flex flex-col bg-[#140F14] border border-[#231820] rounded-3xl overflow-hidden h-[650px] shadow-2xl">
          <div className="p-6 border-b border-[#231820] bg-[#100D10]/50">
            <h3 className="text-sm font-black text-[#F5EEF0] uppercase tracking-widest flex items-center gap-2">
              <Bot size={16} className="text-[#C9747A]" />
              AI Command Console
            </h3>
            <p className="text-[11px] text-[#6B5560] mt-1">Query the neural fleet directly</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {error === "API Key Missing" && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <p className="text-[11px] text-amber-400 leading-relaxed">
                  ⚠️ **Connect your Gemini API key** in environment settings to enable live AI analysis. Showing simulated responses below.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-[#C9747A] text-white rounded-tr-none' 
                    : 'bg-[#080608] text-[#B09AA0] border border-[#231820] rounded-tl-none font-mono'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#080608] border border-[#231820] p-4 rounded-2xl rounded-tl-none flex gap-1">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-[#C9747A]" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-[#C9747A]" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-[#C9747A]" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-6 border-t border-[#231820] bg-[#100D10]/50 space-y-4">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map(p => (
                <button 
                  key={p}
                  onClick={() => handleSend(p)}
                  className="px-3 py-1.5 rounded-lg bg-[#080608] border border-[#231820] text-[10px] font-bold text-[#6B5560] hover:text-[#C9747A] hover:border-[#C9747A]/50 transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
            
            <div className="relative">
              <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(prompt)}
                placeholder="Ask the fleet operator..."
                className="w-full bg-[#080608] border border-[#231820] rounded-xl pl-4 pr-12 py-3 text-sm text-[#F5EEF0] focus:outline-none focus:border-[#C9747A] transition-all"
              />
              <button 
                onClick={() => handleSend(prompt)}
                disabled={isTyping}
                className="absolute right-2 top-2 w-9 h-9 rounded-lg bg-[#C9747A] flex items-center justify-center text-white hover:bg-[#D4A0A3] transition-all disabled:opacity-50"
              >
                {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <p className="text-center text-[9px] text-[#3D2B32] uppercase tracking-widest font-bold">Powered by Gemini 2.0 Flash</p>
          </div>
        </div>
      </div>
    </div>
  );
};
