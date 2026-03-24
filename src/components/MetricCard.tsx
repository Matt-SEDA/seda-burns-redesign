'use client';

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  animClass?: string;
}

export default function MetricCard({ label, value, sub, animClass = '' }: MetricCardProps) {
  return (
    <div className={`seda-card fade-up ${animClass} metric-card`}>
      <span className="metric-card__label">{label}</span>
      <div className="metric-card__value-wrap">
        <span className="metric-card__value">{value}</span>
        {sub && <p className="metric-card__sub">{sub}</p>}
      </div>
    </div>
  );
}
