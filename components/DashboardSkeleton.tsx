import React from 'react';
import { Activity, PieChart, BarChart2, Zap, Info } from 'lucide-react';

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/20 p-1.5 rounded-lg animate-pulse">
                <Activity className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="h-5 w-32 bg-zinc-800 rounded-md animate-pulse"></div>
            </div>
            <nav className="hidden md:flex space-x-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-9 w-24 bg-zinc-900 rounded-md animate-pulse mx-1"></div>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl h-24 animate-pulse"></div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl h-80 animate-pulse"></div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl h-80 animate-pulse"></div>
        </div>
      </main>
    </div>
  );
}
