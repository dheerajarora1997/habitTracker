'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectAuthLoading, selectCurrentUser, clearCredentials } from '@/store/authSlice';
import { useLogoutMutation } from '@/store/apiSlice';
import { Activity, LayoutDashboard, CalendarDays, Users2, User, Shield, LogOut, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/layout/ThemeProvider';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);
  const user = useSelector(selectCurrentUser);

  const [logout] = useLogoutMutation();

  // Enforce session check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(clearCredentials());
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
      dispatch(clearCredentials());
      router.push('/');
    }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold tracking-wide text-zinc-650 dark:text-zinc-300">Restoring secure session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  const isAdmin = user?.phoneNumber === '+1111111111' || user?.phoneNumber === '1111111111';

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tracker', label: 'Log Habits', icon: CalendarDays },
    { href: '/groups', label: 'My Groups', icon: Users2 },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  if (isAdmin) {
    navLinks.push({ href: '/admin', label: 'Admin Panel', icon: Shield });
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100 pb-12 transition-colors duration-200">
      {/* Global Glassmorphic Sticky Navbar */}
      <nav className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-900 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="bg-indigo-600/10 p-1.5 rounded-lg border border-indigo-500/20">
                  <Activity className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                </div>
                <span className="text-sm font-bold tracking-wider text-zinc-900 dark:text-white hidden sm:block">
                  HABITPARTNER
                </span>
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:flex space-x-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-lg glow-indigo'
                          : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Profile Avatar / Phone & Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 mr-1">
                <div className="w-8 h-8 rounded-full bg-indigo-900/10 dark:bg-indigo-900/40 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-300 text-xs shadow-inner">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'HP'}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-zinc-900 dark:text-white max-w-[120px] truncate">{user?.name}</div>
                  <div className="text-[10px] text-zinc-500 font-mono truncate">{user?.phoneNumber}</div>
                </div>
              </div>

              {/* Theme Toggle Button */}
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

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 dark:hover:border-red-900/30 text-zinc-500 dark:text-zinc-400 hover:text-red-650 dark:hover:text-red-400 transition-all text-xs flex items-center justify-center cursor-pointer shadow-sm"
                title="Log Out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar (Sub-Navbar for smaller screens) */}
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-900/80 px-4 py-2 flex justify-around bg-white/95 dark:bg-zinc-950/90 w-full transition-colors duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold tracking-wide transition-all ${
                  isActive 
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold' 
                    : 'text-zinc-550 dark:text-zinc-550 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{link.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Screen Layout Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-1 flex flex-col w-full z-10">
        {children}
      </main>
    </div>
  );
}
