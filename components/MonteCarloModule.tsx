'use client';

import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, TrendingUp, Activity, ShieldAlert, BarChart2 } from 'lucide-react';

export default function MonteCarloModule() {
  const [S0, setS0] = useState(100);
  const [mu, setMu] = useState(0.08);
  const [sigma, setSigma] = useState(0.20);
  const [days, setDays] = useState(252);
  const [paths, setPaths] = useState(10000);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);

  const handleCompute = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/monte-carlo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ S0, mu, sigma, days, paths }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to compute simulation');
      
      // Transform sample paths for Recharts
      const formattedPaths = Array.from({ length: days + 1 }, (_, i) => {
        const point: any = { day: i };
        json.samplePaths.forEach((path: number[], pIndex: number) => {
          point[`path${pIndex}`] = path[i];
        });
        return point;
      });

      setData({ ...json, formattedPaths });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col gap-2">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Initial Price (S0)</label>
          <input
            type="number"
            value={S0}
            onChange={(e) => setS0(parseFloat(e.target.value))}
            className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col gap-2">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Expected Return (μ)</label>
          <input
            type="number"
            step="0.01"
            value={mu}
            onChange={(e) => setMu(parseFloat(e.target.value))}
            className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col gap-2">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Volatility (σ)</label>
          <input
            type="number"
            step="0.01"
            value={sigma}
            onChange={(e) => setSigma(parseFloat(e.target.value))}
            className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col gap-2">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Trading Days</label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col justify-end">
          <button
            onClick={handleCompute}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!data && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-500 space-y-4 border border-zinc-800/50 rounded-xl bg-zinc-900/20 border-dashed">
          <BarChart2 className="w-12 h-12 text-zinc-700" />
          <div className="text-center space-y-1">
            <h3 className="text-zinc-400 font-medium">Simulation Ready</h3>
            <p className="text-sm max-w-sm">Configure the initial parameters above and run the simulation to generate Geometric Brownian Motion price paths.</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-500 space-y-4 border border-zinc-800/50 rounded-xl bg-zinc-900/20 border-dashed">
          <div className="w-12 h-12 border-4 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="text-center space-y-1">
            <h3 className="text-zinc-400 font-medium">Running Simulation</h3>
            <p className="text-sm max-w-sm">Generating {paths.toLocaleString()} random price paths...</p>
          </div>
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="Expected Return" value={(data.expectedReturn * 100).toFixed(2) + '%'} icon={TrendingUp} />
            <MetricCard title="Expected Drawdown" value={(data.expectedDrawdown * 100).toFixed(2) + '%'} icon={ShieldAlert} />
            <MetricCard title="Min Simulated Price" value={data.finalPricesSummary.min.toFixed(2)} icon={Activity} />
            <MetricCard title="Max Simulated Price" value={data.finalPricesSummary.max.toFixed(2)} icon={BarChart2} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <h3 className="text-lg font-medium mb-4">Sample Paths (First 50)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.formattedPaths}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                    <XAxis dataKey="day" stroke="#a1a1aa" fontSize={12} />
                    <YAxis stroke="#a1a1aa" fontSize={12} domain={['auto', 'auto']} tickFormatter={(v) => Number(v).toFixed(2)} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }} formatter={(val: any) => Number(val).toFixed(2)} />
                    {data.samplePaths.map((_: any, i: number) => (
                      <Line key={i} type="monotone" dataKey={`path${i}`} stroke="#6366f1" strokeWidth={1} dot={false} opacity={0.3} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <h3 className="text-lg font-medium mb-4">Final Price Distribution</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.histogramData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                    <XAxis dataKey="bin" stroke="#a1a1aa" fontSize={12} tickFormatter={(v) => Number(v).toFixed(2)} />
                    <YAxis stroke="#a1a1aa" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
                      formatter={(val: any) => [val, 'Frequency']}
                      labelFormatter={(label: any) => `Price: ${Number(label).toFixed(2)}`}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
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
