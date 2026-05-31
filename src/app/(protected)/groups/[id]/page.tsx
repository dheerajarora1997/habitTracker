'use client';

import React, { useState, use } from 'react';
import { useGetGroupDetailsQuery } from '@/store/apiSlice';
import { Trophy, Flame, Footprints, Copy, Check, ChevronLeft, ShieldCheck, Sparkles, CheckCircle2, XCircle, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HABITS_LABELS: Record<string, string> = {
  noFastFood: 'No Fast Food',
  hitGym: 'Hit the Gym',
  noAlcohol: 'No Alcohol',
  socialMediaDetox: 'Media Detox',
  learnStudy: 'Study / Learn',
  noSugar: 'No Sugar',
  drinkWater: 'Drink Water 2L',
};

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = use(params);
  const { data: detailRes, isLoading, error } = useGetGroupDetailsQuery(groupId);
  
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh] text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold tracking-wide">Syncing room details...</p>
        </div>
      </div>
    );
  }

  if (error || !detailRes?.success || !detailRes?.group) {
    return (
      <div className="flex-1 max-w-md mx-auto text-center py-16">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Room not found</h3>
        <p className="text-zinc-500 text-sm mb-6">
          The requested group ID is invalid or you do not have permission to view it.
        </p>
        <Link href="/groups" className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs inline-flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" /> Back to My Groups
        </Link>
      </div>
    );
  }

  const { group, members, meUserId } = detailRes;

  // Identify who is "Me" and who is the "Partner"
  const me = members.find((m: any) => m.userId === meUserId);
  const partner = members.find((m: any) => m.userId !== meUserId);

  // If partner hasn't joined yet
  const partnerJoined = !!partner;

  // Compile Chart data side-by-side
  const chartDataMap: Record<string, { date: string; Me?: number; Partner?: number }> = {};

  if (me && me.history) {
    me.history.forEach((record: any) => {
      chartDataMap[record.date] = {
        date: record.date.slice(5), // MM-DD format
        Me: record.steps,
      };
    });
  }

  if (partner && partner.history) {
    partner.history.forEach((record: any) => {
      const existing = chartDataMap[record.date];
      if (existing) {
        existing.Partner = record.steps;
      } else {
        chartDataMap[record.date] = {
          date: record.date.slice(5),
          Partner: record.steps,
        };
      }
    });
  }

  // Sort and convert to array
  const stepHistoryChartData = Object.entries(chartDataMap)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([, val]) => val);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full relative space-y-6">
      <div className="absolute -top-10 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-900/5 blur-[120px] pointer-events-none"></div>

      {/* Header Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-4">
        <div>
          <Link href="/groups" className="text-zinc-500 hover:text-zinc-300 font-bold text-xs inline-flex items-center gap-1 mb-2">
            <ChevronLeft className="h-4.5 w-4.5" /> Back to Groups
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{group.groupName}</h1>
        </div>

        {/* Copy Invite Code Node */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-xs font-mono">
          <span className="text-zinc-500 font-sans font-bold uppercase text-[10px] tracking-wider mr-1">Invite Partner:</span>
          <span className="text-white font-bold tracking-wide">{group.inviteCode}</span>
          <button
            onClick={() => handleCopyCode(group.inviteCode)}
            className="text-zinc-500 hover:text-white transition-all pl-1.5"
          >
            {copiedCode ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {!partnerJoined ? (
        /* Pending Partner Screen */
        <div className="glass-panel p-10 rounded-2xl border border-zinc-900 text-center flex flex-col items-center justify-center min-h-[350px]">
          <div className="w-14 h-14 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-5">
            <Sparkles className="h-7 w-7 text-indigo-400 animate-pulse" />
          </div>
          <h4 className="text-xl font-bold text-white mb-2">Awaiting Accountability Partner</h4>
          <p className="text-zinc-500 text-sm max-w-md mb-6 leading-relaxed">
            Send the invite code <span className="font-mono font-bold text-white bg-zinc-900 px-2 py-1 rounded border border-zinc-800">{group.inviteCode}</span> to your partner. Once they log in and enter this code, your head-to-head tracking logs and active charts will unlock instantly!
          </p>
        </div>
      ) : (
        <>
          {/* Top Row: Side-by-Side Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Me Card */}
            <div className="glass-panel p-6 rounded-2xl border border-zinc-900 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase mb-1">Accountability Partner 1</div>
                  <h3 className="text-xl font-bold text-white">{me.name}</h3>
                </div>
                <div className="bg-indigo-600/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold text-indigo-300 font-mono tracking-wider">
                  ME
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-900/60">
                <div className="text-left">
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Total Score</div>
                  <div className="text-2xl font-black text-white font-mono">{me.totalPoints} <span className="text-xs text-zinc-500 font-bold">pts</span></div>
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Steps Today</div>
                  <div className="text-2xl font-black text-white font-mono">{me.todayRecord.steps.toLocaleString()}</div>
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Streak</div>
                  <div className="text-2xl font-black text-orange-500 font-mono flex items-center gap-1">
                    <Flame className="h-5 w-5 text-orange-500 animate-streak-fire shrink-0" />
                    {me.streak}d
                  </div>
                </div>
              </div>
            </div>

            {/* Partner Card */}
            <div className="glass-panel p-6 rounded-2xl border border-zinc-900 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase mb-1">Accountability Partner 2</div>
                  <h3 className="text-xl font-bold text-white">{partner.name}</h3>
                </div>
                <div className="bg-emerald-600/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold text-emerald-300 font-mono tracking-wider">
                  PARTNER
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-900/60">
                <div className="text-left">
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Total Score</div>
                  <div className="text-2xl font-black text-white font-mono">{partner.totalPoints} <span className="text-xs text-zinc-500 font-bold">pts</span></div>
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Steps Today</div>
                  <div className="text-2xl font-black text-white font-mono">{partner.todayRecord.steps.toLocaleString()}</div>
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Streak</div>
                  <div className="text-2xl font-black text-orange-500 font-mono flex items-center gap-1">
                    <Flame className="h-5 w-5 text-orange-500 animate-streak-fire shrink-0" />
                    {partner.streak}d
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Habit Checklist Matrix Section */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-900 shadow-xl">
            <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-indigo-400" />
              Today&apos;s Habits Comparison Matrix
            </h3>

            <div className="border border-zinc-900 rounded-xl overflow-hidden text-sm">
              {/* Header row */}
              <div className="grid grid-cols-3 bg-zinc-900/40 p-4 font-bold border-b border-zinc-900 text-zinc-400 text-xs tracking-wider uppercase">
                <div>Habit</div>
                <div className="text-center">Me</div>
                <div className="text-center">Partner</div>
              </div>

              {/* Habit rows */}
              <div className="divide-y divide-zinc-900/80">
                {Object.entries(HABITS_LABELS).map(([key, label]) => {
                  const isWater = key === 'drinkWater';
                  const myDone = me.todayRecord.habits[key];
                  const partnerDone = partner.todayRecord.habits[key];

                  return (
                    <div key={key} className="grid grid-cols-3 p-4 items-center">
                      <div className="font-medium text-white">{label}</div>
                      
                      {/* My status */}
                      <div className="flex justify-center font-bold font-mono text-xs">
                        {isWater ? (
                          <span className="text-indigo-400 text-glow-primary bg-indigo-950/20 border border-indigo-900/40 px-2 py-1 rounded-lg">
                            {myDone || 0} L
                          </span>
                        ) : myDone ? (
                          <CheckCircle2 className="h-5 w-5 text-indigo-400 text-glow-primary" />
                        ) : (
                          <XCircle className="h-5 w-5 text-zinc-800" />
                        )}
                      </div>

                      {/* Partner status */}
                      <div className="flex justify-center font-bold font-mono text-xs">
                        {isWater ? (
                          <span className="text-emerald-400 text-glow-emerald bg-emerald-950/20 border border-emerald-900/40 px-2 py-1 rounded-lg">
                            {partnerDone || 0} L
                          </span>
                        ) : partnerDone ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 text-glow-emerald" />
                        ) : (
                          <XCircle className="h-5 w-5 text-zinc-800" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recharts Step History Chart Section */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-900 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Footprints className="h-5 w-5 text-indigo-400" />
              Step Tracker Comparison Chart (Last 30 Days)
            </h3>

            <div className="w-full h-80 pt-4">
              {stepHistoryChartData.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 text-xs">
                  No step history recorded in the last 30 days. Start walking and log steps!
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={stepHistoryChartData}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                    <XAxis dataKey="date" stroke="#71717a" fontSize={10} fontStyle="bold" />
                    <YAxis stroke="#71717a" fontSize={10} fontStyle="bold" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid #27272a',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                    <Line
                      type="monotone"
                      dataKey="Me"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#6366f1' }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Partner"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#10b981' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Leaderboard stats and overall rankings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Weekly rankings */}
            <div className="glass-panel p-6 rounded-2xl border border-zinc-900 shadow-xl col-span-1">
              <h4 className="text-xs font-extrabold text-zinc-500 tracking-widest uppercase mb-4 flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-indigo-400" />
                Weekly Rank (7d)
              </h4>
              <div className="space-y-3">
                {group.leaderboardData.weeklyRankings.map((rank: any, idx: number) => {
                  const m = members.find((x: any) => x.userId === rank.userId);
                  const isMeRank = rank.userId === meUserId;
                  
                  return (
                    <div key={rank.userId} className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/40">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-500 font-mono w-4">#{idx + 1}</span>
                        <span className={`text-xs font-bold ${isMeRank ? 'text-indigo-400' : 'text-zinc-200'}`}>{m?.name}</span>
                      </div>
                      <span className="text-xs font-bold text-white font-mono">{rank.points} pts</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly rankings */}
            <div className="glass-panel p-6 rounded-2xl border border-zinc-900 shadow-xl col-span-1">
              <h4 className="text-xs font-extrabold text-zinc-500 tracking-widest uppercase mb-4 flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-emerald-400" />
                Monthly Rank (30d)
              </h4>
              <div className="space-y-3">
                {group.leaderboardData.monthlyRankings.map((rank: any, idx: number) => {
                  const m = members.find((x: any) => x.userId === rank.userId);
                  const isMeRank = rank.userId === meUserId;
                  
                  return (
                    <div key={rank.userId} className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/40">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-500 font-mono w-4">#{idx + 1}</span>
                        <span className={`text-xs font-bold ${isMeRank ? 'text-emerald-400' : 'text-zinc-200'}`}>{m?.name}</span>
                      </div>
                      <span className="text-xs font-bold text-white font-mono">{rank.points} pts</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Overall Milestones */}
            <div className="glass-panel p-6 rounded-2xl border border-zinc-900 shadow-xl col-span-1 space-y-4">
              <h4 className="text-xs font-extrabold text-zinc-500 tracking-widest uppercase mb-2 flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-500" />
                Group Trophies
              </h4>

              {/* Current Winner */}
              <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-left">
                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Current Winner (Overall)</div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-1.5">
                  <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
                  {group.leaderboardData.currentWinnerId ? (
                    members.find((x: any) => x.userId === group.leaderboardData.currentWinnerId)?.name
                  ) : (
                    <span className="text-zinc-500 font-normal">Tie Game / None</span>
                  )}
                </div>
              </div>

              {/* Longest streak */}
              <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-left">
                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Longest Streak Record</div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-1.5">
                  <Flame className="h-4 w-4 text-orange-500 shrink-0" />
                  {group.leaderboardData.longestStreakUserId ? (
                    `${members.find((x: any) => x.userId === group.leaderboardData.longestStreakUserId)?.name} (${group.leaderboardData.longestStreakValue} days)`
                  ) : (
                    <span className="text-zinc-500 font-normal">0 days</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
