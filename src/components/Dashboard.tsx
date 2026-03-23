'use client';

import { useEffect, useState } from 'react';
import { DashboardData } from '@/lib/types';
import { formatNumber, formatUSD } from '@/lib/utils';
import MetricCard from './MetricCard';
import BurnChart from './BurnChart';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch('/data.json')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-6 h-6 border-2 border-zinc-700 border-t-violet-500 rounded-full animate-spin"
          />
          <span className="text-zinc-600 text-xs tracking-wide">Loading data…</span>
        </div>
      </div>
    );
  }

  const { records, fastRequestsSold } = data;
  const totalSeda = records.reduce((s, r) => s + r.seda, 0);
  const totalUsd = records.reduce((s, r) => s + r.usd, 0);

  return (
    <div className="min-h-screen bg-[#08080a] px-3 py-3 sm:px-5 sm:py-4 lg:px-8 lg:py-6 max-w-[1200px] mx-auto">

      {/* Top metrics row with animated background */}
      <div className="relative rounded-2xl overflow-hidden mb-2 sm:mb-3">
        {/* Animated wavy gradient background */}
        <div className="absolute inset-0 opacity-40" style={{ zIndex: 0 }}>
          <div className="absolute inset-0 animate-wave-slow">
            <div
              className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2"
              style={{
                background: 'radial-gradient(ellipse at 30% 50%, rgba(139, 92, 246, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(6, 214, 160, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(99, 102, 241, 0.2) 0%, transparent 40%)',
                animation: 'waveMove 12s ease-in-out infinite alternate',
              }}
            />
          </div>
          <div className="absolute inset-0">
            <div
              className="absolute w-[200%] h-[200%] -top-1/4 -left-1/4"
              style={{
                background: 'radial-gradient(ellipse at 60% 40%, rgba(139, 92, 246, 0.25) 0%, transparent 45%), radial-gradient(ellipse at 20% 70%, rgba(6, 214, 160, 0.2) 0%, transparent 40%)',
                animation: 'waveMove2 15s ease-in-out infinite alternate',
              }}
            />
          </div>
          {/* Curved wave overlay */}
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ opacity: 0.15 }}>
            <path d="M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120Z" fill="url(#waveGrad)">
              <animate attributeName="d" dur="8s" repeatCount="indefinite" values="
                M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120Z;
                M0,50 C200,20 400,90 600,50 C800,20 1000,90 1200,50 L1200,120 L0,120Z;
                M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120Z
              " />
            </path>
            <defs>
              <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#06d6a0" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Metric cards */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 p-2 sm:p-3">
          <MetricCard
            label="Total SEDA Burned"
            value={formatNumber(totalSeda)}
            sub={`${records.length} days tracked`}
            animClass="fade-up-1"
          />
          <MetricCard
            label="Total Chain Fees (USD)"
            value={formatUSD(totalUsd)}
            sub={'\u00A0'}
            animClass="fade-up-2"
          />
          {/* ✏️ EDIT Perp Volume here — change the number below */}
          <MetricCard
            label="Perp Volume Powered"
            value={formatUSD(11060000000)}
            sub={'\u00A0'}
            animClass="fade-up-3"
          />
          {/* ✏️ EDIT Oracle Programs here — change the string below */}
          <MetricCard
            label="Oracle Programs"
            value="175"
            sub="Deployed on mainnet"
            animClass="fade-up-4"
          />
        </div>
      </div>

      {/* Charts - stacked on mobile, side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
        <BurnChart
          records={records}
          dataKey="usd"
          title="Chain Fees (USD)"
          animClass="fade-up-5"
        />
        <BurnChart
          records={records}
          dataKey="seda"
          title="SEDA Burned"
          animClass="fade-up-6"
        />
      </div>

    </div>
  );
}
