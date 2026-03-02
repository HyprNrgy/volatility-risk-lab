import { BookOpen, AlertTriangle, Info, Calculator, ShieldAlert } from 'lucide-react';

export default function MethodologySection() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-indigo-500" />
          <h2 className="text-2xl font-semibold tracking-tight">Model Assumptions & Methodology</h2>
        </div>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-zinc-400 leading-relaxed">
            Volatility Risk Lab is designed as a compact risk terminal for quantitative equity analysis. 
            The calculations and models presented rely on several standard financial assumptions and methodologies. 
            Understanding these limitations is crucial for interpreting the results correctly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MethodologyCard 
          icon={Calculator}
          title="Normal Distribution Assumptions"
          content="Many metrics, including Parametric Value at Risk (VaR) and Mean-Variance Optimization, assume that asset returns follow a normal (Gaussian) distribution. In reality, financial returns often exhibit &apos;fat tails&apos; (leptokurtosis) and skewness, meaning extreme events occur more frequently than a normal distribution would predict."
        />
        
        <MethodologyCard 
          icon={AlertTriangle}
          title="Historical Volatility Limitations"
          content="Historical volatility is backward-looking. It assumes that past price fluctuations are indicative of future risk. Structural market changes, macroeconomic shifts, or company-specific events can cause future volatility to diverge significantly from historical estimates."
        />

        <MethodologyCard 
          icon={Info}
          title="252 Trading Day Convention"
          content="Annualization of daily metrics (returns, volatility) uses the standard convention of 252 trading days per year. This accounts for weekends and typical market holidays. Annualized Volatility = Daily Volatility × √252."
        />

        <MethodologyCard 
          icon={ShieldAlert}
          title="Data Handling & Survivorship Bias"
          content="Missing data points are handled using forward-fill logic (carrying the last known price forward). The platform relies on currently active tickers. Delisted or bankrupt companies are not included, introducing survivorship bias which may artificially inflate historical portfolio performance."
        />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl">
        <h3 className="text-lg font-medium mb-4">Metric Definitions</h3>
        <div className="space-y-4 text-sm text-zinc-400">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-zinc-800/50 pb-4">
            <div className="font-medium text-zinc-200">Value at Risk (VaR)</div>
            <div className="md:col-span-3">The maximum expected loss over a specific timeframe at a given confidence level (95%). Historical VaR uses the 5th percentile of past returns. Parametric VaR uses μ - 1.645σ.</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-zinc-800/50 pb-4">
            <div className="font-medium text-zinc-200">Beta</div>
            <div className="md:col-span-3">A measure of an asset&apos;s volatility relative to the broader market (benchmark). Calculated as Covariance(Asset, Benchmark) / Variance(Benchmark).</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-zinc-800/50 pb-4">
            <div className="font-medium text-zinc-200">Sharpe Ratio</div>
            <div className="md:col-span-3">Measures risk-adjusted performance. Calculated as (Expected Return - Risk-Free Rate) / Portfolio Volatility. The risk-free rate is dynamically pulled from the 10-Year Treasury yield (^TNX).</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="font-medium text-zinc-200">Monte Carlo (GBM)</div>
            <div className="md:col-span-3">Simulates future price paths using Geometric Brownian Motion: dS = μS dt + σS dW. It models stock prices as a continuous-time stochastic process with constant drift (μ) and volatility (σ).</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MethodologyCard({ icon: Icon, title, content }: { icon: any, title: string, content: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col gap-4">
      <div className="flex items-center gap-3 text-zinc-200">
        <div className="bg-zinc-800 p-2 rounded-lg">
          <Icon className="w-5 h-5 text-indigo-400" />
        </div>
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-sm text-zinc-400 leading-relaxed">
        {content}
      </p>
    </div>
  );
}
