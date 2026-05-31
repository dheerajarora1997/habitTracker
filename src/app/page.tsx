import Link from 'next/link';
import { Activity, Flame, Users, Trophy, Compass, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 bg-zinc-950 flex flex-col relative overflow-hidden font-sans">
      {/* Visual Ambient Blur Backgrounds */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-emerald-900/5 blur-[100px] pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="border-b border-zinc-900/80 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600/10 p-1.5 rounded-lg border border-indigo-500/20">
              <Activity className="h-5 w-5 text-indigo-400" />
            </div>
            <span className="text-md font-bold tracking-wider text-white">HABITPARTNER</span>
          </div>
          <div>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all glow-indigo"
            >
              Get Started
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20 z-10 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/50 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 animate-pulse">
          <Flame className="h-3.5 w-3.5 text-orange-500" />
          Transform habits together
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          The ultimate accountability partner{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-100 bg-clip-text text-transparent block sm:inline">
            habit tracking app.
          </span>
        </h1>

        <p className="max-w-2xl text-base sm:text-lg text-zinc-400 mb-10 leading-relaxed">
          Log in instantly with your phone. Join an accountability group with your friend.
          Log daily steps, track habits, score points, and fuel the fire of positive streaks.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full justify-center px-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg transition-all text-sm glow-indigo"
          >
            Start Tracking Free
            <ChevronRight className="h-4.5 w-4.5" />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 text-zinc-300 font-semibold transition-all text-sm"
          >
            See Points & Rules
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left pt-12 border-t border-zinc-900">
          {/* Card 1: OTP Session */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-800/50 hover:border-indigo-500/20 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-4">
              <Compass className="h-5 w-5 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Zero-Password OTP Login</h3>
            <p className="text-sm text-zinc-400">
              No memorizing passwords. Authenticate securely with a 6-digit verification code sent directly to your phone number.
            </p>
          </div>

          {/* Card 2: 2-Partner Limit */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-800/50 hover:border-indigo-500/20 transition-all">
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-4">
              <Users className="h-5 w-5 text-violet-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Focused 1-on-1 Teams</h3>
            <p className="text-sm text-zinc-400">
              Maximize accountability. Groups are limited to exactly 2 partners. Create up to 3 groups and track progress side-by-side.
            </p>
          </div>

          {/* Card 3: points tracker */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-800/50 hover:border-indigo-500/20 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <Trophy className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">The Point System</h3>
            <p className="text-sm text-zinc-400">
              Earn 1 point for every 2500 steps, and 1 point for every positive habit marked completed. Compete on the weekly leaderboard!
            </p>
          </div>
        </div>

        {/* Habit Points Reference Panel */}
        <div className="w-full mt-16 glass-panel p-8 rounded-2xl border border-zinc-900 text-left">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-400" />
            Daily Habit List & Points Scoring
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/40">
                <span className="text-zinc-300 font-medium">Daily Steps</span>
                <span className="text-indigo-400 font-semibold">1 Point per 2500 steps</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/40">
                <span className="text-zinc-300 font-medium">No Fast Food</span>
                <span className="text-indigo-400 font-semibold">+1 Point</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/40">
                <span className="text-zinc-300 font-medium">Hit the Gym</span>
                <span className="text-indigo-400 font-semibold">+1 Point</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/40">
                <span className="text-zinc-300 font-medium">No Alcohol</span>
                <span className="text-indigo-400 font-semibold">+1 Point</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/40">
                <span className="text-zinc-300 font-medium">Social Media Detox</span>
                <span className="text-indigo-400 font-semibold">+1 Point</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/40">
                <span className="text-zinc-300 font-medium">Learn / Study</span>
                <span className="text-indigo-400 font-semibold">+1 Point</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/40">
                <span className="text-zinc-300 font-medium">No Sugar</span>
                <span className="text-indigo-400 font-semibold">+1 Point</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/40">
                <span className="text-zinc-300 font-medium">Drink 1 Liters Water</span>
                <span className="text-indigo-400 font-semibold">+1 Point</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 z-10 text-center text-xs text-zinc-600">
        <p>© 2026 HabitPartner Accountability System. Built for visual excellence and peak performance.</p>
      </footer>
    </div>
  );
}

