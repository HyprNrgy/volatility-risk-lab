'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { AlertCircle, Plus, Trash2, Activity, TrendingDown, ShieldAlert, Info, X, Zap } from 'lucide-react';

export default function ScenarioAnalysisModule() {
  const [assets, setAssets] = useState([{ ticker: 'AAPL', weight: 40 }, { ticker: 'MSFT', weight: 40 }, { ticker: 'GOOGL', weight: 20 }]);
  const [benchmark, setBenchmark] = useState('SPY');
  const [shock, setShock] = useState(-10); // percentage
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);
  const [showIndianStockHint, setShowIndianStockHint] = useState(false);

  const handleCompute = async () => {
    setLoading(true);
    setError('');
    const sum = assets.reduce((a, b) => a + b.weight, 0);
    if (Math.abs(sum - 100) > 0.1) {
      setError('Weights must sum to 100%');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tickers: assets.map(a => a.ticker),
          weights: assets.map(a => a.weight / 100),
          benchmark,
          shock: shock / 100
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to compute scenario analysis');
      }

      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addAsset = () => setAssets([...assets, { ticker: '', weight: 0 }]);
  const removeAsset = (index: number) => setAssets(assets.filter((_, i) => i !== index));
  const updateAsset = (index: number, field: string, value: string | number) => {
    const newAssets = [...assets];
    newAssets[index] = { ...newAssets[index], [field]: value };
    setAssets(newAssets);
  };

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl col-span-1 lg:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Portfolio Assets</h3>
            <button onClick={addAsset} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-sm font-medium">
              <Plus className="w-4 h-4" /> Add Asset
            </button>
          </div>
          <p className="text-xs text-zinc-500 mb-4">Use suffixes for international exchanges (e.g., .NS for NSE, .BO for BSE)</p>
          <div className="space-y-3">
            {assets.map((asset, i) => (
              <div key={i} className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Ticker"
                  value={asset.ticker}
                  onFocus={() => setShowIndianStockHint(true)}
                  onChange={(e) => updateAsset(i, 'ticker', e.target.value.toUpperCase())}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
                />
                <input
                  type="number"
                  placeholder="Weight (%)"
                  step="1"
                  min="0"
                  max="100"
                  value={asset.weight}
                  onChange={(e) => updateAsset(i, 'weight', parseFloat(e.target.value))}
                  className="w-32 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button onClick={() => removeAsset(i)} className="text-zinc-500 hover:text-red-400 p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between items-center text-sm">
            <span className="text-zinc-400">Total Weight:</span>
            <span className={`font-mono font-medium ${Math.abs(assets.reduce((a, b) => a + b.weight, 0) - 100) > 0.1 ? 'text-red-400' : 'text-emerald-400'}`}>
              {assets.reduce((a, b) => a + b.weight, 0).toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Benchmark Index</label>
            <input 
              type="text" 
              list="benchmarks"
              value={benchmark} 
              onChange={(e) => setBenchmark(e.target.value.toUpperCase())} 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase" 
              placeholder="e.g. SPY, ^NSEI"
            />
            <datalist id="benchmarks">
              <option value="SPY">S&P 500 ETF</option>
              <option value="QQQ">Nasdaq 100 ETF</option>
              <option value="^NSEI">NIFTY 50</option>
              <option value="^BSESN">BSE SENSEX</option>
            </datalist>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Benchmark Shock (%)</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={shock} 
                onChange={(e) => setShock(parseFloat(e.target.value))} 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
              />
              <span className="text-zinc-500">%</span>
            </div>
            <p className="text-xs text-zinc-500">Enter a negative value for a market downturn (e.g., -10 for a 10% drop).</p>
          </div>
          <button onClick={handleCompute} disabled={loading} className="w-full mt-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md transition-colors disabled:opacity-50">
            {loading ? 'Simulating...' : 'Run Scenario'}
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
          <Zap className="w-12 h-12 text-zinc-700" />
          <div className="text-center space-y-1">
            <h3 className="text-zinc-400 font-medium">No Scenario Computed</h3>
            <p className="text-sm max-w-sm">Define your portfolio and a market shock above, then click run to simulate the impact on your assets.</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-500 space-y-4 border border-zinc-800/50 rounded-xl bg-zinc-900/20 border-dashed">
          <div className="w-12 h-12 border-4 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="text-center space-y-1">
            <h3 className="text-zinc-400 font-medium">Running Scenario</h3>
            <p className="text-sm max-w-sm">Calculating historical betas and estimating portfolio impact...</p>
          </div>
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard 
              title="Benchmark Shock" 
              value={(data.shock * 100).toFixed(2) + '%'} 
              icon={Activity} 
              color={data.shock < 0 ? 'text-red-400' : 'text-emerald-400'} 
            />
            <MetricCard 
              title="Expected Portfolio Impact" 
              value={(data.portfolioExpectedImpact * 100).toFixed(2) + '%'} 
              icon={TrendingDown} 
              color={data.portfolioExpectedImpact < 0 ? 'text-red-400' : 'text-emerald-400'} 
            />
            <MetricCard 
              title="Portfolio Beta" 
              value={(data.portfolioExpectedImpact / data.shock).toFixed(2)} 
              icon={ShieldAlert} 
              color="text-indigo-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <h3 className="text-lg font-medium mb-4">Estimated Asset Impact</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.assetResults.map((a: any) => ({
                    name: a.ticker,
                    impact: a.expectedImpact * 100
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                    <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} />
                    <YAxis stroke="#a1a1aa" fontSize={12} tickFormatter={(v) => v.toFixed(2) + '%'} />
                    <Tooltip 
                      formatter={(value: any) => `${Number(value).toFixed(2)}%`}
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
                      itemStyle={{ color: '#f4f4f5' }}
                    />
                    <Bar dataKey="impact" name="Expected Impact" radius={[4, 4, 0, 0]}>
                      {data.assetResults.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.expectedImpact < 0 ? '#ef4444' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl overflow-x-auto">
              <h3 className="text-lg font-medium mb-4">Asset Breakdown</h3>
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-950/50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Ticker</th>
                    <th className="px-4 py-3">Weight</th>
                    <th className="px-4 py-3">Beta to {data.benchmark}</th>
                    <th className="px-4 py-3 rounded-tr-lg">Expected Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {data.assetResults.map((asset: any, i: number) => (
                    <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                      <td className="px-4 py-3 font-medium">{asset.ticker}</td>
                      <td className="px-4 py-3 font-mono">{(asset.weight * 100).toFixed(2)}%</td>
                      <td className="px-4 py-3 font-mono">{asset.beta.toFixed(2)}</td>
                      <td className={`px-4 py-3 font-mono ${asset.expectedImpact < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {(asset.expectedImpact * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {data.historicalScenarios && data.historicalScenarios.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <h3 className="text-lg font-medium mb-4">Historical Stress Tests</h3>
              <p className="text-sm text-zinc-400 mb-6">Actual performance of this portfolio during major historical market events.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.historicalScenarios.map((scenario: any, i: number) => (
                  <div key={i} className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg flex justify-between items-center">
                    <span className="font-medium text-zinc-300">{scenario.name}</span>
                    <span className={`font-mono text-lg ${scenario.portfolioReturn < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {(scenario.portfolioReturn * 100).toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color = "text-zinc-50" }: { title: string, value: string, icon: any, color?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col gap-3">
      <div className="flex items-center gap-2 text-zinc-400">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
      </div>
      <div className={`text-2xl font-semibold tracking-tight font-mono ${color}`}>{value}</div>
    </div>
  );
}
