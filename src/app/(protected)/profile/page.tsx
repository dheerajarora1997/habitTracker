'use client';

import React, { useState, useEffect } from 'react';
import { useCheckMeQuery, useUpdateProfileMutation } from '@/store/apiSlice';
import { User, Phone, ShieldCheck, Calendar, Sparkles } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/authSlice';

export default function ProfilePage() {
  const { data: userRes, isLoading } = useCheckMeQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pre-fill states on load
  useEffect(() => {
    if (userRes?.user) {
      setName(userRes.user.name || '');
      setAvatarUrl(userRes.user.avatarUrl || '');
    }
  }, [userRes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (name.trim().length < 2) {
      setErrorMsg('Name must be at least 2 characters.');
      return;
    }

    try {
      const res = await updateProfile({
        name: name.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
      }).unwrap();

      if (res.success && res.user) {
        setSuccessMsg('Profile updated successfully!');
        dispatch(setCredentials({ user: res.user }));
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.error || 'Failed to update profile details.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh] text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold tracking-wide">Syncing profile...</p>
        </div>
      </div>
    );
  }

  const user = userRes?.user;
  const joinDateStr = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'None';

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full relative">
      <div className="absolute -top-10 right-1/4 w-80 h-80 rounded-full bg-indigo-900/5 blur-[80px] pointer-events-none"></div>

      <div className="mb-6 text-left">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <User className="h-7 w-7 text-indigo-400" />
          Edit Profile
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Customize your display name and avatar configurations.
        </p>
      </div>

      {successMsg && (
        <div className="mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm font-semibold text-emerald-400 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-sm font-semibold text-red-400">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 shadow-2xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-900/30 border border-indigo-500/20 flex items-center justify-center font-black text-indigo-300 text-xl shadow-inner uppercase">
              {name.slice(0, 2)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{name || 'Habit Partner'}</h3>
              <p className="text-zinc-500 text-xs mt-0.5 font-medium flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Joined on {joinDateStr}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-zinc-900">
            {/* Phone (Disabled) */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Verified Phone Number
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4.5 w-4.5 text-zinc-600" />
                </div>
                <input
                  type="text"
                  disabled
                  value={user?.phoneNumber || ''}
                  className="block w-full pl-10 pr-3 py-3 border border-zinc-900 rounded-xl bg-zinc-950/60 text-zinc-500 font-mono focus:outline-none transition-all text-xs cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-zinc-600 mt-1 pl-1">
                * Your phone number is your unique ID and cannot be modified.
              </p>
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="display-name" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Display Name
              </label>
              <input
                type="text"
                id="display-name"
                required
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-3 border border-zinc-800 rounded-xl bg-zinc-900/40 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs"
              />
            </div>

            {/* Avatar URL */}
            <div>
              <label htmlFor="avatar-url" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Avatar Image URL <span className="text-zinc-500 text-[10px] font-normal normal-case">(Optional)</span>
              </label>
              <input
                type="url"
                id="avatar-url"
                placeholder="e.g. https://images.unsplash.com/photo-..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="block w-full px-4 py-3 border border-zinc-800 rounded-xl bg-zinc-900/40 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs"
              />
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed glow-indigo"
              >
                {isUpdating ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
