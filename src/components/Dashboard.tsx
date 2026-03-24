'use client';

import { useEffect, useState } from 'react';
import { DashboardData } from '@/lib/types';
import { formatNumber, formatUSD } from '@/lib/utils';
import MetricCard from './MetricCard';
import BurnChart from './BurnChart';
import ForecastChart from './ForecastChart';

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
      <div className="loading-screen">
        <div className="loading-inner">
          <div className="loading-spinner" />
          <span className="loading-text">Loading data…</span>
        </div>
      </div>
    );
  }

  const { records } = data;
  const totalSeda = records.reduce((s, r) => s + r.seda, 0);
  const totalUsd = records.reduce((s, r) => s + r.usd, 0);

  return (
    <div className="page-wrapper">

      {/* Top metrics row - 2x2 on mobile, 4 across on desktop */}
      <div className="metrics-grid">
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
          value={formatUSD(11120000000)}
          sub={'\u00A0'}
          animClass="fade-up-3"
        />
        {/* ✏️ EDIT Oracle Programs here — change the string below */}
        <MetricCard
          label="Oracle Programs"
          value="189"
          sub="Deployed on mainnet"
          animClass="fade-up-4"
        />
      </div>

      {/* Charts - stacked on mobile, side by side on desktop */}
      <div className="charts-grid">
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

      {/* Forecast chart - full width */}
      <div className="forecast-section">
        <ForecastChart records={records} animClass="fade-up-6" />
      </div>

    </div>
  );
}
