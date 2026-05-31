'use client';

import React, { useState } from 'react';
import {
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useGetAdminGroupsQuery,
  useBanUserMutation,
  useDeleteGroupMutation,
} from '@/store/apiSlice';
import { ShieldAlert, Users, Group, Landmark, Trophy, Ban, CheckCircle, Trash2, Calendar, ShieldCheck, Flame } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/authSlice';

export default function AdminPage() {
  const currentUser = useSelector(selectCurrentUser);

  const { data: statsRes, isLoading: isStatsLoading } = useGetAdminStatsQuery();
  const { data: usersRes, isLoading: isUsersLoading } = useGetAdminUsersQuery();
  const { data: groupsRes, isLoading: isGroupsLoading } = useGetAdminGroupsQuery();

  const [banUser, { isLoading: isBanning }] = useBanUserMutation();
  const [deleteGroup, { isLoading: isDeleting }] = useDeleteGroupMutation();

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleBanToggle = async (userId: string, currentBanStatus: boolean) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (userId === currentUser?.id) {
      setErrorMsg('You cannot ban yourself.');
      return;
    }

    try {
      const res = await banUser({ userId, isBanned: !currentBanStatus }).unwrap();
      if (res.success) {
        setSuccessMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.error || 'Failed to toggle user ban state.');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!confirm('Are you absolutely sure you want to delete this group? All statistics, leaderboard logs, and scores will be permanently deleted.')) {
      return;
    }

    try {
      const res = await deleteGroup(groupId).unwrap();
      if (res.success) {
        setSuccessMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.error || 'Failed to delete accountability group.');
    }
  };

  const isLoading = isStatsLoading || isUsersLoading || isGroupsLoading;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh] text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold tracking-wide">Syncing administrative grid...</p>
        </div>
      </div>
    );
  }

  const stats = statsRes?.stats || {
    totalUsers: 0,
    totalGroups: 0,
    totalRecords: 0,
    totalPointsScored: 0,
    maxStreakOnPlatform: 0,
    maxStreakGroupName: 'None',
  };

  const users = usersRes?.users || [];
  const groups = groupsRes?.groups || [];

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full relative space-y-8">
      {/* Decorative glowing backdrops */}
      <div className="absolute -top-10 left-1/4 w-[400px] h-[400px] rounded-full bg-red-950/5 blur-[120px] pointer-events-none"></div>

      <div className="mb-6 text-left">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <ShieldAlert className="h-7 w-7 text-red-500" />
          Admin Command Center
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Perform administrative stats reporting, user moderation, and group audit checks.
        </p>
      </div>

      {successMsg && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-semibold text-emerald-400 flex items-center gap-2">
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-xs font-semibold text-red-400 flex items-center gap-2">
          <ShieldAlert className="h-4.5 w-4.5 text-red-400 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Aggregates Dashboard Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-900 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Total Users</span>
            <span className="text-xl font-black text-white font-mono">{stats.totalUsers}</span>
          </div>
          <div className="bg-zinc-800 p-2.5 rounded-xl border border-zinc-700/50">
            <Users className="h-5 w-5 text-zinc-400" />
          </div>
        </div>

        {/* Groups */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-900 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Total Groups</span>
            <span className="text-xl font-black text-white font-mono">{stats.totalGroups}</span>
          </div>
          <div className="bg-zinc-800 p-2.5 rounded-xl border border-zinc-700/50">
            <Group className="h-5 w-5 text-zinc-400" />
          </div>
        </div>

        {/* Points logged */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-900 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Points Logged</span>
            <span className="text-xl font-black text-indigo-400 font-mono text-glow-primary">+{stats.totalPointsScored}</span>
          </div>
          <div className="bg-indigo-600/10 p-2.5 rounded-xl border border-indigo-500/20">
            <Trophy className="h-5 w-5 text-indigo-400" />
          </div>
        </div>

        {/* Platform Streak */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-900 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Max Streak</span>
            <span className="text-xl font-black text-orange-500 font-mono flex items-center gap-1">
              <Flame className="h-5 w-5 text-orange-500 animate-streak-fire shrink-0" />
              {stats.maxStreakOnPlatform}d
            </span>
          </div>
          <div className="bg-orange-500/10 p-2.5 rounded-xl border border-orange-500/20">
            <Landmark className="h-5 w-5 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Split grid: Users Table vs Groups Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Moderation Users Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-white tracking-widest uppercase pl-1 flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-zinc-400" />
            Users Moderation Board ({users.length})
          </h3>

          <div className="glass-panel rounded-2xl border border-zinc-900 overflow-hidden shadow-xl">
            <div className="max-h-[500px] overflow-y-auto text-xs">
              <div className="grid grid-cols-3 bg-zinc-900/40 p-4 font-bold border-b border-zinc-900 text-zinc-400 uppercase tracking-wider">
                <div>User</div>
                <div>Phone</div>
                <div className="text-right">Action</div>
              </div>

              <div className="divide-y divide-zinc-900/60">
                {users.map((u: any) => {
                  const isMe = u.id === currentUser?.id;
                  const regDate = new Date(u.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div key={u.id} className="grid grid-cols-3 p-4 items-center">
                      <div>
                        <div className="font-bold text-white flex items-center gap-1">
                          {u.name}
                          {isMe && <span className="text-[8px] bg-indigo-900/40 text-indigo-400 px-1 rounded border border-indigo-500/20">ME</span>}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-medium flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          Joined {regDate}
                        </div>
                      </div>

                      <div className="font-mono font-bold text-zinc-300">{u.phoneNumber}</div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => handleBanToggle(u.id, u.isBanned)}
                          disabled={isMe || isBanning}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold border transition-all ${
                            u.isBanned
                              ? 'bg-red-950/20 border-red-900/30 text-red-400 hover:bg-emerald-950/20 hover:border-emerald-900/30 hover:text-emerald-400'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-red-950/20 hover:border-red-900/30 hover:text-red-400'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          <Ban className="h-3.5 w-3.5" />
                          {u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Audit Groups Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-white tracking-widest uppercase pl-1 flex items-center gap-2">
            <Group className="h-4.5 w-4.5 text-zinc-400" />
            Groups Audit Board ({groups.length})
          </h3>

          <div className="glass-panel rounded-2xl border border-zinc-900 overflow-hidden shadow-xl">
            <div className="max-h-[500px] overflow-y-auto text-xs">
              <div className="grid grid-cols-3 bg-zinc-900/40 p-4 font-bold border-b border-zinc-900 text-zinc-400 uppercase tracking-wider">
                <div>Group</div>
                <div>Invite Code</div>
                <div className="text-right">Action</div>
              </div>

              <div className="divide-y divide-zinc-900/60">
                {groups.map((g: any) => {
                  const size = g.members.length;
                  return (
                    <div key={g._id} className="grid grid-cols-3 p-4 items-center">
                      <div>
                        <div className="font-bold text-white truncate pr-2">{g.groupName}</div>
                        <div className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                          {size} / 2 Members
                        </div>
                      </div>

                      <div className="font-mono font-bold text-zinc-300 bg-zinc-900/60 border border-zinc-800/80 px-2 py-0.5 rounded-lg w-max">
                        {g.inviteCode}
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDeleteGroup(g._id)}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold bg-zinc-900 hover:bg-red-950/20 border border-zinc-800 hover:border-red-900/30 text-zinc-400 hover:text-red-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
