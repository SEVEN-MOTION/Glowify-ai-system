import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { ArrowUpRight, Search, Sparkles, ChevronRight } from 'lucide-react';
import { MetricCard } from '../MetricCard';
import { Card, CardHeader, HelperText } from '../CommonUI';

const ROAS_METRICS = [
  { label: 'Paid ROAS', value: '4.2x', change: '+0.5x', trend: 'up' as const },
  { label: 'Email ROAS', value: '7.8x', change: '+1.2x', trend: 'up' as const },
  { label: 'SEO ROAS', value: '3.9x', change: '+0.2x', trend: 'up' as const },
  { label: 'Campaign ROAS', value: '5.1x', change: '+0.4x', trend: 'up' as const },
];

const CAMPAIGNS = [
  {
    id: 'growth-1',
    name: 'Summer Glow Serum Launch',
    channel: 'Meta Ads',
    spend: 4200,
    revenue: 18400,
    roas: 4.38,
    status: 'Live',
    progress: 78,
  },
  {
    id: 'growth-2',
    name: 'Retargeting VIP Audience',
    channel: 'Google',
    spend: 2800,
    revenue: 14600,
    roas: 5.21,
    status: 'Optimizing',
    progress: 64,
  },
  {
    id: 'growth-3',
    name: 'Email VIP Reengagement',
    channel: 'Klaviyo',
    spend: 560,
    revenue: 9200,
    roas: 16.4,
    status: 'Draft',
    progress: 42,
  },
];

const EMAIL_PERFORMANCE = [
  { name: 'Welcome', open: 48, ctr: 11 },
  { name: 'VIP Flash', open: 61, ctr: 18 },
  { name: 'Abandoned Cart', open: 52, ctr: 14 },
  { name: 'Weekend Sale', open: 39, ctr: 9 },
];

const SEO_OPPORTUNITIES = [
  { id: 'seo-1', title: 'Boost "Glow Serum" ranking', detail: 'Target long-tail keywords in product descriptions and supporting blogs.', impact: 'High' },
  { id: 'seo-2', title: 'Optimize category landing page', detail: 'Improve internal links and schema markup for best-selling treatments.', impact: 'Medium' },
  { id: 'seo-3', title: 'Capture branded search intent', detail: 'Add FAQ and how-to content for repeat purchase intent.', impact: 'Low' },
];

const AI_RECOMMENDATIONS = [
  { id: 'rec-1', title: 'Launch email winback immediately', detail: 'Target customers inactive for 21+ days with a limited-time offer.', confidence: 86 },
  { id: 'rec-2', title: 'Increase Meta budgets for top SKU', detail: 'Shift 12% of spend to the highest-performing creative set.', confidence: 78 },
  { id: 'rec-3', title: 'Promote SEO-rich content', detail: 'Publish a “Best skincare routine” guide to capture search demand.', confidence: 69 },
];

const emailData = EMAIL_PERFORMANCE.map((item, index) => ({
  name: item.name,
  opens: item.open,
  ctr: item.ctr,
  idx: index,
}));

function GrowthView() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8A7A81]">Growth Center</p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#F5EEF0]">Revenue acceleration and campaign health</h1>
          <p className="mt-3 max-w-2xl text-sm text-[#BCA8AE]">Monitor return on ad spend, campaign momentum, email effectiveness, and SEO opportunity signals in one executive growth surface.</p>
        </div>
        <button className="inline-flex items-center gap-2 self-start rounded-2xl bg-[#C9747A] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(201,116,122,0.22)] transition hover:-translate-y-0.5">
          <ArrowUpRight size={16} /> Launch campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {ROAS_METRICS.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <CardHeader className="text-lg">Campaign Performance</CardHeader>
                <HelperText>Active growth campaigns and return on spend.</HelperText>
              </div>
              <span className="rounded-full border border-[#C9747A]/20 bg-[#C9747A]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F3CBD0]">Live</span>
            </div>
            <div className="space-y-4">
              {CAMPAIGNS.map((campaign) => (
                <div key={campaign.id} className="rounded-3xl border border-[#231820] bg-[#100D10] p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#F5EEF0]">{campaign.name}</p>
                      <p className="text-[11px] text-[#6B6B88] mt-1">{campaign.channel} • {campaign.status}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[11px] text-[#6B6B88]">ROAS {campaign.roas.toFixed(2)}x</span>
                      <span className="text-[11px] text-[#6B6B88]">Spend ${campaign.spend.toLocaleString()}</span>
                      <span className="text-[11px] text-[#10B981] font-semibold">Revenue ${campaign.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-4 h-3 rounded-full bg-[#080608] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#C9747A] to-[#8B4A6B]" style={{ width: `${campaign.progress}%` }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-[#6B6B88]"><span>Progress</span><span>{campaign.progress}%</span></div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <CardHeader className="text-lg">Email Performance</CardHeader>
                <HelperText>Engagement and conversion signals from recent campaigns.</HelperText>
              </div>
              <div className="rounded-full border border-[#10B981]/15 bg-[#10B981]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#10B981]">Email-first</div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={emailData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#8A7A81', fontSize: 11 }} />
                  <YAxis width={34} tickLine={false} axisLine={false} tick={{ fill: '#8A7A81', fontSize: 11 }} />
                  <Tooltip wrapperStyle={{ background: '#0D0D1A', border: '1px solid #1E1E3A', borderRadius: 16, color: '#F5EEF0' }} />
                  <Line type="monotone" dataKey="opens" stroke="#C9747A" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="ctr" stroke="#10B981" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {EMAIL_PERFORMANCE.map((item) => (
                <div key={item.name} className="rounded-3xl border border-[#231820] bg-[#080608] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#6B6B88]">{item.name}</p>
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-2xl font-black text-[#F5EEF0]">{item.open}%</p>
                      <p className="text-[11px] text-[#6B6B88]">Open rate</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-[#C9747A]">{item.ctr}%</p>
                      <p className="text-[11px] text-[#6B6B88]">CTR</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <CardHeader className="text-lg">SEO Opportunities</CardHeader>
                <HelperText>High-value SEO plays to amplify organic growth.</HelperText>
              </div>
              <Search size={18} className="text-[#C9747A]" />
            </div>
            <div className="space-y-4">
              {SEO_OPPORTUNITIES.map((opportunity) => (
                <div key={opportunity.id} className="rounded-3xl border border-[#231820] bg-[#100D10] p-4">
                  <p className="text-sm font-semibold text-[#F5EEF0]">{opportunity.title}</p>
                  <p className="text-[12px] text-[#BCA8AE] mt-2">{opportunity.detail}</p>
                  <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-[#6B6B88]">
                    <span>Impact: {opportunity.impact}</span>
                    <button className="inline-flex items-center gap-2 text-[#C9747A] hover:text-white">
                      Explore
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <CardHeader className="text-lg">AI Recommendations</CardHeader>
                <HelperText>Suggested growth moves that should be reviewed first.</HelperText>
              </div>
              <Sparkles size={18} className="text-[#C9747A]" />
            </div>
            <div className="space-y-4">
              {AI_RECOMMENDATIONS.map((recommendation) => (
                <div key={recommendation.id} className="rounded-3xl border border-[#231820] bg-[#100D10] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[#F5EEF0]">{recommendation.title}</p>
                      <p className="text-[12px] text-[#BCA8AE] mt-2">{recommendation.detail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-300 font-semibold">{recommendation.confidence}%</p>
                      <p className="text-[10px] text-[#6B6B88] uppercase tracking-[0.18em] mt-1">Confidence</p>
                    </div>
                  </div>
                  <button className="mt-4 w-full rounded-2xl bg-[#C9747A] px-4 py-3 text-[12px] font-semibold text-white hover:bg-[#D4A0A3] transition-all">Review recommendation</button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default GrowthView;
