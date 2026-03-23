'use client';

import { useState, useEffect, FormEvent } from 'react';

interface Record {
  date: string;
  seda: number;
  usd: number;
  price: number | null;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [seda, setSeda] = useState('');
  const [usd, setUsd] = useState('');
  const [price, setPrice] = useState('');

  const [fastRequests, setFastRequests] = useState('');

  const [status, setStatus] = useState('');
  const [recentRecords, setRecentRecords] = useState<Record[]>([]);
  const [currentFR, setCurrentFR] = useState(0);

  const apiCall = async (body: any) => {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${password}`,
      },
      body: JSON.stringify(body),
    });
    return res.json();
  };

  const loadData = async () => {
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      if (data.records) {
        setRecentRecords(data.records.slice(-10).reverse());
        setCurrentFR(data.fastRequestsSold || 0);
      }
    } catch {}
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${password}`,
      },
      body: JSON.stringify({ action: 'update_fast_requests', fastRequestsSold: currentFR }),
    });
    if (res.ok) {
      setAuthed(true);
      setAuthError('');
      loadData();
    } else {
      setAuthError('Wrong password');
    }
  };

  const handleAddRecord = async (e: FormEvent) => {
    e.preventDefault();
    if (!date || !seda || !usd) {
      setStatus('Fill in date, SEDA, and USD');
      return;
    }
    setStatus('Saving…');
    const result = await apiCall({
      action: 'add_record',
      date,
      seda: Number(seda),
      usd: Number(usd),
      price: price ? Number(price) : null,
    });
    if (result.success) {
      setStatus(`Saved! ${result.recordCount} total records.`);
      setSeda('');
      setUsd('');
      setPrice('');
      const next = new Date(date);
      next.setDate(next.getDate() + 1);
      setDate(next.toISOString().slice(0, 10));
      loadData();
    } else {
      setStatus('Error: ' + (result.error || 'Unknown'));
    }
  };

  const handleUpdateFR = async (e: FormEvent) => {
    e.preventDefault();
    if (!fastRequests) return;
    setStatus('Saving…');
    const result = await apiCall({
      action: 'update_fast_requests',
      fastRequestsSold: Number(fastRequests),
    });
    if (result.success) {
      setStatus('Fast Requests updated!');
      setCurrentFR(Number(fastRequests));
      setFastRequests('');
    } else {
      setStatus('Error: ' + (result.error || 'Unknown'));
    }
  };

  const handleDelete = async (dateStr: string) => {
    if (!confirm(`Delete record for ${dateStr}?`)) return;
    const result = await apiCall({ action: 'delete_record', date: dateStr });
    if (result.success) {
      setStatus(`Deleted ${dateStr}`);
      loadData();
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!authed) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-surface-1 border border-border rounded-xl p-6 w-full max-w-sm">
          <h1 className="text-lg font-semibold text-white mb-4">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-accent mb-3"
            autoFocus
          />
          {authError && <p className="text-red-400 text-xs mb-2">{authError}</p>}
          <button
            type="submit"
            className="w-full bg-accent text-surface-0 font-medium text-sm rounded-lg py-2 hover:bg-cyan-300 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-0 p-4 sm:p-6 lg:p-8 max-w-[800px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-white">SEDA Burns Admin</h1>
        <a href="/" className="text-xs text-accent hover:underline">← Dashboard</a>
      </div>

      {status && (
        <div className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-zinc-300 mb-4">
          {status}
        </div>
      )}

      <div className="bg-surface-1 border border-border rounded-xl p-5 mb-4">
        <h2 className="text-sm font-medium text-zinc-400 mb-3">Add Daily Record</h2>
        <form onSubmit={handleAddRecord} className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1 block">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1 block">SEDA Burned</label>
              <input
                type="number"
                value={seda}
                onChange={(e) => setSeda(e.target.value)}
                placeholder="42274"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1 block">USD Revenue</label>
              <input
                type="number"
                step="0.01"
                value={usd}
                onChange={(e) => setUsd(e.target.value)}
                placeholder="930.45"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1 block">SEDA Price (opt)</label>
              <input
                type="number"
                step="0.00001"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.02201"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-accent text-surface-0 font-medium text-sm rounded-lg px-4 py-2 hover:bg-cyan-300 transition-colors"
          >
            Add / Update Record
          </button>
        </form>
      </div>

      <div className="bg-surface-1 border border-border rounded-xl p-5 mb-4">
        <h2 className="text-sm font-medium text-zinc-400 mb-3">
          Fast Requests Sold
          <span className="ml-2 text-zinc-500 font-normal">Current: {currentFR.toLocaleString()}</span>
        </h2>
        <form onSubmit={handleUpdateFR} className="flex gap-3">
          <input
            type="number"
            value={fastRequests}
            onChange={(e) => setFastRequests(e.target.value)}
            placeholder="New total"
            className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-accent flex-1 max-w-[200px]"
          />
          <button
            type="submit"
            className="bg-surface-3 border border-border text-zinc-300 font-medium text-sm rounded-lg px-4 py-2 hover:border-accent transition-colors"
          >
            Update
          </button>
        </form>
      </div>

      <div className="bg-surface-1 border border-border rounded-xl p-5">
        <h2 className="text-sm font-medium text-zinc-400 mb-3">Recent Records (last 10)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-zinc-500 border-b border-border">
                <th className="text-left py-2 pr-4 font-medium">Date</th>
                <th className="text-right py-2 pr-4 font-medium">SEDA</th>
                <th className="text-right py-2 pr-4 font-medium">USD</th>
                <th className="text-right py-2 pr-4 font-medium">Price</th>
                <th className="text-right py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.map((r) => (
                <tr key={r.date} className="border-b border-border/50 hover:bg-surface-2">
                  <td className="py-2 pr-4 text-zinc-300">{r.date}</td>
                  <td className="py-2 pr-4 text-right text-white" style={{ fontFamily: 'var(--font-mono)' }}>
                    {r.seda.toLocaleString()}
                  </td>
                  <td className="py-2 pr-4 text-right text-white" style={{ fontFamily: 'var(--font-mono)' }}>
                    ${r.usd.toLocaleString()}
                  </td>
                  <td className="py-2 pr-4 text-right text-zinc-500" style={{ fontFamily: 'var(--font-mono)' }}>
                    {r.price ? `$${r.price.toFixed(4)}` : '—'}
                  </td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => handleDelete(r.date)}
                      className="text-zinc-600 hover:text-red-400 transition-colors text-base"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
