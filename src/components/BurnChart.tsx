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
    <div className="chart-tooltip">
      <p className="chart-tooltip__date">{d.date}</p>
      <p className="chart-tooltip__value">
        {dataKey === 'usd' ? formatUSD(d.usd) : formatNumber(d.seda) + ' SEDA'}
      </p>
      {d.price != null && (
        <p className="chart-tooltip__detail">
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
    <div className="chart-tooltip">
      <p className="chart-tooltip__date">{d.date}</p>
      <p className="chart-tooltip__value">
        {dataKey === 'usd' ? formatUSD(d[cumKey]) : formatNumber(d[cumKey]) + ' SEDA'}
      </p>
      <p className="chart-tooltip__detail">
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

  // Colors: purple for USD charts, teal for SEDA charts (SEDA tokens)
  const barColor = dataKey === 'usd' ? 'var(--primary-primary)' : 'var(--success-success)';
  const barColorDim = dataKey === 'usd' ? '#270067' : '#006458';
  const lineColor = dataKey === 'usd' ? 'var(--primary-primary)' : 'var(--success-success)';
  // Raw hex needed for SVG gradient stops
  const lineColorHex = dataKey === 'usd' ? '#6100ff' : '#1fe9d1';
  const gradientId = `grad-${dataKey}`;

  // Summary stat for the current range
  const rangeTotal = useMemo(() => {
    const data = isCumulative ? records : filtered;
    return data.reduce((s, r) => s + r[dataKey], 0);
  }, [records, filtered, dataKey, isCumulative]);

  return (
    <div className={`seda-card fade-up ${animClass} chart-card`}>
      {/* Header */}
      <div className="chart-card__header">
        <h3 className="chart-card__title">
          {isCumulative ? `Cumulative ${title}` : title}
        </h3>
        <p className="chart-card__value">
          {dataKey === 'usd' ? formatUSD(rangeTotal) : formatNumber(rangeTotal)}
        </p>
        <div className="chart-card__controls">
          <TimeRangePicker active={range} onChange={setRange} />
        </div>
      </div>

      {/* Chart */}
      <div className="chart-card__area">
        <ResponsiveContainer width="100%" height="100%">
          {isCumulative ? (
            <AreaChart data={cumData} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColorHex} stopOpacity={0.3} />
                  <stop offset="50%" stopColor={lineColorHex} stopOpacity={0.08} />
                  <stop offset="100%" stopColor={lineColorHex} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => formatDateLabel(d, range)}
                tick={{ fontSize: 10, fill: '#4b4855' }}
                axisLine={false}
                tickLine={false}
                interval={Math.floor(cumData.length / 6)}
                height={30}
              />
              <YAxis
                tickFormatter={(v) => (dataKey === 'usd' ? '$' + formatNumber(v) : formatNumber(v))}
                tick={{ fontSize: 10, fill: '#4b4855' }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip content={<CumTooltip dataKey={dataKey} />} cursor={{ stroke: 'rgba(255,255,255,0.06)' }} />
              <Area
                type="monotone"
                dataKey={cumKey}
                stroke={lineColorHex}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{
                  r: 4,
                  stroke: lineColorHex,
                  strokeWidth: 2,
                  fill: '#0a0a0f',
                }}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={filtered}
              margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
              onMouseMove={(state: any) => {
                if (state?.activeTooltipIndex !== undefined) setHoveredIdx(state.activeTooltipIndex);
              }}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => formatDateLabel(d, range)}
                tick={{ fontSize: 10, fill: '#4b4855' }}
                axisLine={false}
                tickLine={false}
                interval={filtered.length <= 7 ? 0 : Math.floor(filtered.length / 6)}
                height={30}
              />
              <YAxis
                tickFormatter={(v) => (dataKey === 'usd' ? '$' + formatNumber(v) : formatNumber(v))}
                tick={{ fontSize: 10, fill: '#4b4855' }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip content={<BarTooltip dataKey={dataKey} />} cursor={false} />
              <Bar dataKey={dataKey} radius={[3, 3, 0, 0]} maxBarSize={80}>
                {filtered.map((_, i) => (
                  <Cell
                    key={i}
                    fill={hoveredIdx === i ? lineColorHex : barColorDim}
                    fillOpacity={hoveredIdx === i ? 1 : 0.7}
                    style={{ transition: 'fill 150ms ease, fill-opacity 150ms ease' }}
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
