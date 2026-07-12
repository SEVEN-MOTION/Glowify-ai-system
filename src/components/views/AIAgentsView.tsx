import React, { useEffect, useState } from 'react';
import { Bot, ShieldAlert, Cpu, Activity, BrainCircuit, CheckCircle2, XCircle, Edit2, ArrowUpRight, Search, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type Agent = {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  task: string;
  status: 'Active' | 'Paused' | 'Idle';
  successRate: number;
  lastActivity: string;
};

type ActionItem = {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  successRate: number;
  revenueImpact: number;
  confidence: number;
  agent: string;
  createdAt: string;
};

type TimelineEvent = {
  id: string;
  time: string;
  title: string;
  detail: string;
  revenueImpact: number;
  confidence: number;
};

const AGENTS: Agent[] = [
  { id: 'agent-1', name: 'Inventory Sentinel', icon: ShieldAlert, task: 'Monitoring stock risk', status: 'Active', successRate: 92, lastActivity: '2m ago' },
  { id: 'agent-2', name: 'Pricing Optimizer', icon: Cpu, task: 'Analyzing margin', status: 'Active', successRate: 84, lastActivity: '7m ago' },
  { id: 'agent-3', name: 'SEO Architect', icon: Activity, task: 'Scanning search demand', status: 'Active', successRate: 78, lastActivity: '12m ago' },
  { id: 'agent-4', name: 'Creative Core', icon: BrainCircuit, task: 'Drafting campaign hooks', status: 'Active', successRate: 89, lastActivity: '4m ago' },
];

const INITIAL_ACTIONS: ActionItem[] = [
  { id: 'action-1', title: 'Restock Vitamin C Serum', description: 'Reorder top SKU inventory to preserve momentum.', status: 'pending', successRate: 92, revenueImpact: 1200, confidence: 94, agent: 'Inventory Sentinel', createdAt: '09:18 AM' },
  { id: 'action-2', title: 'Increase Retinol Cream price', description: 'Raise price by 5% while monitoring conversion.', status: 'completed', successRate: 86, revenueImpact: 860, confidence: 78, agent: 'Pricing Optimizer', createdAt: '08:40 AM' },
  { id: 'action-3', title: 'SEO landing page update', description: 'Add long-tail keyword sections to boost organic traffic.', status: 'failed', successRate: 62, revenueImpact: 430, confidence: 68, agent: 'SEO Architect', createdAt: '07:52 AM' },
];

const TIMELINE_EVENTS: TimelineEvent[] = [
  { id: 'event-1', time: '09:20 AM', title: 'Inventory Sentinel queued restock action', detail: 'Vitamin C Serum inventory fell below threshold.', revenueImpact: 1200, confidence: 94 },
  { id: 'event-2', time: '08:45 AM', title: 'Pricing Optimizer approved margin update', detail: 'Retinol Cream price increased by 5%.', revenueImpact: 860, confidence: 78 },
  { id: 'event-3', time: '07:30 AM', title: 'SEO Architect flagged content opportunity', detail: 'Create a keyword-rich guide for skin health.', revenueImpact: 430, confidence: 68 },
];

const confidenceStyle = (confidence: number) => {
  if (confidence >= 85) return 'bg-emerald-500/10 text-emerald-300';
  if (confidence >= 70) return 'bg-[#C9747A]/10 text-[#F3CBD0]';
  return 'bg-amber-500/10 text-amber-300';
};

const AgentStatusRow: React.FC<{ agent: Agent }> = ({ agent }) => (
  <div className="grid grid-cols-[1.1fr_1.2fr_0.7fr_0.7fr_1.1fr] gap-4 items-center rounded-3xl border border-[#231820] bg-[#100D10] px-4 py-4 text-sm text-[#BCA8AE]">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#080608] text-[#C9747A]">
        <agent.icon size={18} />
      </div>
      <div>
        <p className="font-semibold text-[#F5EEF0]">{agent.name}</p>
        <p className="text-[11px] text-[#6B6B88]">Task: {agent.task}</p>
      </div>
    </div>
    <div className="font-semibold text-[#F5EEF0] truncate">{agent.task}</div>
    <div>
      <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${agent.status === 'Active' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>
        {agent.status}
      </span>
    </div>
    <div className="text-[#F5EEF0]">{agent.successRate}%</div>
    <div className="text-[#6B6B88]">{agent.lastActivity}</div>
  </div>
);

const ActionRow: React.FC<{ action: ActionItem; onSelect: () => void }> = ({ action, onSelect }) => (
  <button type="button" onClick={onSelect} className="w-full rounded-3xl border border-[#231820] bg-[#0D0D1A] p-4 text-left transition hover:border-[#C9747A]/40">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#F5EEF0] truncate">{action.title}</p>
        <p className="mt-2 text-[12px] text-[#BCA8AE] truncate">{action.description}</p>
      </div>
      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${confidenceStyle(action.confidence)}`}>{action.confidence}%</span>
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-[#6B6B88]">
      <span>{action.agent}</span>
      <span>Impact ${action.revenueImpact.toLocaleString()}</span>
      <span>{action.createdAt}</span>
    </div>
  </button>
);

const TimelineRow: React.FC<{ event: TimelineEvent }> = ({ event }) => (
  <div className="rounded-3xl border border-[#231820] bg-[#0D0D1A] p-4 text-sm">
    <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-[#6B6B88] mb-3">
      <span>{event.time}</span>
      <span>Impact ${event.revenueImpact.toLocaleString()}</span>
    </div>
    <p className="font-semibold text-[#F5EEF0]">{event.title}</p>
    <p className="mt-2 text-[12px] text-[#BCA8AE]">{event.detail}</p>
    <div className="mt-4 flex items-center justify-between text-[11px] text-[#6B6B88]">
      <span>Confidence</span>
      <span className={`rounded-full px-3 py-1 ${confidenceStyle(event.confidence)}`}>{event.confidence}%</span>
    </div>
  </div>
);

const AIAgentsView: React.FC = () => {
  const { profile } = useAuth();
  const storeName = profile?.storeName || 'Glowify Workspace';

  const [actions, setActions] = useState<ActionItem[]>(INITIAL_ACTIONS);
  const [selectedActionId, setSelectedActionId] = useState<string>(INITIAL_ACTIONS[0]?.id ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (!selectedActionId && actions.length > 0) {
      setSelectedActionId(actions[0].id);
    }
  }, [actions, selectedActionId]);

  const selectedAction = actions.find((item) => item.id === selectedActionId);
  const pendingActions = actions.filter((item) => item.status === 'pending');
  const completedActions = actions.filter((item) => item.status === 'completed');
  const failedActions = actions.filter((item) => item.status === 'failed');

  const handleApprove = (id: string) => {
    setActions((items) => items.map((item) => (item.id === id ? { ...item, status: 'completed' } : item)));
  };

  const handleReject = (id: string) => {
    setActions((items) => items.map((item) => (item.id === id ? { ...item, status: 'failed' } : item)));
  };

  const startEdit = () => {
    if (!selectedAction) return;
    setDraftTitle(selectedAction.title);
    setDraftDescription(selectedAction.description);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!selectedAction) return;
    setActions((items) => items.map((item) => (item.id === selectedAction.id ? { ...item, title: draftTitle, description: draftDescription } : item)));
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraftTitle('');
    setDraftDescription('');
  };

  const submitPrompt = () => {
    if (!prompt.trim()) return;
    const newAction: ActionItem = {
      id: `action-${Date.now()}`,
      title: prompt.trim().slice(0, 45),
      description: `Glowify AI recommendation: ${prompt.trim()}`,
      status: 'pending',
      successRate: 82,
      revenueImpact: 950,
      confidence: 88,
      agent: 'Creative Core',
      createdAt: 'Now',
    };
    setActions((items) => [newAction, ...items]);
    setSelectedActionId(newAction.id);
    setPrompt('');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8A7A81]">AI Command Center</p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#F5EEF0]">Grow operations for {storeName}</h1>
          <p className="mt-3 max-w-2xl text-sm text-[#BCA8AE]">Track agent status, approve smart actions, and monitor AI timeline events with revenue and confidence context.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full sm:w-auto">
          <div className="rounded-3xl border border-[#231820] bg-[#100D10] p-5 text-sm">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#6B6B88]">Live agents</p>
            <p className="mt-3 text-3xl font-black text-[#F5EEF0]">4</p>
          </div>
          <div className="rounded-3xl border border-[#231820] bg-[#100D10] p-5 text-sm">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#6B6B88]">Pending actions</p>
            <p className="mt-3 text-3xl font-black text-[#F5EEF0]">{pendingActions.length}</p>
          </div>
          <div className="rounded-3xl border border-[#231820] bg-[#100D10] p-5 text-sm">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#6B6B88]">Avg confidence</p>
            <p className="mt-3 text-3xl font-black text-[#F5EEF0]">{Math.round(actions.reduce((sum, item) => sum + item.confidence, 0) / Math.max(actions.length, 1))}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.45fr_1fr] gap-6">
        <div className="rounded-3xl border border-[#231820] bg-[#100D10] p-5">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-sm font-semibold text-[#F5EEF0]">Agent Status Board</p>
              <p className="text-[12px] text-[#6B6B88] mt-1">Agent tasks, success percentages, and latest activity.</p>
            </div>
            <button type="button" className="rounded-2xl border border-[#C9747A]/20 bg-[#C9747A]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F3CBD0]">Refresh</button>
          </div>
          <div className="grid grid-cols-[1.1fr_1.2fr_0.7fr_0.7fr_1.1fr] gap-4 px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-[#6B6B88] border-b border-[#231820]">
            <span>Agent</span>
            <span>Current task</span>
            <span>Status</span>
            <span>Success rate</span>
            <span>Last activity</span>
          </div>
          <div className="space-y-3 mt-3">
            {AGENTS.map((agent) => (
              <AgentStatusRow key={agent.id} agent={agent} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-[#231820] bg-[#100D10] p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-sm font-semibold text-[#F5EEF0]">Approval Center</p>
                <p className="text-[12px] text-[#6B6B88] mt-1">Approve, reject, or edit AI-recommended actions.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#3B82F6]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#60A5FA]">Review queue</div>
            </div>
            {!selectedAction ? (
              <div className="rounded-3xl border border-dashed border-[#231820] p-8 text-center text-[#6B6B88]">Select an action to review from the queue.</div>
            ) : isEditing ? (
              <div className="space-y-4">
                <label className="block text-[11px] uppercase tracking-[0.18em] text-[#6B6B88]">Action title</label>
                <input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} className="w-full rounded-2xl border border-[#231820] bg-[#080608] p-3 text-sm text-[#F5EEF0] focus:outline-none focus:border-[#C9747A]" />
                <label className="block text-[11px] uppercase tracking-[0.18em] text-[#6B6B88]">Description</label>
                <textarea value={draftDescription} onChange={(e) => setDraftDescription(e.target.value)} className="w-full rounded-2xl border border-[#231820] bg-[#080608] p-3 text-sm text-[#F5EEF0] focus:outline-none focus:border-[#C9747A]" rows={5} />
                <div className="flex gap-3">
                  <button type="button" onClick={saveEdit} className="flex-1 rounded-2xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white">Save</button>
                  <button type="button" onClick={cancelEdit} className="flex-1 rounded-2xl border border-[#231820] bg-[#080608] px-4 py-3 text-sm font-semibold text-[#F5EEF0]">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-[#F5EEF0]">{selectedAction.title}</p>
                  <p className="mt-2 text-[12px] text-[#BCA8AE]">{selectedAction.description}</p>
                </div>
                <div className="rounded-3xl border border-[#231820] bg-[#080608] p-4 text-[11px] text-[#6B6B88]">
                  <p>Agent: {selectedAction.agent}</p>
                  <p>Success rate: {selectedAction.successRate}%</p>
                  <p>Revenue impact: ${selectedAction.revenueImpact.toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => handleApprove(selectedAction.id)} className="rounded-2xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white">Approve</button>
                  <button type="button" onClick={() => handleReject(selectedAction.id)} className="rounded-2xl bg-[#EF4444] px-4 py-3 text-sm font-semibold text-white">Reject</button>
                </div>
                <button type="button" onClick={startEdit} className="w-full rounded-2xl border border-[#231820] bg-[#080608] px-4 py-3 text-sm font-semibold text-[#F5EEF0] inline-flex items-center justify-center gap-2"><Edit2 size={16} /> Edit action</button>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-[#231820] bg-[#100D10] p-5">
            <p className="text-sm font-semibold text-[#F5EEF0] mb-3">Quick Prompt</p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask glowify to grow your store...."
              className="w-full rounded-3xl border border-[#231820] bg-[#080608] p-4 text-sm text-[#F5EEF0] focus:outline-none focus:border-[#C9747A]"
              rows={5}
            />
            <button type="button" onClick={submitPrompt} className="mt-4 w-full rounded-2xl bg-[#C9747A] px-4 py-3 text-sm font-semibold text-white">Submit prompt</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.95fr] gap-6">
        <div className="rounded-3xl border border-[#231820] bg-[#100D10] p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-sm font-semibold text-[#F5EEF0]">Action Queue</p>
              <p className="text-[12px] text-[#6B6B88] mt-1">Pending, completed, and failed actions in one place.</p>
            </div>
            <span className="rounded-full bg-[#C9747A]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F3CBD0]">Mock only</span>
          </div>
          <div className="space-y-4">
            {[
              { title: 'Pending', actions: pendingActions },
              { title: 'Completed', actions: completedActions },
              { title: 'Failed', actions: failedActions },
            ].map((section) => (
              <div key={section.title} className="rounded-3xl border border-[#231820] bg-[#080608] p-4">
                <p className="text-[12px] uppercase tracking-[0.18em] text-[#6B6B88] mb-3">{section.title}</p>
                <div className="space-y-3">
                  {section.actions.length > 0 ? section.actions.map((action) => (
                    <ActionRow key={action.id} action={action} onSelect={() => setSelectedActionId(action.id)} />
                  )) : (
                    <div className="rounded-3xl border border-dashed border-[#231820] p-6 text-center text-[#6B6B88]">No actions.</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#231820] bg-[#100D10] p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-sm font-semibold text-[#F5EEF0]">AI Timeline</p>
              <p className="text-[12px] text-[#6B6B88] mt-1">Chronological actions with revenue impact and confidence.</p>
            </div>
            <span className="rounded-full bg-[#C9747A]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F3CBD0]">Revenue aware</span>
          </div>
          <div className="space-y-4">
            {TIMELINE_EVENTS.map((event) => (
              <TimelineRow key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAgentsView;
