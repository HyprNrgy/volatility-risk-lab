'use client';
import { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis, Legend, BarChart, Bar } from 'recharts';
import { AlertCircle, Plus, Trash2, PieChart, TrendingUp, Activity, ShieldAlert, Info, X } from 'lucide-react';
import { alertsEngine } from '@/lib/alerts';

export default function PortfolioModule() {
  const [assets, setAssets] = useState([{ ticker: 'AAPL', weight: 40 }, { ticker: 'MSFT', weight: 40 }, { ticker: 'GOOGL', weight: 20 }]);
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    setEndDate(new Date().toISOString().split('T')[0]);
  }, []);
  const [riskFreeRateSource, setRiskFreeRateSource] = useState('^TNX');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);
  const [showIndianStockHint, setShowIndianStockHint] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  const handleCompute = async () => {
    setLoading(true);
    setError('');
    setSelectedPoint(null);
    const sum = assets.reduce((a, b) => a + b.weight, 0);
    if (Math.abs(sum - 100) > 0.1) {
      setError('Weights must sum to 100%');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tickers: assets.map(a => a.ticker),
          weights: assets.map(a => a.weight / 100),
          startDate,
          endDate,
          riskFreeRateSource
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch data');
      setData(json);
      
      // Trigger portfolio risk alerts evaluation
      if (json.portfolio && json.portfolio.volatility) {
         alertsEngine.evaluatePortfolioRisk(json.portfolio.volatility * 100);
      }
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
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Date Range</label>
            <div className="flex flex-col gap-2">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Risk-Free Rate Proxy</label>
            <select value={riskFreeRateSource} onChange={(e) => setRiskFreeRateSource(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="^TNX">10-Year Treasury (^TNX)</option>
              <option value="^IRX">13-Week Treasury (^IRX)</option>
            </select>
          </div>
          <button onClick={handleCompute} disabled={loading} className="w-full mt-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md transition-colors disabled:opacity-50">
            {loading ? 'Computing...' : 'Compute Portfolio'}
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
          <PieChart className="w-12 h-12 text-zinc-700" />
          <div className="text-center space-y-1">
            <h3 className="text-zinc-400 font-medium">No Portfolio Computed</h3>
            <p className="text-sm max-w-sm">Add assets and weights above, then click compute to generate the efficient frontier and risk metrics.</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-500 space-y-4 border border-zinc-800/50 rounded-xl bg-zinc-900/20 border-dashed">
          <div className="w-12 h-12 border-4 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="text-center space-y-1">
            <h3 className="text-zinc-400 font-medium">Computing Portfolio</h3>
            <p className="text-sm max-w-sm">Fetching historical data and calculating covariance matrices...</p>
          </div>
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="Port. Volatility" value={(data.portfolio.volatility * 100).toFixed(2) + '%'} icon={Activity} />
            <MetricCard title="Expected Return" value={(data.portfolio.expectedReturn * 100).toFixed(2) + '%'} icon={TrendingUp} />
            <MetricCard title="Sharpe Ratio" value={data.portfolio.sharpeRatio.toFixed(2)} icon={PieChart} />
            <MetricCard title="Risk-Free Rate" value={(data.portfolio.riskFreeRate * 100).toFixed(2) + '%'} icon={ShieldAlert} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium">Efficient Frontier</h3>
                {selectedPoint && (
                  <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg text-sm min-w-[200px]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-zinc-300">Selected Portfolio</span>
                      <button onClick={() => setSelectedPoint(null)} className="text-zinc-500 hover:text-zinc-300">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
                      <span className="text-zinc-500">Return:</span>
                      <span className="font-mono text-emerald-400 text-right">{(selectedPoint.return * 100).toFixed(2)}%</span>
                      <span className="text-zinc-500">Vol:</span>
                      <span className="font-mono text-zinc-300 text-right">{(selectedPoint.volatility * 100).toFixed(2)}%</span>
                      <span className="text-zinc-500">Sharpe:</span>
                      <span className="font-mono text-zinc-300 text-right">{selectedPoint.sharpe ? selectedPoint.sharpe.toFixed(2) : ((selectedPoint.return - data.portfolio.riskFreeRate) / selectedPoint.volatility).toFixed(2)}</span>
                    </div>
                    {selectedPoint.weights && (
                      <div className="pt-2 border-t border-zinc-800/50">
                        <span className="text-xs text-zinc-500 block mb-1">Weights:</span>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                          {selectedPoint.weights.map((w: number, i: number) => (
                            <div key={i} className="flex justify-between text-xs">
                              <span className="text-zinc-400">{assets[i].ticker}</span>
                              <span className="font-mono text-zinc-300">{(w * 100).toFixed(1)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedPoint.isCurrent && (
                      <div className="pt-2 border-t border-zinc-800/50 text-xs text-indigo-400 font-medium text-center">
                        Current Portfolio
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis type="number" dataKey="volatility" name="Volatility" stroke="#a1a1aa" tickFormatter={(v) => (v * 100).toFixed(2) + '%'} domain={['auto', 'auto']} />
                    <YAxis type="number" dataKey="return" name="Return" stroke="#a1a1aa" tickFormatter={(v) => (v * 100).toFixed(2) + '%'} domain={['auto', 'auto']} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }} itemStyle={{ color: '#f4f4f5' }} formatter={(val: any) => (Number(val) * 100).toFixed(2) + '%'} />
                    <Legend wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
                    <Scatter name="Random Portfolios" data={data.scatterPoints} fill="#4f46e5" opacity={0.3} onClick={(e) => setSelectedPoint(e)} className="cursor-pointer" />
                    <Scatter name="Efficient Frontier" data={data.efficientFrontier} fill="#10b981" line shape="circle" onClick={(e) => setSelectedPoint(e)} className="cursor-pointer" />
                    <Scatter name="Current Portfolio" data={[{ volatility: data.portfolio.volatility, return: data.portfolio.expectedReturn, isCurrent: true, weights: assets.map(a => a.weight / 100) }]} fill="#ef4444" shape="star" onClick={(e) => setSelectedPoint(e)} className="cursor-pointer" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl overflow-x-auto">
              <h3 className="text-lg font-medium mb-4">Correlation Matrix</h3>
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-950/50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg"></th>
                    {assets.map((a, i) => <th key={i} className="px-4 py-3">{a.ticker}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data.matrices.correlation.map((row: number[], i: number) => (
                    <tr key={i} className="border-b border-zinc-800/50">
                      <th className="px-4 py-3 font-medium text-zinc-300">{assets[i].ticker}</th>
                      {row.map((val, j) => (
                        <td key={j} className="px-4 py-3 font-mono" style={{ color: val > 0.5 ? '#10b981' : val < -0.5 ? '#ef4444' : '#a1a1aa' }}>
                          {val.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl overflow-x-auto">
              <h3 className="text-lg font-medium mb-4">Asset Contributions</h3>
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-950/50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Ticker</th>
                    <th className="px-4 py-3">Weight</th>
                    <th className="px-4 py-3">Marginal Risk</th>
                    <th className="px-4 py-3 rounded-tr-lg">% Risk Contrib.</th>
                  </tr>
                </thead>
                <tbody>
                  {data.individual.map((asset: any, i: number) => (
                    <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                      <td className="px-4 py-3 font-medium">{asset.ticker}</td>
                      <td className="px-4 py-3 font-mono">{(asset.weight * 100).toFixed(2)}%</td>
                      <td className="px-4 py-3 font-mono">{(asset.marginalRiskContribution * 100).toFixed(2)}%</td>
                      <td className="px-4 py-3 font-mono">{(asset.percentageRiskContribution * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <h3 className="text-lg font-medium mb-4">Risk Contribution Breakdown</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.individual.map((a: any) => ({
                    name: a.ticker,
                    marginalRisk: a.marginalRiskContribution * 100,
                    pctRisk: a.percentageRiskContribution * 100
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                    <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#a1a1aa" fontSize={12} tickFormatter={(v) => v.toFixed(2) + '%'} />
                    <YAxis yAxisId="right" orientation="right" stroke="#a1a1aa" fontSize={12} tickFormatter={(v) => v.toFixed(2) + '%'} />
                    <Tooltip 
                      formatter={(value: any) => `${Number(value).toFixed(2)}%`}
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
                      itemStyle={{ color: '#f4f4f5' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
                    <Bar yAxisId="left" dataKey="marginalRisk" name="Marginal Risk" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="pctRisk" name="% Risk Contrib." fill="#10b981" radius={[4, 4, 0, 0]} />
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
