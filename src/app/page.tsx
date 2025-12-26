import Link from 'next/link';
import { ArrowRight, BarChart2, Lock, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          InsightBoard
        </div>
        <div className="space-x-4">
          <Link href="/login" className="text-slate-300 hover:text-white transition-colors">Login</Link>
          <Link href="/register" className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 transition-all font-medium">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 container mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          New: Excel 2.0 Integration
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Turn Data into <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Decisions</span>
        </h1>
        
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Upload your Excel files and instantly generate beautiful, interactive dashboards. 
          Secure, fast, and no coding required.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <Link 
            href="/register" 
            className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-lg font-semibold shadow-lg shadow-blue-500/25 transition-all hover:scale-105 flex items-center gap-2"
          >
            Get Started Free <ArrowRight size={20} />
          </Link>
          <Link 
            href="/dashboard" 
            className="px-8 py-4 rounded-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-lg font-semibold transition-all"
          >
            View Demo
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 text-left">
          <div className="glass-card p-8 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6 text-blue-400">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Instant Visuals</h3>
            <p className="text-slate-400">
              Automatic parsing of Excel/CSV files. Just drag, drop, and see your data come to life.
            </p>
          </div>
          <div className="glass-card p-8 hover:-translate-y-2 transition-transform duration-300">
             <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-6 text-purple-400">
              <BarChart2 size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Custom Analytics</h3>
            <p className="text-slate-400">
              Choose your metrics, customize chart types, and build a personalized dashboard.
            </p>
          </div>
          <div className="glass-card p-8 hover:-translate-y-2 transition-transform duration-300">
             <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-6 text-emerald-400">
              <Lock size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Enterprise Security</h3>
            <p className="text-slate-400">
              Bank-grade encryption for your data. built with secure JWT authentication.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}