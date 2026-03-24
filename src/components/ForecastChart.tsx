'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { DailyRecord } from '@/lib/types';
import { formatNumber, formatUSD } from '@/lib/utils';

type Horizon = '1W' | '1M' | '1Y' | '3Y';
type Baseline = '7D' | '30D';
type Multiplier = 1 | 5 | 10 | 25 | 100;

const HORIZONS: { key: Horizon; label: string; days: number }[] = [
  { key: '1W', label: '1 Week', days: 7 },
  { key: '1M', label: '1 Month', days: 30 },
  { key: '1Y', label: '1 Year', days: 365 },
  { key: '3Y', label: '3 Years', days: 1095 },
];

const BASELINES: { key: Baseline; label: string; days: number }[] = [
  { key: '7D', label: '7 Day Avg', days: 7 },
  { key: '30D', label: '30 Day Avg', days: 30 },
];

const MULTIPLIERS: { key: Multiplier; label: string }[] = [
  { key: 1, label: 'Current' },
  { key: 5, label: '5x' },
  { key: 10, label: '10x' },
  { key: 25, label: '25x' },
  { key: 100, label: '100x' },
];

const BASE_PRICE = 0.02;

function getDailyAvg(records: DailyRecord[], key: 'seda' | 'usd', days: number): number {
  const slice = records.slice(-days);
  if (slice.length === 0) return 0;
  return slice.reduce((s, r) => s + r[key], 0) / slice.length;
}

interface DataPoint {
  date: string;
  histSeda: number | null;
  foreSeda: number | null;
  dailySeda: number;
  isForecast: boolean;
}

function buildForecast(
  records: DailyRecord[],
  horizon: Horizon,
  baseline: Baseline,
  multiplier: Multiplier,
  tokenPrice: number
): DataPoint[] {
  const baselineDays = BASELINES.find((b) => b.key === baseline)!.days;
  const dailyUsd = getDailyAvg(records, 'usd', baselineDays) * multiplier;
  const dailySeda = dailyUsd / tokenPrice;

  const totalDays = HORIZONS.find((h) => h.key === horizon)!.days;
  const histDays = Math.min(21, Math.max(5, Math.floor(totalDays * 0.12)));
  const histSlice = records.slice(-histDays);

  const totalHistSeda = records.reduce((s, r) => s + r.seda, 0);
  const histSliceSeda = histSlice.reduce((s, r) => s + r.seda, 0);
  let cumSeda = totalHistSeda - histSliceSeda;

  const data: DataPoint[] = [];

  for (const r of histSlice) {
    cumSeda += r.seda;
    data.push({
      date: r.date,
      histSeda: cumSeda,
      foreSeda: null,
      dailySeda: r.seda,
      isForecast: false,
    });
  }

  const last = data[data.length - 1];
  if (last) {
    last.foreSeda = last.histSeda;
  }

  const lastDate = new Date(records[records.length - 1].date + 'T00:00:00');
  const step = totalDays > 365 ? 7 : totalDays > 60 ? 2 : 1;

  for (let i = step; i <= totalDays; i += step) {
    const d = new Date(lastDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const projSeda = totalHistSeda + dailySeda * i;

    data.push({
      date: dateStr,
      histSeda: null,
      foreSeda: projSeda,
      dailySeda,
      isForecast: true,
    });
  }

  return data;
}

function fmtDate(dateStr: string, horizon: Horizon): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (horizon === '1W' || horizon === '1M') return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  return d.toLocaleDateString('en', { month: 'short', year: '2-digit' });
}

const ForecastTooltip = ({ active, payload, tokenPrice }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const cumSeda = d.foreSeda ?? d.histSeda ?? 0;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__date">
        {d.date} · {d.isForecast ? 'Projected' : 'Actual'}
      </p>
      <p className="chart-tooltip__value" style={{ color: '#1fe9d1' }}>
        {formatNumber(cumSeda)} cumulative SEDA burned
      </p>
      {d.isForecast && (
        <div className="chart-tooltip__divider">
          <p className="chart-tooltip__detail">
            {formatNumber(d.dailySeda)} SEDA/day · Price: ${tokenPrice.toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
};

interface Props {
  records: DailyRecord[];
  animClass?: string;
}

export default function ForecastChart({ records, animClass = '' }: Props) {
  const [horizon, setHorizon] = useState<Horizon>('1Y');
  const [baseline, setBaseline] = useState<Baseline>('30D');
  const [multiplier, setMultiplier] = useState<Multiplier>(1);
  const [customPrice, setCustomPrice] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [livePrice, setLivePrice] = useState<number>(BASE_PRICE);
  const [priceLoaded, setPriceLoaded] = useState(false);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=seda-2&vs_currencies=usd')
      .then((r) => r.json())
      .then((data) => {
        const price = data?.['seda-2']?.usd;
        if (price && price > 0) setLivePrice(price);
        setPriceLoaded(true);
      })
      .catch(() => setPriceLoaded(true));
  }, []);

  const tokenPrice = useCustom && customPrice
    ? Math.max(0.0001, parseFloat(customPrice) || livePrice)
    : livePrice;

  const data = useMemo(
    () => buildForecast(records, horizon, baseline, multiplier, tokenPrice),
    [records, horizon, baseline, multiplier, tokenPrice]
  );

  const boundaryDate = records[records.length - 1]?.date || '';
  const lastPoint = data[data.length - 1];
  const projSeda = lastPoint?.foreSeda ?? lastPoint?.histSeda ?? 0;

  const baselineDays = BASELINES.find((b) => b.key === baseline)!.days;
  const dailyUsd = getDailyAvg(records, 'usd', baselineDays);
  const dailySeda = (dailyUsd * multiplier) / tokenPrice;

  const tickInt = data.length > 60 ? Math.floor(data.length / 7) : data.length > 20 ? Math.floor(data.length / 6) : undefined;

  return (
    <div className={`seda-card fade-up ${animClass} forecast-card`}>
      <div className="forecast-card__header">
        <h3 className="forecast-card__title">
          Forecast — Projected SEDA Burned
        </h3>

        <div style={{ marginTop: 8 }}>
          <span className="forecast-card__value">
            {formatNumber(projSeda)}
          </span>
          <span className="forecast-card__value-unit">SEDA</span>
        </div>

        <div className="forecast-card__controls">
          {/* Horizon */}
          <div className="forecast-card__control-group">
            <p className="forecast-card__control-label">Projection</p>
            <div className="forecast-card__pills">
              {HORIZONS.map(({ key, label }) => (
                <button key={key} className={`pill ${horizon === key ? 'active' : ''}`} onClick={() => setHorizon(key)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="forecast-card__divider" />

          {/* Baseline */}
          <div className="forecast-card__control-group">
            <p className="forecast-card__control-label">Baseline</p>
            <div className="forecast-card__pills">
              {BASELINES.map(({ key, label }) => (
                <button
                  key={key}
                  className={`pill ${baseline === key ? 'active' : ''}`}
                  onClick={() => setBaseline(key)}
                  style={
                    baseline === key
                      ? { color: '#1fe9d1', background: 'rgba(31, 233, 209, 0.08)', borderColor: 'rgba(31, 233, 209, 0.25)' }
                      : undefined
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="forecast-card__divider" />

          {/* Growth */}
          <div className="forecast-card__control-group">
            <p className="forecast-card__control-label">Growth</p>
            <div className="forecast-card__pills">
              {MULTIPLIERS.map(({ key, label }) => (
                <button
                  key={key}
                  className={`pill ${multiplier === key ? 'active' : ''}`}
                  onClick={() => setMultiplier(key)}
                  style={
                    multiplier === key && key > 1
                      ? { color: '#6100ff', background: 'rgba(97, 0, 255, 0.1)', borderColor: 'rgba(97, 0, 255, 0.3)' }
                      : undefined
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="forecast-card__divider" />

          {/* SEDA Price: live + custom */}
          <div className="forecast-card__control-group">
            <p className="forecast-card__control-label">SEDA Price</p>
            <div className="forecast-card__price-group">
              <div className="forecast-card__live-btn-wrap">
                <button
                  className={`pill ${!useCustom ? 'active' : ''}`}
                  onClick={() => setUseCustom(false)}
                  style={
                    !useCustom
                      ? { color: '#dcc6ff', background: 'rgba(97, 0, 255, 0.08)', borderColor: 'rgba(97, 0, 255, 0.25)' }
                      : undefined
                  }
                >
                  {priceLoaded ? `$${livePrice.toFixed(4)}` : 'Loading…'}
                </button>
                <span className="forecast-card__live-label">live price</span>
              </div>
              <div className="forecast-card__custom-input-wrap">
                <span className="forecast-card__custom-dollar">$</span>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  placeholder="Custom"
                  value={customPrice}
                  onChange={(e) => { setCustomPrice(e.target.value); setUseCustom(true); }}
                  onFocus={() => setUseCustom(true)}
                  className={`forecast-card__custom-input ${useCustom ? 'forecast-card__custom-input--active' : ''}`}
                />
              </div>
            </div>
          </div>
        </div>

        <p className="forecast-card__summary">
          {BASELINES.find((b) => b.key === baseline)!.label}: {formatUSD(dailyUsd)}/day fees
          {multiplier > 1 && <span className="forecast-card__summary-highlight"> × {multiplier}</span>}
          <span className="forecast-card__summary-separator"> · </span>
          Price: <span className="forecast-card__summary-accent">${tokenPrice.toFixed(4)}</span>
          <span className="forecast-card__summary-separator"> · </span>
          {formatNumber(dailySeda)} SEDA burned/day
        </p>
      </div>

      <div className="forecast-card__chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="fSedaG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1fe9d1" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#1fe9d1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => fmtDate(d, horizon)}
              tick={{ fontSize: 10, fill: '#4b4855' }}
              axisLine={false} tickLine={false}
              interval={tickInt} height={30}
            />
            <YAxis
              tickFormatter={(v) => formatNumber(v)}
              tick={{ fontSize: 10, fill: '#4b4855' }}
              axisLine={false} tickLine={false} width={58}
            />
            <Tooltip content={<ForecastTooltip tokenPrice={tokenPrice} />} />
            <ReferenceLine
              x={boundaryDate}
              stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4"
              label={{ value: 'Today', position: 'insideTopRight', fill: '#a8a4b7', fontSize: 10, dy: -5 }}
            />

            {/* Historical: solid */}
            <Line type="monotone" dataKey="histSeda" stroke="#1fe9d1" strokeWidth={2} dot={false} connectNulls={false} />

            {/* Forecast: dashed + gradient fill */}
            <Area type="monotone" dataKey="foreSeda" stroke="#1fe9d1" strokeWidth={2} strokeDasharray="6 3" fill="url(#fSedaG)" dot={false} connectNulls={false} activeDot={{ r: 3, stroke: '#1fe9d1', strokeWidth: 2, fill: '#0a0a0f' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="forecast-card__legend">
        <div className="forecast-card__legend-item">
          <div className="forecast-card__legend-line" />
          <span className="forecast-card__legend-text">SEDA burned (actual)</span>
        </div>
        <div className="forecast-card__legend-item">
          <div className="forecast-card__legend-line forecast-card__legend-line--dashed" />
          <span className="forecast-card__legend-text">SEDA burned (projected)</span>
        </div>
      </div>
    </div>
  );
}
