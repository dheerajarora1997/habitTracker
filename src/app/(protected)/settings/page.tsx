'use client';

import React, { useState } from 'react';
import { Settings, Bell, Shield, Moon, Eye, User, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [reminders, setReminders] = useState(true);
  const [partnerAlerts, setPartnerAlerts] = useState(true);
  const [streakMilestones, setStreakMilestones] = useState(true);

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full relative space-y-6">
      <div className="absolute -top-10 right-1/4 w-80 h-80 rounded-full bg-indigo-900/5 blur-[80px] pointer-events-none"></div>

      <div className="mb-6 text-left">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Settings className="h-7 w-7 text-indigo-400" />
          Settings
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Review application preferences and account security.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-zinc-900 shadow-2xl space-y-6">
        {/* Section 1: Notifications */}
        <div>
          <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-indigo-400" />
            Alerts & Notifications
          </h3>

          <div className="space-y-3">
            {/* Toggle 1 */}
            <div className="flex justify-between items-center p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/40">
              <div>
                <div className="text-xs font-bold text-white">Daily Habit Reminders</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Receive a push alert if habits are unlogged by 8:00 PM</div>
              </div>
              <button
                type="button"
                onClick={() => setReminders(!reminders)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  reminders ? 'bg-indigo-650' : 'bg-zinc-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    reminders ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex justify-between items-center p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/40">
              <div>
                <div className="text-xs font-bold text-white">Partner Activity Alerts</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Get notified instantly when your partner records positive points</div>
              </div>
              <button
                type="button"
                onClick={() => setPartnerAlerts(!partnerAlerts)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  partnerAlerts ? 'bg-indigo-650' : 'bg-zinc-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    partnerAlerts ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3 */}
            <div className="flex justify-between items-center p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/40">
              <div>
                <div className="text-xs font-bold text-white">Streak Milestones</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Alert me when we hit 5, 10, or 30 consecutive tracking days</div>
              </div>
              <button
                type="button"
                onClick={() => setStreakMilestones(!streakMilestones)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  streakMilestones ? 'bg-indigo-650' : 'bg-zinc-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    streakMilestones ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Look and Feel */}
        <div className="pt-4 border-t border-zinc-900">
          <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Eye className="h-4 w-4 text-violet-400" />
            Theme & Appearance
          </h3>
          <div className="flex justify-between items-center p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/40">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-zinc-400" />
              <div>
                <div className="text-xs font-bold text-white">Dark Theme (Aesthetic)</div>
                <div className="text-[10px] text-zinc-500">Premium dark glass mode is locked as the default interface color scale</div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase bg-indigo-950/40 border border-indigo-900/50 px-2 py-0.5 rounded-md">
              LOCKED
            </span>
          </div>
        </div>

        {/* Section 3: Profile redirection Link */}
        <div className="pt-4 border-t border-zinc-900">
          <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            Account Security
          </h3>
          <Link
            href="/profile"
            className="flex justify-between items-center p-4 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-800/50 transition-all text-xs"
          >
            <div className="flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-zinc-400" />
              <div>
                <div className="font-bold text-white">Configure User Details</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Access phone, display name and upload custom avatar URLs</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-500" />
          </Link>
        </div>

        {/* Info panel */}
        <div className="flex items-start gap-2.5 text-[10px] text-zinc-500 border-t border-zinc-900 pt-6">
          <ShieldCheck className="h-4 w-4 text-indigo-500/80 shrink-0" />
          <p>
            Your account is secured using JWT sessions tied directly to your verified phone number. All requests require valid HTTP-only credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
