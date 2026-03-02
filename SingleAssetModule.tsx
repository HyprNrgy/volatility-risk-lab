'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertCircle, TrendingUp, Activity, BarChart3, ShieldAlert, Info, X } from 'lucide-react';

export default function SingleAssetModule() {
  const [ticker, setTicker] = useState('AAPL');
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    setEndDate(new Date().toISOString().split('T')[0]);
  }, []);
  const [benchmark, setBenchmark] = useState('^GSPC');
  const [logReturns, setLogReturns] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);
  const [showIndianStockHint, setShowIndianStockHint] = useState(false);

  const handleCompute = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, startDate, endDate, benchmark, logReturns }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch data');
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col gap-2">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Ticker</label>
          <input
            type="text"
            value={ticker}
            onFocus={() => setShowIndianStockHint(true)}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <span className="text-[10px] text-zinc-500">e.g., AAPL, RELIANCE.NS, TCS.BO</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col gap-2">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Date Range</label>
          <div className="flex flex-col gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col gap-2">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Benchmark</label>
          <select
            value={benchmark}
            onChange={(e) => setBenchmark(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="^GSPC">S&P 500 (^GSPC)</option>
            <option value="^NSEI">NIFTY 50 (^NSEI)</option>
            <option value="^BSESN">BSE SENSEX (^BSESN)</option>
            <option value="^IXIC">NASDAQ (^IXIC)</option>
          </select>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Log Returns</label>
            <input
              type="checkbox"
              checked={logReturns}
              onChange={(e) => setLogReturns(e.target.checked)}
              className="rounded bg-zinc-950 border-zinc-800 text-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={handleCompute}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Computing...' : 'Compute Metrics'}
          </button>
        </div>
      </div>

      {showIndianStockHint && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 p-4 rounded-xl flex items-start gap-3 relative">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-medium text-indigo-200">Looking for Indian stocks?</p>
            <p>Since the app uses Yahoo Finance data under the hood, you can access Indian stocks by simply appending the appropriate suffix to the ticker symbol:</p>
            <ul className="list-disc pl-4 space-y-1 mt-2">
              <li><strong>NSE (National Stock Exchange):</strong> Add <code className="bg-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-200">.NS</code> to the end of the ticker (e.g., RELIANCE.NS, TCS.NS, INFY.NS)</li>
              <li><strong>BSE (Bombay Stock Exchange):</strong> Add <code className="bg-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-200">.BO</code> to the end of the ticker (e.g., RELIANCE.BO, TCS.BO, INFY.BO)</li>
            </ul>
          </div>
          <button onClick={() => setShowIndianStockHint(false)} className="absolute top-3 right-3 text-indigo-400 hover:text-indigo-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!data && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-500 space-y-4 border border-zinc-800/50 rounded-xl bg-zinc-900/20 border-dashed">
          <Activity className="w-12 h-12 text-zinc-700" />
          <div className="text-center space-y-1">
            <h3 className="text-zinc-400 font-medium">No Data Computed</h3>
            <p className="text-sm max-w-sm">Enter a ticker symbol and date range above, then click compute to generate risk metrics and volatility charts.</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-500 space-y-4 border border-zinc-800/50 rounded-xl bg-zinc-900/20 border-dashed">
          <div className="w-12 h-12 border-4 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="text-center space-y-1">
            <h3 className="text-zinc-400 font-medium">Computing Metrics</h3>
            <p className="text-sm max-w-sm">Fetching historical data and calculating volatility metrics...</p>
          </div>
        </div>
      )}

      {data && (
        <>
          {data.warnings?.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <ul className="text-sm list-disc pl-4">
                {data.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard title="Ann. Volatility" value={(data.metrics.annualizedVolatility * 100).toFixed(2) + '%'} icon={Activity} />
            <MetricCard title="Max Drawdown" value={(data.metrics.maxDrawdown * 100).toFixed(2) + '%'} icon={TrendingUp} />
            <MetricCard title="Beta" value={data.metrics.beta.toFixed(2)} icon={BarChart3} />
            <MetricCard title="Hist VaR (95%)" value={(data.metrics.historicalVaR95 * 100).toFixed(2) + '%'} icon={ShieldAlert} />
            <MetricCard title="Param VaR (95%)" value={(data.metrics.parametricVaR95 * 100).toFixed(2) + '%'} icon={ShieldAlert} />
            <MetricCard title="Ann. Return" value={(data.metrics.meanReturn * 100).toFixed(2) + '%'} icon={TrendingUp} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <h3 className="text-lg font-medium mb-4">Price Trend</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                    <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} tickFormatter={(t) => t.substring(0, 7)} />
                    <YAxis stroke="#a1a1aa" fontSize={12} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
                      itemStyle={{ color: '#f4f4f5' }}
                    />
                    <Line type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <h3 className="text-lg font-medium mb-4">Rolling Volatility</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                    <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} tickFormatter={(t) => t.substring(0, 7)} />
                    <YAxis stroke="#a1a1aa" fontSize={12} tickFormatter={(v) => (v * 100).toFixed(0) + '%'} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
                      formatter={(val: any) => (Number(val) * 100).toFixed(2) + '%'}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="vol20" name="20-Day" stroke="#10b981" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="vol60" name="60-Day" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="vol252" name="252-Day" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">Audit Log</h3>
            <ul className="text-sm font-mono text-zinc-500 space-y-1">
              {data.auditLog.map((log: string, i: number) => (
                <li key={i}>&gt; {log}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon: Icon }: { title: string, value: string, icon: any }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col gap-3">
      <div className="flex items-center gap-2 text-zinc-400">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
      </div>
      <div className="text-2xl font-semibold tracking-tight font-mono">{value}</div>
    </div>
  );
}
