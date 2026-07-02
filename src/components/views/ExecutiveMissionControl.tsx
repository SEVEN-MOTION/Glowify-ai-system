import React, { memo, useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Crown,
  Flame,
  Gauge,
  Mail,
  Megaphone,
  Package,
  Pause,
  Play,
  Rocket,
  ShoppingCart,
  Sparkles,
  Target,
  Truck,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { Card, HelperText, Skeleton } from '../CommonUI';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboard } from '../../contexts/DashboardContext';
import { useData } from '../../contexts/DataContext';
import type { Order, Product } from '../../types';

interface ExecutiveMissionControlProps {
  onNavigate: (tab: string) => void;
}

type PriorityItem = {
  title: string;
  detail: string;
  due: string;
  icon: LucideIcon;
  action: string;
  targetTab: string;
};

type RecommendationItem = {
  title: string;
  detail: string;
  impact: string;
  action: string;
  targetTab: string;
  accent: string;
  icon: LucideIcon;
};

type HealthItem = {
  label: string;
  value: string;
  detail: string;
  change: string;
  accent: string;
  icon: LucideIcon;
};

type OpportunityItem = {
  title: string;
  detail: string;
  expectedImpact: string;
  action: string;
  targetTab: string;
  icon: LucideIcon;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const formatCompact = (value: number) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);

const SectionShell = memo(function SectionShell({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12%' }}
      transition={{ duration: 0.35 }}
      className={className}
    >
      {children}
    </motion.section>
  );
});
SectionShell.displayName = 'SectionShell';

const SectionHeader = memo(function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8A7A81]">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#F5EEF0]">{title}</h2>
      {description && <HelperText className="mt-2 max-w-2xl">{description}</HelperText>}
    </div>
  );
});
SectionHeader.displayName = 'SectionHeader';

const SummaryValueCard = memo(function SummaryValueCard({
  label,
  value,
  detail,
  change,
  accent,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  change: string;
  accent: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="h-full border-white/8 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A7A81]">{label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#F5EEF0]" style={{ color: accent }}>
            {value}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03]" style={{ color: accent }}>
            <Icon size={18} />
          </span>
          <span className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#BCA8AE]">
            {change}
          </span>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-[#BCA8AE]">{detail}</p>
    </Card>
  );
});
SummaryValueCard.displayName = 'SummaryValueCard';

const PriorityCard = memo(function PriorityCard({ item, onNavigate }: { item: PriorityItem; onNavigate: (tab: string) => void; }) {
  const Icon = item.icon;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition-all duration-200 hover:border-white/12 hover:bg-white/[0.045]">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-[#E7C2C5]">
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold tracking-[-0.01em] text-[#F5EEF0]">{item.title}</p>
          <span className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#BCA8AE]">
            {item.due}
          </span>
        </div>
        <p className="mt-1 text-sm leading-6 text-[#9A8B92]">{item.detail}</p>
      </div>
      <button
        type="button"
        onClick={() => onNavigate(item.targetTab)}
        className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F3CBD0] transition-colors hover:text-white"
      >
        {item.action}
        <ArrowUpRight size={14} />
      </button>
    </div>
  );
});
PriorityCard.displayName = 'PriorityCard';

const RecommendationCard = memo(function RecommendationCard({
  item,
  onNavigate,
}: {
  item: RecommendationItem;
  onNavigate: (tab: string) => void;
}) {
  const Icon = item.icon;

  return (
    <Card className="group h-full border-white/8 bg-white/[0.03] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-white/12 hover:shadow-[0_24px_50px_rgba(0,0,0,0.25)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03]"
            style={{ color: item.accent }}
          >
            <Icon size={18} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A7A81]">AI Recommendation</p>
            <h3 className="mt-1 text-base font-semibold tracking-[-0.02em] text-[#F5EEF0]">{item.title}</h3>
          </div>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ background: `${item.accent}18`, color: item.accent }}
        >
          {item.impact}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-[#BCA8AE]">{item.detail}</p>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/6 pt-4">
        <span className="text-[#7A6A71]">Expected impact</span>
        <button
          type="button"
          onClick={() => onNavigate(item.targetTab)}
          className="inline-flex items-center gap-1 text-[#E7C2C5] transition-colors hover:text-[#F5EEF0]"
        >
          {item.action}
          <ArrowUpRight size={14} />
        </button>
      </div>
    </Card>
  );
});
RecommendationCard.displayName = 'RecommendationCard';

const OpportunityCard = memo(function OpportunityCard({
  item,
  onNavigate,
}: {
  item: OpportunityItem;
  onNavigate: (tab: string) => void;
}) {
  const Icon = item.icon;

  return (
    <Card className="group h-full border-white/8 bg-gradient-to-br from-white/[0.03] via-white/[0.025] to-transparent p-5 transition-all duration-200 hover:-translate-y-1 hover:border-white/12 hover:shadow-[0_24px_50px_rgba(0,0,0,0.25)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-[#E7C2C5]">
            <Icon size={18} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A7A81]">Opportunity</p>
            <h3 className="mt-1 text-base font-semibold tracking-[-0.02em] text-[#F5EEF0]">{item.title}</h3>
          </div>
        </div>
        <span className="rounded-full border border-[#C9747A]/20 bg-[#C9747A]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F3CBD0]">
          {item.expectedImpact}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-[#BCA8AE]">{item.detail}</p>
      <button
        type="button"
        onClick={() => onNavigate(item.targetTab)}
        className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#F3CBD0] transition-colors hover:text-white"
      >
        {item.action}
        <ArrowUpRight size={14} />
      </button>
    </Card>
  );
});
OpportunityCard.displayName = 'OpportunityCard';

const AlertRow = memo(function AlertRow({
  title,
  detail,
  accent,
  icon: Icon,
}: {
  title: string;
  detail: string;
  accent: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03]" style={{ color: accent }}>
        <Icon size={18} />
      </span>
      <div>
        <p className="font-semibold tracking-[-0.01em] text-[#F5EEF0]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[#9A8B92]">{detail}</p>
      </div>
    </div>
  );
});
AlertRow.displayName = 'AlertRow';

const ExecutiveMissionControl: React.FC<ExecutiveMissionControlProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const { timeRange } = useDashboard();
  const { metrics, loading, products, orders, customers } = useData();
  const [aiPaused, setAiPaused] = useState(false);

  const businessName = profile?.storeName || 'Glowify Workspace';
  const workspace = profile?.plan || 'Growth Workspace';
  const displayName = profile?.displayName || 'Operator';
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'morning' : currentHour < 18 ? 'afternoon' : 'evening';

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }).format(new Date()),
    [],
  );

  const revenueValue = metrics.revenue.value;
  const ordersValue = metrics.orders.value;
  const customersValue = metrics.customers.value;
  const revenueChange = metrics.revenue.change;
  const revenueDirection = metrics.revenue.trend;

  const lowStockProducts = useMemo(
    () => [...products].filter((product) => product.inventory <= 100).sort((a, b) => a.inventory - b.inventory),
    [products],
  );

  const topProduct = useMemo(
    () => [...products].sort((a, b) => b.revenue - a.revenue)[0] || null,
    [products],
  );

  const totalProfit = useMemo(() => Math.round(revenueValue * 0.34), [revenueValue]);
  const todayRevenue = useMemo(() => Math.round(revenueValue * 0.067), [revenueValue]);
  const weekRevenue = useMemo(() => Math.round(revenueValue * 0.31), [revenueValue]);
  const visitors = useMemo(() => Math.max(ordersValue * 18, 1200), [ordersValue]);
  const conversionRate = useMemo(() => (visitors ? (ordersValue / visitors) * 100 : 0), [visitors, ordersValue]);
  const averageOrderValue = useMemo(() => (ordersValue ? revenueValue / ordersValue : 0), [ordersValue, revenueValue]);
  const inventoryHealth = useMemo(
    () => clamp(96 - lowStockProducts.length * 10 + Math.min(8, Math.round(products.length * 0.8)), 42, 99),
    [lowStockProducts.length, products.length],
  );
  const marketingScore = useMemo(
    () => clamp(72 + (customersValue > 0 ? 6 : 0) + (revenueDirection === 'up' ? 8 : -6), 45, 98),
    [customersValue, revenueDirection],
  );
  const operationsScore = useMemo(
    () => clamp(74 + Math.min(12, ordersValue * 1.1) - lowStockProducts.length * 4, 46, 98),
    [lowStockProducts.length, ordersValue],
  );
  const revenueScore = useMemo(() => clamp(77 + revenueChange * 0.9, 50, 99), [revenueChange]);
  const aiScore = useMemo(() => clamp(aiPaused ? 68 : 91 - lowStockProducts.length * 2, 56, 99), [aiPaused, lowStockProducts.length]);
  const overallScore = useMemo(
    () => Math.round((revenueScore + marketingScore + operationsScore + inventoryHealth + aiScore) / 5),
    [aiScore, inventoryHealth, marketingScore, operationsScore, revenueScore],
  );

  const executiveSummary = useMemo(
    () => [
      {
        label: 'What is happening?',
        value: revenueDirection === 'up' ? 'Revenue is expanding' : 'Revenue is softening',
        detail: `${timeRange} shows ${formatCurrency(todayRevenue)} pacing for today, with ${formatCompact(ordersValue)} orders already in motion.`,
      },
      {
        label: 'Why is it happening?',
        value: topProduct?.title || 'Top product is driving demand',
        detail: topProduct
          ? `${topProduct.title} generated ${formatCurrency(topProduct.revenue)} and is the clearest demand signal.`
          : 'Current product demand is not yet concentrated enough to call a single driver.',
      },
      {
        label: 'What should happen next?',
        value: lowStockProducts.length > 0 ? 'Protect conversion with restock' : 'Scale what is working',
        detail: lowStockProducts.length > 0
          ? `${lowStockProducts[0].title} needs attention before it affects availability.`
          : 'Reinforce the highest-performing channel and repeat the winning offer.',
      },
      {
        label: 'Can AI execute it?',
        value: aiPaused ? 'AI is paused' : 'AI can execute now',
        detail: aiPaused
          ? 'Resume AI work to keep recommendations and automations flowing.'
          : 'Glowify can generate campaigns, detect risk, and prioritize actions automatically.',
      },
    ],
    [aiPaused, lowStockProducts, ordersValue, revenueDirection, timeRange, todayRevenue, topProduct],
  );

  const priorities = useMemo<PriorityItem[]>(
    () => [
      {
        title: 'Review the top revenue driver',
        detail: topProduct
          ? `Double down on ${topProduct.title} and keep it visible in the next promotion.`
          : 'Select the highest-performing product and move it into the next push.',
        due: 'Today',
        icon: Crown,
        action: 'Open growth',
        targetTab: 'growth',
      },
      {
        title: 'Approve the restock decision',
        detail: lowStockProducts.length > 0
          ? `${lowStockProducts[0].title} is approaching the reorder threshold.`
          : 'No urgent stockout risk is visible right now.',
        due: 'Today',
        icon: Truck,
        action: 'Open commerce',
        targetTab: 'commerce',
      },
      {
        title: 'Send the retention sequence',
        detail: 'Reach dormant and high-intent customers with a concise reactivation offer.',
        due: 'Today',
        icon: Mail,
        action: 'Open marketing',
        targetTab: 'marketing',
      },
      {
        title: 'Review AI work queue',
        detail: 'Validate campaign shifts and automation decisions before end of day.',
        due: 'Scheduled',
        icon: Sparkles,
        action: 'Open AI',
        targetTab: 'ai',
      },
    ],
    [lowStockProducts, topProduct],
  );

  const recommendations = useMemo<RecommendationItem[]>(
    () => [
      {
        title: 'Prioritize the winning SKU in email and paid',
        detail: 'Feature the top product in the next push so the business compounds the strongest signal.',
        impact: '+8-12% revenue lift',
        action: 'Apply',
        targetTab: 'growth',
        accent: '#10B981',
        icon: Megaphone,
      },
      {
        title: 'Recover carts with an AI-triggered flow',
        detail: `Glowify can recover the ${Math.max(12, Math.round(visitors * 0.08))} abandoned carts most likely to convert.`,
        impact: 'Reduced leakage',
        action: 'Enable',
        targetTab: 'automation',
        accent: '#C9747A',
        icon: ShoppingCart,
      },
      {
        title: 'Rebalance spend toward the highest-intent channel',
        detail: 'Move budget away from weaker traffic sources and protect blended ROAS.',
        impact: 'Higher ROAS',
        action: 'Review',
        targetTab: 'marketing',
        accent: '#8B4A6B',
        icon: Wallet,
      },
    ],
    [visitors],
  );

  const healthCards = useMemo<HealthItem[]>(
    () => [
      {
        label: 'Revenue Today',
        value: formatCurrency(todayRevenue),
        detail: 'Current pace for the selected period. Use this to judge whether the store is ahead or behind plan.',
        change: revenueDirection === 'up' ? `+${revenueChange.toFixed(0)}%` : `-${revenueChange.toFixed(0)}%`,
        accent: '#10B981',
        icon: Flame,
      },
      {
        label: 'Average Order Value',
        value: formatCurrency(averageOrderValue),
        detail: 'Shows how much revenue each order is worth. Increase this through bundles, upsells, and stronger offers.',
        change: '+3%',
        accent: '#C9747A',
        icon: Crown,
      },
      {
        label: 'Conversion Rate',
        value: `${conversionRate.toFixed(1)}%`,
        detail: 'Measures how efficiently traffic turns into revenue. This is the lever behind scaling spend safely.',
        change: '+0.4%',
        accent: '#8B4A6B',
        icon: Target,
      },
      {
        label: 'Inventory Health',
        value: `${inventoryHealth}%`,
        detail: 'Signals how much operational risk is sitting in the catalog. Low stock here can suppress conversion quickly.',
        change: lowStockProducts.length > 0 ? `${lowStockProducts.length} risks` : 'Stable',
        accent: '#F59E0B',
        icon: Gauge,
      },
    ],
    [averageOrderValue, conversionRate, inventoryHealth, lowStockProducts.length, revenueChange, revenueDirection, todayRevenue],
  );

  const opportunities = useMemo<OpportunityItem[]>(
    () => [
      {
        title: 'Scale the best-performing product',
        detail: topProduct
          ? `${topProduct.title} is already leading revenue. It should be the next campaign anchor.`
          : 'The top product signal is not yet strong enough, so the next promotion should be selective.',
        expectedImpact: 'Revenue growth',
        action: 'Push more traffic',
        targetTab: 'growth',
        icon: ShoppingCart,
      },
      {
        title: 'Protect the next stockout',
        detail: lowStockProducts.length > 0
          ? `${lowStockProducts[0].title} needs a reorder decision before it becomes a conversion problem.`
          : 'No immediate stockout risk is visible, so focus can stay on growth.',
        expectedImpact: 'Conversion saved',
        action: 'Review stock',
        targetTab: 'commerce',
        icon: Package,
      },
      {
        title: 'Re-activate dormant customers',
        detail: customersValue > 0
          ? `${Math.max(1, Math.round(customersValue * 0.22))} VIP customers are ready for retention outreach.`
          : 'Customer signals are still building, so AI should watch for stronger segments.',
        expectedImpact: 'Higher LTV',
        action: 'Launch recovery',
        targetTab: 'customers',
        icon: Users,
      },
    ],
    [customersValue, lowStockProducts, topProduct],
  );

  const alerts = useMemo(
    () => [
      {
        title: aiPaused ? 'AI is paused for review' : 'AI queue is live',
        detail: aiPaused
          ? 'Resume execution to keep recommendations and automations active.'
          : 'The AI workforce is analyzing revenue and operational signals continuously.',
        accent: aiPaused ? '#F59E0B' : '#10B981',
        icon: aiPaused ? Pause : Sparkles,
      },
      {
        title: lowStockProducts.length > 0 ? 'Inventory needs attention' : 'Inventory is stable',
        detail: lowStockProducts.length > 0
          ? `${lowStockProducts[0].title} is the main risk item in the catalog.`
          : 'No critical stock issues are threatening conversion right now.',
        accent: '#F59E0B',
        icon: Package,
      },
      {
        title: 'Revenue opportunity available now',
        detail: `There is ${formatCurrency(weekRevenue)} in weekly revenue momentum to reinforce with the next action.`,
        accent: '#C9747A',
        icon: Rocket,
      },
    ],
    [aiPaused, lowStockProducts, weekRevenue],
  );

  const businessSignals = useMemo(
    () => [
      { label: 'Revenue', value: formatCurrency(revenueValue), accent: '#10B981' },
      { label: 'Orders', value: formatCompact(ordersValue), accent: '#C9747A' },
      { label: 'Customers', value: formatCompact(customersValue), accent: '#8B4A6B' },
      { label: 'Profit', value: formatCurrency(totalProfit), accent: '#F59E0B' },
    ],
    [customersValue, ordersValue, revenueValue, totalProfit],
  );

  const pauseAction = useCallback(() => setAiPaused((value) => !value), []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 lg:space-y-10">
      <SectionShell className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
        <Card className="relative overflow-hidden border-white/8 bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-transparent p-6 lg:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,116,122,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(139,74,107,0.12),transparent_26%)]" />
          <div className="relative z-10 flex h-full flex-col gap-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8A7A81]">Executive Briefing</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#F5EEF0] lg:text-5xl">
                  Good {greeting}, {displayName}.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[#BCA8AE] lg:text-lg">
                  {businessName} is operating from the {workspace} workspace. Glowify is monitoring revenue, customer demand, and operations in real time across the {timeRange.toLowerCase()} view.
                </p>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A7A81]">Today</p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#F5EEF0]">{dateLabel}</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.7)]" />
                  AI status: active
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {businessSignals.map((signal) => (
                <div key={signal.label} className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A7A81]">{signal.label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#F5EEF0]" style={{ color: signal.accent }}>
                    {signal.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 lg:grid-cols-4">
              {executiveSummary.map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A7A81]">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold tracking-[-0.02em] text-[#F5EEF0]">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-[#A8969C]">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="relative flex flex-col justify-between border-white/8 bg-white/[0.03] p-6 lg:p-8">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8A7A81]">Executive Health</p>
                <p className="mt-3 text-5xl font-semibold tracking-[-0.06em] text-[#F5EEF0]">{overallScore}</p>
              </div>
              <span className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                AI workforce live
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {alerts.map((alert) => (
                <AlertRow key={alert.title} title={alert.title} detail={alert.detail} accent={alert.accent} icon={alert.icon} />
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={pauseAction}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 text-sm font-semibold text-[#F5EEF0] transition-all hover:border-white/12 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9747A]/70"
            >
              {aiPaused ? <Play size={16} /> : <Pause size={16} />}
              {aiPaused ? 'Resume AI' : 'Pause AI'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('automation')}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#C9747A] to-[#8B4A6B] px-4 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(201,116,122,0.22)] transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9747A]/70"
            >
              Manage AI
              <ArrowUpRight size={16} />
            </button>
          </div>
        </Card>
      </SectionShell>

      <SectionShell className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-white/8 bg-white/[0.03] p-6 lg:p-8">
          <SectionHeader
            eyebrow="Today's Priorities"
            title="What the merchant should do next"
            description="These are the highest-leverage decisions to make before the next revenue window closes."
          />
          <div className="mt-5 space-y-3">
            {priorities.map((item) => (
              <PriorityCard key={item.title} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        </Card>

        <Card className="border-white/8 bg-white/[0.03] p-6 lg:p-8">
          <SectionHeader
            eyebrow="AI Recommendations"
            title="What Glowify can solve automatically"
            description="The AI layer should not wait for prompts. It should keep identifying, prioritizing, and executing work."
          />
          <div className="mt-5 grid gap-4">
            {recommendations.map((item) => (
              <RecommendationCard key={item.title} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        </Card>
      </SectionShell>

      <SectionShell className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-white/8 bg-white/[0.03] p-6 lg:p-8">
          <SectionHeader
            eyebrow="Revenue Health"
            title="Money, momentum, and operational risk"
            description="This is the compact executive view of revenue performance and the signals influencing it."
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {healthCards.map((item) => (
              <SummaryValueCard
                key={item.label}
                label={item.label}
                value={item.value}
                detail={item.detail}
                change={item.change}
                accent={item.accent}
                icon={item.icon}
              />
            ))}
          </div>
        </Card>

        <Card className="border-white/8 bg-white/[0.03] p-6 lg:p-8">
          <SectionHeader
            eyebrow="Growth Opportunities"
            title="Where the next dollars are hiding"
            description="These cards surface the best near-term opportunities to increase revenue, margin, and retention."
          />
          <div className="mt-5 space-y-4">
            {opportunities.map((item) => (
              <OpportunityCard key={item.title} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        </Card>
      </SectionShell>

      <SectionShell>
        <Card className="border-white/8 bg-white/[0.03] p-6 lg:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8A7A81]">Business Context</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#F5EEF0]">Everything else compressed into a clean executive summary</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {([
              { label: 'Revenue', value: formatCurrency(revenueValue), icon: Wallet },
              { label: 'Orders', value: formatCompact(ordersValue), icon: ShoppingCart },
              { label: 'Customers', value: formatCompact(customersValue), icon: BriefcaseBusiness },
              { label: 'Inventory risks', value: String(lowStockProducts.length), icon: Package },
            ]).map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A7A81]">{item.label}</p>
                    <Icon size={16} className="text-[#8A7A81]" />
                  </div>
                  <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#F5EEF0]">{item.value}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </SectionShell>
    </div>
  );
};

export default memo(ExecutiveMissionControl);

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <Card className="h-full border-white/8 bg-white/[0.03] p-5">
      <Skeleton h={12} w={120} r={999} />
      <div className="mt-5 space-y-3">
        <Skeleton h={18} w="80%" r={10} />
        <Skeleton h={12} w="60%" r={10} />
        <Skeleton h={12} w="72%" r={10} />
      </div>
    </Card>
  );
});
