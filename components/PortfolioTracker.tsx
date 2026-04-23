'use client';

import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Plus, Trash2, TrendingUp, ShieldAlert, RefreshCw, Briefcase, Activity } from 'lucide-react';
import { alertsEngine } from '@/lib/alerts';

type Holding = {
  id: string;
  ticker: string;
  quantity: number;
  buyPrice: number;
};

type LiveData = {
  ticker: string;
  currentPrice: number;
  sector: string;
};

export default function PortfolioTracker() {
  const [holdings, setHoldings] = useState<Holding[]>([
    { id: '1', ticker: 'AAPL', quantity: 50, buyPrice: 150 },
    { id: '2', ticker: 'MSFT', quantity: 20, buyPrice: 300 },
  ]);
  
  const [liveData, setLiveData] = useState<Record<string, LiveData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLivePrices = async () => {
    const validTickers = holdings.filter(h => h.ticker.trim() !== '').map(h => h.ticker.toUpperCase());
    if (validTickers.length === 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers: validTickers }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch prices');
      
      const newLiveData: Record<string, LiveData> = {};
      data.forEach((d: LiveData) => Object.assign(newLiveData, { [d.ticker]: d }));
      setLiveData(newLiveData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLivePrices();
    // Use interval to simulate a live ticker update occasionally
    const interval = setInterval(fetchLivePrices, 60000); // 1 minute
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [holdings.length]); // Refresh natively when a holding is added/removed

  const addHolding = () => setHoldings([...holdings, { id: Math.random().toString(), ticker: '', quantity: 0, buyPrice: 0 }]);
  const removeHolding = (id: string) => setHoldings(holdings.filter((h) => h.id !== id));
  const updateHolding = (id: string, field: keyof Holding, value: string | number) => {
    setHoldings(holdings.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  // Derived calculations
  const summary = useMemo(() => {
    let totalValue = 0;
    let totalCost = 0;
    const sectors: Record<string, number> = {};

    holdings.forEach(h => {
      const live = liveData[h.ticker.toUpperCase()];
      const price = live?.currentPrice || h.buyPrice;
      const val = price * h.quantity;
      const cost = h.buyPrice * h.quantity;

      totalValue += val;
      totalCost += cost;

      if (live?.sector) {
        sectors[live.sector] = (sectors[live.sector] || 0) + val;
      } else {
        sectors['Unknown'] = (sectors['Unknown'] || 0) + val;
      }
    });

    const pnl = totalValue - totalCost;
    const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
    
    // Mocking an aggregated volatility score between 10 and 60 depending on holdings
    // A placeholder calculation using a hash of string lengths just to give deterministic random data
    const volMock = holdings.reduce((acc, h) => acc + h.ticker.length, 0) % 50 + 10; 

    const sectorData = Object.keys(sectors).map(key => ({
      name: key,
      value: sectors[key]
    }));
    
    // Evaluate via alert system
    if (volMock > 0) {
      alertsEngine.evaluatePortfolioRisk(volMock);
    }

    return { totalValue, pnl, pnlPercent, volMock, sectorData };
  }, [holdings, liveData]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-zinc-400">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-medium uppercase tracking-wider">Total Value</h3>
          </div>
          <div className="text-4xl font-bold font-mono text-zinc-100">
            ${summary.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-zinc-400">
            <TrendingUp className={`w-5 h-5 ${summary.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} />
            <h3 className="text-sm font-medium uppercase tracking-wider">Total Profit / Loss</h3>
          </div>
          <div className={`text-4xl font-bold font-mono flex items-baseline gap-2 ${summary.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            ${Math.abs(summary.pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-lg font-medium">({summary.pnlPercent >= 0 ? '+' : ''}{summary.pnlPercent.toFixed(2)}%)</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center gap-2 text-zinc-400 relative z-10">
            <Activity className="w-5 h-5 text-orange-400" />
            <h3 className="text-sm font-medium uppercase tracking-wider">Portfolio Volatility</h3>
          </div>
          <div className="text-4xl font-bold font-mono text-zinc-100 relative z-10">
            {summary.volMock.toFixed(1)}%
          </div>
          <p className="text-xs text-zinc-500 mt-1 relative z-10">Simulated risk profile score.</p>
          <div className="absolute -bottom-10 -right-6 text-zinc-800 opacity-50 z-0">
            <ShieldAlert className="w-32 h-32" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table of Holdings */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl lg:col-span-2 shadow-xl shadow-black/20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-zinc-100">Live Holdings</h3>
            <div className="flex items-center gap-4">
              <button onClick={fetchLivePrices} className="text-zinc-500 hover:text-white transition-colors" title="Force Refresh">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
              </button>
              <button onClick={addHolding} className="bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all">
                <Plus className="w-4 h-4" /> Add Trade
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-950/50 border-y border-zinc-800/50">
                <tr>
                  <th className="px-4 py-4 font-semibold">Asset</th>
                  <th className="px-4 py-4 font-semibold text-right">Quantity</th>
                  <th className="px-4 py-4 font-semibold text-right">Avg Buy Price</th>
                  <th className="px-4 py-4 font-semibold text-right">Live Price</th>
                  <th className="px-4 py-4 font-semibold text-right">PnL</th>
                  <th className="px-4 py-4 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h, i) => {
                  const live = liveData[h.ticker.toUpperCase()];
                  const currentPrice = live?.currentPrice || 0;
                  const itemValue = currentPrice * h.quantity;
                  const itemCost = h.buyPrice * h.quantity;
                  const itemPnl = currentPrice > 0 ? itemValue - itemCost : 0;
                  const itemPnlPercent = itemCost > 0 ? (itemPnl / itemCost) * 100 : 0;

                  return (
                    <tr key={h.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={h.ticker}
                          placeholder="TICKER"
                          className="w-24 bg-transparent border-b border-zinc-700/50 focus:border-indigo-500 px-1 py-1 uppercase text-zinc-200 focus:outline-none placeholder:text-zinc-700 font-medium"
                          onChange={(e) => updateHolding(h.id, 'ticker', e.target.value)}
                          onBlur={fetchLivePrices}
                        />
                        {live?.sector && <div className="text-[10px] text-zinc-500 tracking-wide uppercase mt-1 ml-1">{live.sector}</div>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          value={h.quantity || ''}
                          className="w-20 bg-transparent border-b border-zinc-700/50 focus:border-indigo-500 px-1 py-1 text-right text-zinc-300 focus:outline-none"
                          onChange={(e) => updateHolding(h.id, 'quantity', Number(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end items-center gap-1">
                          <span className="text-zinc-500">$</span>
                          <input
                            type="number"
                            value={h.buyPrice || ''}
                            className="w-24 bg-transparent border-b border-zinc-700/50 focus:border-indigo-500 px-1 py-1 text-right font-mono text-zinc-300 focus:outline-none"
                            onChange={(e) => updateHolding(h.id, 'buyPrice', Number(e.target.value))}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-200">
                        {currentPrice > 0 ? `$${currentPrice.toFixed(2)}` : <span className="text-zinc-600">--</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {currentPrice > 0 ? (
                          <div className={`font-mono font-medium ${itemPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {itemPnl >= 0 ? '+' : ''}${itemPnl.toFixed(2)}
                            <div className="text-xs opacity-80">{itemPnlPercent >= 0 ? '+' : ''}{itemPnlPercent.toFixed(2)}%</div>
                          </div>
                        ) : (
                          <span className="text-zinc-600">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => removeHolding(h.id)} className="text-zinc-600 hover:text-rose-400 transition-colors p-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {holdings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                      No holdings added. Click &quot;Add Trade&quot; to begin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {error && <p className="text-rose-400 text-sm mt-4">{error}</p>}
        </div>

        {/* Sector Allocation */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-xl shadow-black/20 flex flex-col">
          <h3 className="text-lg font-semibold text-zinc-100 mb-6">Sector Allocation</h3>
          {summary.sectorData.length > 0 && summary.sectorData.some(d => d.value > 0) ? (
             <div className="flex-grow min-h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={summary.sectorData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                     stroke="none"
                   >
                     {summary.sectorData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <RechartsTooltip 
                      formatter={(value: any) => `$${Number(value).toFixed(2)}`}
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
                      itemStyle={{ color: '#f4f4f5' }}
                    />
                   <Legend wrapperStyle={{ fontSize: '12px' }} />
                 </PieChart>
               </ResponsiveContainer>
             </div>
          ) : (
            <div className="flex-grow flex items-center justify-center text-zinc-600 text-sm">
              Insufficient data for allocation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
