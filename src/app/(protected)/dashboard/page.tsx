'use client';

import React from 'react';
import { useCheckMeQuery, useGetTodayRecordQuery, useGetHistoryRecordsQuery, useGetGroupsQuery } from '@/store/apiSlice';
import { Flame, Trophy, Calendar, CheckCircle2, TrendingUp, Users2, ArrowUpRight, Activity, Smile, Footprints } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: userRes } = useCheckMeQuery();
  const { data: todayRes, isLoading: isTodayLoading } = useGetTodayRecordQuery();
  const { data: historyRes, isLoading: isHistoryLoading } = useGetHistoryRecordsQuery();
  const { data: groupsRes, isLoading: isGroupsLoading } = useGetGroupsQuery();

  const user = userRes?.user;
  const todayRecord = todayRes?.record;
  const history = historyRes?.records || [];
  const groups = groupsRes?.groups || [];

  if (isTodayLoading || isHistoryLoading || isGroupsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh] text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold tracking-wide">Synthesizing personal dashboard...</p>
        </div>
      </div>
    );
  }

  // 1. Compute today's score
  const todayScore = todayRecord?.dailyTotalPoints || 0;

  // 2. Compute weekly score (last 7 records)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
  const weeklyScore = history
    .filter((r: any) => r.date >= sevenDaysAgoStr)
    .reduce((sum: number, r: any) => sum + r.dailyTotalPoints, 0);

  // 3. Compute monthly score (last 30 records)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
  const monthlyScore = history
    .filter((r: any) => r.date >= thirtyDaysAgoStr)
    .reduce((sum: number, r: any) => sum + r.dailyTotalPoints, 0);

  // 4. Compute habit completion rate
  let totalHabitOpportunities = 0;
  let totalCompletedHabits = 0;

  history.forEach((record: any) => {
    if (record.habits) {
      Object.values(record.habits).forEach((done) => {
        totalHabitOpportunities++;
        if (done) totalCompletedHabits++;
      });
    }
  });

  const completionRate = totalHabitOpportunities > 0
    ? Math.round((totalCompletedHabits / totalHabitOpportunities) * 100)
    : 0;

  // 5. Active streak (highest streak from active groups, or today's count)
  let activeStreak = 0;
  groups.forEach((group: any) => {
    const member = group.members.find((m: any) => m.userId === user?.id);
    if (member && member.streak > activeStreak) {
      activeStreak = member.streak;
    }
  });

  // 6. Step aggregate logs
  const totalStepsLogged = history.reduce((sum: number, r: any) => sum + (r.steps || 0), 0);
  const averageSteps = history.length > 0 ? Math.round(totalStepsLogged / history.length) : 0;

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full relative space-y-6">
      {/* Decorative glowing backdrops */}
      <div className="absolute -top-10 left-1/4 w-96 h-96 rounded-full bg-indigo-900/5 blur-[120px] pointer-events-none"></div>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Hey, {user?.name}!
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Let&apos;s build healthy habits and stay accountable today.
          </p>
        </div>
        <div>
          <Link
            href="/tracker"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all glow-indigo"
          >
            <Activity className="h-4 w-4" />
            Log Today&apos;s habits
          </Link>
        </div>
      </div>

      {/* Top Aggregates Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Streak */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-900 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Active Streak</span>
            <span className="text-2xl font-black text-white font-mono">{activeStreak} <span className="text-xs text-zinc-500 font-bold">days</span></span>
          </div>
          <div className="bg-orange-500/10 p-2.5 rounded-xl border border-orange-500/20">
            <Flame className="h-6 w-6 text-orange-500 animate-streak-fire" />
          </div>
        </div>

        {/* Metric 2: Today Score */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-900 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Today&apos;s Points</span>
            <span className="text-2xl font-black text-indigo-400 font-mono text-glow-primary">+{todayScore} <span className="text-xs text-zinc-500 font-bold">pts</span></span>
          </div>
          <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20">
            <Trophy className="h-6 w-6 text-indigo-400" />
          </div>
        </div>

        {/* Metric 3: Weekly Total */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-900 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Weekly Points</span>
            <span className="text-2xl font-black text-emerald-400 font-mono text-glow-emerald">+{weeklyScore} <span className="text-xs text-zinc-500 font-bold">pts</span></span>
          </div>
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
          </div>
        </div>

        {/* Metric 4: Rate */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-900 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Habit Consistency</span>
            <span className="text-2xl font-black text-white font-mono">{completionRate}%</span>
          </div>
          <div className="bg-violet-500/10 p-2.5 rounded-xl border border-violet-500/20">
            <CheckCircle2 className="h-6 w-6 text-violet-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Accountability Partner Dashboard Comparison */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-extrabold text-white tracking-widest uppercase pl-1">
            Accountability Partner Rooms
          </h3>

          {groups.length === 0 ? (
            /* Banner if no groups joined */
            <div className="glass-panel p-8 rounded-2xl border border-zinc-900 text-center flex flex-col items-center justify-center min-h-[220px]">
              <Users2 className="h-10 w-10 text-zinc-600 mb-3" />
              <h4 className="font-bold text-white mb-1">No Active Partnerships</h4>
              <p className="text-xs text-zinc-500 max-w-sm mb-4 leading-normal">
                Habits are built twice as fast when tracked together. Join or create a group to unlock head-to-head metrics.
              </p>
              <Link
                href="/groups"
                className="inline-flex items-center gap-1 text-xs font-semibold px-4.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all glow-indigo"
              >
                Set up Partner Room
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {groups.map((group) => {
                const partner = group.members.find((m: any) => m.userId !== user?.id);
                const meInGroup = group.members.find((m: any) => m.userId === user?.id);
                
                return (
                  <div
                    key={group._id}
                    className="glass-panel p-5 rounded-2xl border border-zinc-900 flex justify-between items-center relative overflow-hidden"
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none"></div>

                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-white truncate">{group.groupName}</h4>
                        <span className="text-[9px] font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full shrink-0">
                          Invite: {group.inviteCode}
                        </span>
                      </div>

                      {partner ? (
                        <div className="flex items-center gap-4 mt-3 text-xs">
                          <div className="text-left">
                            <div className="text-[9px] text-zinc-500 uppercase tracking-wider mb-0.5">Me</div>
                            <div className="font-bold text-zinc-300 font-mono">{meInGroup?.totalPoints || 0} pts</div>
                          </div>
                          <div className="text-zinc-700">|</div>
                          <div className="text-left">
                            <div className="text-[9px] text-zinc-500 uppercase tracking-wider mb-0.5">Partner ({partner.name})</div>
                            <div className="font-bold text-indigo-400 font-mono text-glow-primary">{partner.totalPoints || 0} pts</div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] text-indigo-400 font-semibold mt-3 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                          Waiting for partner to join...
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/groups/${group._id}`}
                      className="inline-flex items-center justify-center p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all shrink-0"
                    >
                      <ArrowUpRight className="h-4.5 w-4.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Overall Stats / Recent logs history */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-extrabold text-white tracking-widest uppercase pl-1">
            Recent Logs History
          </h3>

          <div className="glass-panel p-5 rounded-2xl border border-zinc-900 shadow-xl space-y-4 max-h-[360px] overflow-y-auto">
            {history.length === 0 ? (
              <div className="text-center py-10 text-xs text-zinc-600">
                No logs recorded yet. Start tracking today!
              </div>
            ) : (
              <div className="divide-y divide-zinc-900/60 space-y-3">
                {history.slice(-5).reverse().map((rec: any, idx: number) => (
                  <div key={rec._id || idx} className="flex justify-between items-center pt-3 first:pt-0">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                        {rec.date}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-medium mt-0.5 flex items-center gap-1">
                        <Footprints className="h-3 w-3" />
                        {rec.steps.toLocaleString()} steps
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-400 font-mono text-glow-primary">+{rec.dailyTotalPoints} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Step Average Summary Card */}
          <div className="glass-panel p-5 rounded-2xl border border-zinc-900 shadow-xl flex items-center gap-4">
            <div className="bg-indigo-600/10 p-2.5 rounded-xl border border-indigo-500/20 shrink-0">
              <Footprints className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Average Daily Steps</div>
              <div className="text-lg font-black text-white font-mono">{averageSteps.toLocaleString()} <span className="text-[10px] text-zinc-500 font-bold">steps/day</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
