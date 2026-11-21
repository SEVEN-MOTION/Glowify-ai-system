import React, { useEffect, useState } from 'react';
import { Activity, AlertCircle, ArrowRight, Bot, CalendarDays, Clock3, Package, Plug, ShoppingBag, Sparkles, Store, TrendingUp, Users } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../contexts/AuthContext';

type ShopifySummary = {
  periodStart: string;
  periodEnd: string;
  currency: string | null;
  paidOrderCount: number | null;
  productsCount: number | null;
  paidSalesTotal: number | null;
  averageOrderValue: number | null;
  salesByDay: Array<{ day: string; sales: number }>;
  historyComplete: boolean;
};
type ShopifyOverview = {
  status: 'not_connected' | 'connected' | 'reconnect_required' | 'connection_unavailable' | 'temporarily_unavailable';
  store?: { domain: string; name?: string; connectedAt?: string | null };
  summary?: ShopifySummary;
  source?: string;
  syncedAt?: string;
  availableStores?: Array<{ domain: string; name: string }>;
};

const SAMPLE_METRICS = [
  { label: 'Gross sales', value: 'US$48,250', change: '+12.4%', note: 'vs previous period · sample', icon: TrendingUp },
  { label: 'Orders', value: '1,284', change: '+8.1%', note: 'vs previous period · sample', icon: ShoppingBag },
  { label: 'Average order value', value: 'US$37.58', change: '+3.7%', note: 'vs previous period · sample', icon: Package },
  { label: 'Returning customers', value: '32%', change: '+2.2 pts', note: 'vs previous period · sample', icon: Users },
];

const SAMPLE_SALES = [
  { day: '1 Nov', sales: 8300 }, { day: '6 Nov', sales: 10400 }, { day: '11 Nov', sales: 9100 },
  { day: '16 Nov', sales: 12700 }, { day: '21 Nov', sales: 11600 }, { day: '26 Nov', sales: 14900 },
];

const SAMPLE_ACTIVITY = [
  { icon: ShoppingBag, title: 'Order received', detail: 'Hydrating serum · Sample event', time: '10:42 AM', tone: 'rose' },
  { icon: Package, title: 'Stock review needed', detail: 'Vitamin C serum · Sample alert', time: '9:18 AM', tone: 'amber' },
  { icon: Activity, title: 'Campaign summary ready', detail: 'Welcome series · Sample event', time: 'Yesterday', tone: 'blue' },
];

const card = 'rounded-2xl border border-[#1E1E3A] bg-[#100D10] p-5 shadow-sm';
const sub = 'text-xs text-[#8A7A81]';

function formatMoney(amount: number | null, currency: string | null) {
  if (amount === null || !currency) return '—';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString()}`;
  }
}

function statusLabel(status: ShopifyOverview['status'] | undefined) {
  if (status === 'connected') return 'Connected';
  if (status === 'reconnect_required') return 'Reconnect required';
  if (status === 'temporarily_unavailable' || status === 'connection_unavailable') return 'Status unavailable';
  return 'Not connected';
}

export const OverviewPreview: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [overview, setOverview] = useState<ShopifyOverview | null>(null);
  const [selectedStore, setSelectedStore] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user) {
        setOverview(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError(false);
      try {
        const token = await user.getIdToken();
        const query = selectedStore ? `?shop=${encodeURIComponent(selectedStore)}` : '';
        const response = await fetch(`/api/shopify/overview${query}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (!response.ok) throw new Error('Shopify status could not be loaded');
        const result = await response.json() as ShopifyOverview;
        if (!cancelled) {
          setOverview(result);
          if (result.store?.domain && result.store.domain !== selectedStore) setSelectedStore(result.store.domain);
        }
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [user, selectedStore]);

  const connected = overview?.status === 'connected' && Boolean(overview.summary);
  const sampleMode = !loading && !loadError && overview?.status === 'not_connected';
  const liveMetrics = connected && overview.summary ? [
    { label: 'Paid sales', value: formatMoney(overview.summary.paidSalesTotal, overview.summary.currency), change: '', note: overview.summary.historyComplete ? 'paid orders · last 30 days' : 'history is incomplete', icon: TrendingUp },
    { label: 'Paid orders', value: overview.summary.paidOrderCount?.toLocaleString() ?? '—', change: '', note: 'last 30 days', icon: ShoppingBag },
    { label: 'Products', value: overview.summary.productsCount?.toLocaleString() ?? '—', change: '', note: 'in Shopify catalog', icon: Package },
    { label: 'Average order value', value: formatMoney(overview.summary.averageOrderValue, overview.summary.currency), change: '', note: overview.summary.historyComplete ? 'paid orders · last 30 days' : 'available when history is complete', icon: Users },
  ] : null;
  const metrics = liveMetrics ?? SAMPLE_METRICS;
  const salesData = connected ? overview?.summary?.salesByDay ?? [] : SAMPLE_SALES;
  const salesLabel = connected ? 'Shopify paid sales' : 'Sample sales';
  const storeName = overview?.store?.name || overview?.store?.domain || '';

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9747A]">Overview</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#F5EEF0] sm:text-3xl">Store performance</h1>
          <p className="mt-1 text-sm text-[#BCA8AE]">A clear view of sales, store health, and the next useful action.</p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#1E1E3A] bg-[#0F0F1E] px-3 py-2 text-xs text-[#C2B4B9]">
          <CalendarDays size={15} aria-hidden="true" /> {connected ? 'Last 30 days · Shopify' : 'Example period: last 30 days'}
        </div>
      </section>

      <section aria-label="Store connection status" className="flex flex-col gap-4 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 rounded-lg bg-amber-400/10 p-2 text-amber-300"><Store size={18} aria-hidden="true" /></span>
          <div>
            <p className="text-sm font-semibold text-[#F5EEF0]">{loading ? 'Checking store connection…' : loadError ? 'Store status is unavailable' : connected ? `Shopify connected · ${storeName}` : overview?.status === 'reconnect_required' ? 'Shopify needs to be reconnected' : overview?.status === 'temporarily_unavailable' || overview?.status === 'connection_unavailable' ? 'Shopify data is temporarily unavailable' : 'Shopify store not connected'}</p>
            <p className="mt-1 text-xs text-[#BCA8AE]">{connected ? `Live read-only data · refreshed ${overview?.syncedAt ? new Date(overview.syncedAt).toLocaleTimeString() : 'now'}` : sampleMode ? 'Connect when your store is ready. This preview works without connecting a store.' : 'No live store data is shown until the connection can be verified.'}</p>
          </div>
        </div>
        {overview?.availableStores && overview.availableStores.length > 1 && (
          <label className="flex shrink-0 items-center gap-2 text-xs text-[#C2B4B9]">Store
            <select aria-label="Choose connected Shopify store" value={selectedStore || overview.store?.domain || ''} onChange={event => setSelectedStore(event.target.value)} className="rounded-lg border border-[#1E1E3A] bg-[#0F0F1E] px-3 py-2 text-xs text-[#F5EEF0]">
              {overview.availableStores.map(store => <option key={store.domain} value={store.domain}>{store.name}</option>)}
            </select>
          </label>
        )}
        <button type="button" onClick={() => onNavigate('settings')} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#C9747A]/40 px-3 py-2 text-xs font-semibold text-[#F3CBD0] hover:bg-[#C9747A]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A0A3]">
          {connected ? 'Manage connection' : 'Connect Shopify'} <ArrowRight size={14} aria-hidden="true" />
        </button>
      </section>

      {sampleMode ? (
        <div role="note" className="flex items-start gap-3 rounded-xl border border-[#C9747A]/25 bg-[#C9747A]/[0.07] px-4 py-3 text-xs text-[#DCC7CC]">
          <Sparkles size={16} className="mt-0.5 shrink-0 text-[#D4A0A3]" aria-hidden="true" />
          <p><strong className="font-semibold text-[#F5EEF0]">Preview data.</strong> All figures, trends, alerts, and activity below are illustrative examples. They do not come from your store and no actions can run from this preview.</p>
        </div>
      ) : connected ? (
        <div role="note" className="flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-3 text-xs text-[#DCC7CC]">
          <Plug size={16} className="mt-0.5 shrink-0 text-emerald-300" aria-hidden="true" />
          <p><strong className="font-semibold text-[#F5EEF0]">Live Shopify data.</strong> Sales, paid orders, and product count come from Shopify. Activity and suggested review below remain labeled examples until their live feeds are available.</p>
        </div>
      ) : null}

      <section aria-labelledby="sample-metrics-title">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div><h2 id="sample-metrics-title" className="text-sm font-semibold text-[#F5EEF0]">Performance snapshot</h2><p className={sub}>{connected ? `Verified Shopify data · ${overview?.summary?.historyComplete ? 'last 30 days' : 'partial order history'}` : 'Illustrative sample · USD · last 30 days'}</p></div>
          <button type="button" onClick={() => onNavigate('analytics')} className="text-xs font-medium text-[#D4A0A3] hover:underline">View analytics</button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, change, note, icon: Icon }) => (
            <article key={label} className={card}>
              <div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-[#BCA8AE]">{label}</p><Icon size={17} className="text-[#D4A0A3]" aria-hidden="true" /></div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-[#F5EEF0]">{value}</p>
              <p className="mt-2 text-[11px]">{change && <span className="font-semibold text-emerald-300">{change}</span>}<span className={change ? 'ml-1 text-[#8A7A81]' : 'text-[#8A7A81]'}>{note}</span></p>
            </article>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(290px,0.85fr)]">
        <section className={card} aria-labelledby="sales-trend-title">
          <div className="mb-4 flex items-start justify-between gap-3"><div><h2 id="sales-trend-title" className="text-sm font-semibold text-[#F5EEF0]">Sales trend</h2><p className={sub}>{connected ? 'Daily paid sales · last 30 days' : 'Example daily totals · not connected data'}</p></div><span className="rounded-full border border-[#1E1E3A] px-2.5 py-1 text-[10px] text-[#BCA8AE]">{connected ? 'Shopify' : 'Sample chart'}</span></div>
          {salesData.length ? <div className="h-[230px] w-full" role="img" aria-label={connected ? 'Verified Shopify paid sales trend over the last 30 days' : 'Illustrative sample sales trend chart over the last 30 days'}>
            <ResponsiveContainer width="100%" height="100%"><AreaChart data={salesData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs><linearGradient id="sampleSalesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C9747A" stopOpacity={0.32} /><stop offset="95%" stopColor="#C9747A" stopOpacity={0.02} /></linearGradient></defs>
              <CartesianGrid stroke="#2a2026" strokeDasharray="3 4" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#BCA8AE', fontSize: 11 }} tickFormatter={value => connected ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : value} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#BCA8AE', fontSize: 10 }} tickFormatter={value => connected && overview?.summary?.currency ? `${overview.summary.currency} ${Number(value).toLocaleString()}` : 'US$' + (value / 1000).toFixed(0) + 'k'} />
              <Tooltip formatter={value => [connected && overview?.summary?.currency ? `${overview.summary.currency} ${Number(value).toLocaleString()}` : 'US$' + Number(value).toLocaleString(), salesLabel]} contentStyle={{ background: '#100D10', border: '1px solid #392b32', borderRadius: 10, color: '#F5EEF0' }} />
              <Area type="monotone" dataKey="sales" stroke="#C9747A" strokeWidth={2.5} fill="url(#sampleSalesFill)" activeDot={{ r: 5, fill: '#C9747A' }} />
            </AreaChart></ResponsiveContainer>
          </div> : <div className="flex h-[230px] items-center justify-center rounded-xl border border-dashed border-[#392b32] text-center text-xs text-[#8A7A81]">Complete sales history is not available yet.<br />No partial total is shown.</div>}
          <p className="mt-2 text-[10px] text-[#8A7A81]">{connected ? 'Source: Shopify Admin API · no estimated values' : 'Example data only · source and period labels stay visible with live data.'}</p>
        </section>

        <section className={card} aria-labelledby="connection-title">
          <div className="mb-4"><h2 id="connection-title" className="text-sm font-semibold text-[#F5EEF0]">Integration status</h2><p className={sub}>Connection state from available backend checks</p></div>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[#1E1E3A] bg-[#0a0a0b] p-3">
              <div className="flex items-center gap-3"><span className="rounded-lg bg-[#C9747A]/10 p-2 text-[#D4A0A3]"><Store size={16} aria-hidden="true" /></span><div><p className="text-xs font-semibold text-[#F5EEF0]">Shopify</p><p className="text-[10px] text-[#8A7A81]">{loading ? 'Checking OAuth and store access' : loadError ? 'Backend status could not be checked' : connected ? `Verified · ${overview?.store?.domain}` : statusLabel(overview?.status)}</p></div></div>
              <span className="rounded-full bg-amber-400/10 px-2 py-1 text-[10px] font-semibold text-amber-300">{loading ? 'Checking' : loadError ? 'Unavailable' : statusLabel(overview?.status)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[#1E1E3A] bg-[#0a0a0b] p-3">
              <div className="flex items-center gap-3"><span className="rounded-lg bg-blue-400/10 p-2 text-blue-300"><Plug size={16} aria-hidden="true" /></span><div><p className="text-xs font-semibold text-[#F5EEF0]">Klaviyo</p><p className="text-[10px] text-[#8A7A81]">Connection is not verified in this app</p></div></div>
              <span className="rounded-full bg-slate-400/10 px-2 py-1 text-[10px] font-semibold text-[#BCA8AE]">Not connected</span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[#1E1E3A] bg-[#0a0a0b] p-3">
              <div className="flex items-center gap-3"><span className="rounded-lg bg-violet-400/10 p-2 text-violet-300"><Bot size={16} aria-hidden="true" /></span><div><p className="text-xs font-semibold text-[#F5EEF0]">AI assistant</p><p className="text-[10px] text-[#8A7A81]">Server availability depends on app configuration</p></div></div>
              <span className="rounded-full bg-slate-400/10 px-2 py-1 text-[10px] font-semibold text-[#BCA8AE]">Check Settings</span>
            </div>
          </div>
          <button type="button" onClick={() => onNavigate('settings')} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#D4A0A3] hover:underline">Review integrations <ArrowRight size={14} aria-hidden="true" /></button>
          <p className="mt-3 text-[10px] text-[#8A7A81]">A saved credential alone does not confirm that an integration is healthy.</p>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className={card} aria-labelledby="activity-title">
          <div className="mb-3 flex items-center justify-between gap-3"><div><h2 id="activity-title" className="text-sm font-semibold text-[#F5EEF0]">Recent activity</h2><p className={sub}>Example events · not a live activity feed</p></div><button type="button" onClick={() => onNavigate('activity')} className="text-xs text-[#D4A0A3] hover:underline">View activity</button></div>
          <ul className="divide-y divide-[#231820]">{SAMPLE_ACTIVITY.map(({ icon: Icon, title, detail, time, tone }) => (
            <li key={title} className="flex items-center gap-3 py-3"><span className={'rounded-lg p-2 ' + (tone === 'amber' ? 'bg-amber-400/10 text-amber-300' : tone === 'blue' ? 'bg-blue-400/10 text-blue-300' : 'bg-[#C9747A]/10 text-[#D4A0A3]')}><Icon size={15} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-[#F5EEF0]">{title}</span><span className="block truncate text-[10px] text-[#8A7A81]">{detail}</span></span><span className="shrink-0 text-[10px] text-[#8A7A81]">{time}</span></li>
          ))}</ul>
        </section>

        <section className={card} aria-labelledby="recommendation-title">
          <div className="mb-3 flex items-center justify-between gap-3"><div><h2 id="recommendation-title" className="text-sm font-semibold text-[#F5EEF0]">Suggested review</h2><p className={sub}>Example AI suggestion · preview only</p></div><Sparkles size={17} className="text-[#D4A0A3]" aria-hidden="true" /></div>
          <div className="rounded-xl border border-[#1E1E3A] bg-[#0a0a0b] p-4"><div className="flex items-center gap-2"><AlertCircle size={16} className="text-amber-300" aria-hidden="true" /><p className="text-xs font-semibold text-[#F5EEF0]">Review low-stock products</p></div><p className="mt-2 text-xs leading-5 text-[#BCA8AE]">Example: check items with less than two weeks of stock before the next campaign.</p><div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-[#8A7A81]"><span className="rounded-full bg-[#C9747A]/10 px-2 py-1 text-[#D4A0A3]">Example inventory signal</span><span>Source: sample product list</span></div></div>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-[#8A7A81]"><Clock3 size={13} aria-hidden="true" /> Example recommendation only · no action has run</div>
        </section>
      </div>
    </div>
  );
};
