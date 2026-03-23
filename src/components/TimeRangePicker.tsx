'use client';

import { TimeRange } from '@/lib/types';

const RANGES: { key: TimeRange; label: string }[] = [
  { key: '1D', label: '1 Day' },
  { key: '7D', label: '1 Week' },
  { key: '1M', label: '1 Month' },
  { key: '1Y', label: '1 Year' },
  { key: 'ALL', label: 'Cumulative' },
];

interface Props {
  active: TimeRange;
  onChange: (r: TimeRange) => void;
}

export default function TimeRangePicker({ active, onChange }: Props) {
  return (
    <div className="flex gap-1 flex-wrap">
      {RANGES.map(({ key, label }) => (
        <button key={key} className={`pill ${active === key ? 'active' : ''}`} onClick={() => onChange(key)}>
          {label}
        </button>
      ))}
    </div>
  );
}
