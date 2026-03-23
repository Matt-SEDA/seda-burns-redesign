'use client';

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  animClass?: string;
}

export default function MetricCard({ label, value, sub, animClass = '' }: MetricCardProps) {
  return (
    <div className={`bento-card fade-up ${animClass} p-4 sm:p-5 flex flex-col justify-between min-h-[100px] sm:min-h-[110px]`}>
      <span className="text-[10px] sm:text-[11px] font-medium tracking-widest uppercase text-zinc-500">
        {label}
      </span>
      <div className="mt-auto pt-2">
        <span
          className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-white"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {value}
        </span>
        {sub && <p className="text-[10px] text-zinc-600 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
