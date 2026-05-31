'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useRequestOtpMutation } from '@/store/apiSlice';
import { selectIsAuthenticated, selectAuthLoading } from '@/store/authSlice';
import { Phone, ArrowRight, Activity, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);
  
  const [requestOtp, { isLoading }] = useRequestOtpMutation();

  // If already authenticated, bypass login and redirect straight to the dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Clean formatting and simple digit check
    const cleanedPhone = phoneNumber.trim();
    if (!cleanedPhone || cleanedPhone.length < 10) {
      setErrorMsg('Please enter a valid phone number (minimum 10 digits).');
      return;
    }

    try {
      const res = await requestOtp({ phoneNumber: cleanedPhone }).unwrap();
      if (res.success) {
        setSuccessMsg(res.message);
        
        // Push to verify page, attaching phone number in parameters
        setTimeout(() => {
          router.push(`/verify?phone=${encodeURIComponent(cleanedPhone)}`);
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.error || 'Failed to request OTP. Please verify connections.');
    }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium tracking-wide">Securing connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-zinc-950 relative overflow-hidden">
      {/* Decorative ambient glowing backdrops */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-emerald-900/5 blur-[100px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="bg-indigo-600/10 p-2 rounded-xl border border-indigo-500/20">
            <Activity className="h-7 w-7 text-indigo-400" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-100 bg-clip-text text-transparent">
            HABITPARTNER
          </span>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Sign in or register instantly with your phone number.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-2xl shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-zinc-300">
                Phone Number
              </label>
              <div className="mt-2 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-zinc-500" aria-hidden="true" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  required
                  placeholder="e.g. +19998887766 or 9998887766"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl bg-zinc-900/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-xs font-semibold text-red-400">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-semibold text-emerald-400">
                {successMsg}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-indigo"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Request Secure OTP
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-zinc-800 pt-6">
            <div className="flex items-start gap-2.5 text-xs text-zinc-500">
              <ShieldCheck className="h-4 w-4 text-indigo-500/80 shrink-0" />
              <p>
                No password required. We secure your session with a Time-based One Time Password (OTP). Your information is fully encrypted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
