import React, { memo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { motion } from 'framer-motion';
import { Card, CardHeader, HelperText } from '../CommonUI';
import { DS } from '../../theme';

export interface MissionControlSeriesPoint {
  label: string;
  value: number;
}

interface MissionControlChartsProps {
  revenueSeries: MissionControlSeriesPoint[];
  ordersSeries: MissionControlSeriesPoint[];
  aiSeries: MissionControlSeriesPoint[];
  reducedMotion: boolean;
}

const tooltipStyle = {
  contentStyle: {
    background: '#0D0D1A',
    border: '1px solid #1E1E3A',
    borderRadius: '16px',
    color: DS.text.primary,
    boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
  },
  labelStyle: {
    color: DS.text.muted,
    fontSize: '11px',
    fontWeight: 600,
  },
  itemStyle: {
    color: DS.text.primary,
    fontSize: '12px',
  },
};

const ChartShell: React.FC<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
}> = memo(({ title, subtitle, children }) => (
  <Card className="h-full border-white/8 bg-white/[0.025] p-5 lg:p-6">
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <CardHeader className="text-base lg:text-lg">{title}</CardHeader>
        <HelperText className="mt-1">{subtitle}</HelperText>
      </div>
      <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#BCA8AE]">
        Live
      </span>
    </div>
    <div className="h-[240px] lg:h-[280px]">{children}</div>
  </Card>
));
ChartShell.displayName = 'ChartShell';

const MissionControlCharts: React.FC<MissionControlChartsProps> = ({
  revenueSeries,
  ordersSeries,
  aiSeries,
  reducedMotion,
}) => {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: reducedMotion ? 0 : 0.35 }}
      >
        <ChartShell title="Revenue" subtitle="Trailing business momentum">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueSeries} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9747A" stopOpacity={0.34} />
                  <stop offset="95%" stopColor="#C9747A" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.045)" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={12} tick={{ fill: '#8A7A81', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tickMargin={12} tick={{ fill: '#8A7A81', fontSize: 11 }} width={36} />
              <Tooltip {...tooltipStyle} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#C9747A"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                isAnimationActive={!reducedMotion}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartShell>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: reducedMotion ? 0 : 0.35, delay: 0.05 }}
      >
        <ChartShell title="Orders" subtitle="Fulfillment and demand cadence">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ordersSeries} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.045)" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={12} tick={{ fill: '#8A7A81', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tickMargin={12} tick={{ fill: '#8A7A81', fontSize: 11 }} width={36} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#8B4A6B" isAnimationActive={!reducedMotion} />
            </BarChart>
          </ResponsiveContainer>
        </ChartShell>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: reducedMotion ? 0 : 0.35, delay: 0.1 }}
      >
        <ChartShell title="AI Activity" subtitle="Actions completed by your AI workforce">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={aiSeries} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.045)" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={12} tick={{ fill: '#8A7A81', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tickMargin={12} tick={{ fill: '#8A7A81', fontSize: 11 }} width={36} />
              <Tooltip {...tooltipStyle} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={!reducedMotion}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartShell>
      </motion.div>
    </div>
  );
};

export default memo(MissionControlCharts);
