'use client';

import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { DailyRecord, TimeRange } from '@/lib/types';
import {
  filterByRange,
  buildCumulative,
  formatDateLabel,
  formatNumber,
  formatUSD,
} from '@/lib/utils';
import TimeRangePicker from './TimeRangePicker';

interface Props {
  records: DailyRecord[];
  dataKey: 'seda' | 'usd';
  title: string;
  animClass?: string;
}

const BarTooltip = ({ active, payload, dataKey }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: 'rgba(17, 17, 20, 0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        padding: '8px 12px',
        fontSize: 12,
        backdropFilter: 'blur(8px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <p style={{ color: '#71717a', marginBottom: 4, fontSize: 11 }}>{d.date}</p>
      <p style={{ color: '#fff', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
        {dataKey === 'usd' ? formatUSD(d.usd) : formatNumber(d.seda) + ' SEDA'}
      </p>
      {d.price != null && (
        <p style={{ color: '#52525b', marginTop: 2, fontSize: 10 }}>
          SEDA price: ${d.price.toFixed(4)}
        </p>
      )}
    </div>
  );
};

const CumTooltip = ({ active, payload, dataKey }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const cumKey = dataKey === 'usd' ? 'cumUsd' : 'cumSeda';
  return (
    <div
      style={{
        background: 'rgba(17, 17, 20, 0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        padding: '8px 12px',
        fontSize: 12,
        backdropFilter: 'blur(8px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <p style={{ color: '#71717a', marginBottom: 4, fontSize: 11 }}>{d.date}</p>
      <p style={{ color: '#fff', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
        {dataKey === 'usd' ? formatUSD(d[cumKey]) : formatNumber(d[cumKey]) + ' SEDA'}
      </p>
      <p style={{ color: '#52525b', marginTop: 2, fontSize: 10 }}>
        Daily: {dataKey === 'usd' ? formatUSD(d.usd) : formatNumber(d.seda) + ' SEDA'}
      </p>
    </div>
  );
};

export default function BurnChart({ records, dataKey, title, animClass = '' }: Props) {
  const [range, setRange] = useState<TimeRange>('1M');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const isCumulative = range === 'ALL';

  const filtered = useMemo(() => filterByRange(records, range), [records, range]);
  const cumData = useMemo(() => (isCumulative ? buildCumulative(records) : []), [records, isCumulative]);

  // No fixed barSize — let Recharts auto-fill the available width
  const tickInterval = filtered.length > 30 ? Math.floor(filtered.length / 7) : undefined;
  const cumTickInterval = cumData.length > 60 ? Math.floor(cumData.length / 7) : undefined;

  const cumKey = dataKey === 'usd' ? 'cumUsd' : 'cumSeda';

  // Colors: purple for USD charts, cyan for SEDA charts
  const barColor = dataKey === 'usd' ? '#8b5cf6' : '#06d6a0';
  const barColorDim = dataKey === 'usd' ? '#6d28d9' : '#059669';
  const lineColor = dataKey === 'usd' ? '#8b5cf6' : '#06d6a0';
  const gradientId = `grad-${dataKey}`;

  // Summary stat for the current range
  const rangeTotal = useMemo(() => {
    const data = isCumulative ? records : filtered;
    return data.reduce((s, r) => s + r[dataKey], 0);
  }, [records, filtered, dataKey, isCumulative]);

  return (
    <div className={`bento-card fade-up ${animClass} p-4 sm:p-5`}>
      {/* Header row */}
      <div className="flex items-start justify-between mb-1 flex-wrap gap-2">
        <div>
          <h3 className="text-[10px] sm:text-[11px] font-medium tracking-widest uppercase text-zinc-500">
            {isCumulative ? `Cumulative ${title}` : title}
          </h3>
          <p
            className="text-lg sm:text-xl font-semibold text-white mt-1"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {dataKey === 'usd' ? formatUSD(rangeTotal) : formatNumber(rangeTotal)}
          </p>
        </div>
        <TimeRangePicker active={range} onChange={setRange} />
      </div>

      {/* Chart */}
      <div className="h-[380px] sm:h-[460px] mt-2 -ml-1">
        <ResponsiveContainer width="100%" height="100%">
          {isCumulative ? (
            <AreaChart data={cumData}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
                  <stop offset="50%" stopColor={lineColor} stopOpacity={0.08} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => formatDateLabel(d, range)}
                tick={{ fontSize: 10, fill: '#3f3f46' }}
                axisLine={false}
                tickLine={false}
                interval={cumTickInterval}
              />
              <YAxis
                tickFormatter={(v) => (dataKey === 'usd' ? '$' + formatNumber(v) : formatNumber(v))}
                tick={{ fontSize: 10, fill: '#3f3f46' }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip content={<CumTooltip dataKey={dataKey} />} cursor={{ stroke: 'rgba(255,255,255,0.06)' }} />
              <Area
                type="monotone"
                dataKey={cumKey}
                stroke={lineColor}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{
                  r: 4,
                  stroke: lineColor,
                  strokeWidth: 2,
                  fill: '#08080a',
                }}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={filtered}
              onMouseMove={(state: any) => {
                if (state?.activeTooltipIndex !== undefined) setHoveredIdx(state.activeTooltipIndex);
              }}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => formatDateLabel(d, range)}
                tick={{ fontSize: 10, fill: '#3f3f46' }}
                axisLine={false}
                tickLine={false}
                interval={tickInterval}
              />
              <YAxis
                tickFormatter={(v) => (dataKey === 'usd' ? '$' + formatNumber(v) : formatNumber(v))}
                tick={{ fontSize: 10, fill: '#3f3f46' }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip content={<BarTooltip dataKey={dataKey} />} cursor={false} />
              <Bar dataKey={dataKey} radius={[3, 3, 0, 0]} maxBarSize={80}>
                {filtered.map((_, i) => (
                  <Cell
                    key={i}
                    fill={hoveredIdx === i ? barColor : barColorDim}
                    fillOpacity={hoveredIdx === i ? 1 : 0.7}
                    style={{ transition: 'fill 0.15s ease, fill-opacity 0.15s ease' }}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
