import { DailyRecord, TimeRange } from './types';

export function filterByRange(records: DailyRecord[], range: TimeRange): DailyRecord[] {
  if (range === 'ALL') return records;
  if (range === '1D') return records.slice(-1);

  const last = records[records.length - 1]?.date;
  if (!last) return records;
  const now = new Date(last);
  let count: number | null = null;
  let cutoff: Date | null = null;

  switch (range) {
    case '7D':
      count = 7;
      break;
    case '1M':
      cutoff = new Date(now);
      cutoff.setMonth(cutoff.getMonth() - 1);
      break;
    case '1Y':
      cutoff = new Date(now);
      cutoff.setFullYear(cutoff.getFullYear() - 1);
      break;
    default:
      return records;
  }

  if (count !== null) return records.slice(-count);

  const cutoffStr = cutoff!.toISOString().slice(0, 10);
  return records.filter((r) => r.date > cutoffStr);
}

export function buildCumulative(records: DailyRecord[]): (DailyRecord & { cumSeda: number; cumUsd: number })[] {
  let cumSeda = 0;
  let cumUsd = 0;
  return records.map((r) => {
    cumSeda += r.seda;
    cumUsd += r.usd;
    return { ...r, cumSeda, cumUsd };
  });
}

export function calcPctChange(records: DailyRecord[], key: 'seda' | 'usd', range: TimeRange): number | null {
  const filtered = filterByRange(records, range);
  if (filtered.length < 2) return null;

  const midpoint = Math.floor(filtered.length / 2);
  const firstHalf = filtered.slice(0, midpoint).reduce((s, r) => s + r[key], 0);
  const secondHalf = filtered.slice(midpoint).reduce((s, r) => s + r[key], 0);

  if (firstHalf === 0) return null;
  return ((secondHalf - firstHalf) / firstHalf) * 100;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(n >= 10_000_000_000 ? 1 : 2) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 1 : 1) + 'K';
  return n.toLocaleString();
}

export function formatUSD(n: number): string {
  if (n >= 1_000_000_000) return '$' + (n / 1_000_000_000).toFixed(2) + 'B';
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(1) + 'K';
  return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function formatDateLabel(dateStr: string, range: TimeRange): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (range === '1D') return dateStr;
  if (range === '7D') return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  if (range === '1M') return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  return d.toLocaleDateString('en', { month: 'short', year: '2-digit' });
}
