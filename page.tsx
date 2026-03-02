'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, BarChart2, PieChart, Info, Settings, AlertTriangle } from 'lucide-react';
import SingleAssetModule from '@/components/SingleAssetModule';
import PortfolioModule from '@/components/PortfolioModule';
import MonteCarloModule from '@/components/MonteCarloModule';
import ScenarioAnalysisModule from '@/components/ScenarioAnalysisModule';
import MethodologySection from '@/components/MethodologySection';
import { Zap } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('single');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  const tabs = [
    { id: 'single', label: 'Single Asset', icon: Activity },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'montecarlo', label: 'Monte Carlo', icon: BarChart2 },
    { id: 'scenario', label: 'Scenario Analysis', icon: Zap },
    { id: 'methodology', label: 'Methodology', icon: Info },
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans flex items-center justify-center">
        <div className="animate-pulse text-zinc-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500/30">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="bg-indigo-500 p-1.5 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight">Volatility Risk Lab</h1>
            </Link>
            <nav className="hidden md:flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'single' && <SingleAssetModule />}
          {activeTab === 'portfolio' && <PortfolioModule />}
          {activeTab === 'montecarlo' && <MonteCarloModule />}
          {activeTab === 'scenario' && <ScenarioAnalysisModule />}
          {activeTab === 'methodology' && <MethodologySection />}
        </motion.div>
      </main>
    </div>
  );
}
