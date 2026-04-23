'use client';

import { useState, useEffect } from 'react';
import { alertsEngine, AlertEvent, AlertConfig } from '@/lib/alerts';
import { BellRing, ShieldAlert, Activity, HeartCrack, Info, Settings, Trash2, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export default function AlertsModule() {
  const [config, setConfig] = useState<AlertConfig>(alertsEngine.getConfig());
  const [history, setHistory] = useState<AlertEvent[]>([...alertsEngine.getHistory()]);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Subscribe to new alerts
    const unsubscribe = alertsEngine.subscribe(() => {
      setHistory([...alertsEngine.getHistory()]);
    });

    return () => unsubscribe();
  }, []);

  const handleConfigChange = (key: keyof AlertConfig, value: boolean | number) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    // Auto-save to engine
    alertsEngine.updateConfig(newConfig);
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const clearHistory = () => {
    alertsEngine.clearHistory();
    setHistory([]);
  };

  // Helper config for defining UI details of events
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-rose-500/50 bg-rose-500/10 text-rose-400';
      case 'warning': return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500';
      default: return 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-5 h-5 text-rose-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <Info className="w-5 h-5 text-indigo-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'volatility': return <Activity className="w-4 h-4" />;
      case 'sentiment': return <HeartCrack className="w-4 h-4" />;
      case 'portfolio_risk': return <ShieldAlert className="w-4 h-4" />;
      default: return <BellRing className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Volatility Alert Settings */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 text-zinc-100 font-semibold">
              <Activity className="w-5 h-5 text-indigo-400" />
              Volatility Spikes
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={config.volatilityEnabled} onChange={(e) => handleConfigChange('volatilityEnabled', e.target.checked)} className="sr-only peer" />
              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>
          <p className="text-zinc-500 text-sm">Trigger an alert if a single asset&apos;s annualized volatility exceeds this threshold.</p>
          <div className="mt-auto pt-4 border-t border-zinc-800/50">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider block mb-2">Threshold (%)</label>
            <input 
              type="number" 
              disabled={!config.volatilityEnabled}
              value={config.volatilityThreshold} 
              onChange={(e) => handleConfigChange('volatilityThreshold', Number(e.target.value))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Sentiment Alert Settings */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 text-zinc-100 font-semibold">
              <HeartCrack className="w-5 h-5 text-rose-400" />
              Sentiment Drops
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={config.sentimentEnabled} onChange={(e) => handleConfigChange('sentimentEnabled', e.target.checked)} className="sr-only peer" />
              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>
          <p className="text-zinc-500 text-sm">Alert when the Decision Engine evaluates an asset&apos;s market sentiment under this score (0-100).</p>
          <div className="mt-auto pt-4 border-t border-zinc-800/50">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider block mb-2">Threshold (Score)</label>
            <input 
              type="number" 
              disabled={!config.sentimentEnabled}
              value={config.sentimentThreshold} 
              onChange={(e) => handleConfigChange('sentimentThreshold', Number(e.target.value))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Portfolio Risk Settings */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 text-zinc-100 font-semibold">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Portfolio Risk
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={config.portfolioRiskEnabled} onChange={(e) => handleConfigChange('portfolioRiskEnabled', e.target.checked)} className="sr-only peer" />
              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>
          <p className="text-zinc-500 text-sm">Trigger if simulated total portfolio volatility bounds exceed your safety target.</p>
          <div className="mt-auto pt-4 border-t border-zinc-800/50">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider block mb-2">Threshold (%)</label>
            <input 
              type="number" 
              disabled={!config.portfolioRiskEnabled}
              value={config.portfolioRiskThreshold} 
              onChange={(e) => handleConfigChange('portfolioRiskThreshold', Number(e.target.value))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>
        </div>

      </div>

      <div className="flex justify-end">
         {isSaved && (
            <span className="text-emerald-400 text-sm flex items-center gap-1 animate-pulse">
               <CheckCircle2 className="w-4 h-4" /> Preferences saved
            </span>
         )}
      </div>

      {/* Alerts Event Log Feed */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <BellRing className="w-5 h-5" /> Active Trigger History
          </h3>
          <button 
             onClick={clearHistory}
             className="text-sm text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear Log
          </button>
        </div>

        {history.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center opacity-60">
             <BellRing className="w-12 h-12 text-zinc-700 mb-4" />
             <p className="text-zinc-400">No alerts have been triggered yet.</p>
             <p className="text-xs text-zinc-500 mt-2">Run analytics in Single Asset or Portfolio tracking to simulate events.</p>
          </div>
        ) : (
          <div className="space-y-3">
             {history.map((event) => (
                <div key={event.id} className={`flex items-start gap-4 p-4 rounded-lg border ${getSeverityStyle(event.severity)} transition-all shadow-md`}>
                   <div className="mt-0.5 shrink-0">
                      {getSeverityIcon(event.severity)}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-1">
                         <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-80">
                            {getTypeIcon(event.type)}
                            {event.type.replace('_', ' ')}
                         </div>
                         <time className="text-xs opacity-60 tabular-nums">
                            {new Date(event.timestamp).toLocaleTimeString()}
                         </time>
                      </div>
                      <p className="text-sm font-medium leading-relaxed">
                         {event.message}
                      </p>
                   </div>
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
