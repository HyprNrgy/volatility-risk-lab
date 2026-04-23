import { Activity } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col justify-center items-center z-[200]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-xl opacity-50 animate-pulse" />
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl relative shadow-2xl shadow-indigo-500/10">
            <Activity className="w-8 h-8 text-indigo-400 animate-bounce" style={{ animationDuration: '1s' }} />
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-bold text-white tracking-tight">Risk Lab</h2>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
