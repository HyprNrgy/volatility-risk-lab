'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function TickerTape() {
  const [tickers, setTickers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickers() {
      try {
        const res = await fetch('/api/tickers');
        const data = await res.json();
        if (Array.isArray(data)) {
          setTickers([...data, ...data]); // Duplicate for infinite scroll
        }
      } catch (err) {
        console.error('Ticker tape error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTickers();
  }, []);

  if (loading || !tickers.length) return <div className="h-8 bg-zinc-950/80 border-b border-zinc-800 backdrop-blur-md"></div>;

  return (
    <div 
      className="w-full h-8 overflow-hidden bg-zinc-950/80 border-b border-zinc-800 backdrop-blur-md flex items-center z-[100] sticky top-0"
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
      }}
    >
      <motion.div
        className="flex whitespace-nowrap gap-8 pr-8"
        animate={{ x: '-100%' }}
        transition={{
          repeat: Infinity,
          duration: 90, // Slower, smoother speed
          ease: 'linear',
        }}
        whileHover={{ animationPlayState: 'paused' }}
      >
        {tickers.map((t, i) => (
          <div key={`${t.symbol}-${i}`} className="flex items-center gap-3 text-xs font-semibold py-1">
            <span className="text-zinc-400">{t.name}</span>
            <span className="text-zinc-100 font-mono">{Number(t.price).toFixed(2)}</span>
            <span className={`font-medium ${t.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {t.change >= 0 ? '▲' : '▼'} {Math.abs(t.changePercent).toFixed(2)}%
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
