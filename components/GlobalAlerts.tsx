'use client';

import { useState, useEffect } from 'react';
import { alertsEngine, AlertEvent } from '@/lib/alerts';
import { Activity, HeartCrack, ShieldAlert, XCircle, AlertTriangle, Info, X, BellRing } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function GlobalAlerts() {
  const [toasts, setToasts] = useState<AlertEvent[]>([]);

  useEffect(() => {
    // We only care about new alerts emitted AFTER this mounts
    const unsubscribe = alertsEngine.subscribe((event) => {
      // Ignore internal refresh/update dummy events
      if (event.id === 'update') return;

      // Add to toasts list
      setToasts((prev) => [...prev, event]);

      // Auto dismiss after 6 seconds
      setTimeout(() => {
        removeToast(event.id);
      }, 6000);
    });

    return () => unsubscribe();
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-rose-500/50 bg-rose-950/80 text-rose-100 shadow-[0_0_25px_rgba(244,63,94,0.3)]';
      case 'warning': return 'border-yellow-500/50 bg-yellow-950/80 text-yellow-100 shadow-[0_0_25px_rgba(234,179,8,0.2)]';
      default: return 'border-indigo-500/50 bg-indigo-950/80 text-indigo-100 shadow-[0_0_25px_rgba(99,102,241,0.2)]';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-5 h-5 text-rose-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default: return <Info className="w-5 h-5 text-indigo-400" />;
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
    <div className="fixed bottom-6 right-6 z-[150] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, x: 20 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md ${getSeverityStyle(toast.severity)}`}
          >
            <div className="shrink-0 mt-0.5">{getSeverityIcon(toast.severity)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">
                {getTypeIcon(toast.type)}
                <span>{toast.type.replace('_', ' ')} Alert</span>
              </div>
              <p className="text-sm font-medium leading-relaxed drop-shadow-sm whitespace-pre-wrap">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-white/50 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
