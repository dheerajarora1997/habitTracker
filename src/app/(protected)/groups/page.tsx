'use client';

import React, { useState } from 'react';
import { useGetGroupsQuery, useCreateGroupMutation, useJoinGroupMutation } from '@/store/apiSlice';
import { PlusCircle, Link as LinkIcon, Users2, Copy, Check, ChevronRight, Activity, Sparkles, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function GroupsPage() {
  const { data: groupsRes, isLoading } = useGetGroupsQuery();
  const [createGroup, { isLoading: isCreating }] = useCreateGroupMutation();
  const [joinGroup, { isLoading: isJoining }] = useJoinGroupMutation();

  const [newGroupName, setNewGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newGroupName.trim().length < 3) {
      setErrorMsg('Group name must be at least 3 characters.');
      return;
    }

    try {
      const res = await createGroup({ groupName: newGroupName.trim() }).unwrap();
      if (res.success) {
        setSuccessMsg(`Group "${res.group.groupName}" created! Share the invite code to start.`);
        setNewGroupName('');
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.error || 'Failed to create group. Are you already in 3 groups?');
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (inviteCode.trim().length !== 6) {
      setErrorMsg('Invite code must be exactly 6 characters.');
      return;
    }

    try {
      const res = await joinGroup({ inviteCode: inviteCode.trim().toUpperCase() }).unwrap();
      if (res.success) {
        setSuccessMsg(`Successfully joined group "${res.group.groupName}"!`);
        setInviteCode('');
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.error || 'Failed to join group. Verify the invite code.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh] text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold tracking-wide">Syncing groups...</p>
        </div>
      </div>
    );
  }

  const groups = groupsRes?.groups || [];
  const groupLimitReached = groups.length >= 3;

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full relative">
      <div className="absolute -top-10 right-1/4 w-96 h-96 rounded-full bg-indigo-900/5 blur-[100px] pointer-events-none"></div>

      <div className="mb-8 text-left">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Users2 className="h-7 w-7 text-indigo-400" />
          Accountability Groups
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Each group holds exactly 2 partners. You can be in a maximum of <span className="font-semibold text-white">3 groups</span>.
        </p>
      </div>

      {successMsg && (
        <div className="mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm font-semibold text-emerald-400">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-sm font-semibold text-red-400">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Create / Join Hub */}
        <div className="space-y-6 lg:col-span-1">
          {/* Create Group Card */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-900 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <PlusCircle className="h-4.5 w-4.5 text-indigo-400" />
              Create a Group
            </h3>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="e.g. Morning Joggers"
                  disabled={groupLimitReached || isCreating}
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                disabled={groupLimitReached || isCreating || !newGroupName.trim()}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed glow-indigo"
              >
                {isCreating ? 'Creating...' : 'Create New Group'}
              </button>
            </form>
            {groupLimitReached && (
              <p className="text-[10px] text-zinc-500 mt-3 pl-0.5">
                * You have reached the group limit of 3. You cannot create more groups.
              </p>
            )}
          </div>

          {/* Join Group Card */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-900 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <LinkIcon className="h-4.5 w-4.5 text-violet-400" />
              Join with Code
            </h3>
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="6-CHARACTER INVITE CODE"
                  disabled={groupLimitReached || isJoining}
                  value={inviteCode}
                  maxLength={6}
                  onChange={(e) => setInviteCode(e.target.value.replace(/[^A-Za-z0-9]/g, ''))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-xs text-center text-white placeholder-zinc-500 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                disabled={groupLimitReached || isJoining || inviteCode.trim().length !== 6}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isJoining ? 'Joining...' : 'Join Group'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Active Groups Listing */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-extrabold text-white tracking-widest uppercase pl-1 mb-2">
            Your Active Groups ({groups.length}/3)
          </h3>

          {groups.length === 0 ? (
            /* Visual Onboarding Panel */
            <div className="glass-panel p-10 rounded-2xl border border-zinc-900 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-indigo-400 animate-pulse" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">No Active Accountability Partners</h4>
              <p className="text-zinc-500 text-sm max-w-sm mb-6 leading-relaxed">
                Habit tracking is twice as fun with a partner! Create a new group on the left, copy its invite code, and send it to your friend to begin.
              </p>
              <div className="flex gap-2.5 text-xs text-zinc-500 items-start max-w-sm text-left border-t border-zinc-900/80 pt-4">
                <HelpCircle className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <p>Once your partner joins, both of you will see each other&apos;s daily step charts, streaks, and compete in real-time points leaderboards.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {groups.map((group) => {
                const partner = group.members.find((m: any) => m.userId.toString() !== group.createdBy.toString());
                const creator = group.members.find((m: any) => m.userId.toString() === group.createdBy.toString());
                
                return (
                  <div
                    key={group._id}
                    className="glass-panel p-6 rounded-2xl border border-zinc-900 glass-panel-hover flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden"
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none"></div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-lg text-white truncate pr-2">{group.groupName}</h4>
                        <div className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">
                          {group.members.length === 2 ? 'Active Team' : 'Pending Partner'}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs text-zinc-400">
                        <div>
                          <span className="text-zinc-500">Creator: </span>
                          <span className="text-zinc-300 font-medium">{creator?.name}</span>
                        </div>
                        {partner ? (
                          <div>
                            <span className="text-zinc-500">Partner: </span>
                            <span className="text-zinc-300 font-medium">{partner.name}</span>
                          </div>
                        ) : (
                          <div className="text-indigo-400 font-semibold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                            Waiting for partner...
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-zinc-900/60 pt-4 md:pt-0">
                      {/* Invite Code node */}
                      <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-xl font-mono text-xs">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider font-sans mr-0.5">Invite:</span>
                        <span className="text-white font-bold">{group.inviteCode}</span>
                        <button
                          onClick={() => handleCopyCode(group.inviteCode)}
                          className="text-zinc-500 hover:text-white transition-all pl-1"
                        >
                          {copiedCode === group.inviteCode ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      {/* View Link */}
                      <Link
                        href={`/groups/${group._id}`}
                        className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 font-semibold text-xs transition-all shadow-sm"
                      >
                        Enter Room
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
