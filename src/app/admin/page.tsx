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
      <div className="admin-login">
        <form onSubmit={handleLogin} className="admin-login__form">
          <h1 className="admin-login__title">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="admin-input"
            style={{ marginBottom: 12 }}
            autoFocus
          />
          {authError && <p className="admin-error">{authError}</p>}
          <button type="submit" className="admin-btn-primary" style={{ width: '100%' }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">SEDA Burns Admin</h1>
        <a href="/" className="admin-page__back">← Dashboard</a>
      </div>

      {status && (
        <div className="admin-status">{status}</div>
      )}

      <div className="admin-section">
        <h2 className="admin-section__title">Add Daily Record</h2>
        <form onSubmit={handleAddRecord} className="admin-form">
          <div className="admin-form-grid">
            <div>
              <label className="admin-field-label">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="admin-input admin-input--date"
              />
            </div>
            <div>
              <label className="admin-field-label">SEDA Burned</label>
              <input
                type="number"
                value={seda}
                onChange={(e) => setSeda(e.target.value)}
                placeholder="42274"
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-field-label">USD Revenue</label>
              <input
                type="number"
                step="0.01"
                value={usd}
                onChange={(e) => setUsd(e.target.value)}
                placeholder="930.45"
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-field-label">SEDA Price (opt)</label>
              <input
                type="number"
                step="0.00001"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.02201"
                className="admin-input"
              />
            </div>
          </div>
          <button type="submit" className="admin-btn-primary">
            Add / Update Record
          </button>
        </form>
      </div>

      <div className="admin-section">
        <h2 className="admin-section__title">
          Fast Requests Sold
          <span className="admin-section__title-detail">Current: {currentFR.toLocaleString()}</span>
        </h2>
        <form onSubmit={handleUpdateFR} className="admin-inline-form">
          <input
            type="number"
            value={fastRequests}
            onChange={(e) => setFastRequests(e.target.value)}
            placeholder="New total"
            className="admin-input admin-inline-input"
          />
          <button type="submit" className="admin-btn-secondary">
            Update
          </button>
        </form>
      </div>

      <div className="admin-section">
        <h2 className="admin-section__title">Recent Records (last 10)</h2>
        <div className="admin-table__overflow">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>SEDA</th>
                <th>USD</th>
                <th>Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.map((r) => (
                <tr key={r.date}>
                  <td className="admin-table__date">{r.date}</td>
                  <td className="admin-table__value">{r.seda.toLocaleString()}</td>
                  <td className="admin-table__value">${r.usd.toLocaleString()}</td>
                  <td className="admin-table__muted">
                    {r.price ? `$${r.price.toFixed(4)}` : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(r.date)}
                      className="admin-table__delete"
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
