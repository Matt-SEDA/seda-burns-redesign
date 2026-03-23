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
    <div className="min-h-screen bg-black px-3 py-3 sm:px-5 sm:py-4 lg:px-8 lg:py-6 max-w-[1200px] mx-auto">

      {/* Top metrics row - 2x2 on mobile, 4 across on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-2 sm:mb-3">
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
          sub="Across all live markets"
          animClass="fade-up-3"
        />
        {/* ✏️ EDIT Oracle Programs here — change the string below */}
        <MetricCard
          label="Oracle Programs"
          value="188"
          sub="Deployed on mainnet"
          animClass="fade-up-4"
        />
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
