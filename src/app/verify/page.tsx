'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useVerifyOtpMutation, useRequestOtpMutation } from '@/store/apiSlice';
import { setCredentials, selectIsAuthenticated, selectAuthLoading } from '@/store/authSlice';
import { ShieldAlert, KeyRound, UserPlus, RefreshCw, ArrowLeft, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/components/layout/ThemeProvider';

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();

  const phone = searchParams.get('phone') || '';
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [timer, setTimer] = useState(60);

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [requestOtp, { isLoading: isResending }] = useRequestOtpMutation();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  // Handle countdown timer for resend
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Simple validation check before submitting
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!phone) {
      setErrorMsg('Missing phone number context. Please return to login.');
      return;
    }

    if (otp.length !== 6) {
      setErrorMsg('OTP must be exactly 6 digits.');
      return;
    }

    try {
      const res = await verifyOtp({
        phoneNumber: phone,
        otp,
        name: name.trim() || undefined,
      }).unwrap();

      if (res.success && res.user) {
        setSuccessMsg('Authentication successful! Connecting dashboard...');
        
        // Dispatch credentials to Redux store
        dispatch(setCredentials({ user: res.user }));
        
        // Redirect to protected dashboard area
        setTimeout(() => {
          router.replace('/dashboard');
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.error || 'Verification failed. Please double check the OTP.');
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isResending) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await requestOtp({ phoneNumber: phone }).unwrap();
      if (res.success) {
        setSuccessMsg('A new verification code has been generated.');
        setTimer(60);
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.error || 'Failed to resend code.');
    }
  };

  if (!phone) {
    return (
      <div className="glass-panel p-8 rounded-2xl shadow-xl border border-red-500/20 max-w-md mx-auto text-center">
        <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Missing Context</h3>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6">
          We couldn&apos;t detect a valid phone number session to verify.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Phone login
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-panel py-8 px-6 sm:px-10 rounded-2xl shadow-2xl relative">
      {/* Theme Toggle Button absolute positioned inside panel or top of page */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="bg-indigo-600/5 dark:bg-indigo-950/30 border border-indigo-500/10 dark:border-indigo-900/50 p-4 rounded-xl text-center text-xs text-indigo-600 dark:text-indigo-300">
          We sent a 6-digit code to <span className="font-semibold text-zinc-900 dark:text-white">{phone}</span>.
          <p className="mt-1 font-semibold text-indigo-500 dark:text-indigo-400">For testing, you can also use: 123456</p>
        </div>

        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            6-Digit Verification Code
          </label>
          <div className="mt-2 relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyRound className="h-5 w-5 text-zinc-500" aria-hidden="true" />
            </div>
            <input
              type="text"
              id="otp"
              maxLength={6}
              required
              placeholder="e.g. 123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="block w-full pl-10 pr-3 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 tracking-[0.2em] font-mono text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-lg"
            />
          </div>
        </div>

        {/* Dynamic Name Onboarding Input */}
        <div>
          <div className="flex justify-between items-center">
            <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Display Name <span className="text-zinc-455 text-xs font-normal">(New user only)</span>
            </label>
          </div>
          <div className="mt-2 relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserPlus className="h-5 w-5 text-zinc-500" aria-hidden="true" />
            </div>
            <input
              type="text"
              id="name"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
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
            disabled={isVerifying}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-indigo cursor-pointer"
          >
            {isVerifying ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Verify & Continue'
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 flex justify-between items-center text-xs">
        <Link href="/login" className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 inline-flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" />
          Edit number
        </Link>

        <button
          onClick={handleResend}
          disabled={timer > 0 || isResending}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 disabled:text-zinc-400 dark:disabled:text-zinc-600 disabled:cursor-not-allowed inline-flex items-center gap-1 font-medium transition-all cursor-pointer"
        >
          <RefreshCw className={`h-3 w-3 ${isResending ? 'animate-spin' : ''}`} />
          {timer > 0 ? `Resend code in ${timer}s` : 'Resend code'}
        </button>
      </div>
    </div>
  );
}

function VerifyPageContent() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative overflow-hidden transition-colors duration-200">
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all text-xs flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
          ) : (
            <Moon className="h-4.5 w-4.5 text-indigo-500" />
          )}
        </button>
      </div>

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center mb-6">
        <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Enter verification code
        </h2>
        <p className="mt-2 text-sm text-zinc-650 dark:text-zinc-400">
          Enter the code generated by our server logs to verify your profile.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <Suspense fallback={
          <div className="glass-panel p-8 rounded-2xl shadow-xl flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <VerifyOtpForm />
        </Suspense>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 min-h-screen">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <VerifyPageContent />
    </Suspense>
  );
}
