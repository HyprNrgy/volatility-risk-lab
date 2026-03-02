import Link from 'next/link';
import { Activity, ShieldAlert, TrendingUp, Zap, ArrowRight, BarChart2, PieChart } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500 p-1.5 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight">Volatility Risk Lab</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
              >
                Launch App <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
                <Zap className="w-4 h-4" />
                <span>Advanced Risk Analytics</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Understand your portfolio&apos;s <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">true risk</span>.
              </h1>
              <p className="text-xl text-zinc-400 mb-10 leading-relaxed">
                Professional-grade volatility modeling, Monte Carlo simulations, and scenario analysis tools built for modern investors.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href="/dashboard" 
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Start Analyzing <ArrowRight className="w-5 h-5" />
                </Link>
                <a 
                  href="#features" 
                  className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-8 py-4 rounded-lg text-lg font-medium transition-colors flex items-center justify-center"
                >
                  Explore Features
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-zinc-900">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Comprehensive Risk Toolkit</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Everything you need to measure, visualize, and stress-test your investment strategies.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={Activity}
              title="Single Asset Volatility"
              description="Analyze historical volatility, drawdowns, and return distributions for individual stocks and ETFs."
            />
            <FeatureCard 
              icon={PieChart}
              title="Portfolio Optimization"
              description="Construct efficient frontiers, calculate Sharpe ratios, and visualize correlation matrices."
            />
            <FeatureCard 
              icon={BarChart2}
              title="Monte Carlo Simulation"
              description="Project future price paths using Geometric Brownian Motion to estimate potential outcomes."
            />
            <FeatureCard 
              icon={ShieldAlert}
              title="Scenario Analysis"
              description="Stress-test your portfolio against historical market crashes and hypothetical shocks."
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-zinc-900 border-t border-b border-zinc-800 py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-6">Ready to stress-test your strategy?</h2>
            <p className="text-zinc-400 mb-8 text-lg">
              No sign-up required. Start analyzing your portfolio&apos;s risk profile instantly.
            </p>
            <Link 
              href="/dashboard" 
              className="inline-flex bg-white hover:bg-zinc-200 text-zinc-950 px-8 py-4 rounded-lg text-lg font-medium transition-colors items-center justify-center gap-2"
            >
              Launch Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-zinc-500 text-sm border-t border-zinc-900">
        <p>© {new Date().getFullYear()} Volatility Risk Lab. For educational purposes only.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-2xl hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-300">
      <div className="bg-indigo-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-indigo-500/20">
        <Icon className="w-6 h-6 text-indigo-400" />
      </div>
      <h3 className="text-xl font-semibold mb-3 text-zinc-100">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}
