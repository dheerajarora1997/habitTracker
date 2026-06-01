'use client';

import React, { useState, useEffect } from 'react';
import { useGetTodayRecordQuery, useUpsertRecordMutation } from '@/store/apiSlice';
import { Check, Footprints, ShieldCheck, Flame, BookOpen, Utensils, Dumbbell, GlassWater, Sparkles, Smile, MessageSquareQuote, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeProvider';

const HABIT_DEFINITIONS = [
  { key: 'noFastFood', label: 'No Fast Food', desc: 'Avoided processed or deep-fried fast food items', icon: Utensils, color: 'text-orange-400 bg-orange-500/10' },
  { key: 'hitGym', label: 'Hit the Gym', desc: 'Completed at least 30 mins of strength or cardio workout', icon: Dumbbell, color: 'text-emerald-400 bg-emerald-500/10' },
  { key: 'noAlcohol', label: 'No Alcohol', desc: 'Steered clear of any alcoholic beverages', icon: GlassWater, color: 'text-indigo-400 bg-indigo-500/10' },
  { key: 'socialMediaDetox', label: 'Social Media Detox', desc: 'Limited casual browsing scrolling to under 15 mins', icon: Sparkles, color: 'text-violet-400 bg-violet-500/10' },
  { key: 'learnStudy', label: 'Learn / Study', desc: 'Dedicated at least 45 mins to reading, learning, or coding', icon: BookOpen, color: 'text-sky-400 bg-sky-500/10' },
  { key: 'noSugar', label: 'No Sugar', desc: 'Avoided added refined sugars, sweets, and sodas', icon: Smile, color: 'text-pink-400 bg-pink-500/10' },
];

export default function DailyTrackerPage() {
  const { theme } = useTheme();
  const getTodayStr = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(() => getTodayStr());
  const { data: recordRes, isLoading: isRecordLoading } = useGetTodayRecordQuery(selectedDate);
  const [upsertRecord, { isLoading: isSaving }] = useUpsertRecordMutation();

  const [steps, setSteps] = useState(0);
  const [habits, setHabits] = useState<Record<string, any>>({
    noFastFood: false,
    hitGym: false,
    noAlcohol: false,
    socialMediaDetox: false,
    learnStudy: false,
    noSugar: false,
    drinkWater: 0,
  });
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Timezone-safe date parsing/formatting
  const parseDateStr = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDateStr = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handlePrevDay = () => {
    const d = parseDateStr(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(formatDateStr(d));
  };

  const handleNextDay = () => {
    const todayStr = getTodayStr();
    if (selectedDate === todayStr) return;
    const d = parseDateStr(selectedDate);
    d.setDate(d.getDate() + 1);
    const nextDateStr = formatDateStr(d);
    if (nextDateStr <= todayStr) {
      setSelectedDate(nextDateStr);
    }
  };

  const handleSnapToToday = () => {
    setSelectedDate(getTodayStr());
  };

  // Prefill states when the record loads from the API
  useEffect(() => {
    if (recordRes?.record) {
      const rec = recordRes.record;
      setSteps(rec.steps || 0);
      setNotes(rec.notes || '');
      
      const newHabits = {
        noFastFood: false,
        hitGym: false,
        noAlcohol: false,
        socialMediaDetox: false,
        learnStudy: false,
        noSugar: false,
        drinkWater: 0,
      };
      Object.keys(newHabits).forEach((key) => {
        if (rec.habits && rec.habits[key] !== undefined) {
          (newHabits as any)[key] = rec.habits[key];
        }
      });
      setHabits(newHabits);
    }
  }, [recordRes]);

  const handleToggleHabit = (key: string) => {
    setHabits((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const calculateStepPoints = (stepsVal: number) => {
    return Math.floor(stepsVal / 2500);
  };

  const calculateHabitPoints = () => {
    let pts = 0;
    Object.entries(habits).forEach(([key, val]) => {
      if (key === 'drinkWater') {
        pts += (val as number);
      } else if (val === true) {
        pts += 1;
      }
    });
    return pts;
  };

  const stepPoints = calculateStepPoints(steps);
  const habitPoints = calculateHabitPoints();
  const totalTodayPoints = stepPoints + habitPoints;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await upsertRecord({
        steps,
        habits,
        notes: notes.trim(),
        date: selectedDate,
      }).unwrap();

      if (res.success) {
        const isTodaySelected = selectedDate === getTodayStr();
        const dateLabel = isTodaySelected ? "Today's" : `Progress for ${selectedDate}`;
        setSuccessMsg(`Habit progress recorded! ${dateLabel} score: +${totalTodayPoints} points. Streak: ${res.streak} days.`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.error || 'Failed to save habit progress. Try again.');
    }
  };

  if (isRecordLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh] text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold tracking-wide">Syncing daily log...</p>
        </div>
      </div>
    );
  }

  const selectedDateObj = parseDateStr(selectedDate);
  const formattedSelectedDate = selectedDateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const trackBg = theme === 'dark' ? '#27272a' : '#e4e4e7';
  const primaryColor = theme === 'dark' ? '#6366f1' : '#4f46e5';
  const cyanColor = theme === 'dark' ? '#22d3ee' : '#06b6d4';

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full relative">
      {/* Visual background lights */}
      <div className="absolute -top-10 right-1/4 w-80 h-80 rounded-full bg-indigo-900/5 blur-[80px] pointer-events-none"></div>

      <div className="mb-6 text-left">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          {selectedDate === getTodayStr() ? "Log Today's habits" : "Log past habits"}
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          {formattedSelectedDate} • Daily Score: <span className="text-indigo-400 font-bold font-mono text-glow-primary text-md">+{totalTodayPoints} pts</span>
        </p>
      </div>

      {/* Date Selector Control Panel */}
      <div className="glass-panel p-4 rounded-2xl border border-zinc-900 mb-6 flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevDay}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all shrink-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Date Selector input wrapped in a beautiful label */}
          <div className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-white font-bold text-sm select-none hover:bg-zinc-900 transition-all cursor-pointer">
            <Calendar className="h-4 w-4 text-indigo-400" />
            <span>{formattedSelectedDate}</span>
            <input
              type="date"
              max={getTodayStr()}
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value);
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>

          <button
            type="button"
            onClick={handleNextDay}
            disabled={selectedDate === getTodayStr()}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all shrink-0 disabled:opacity-30 disabled:hover:bg-zinc-900 disabled:hover:text-zinc-500 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {selectedDate !== getTodayStr() && (
          <button
            type="button"
            onClick={handleSnapToToday}
            className="px-4 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 font-bold text-xs transition-all shrink-0 glow-indigo"
          >
            Back to Today
          </button>
        )}
      </div>

      {successMsg && (
        <div className="mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm font-semibold text-emerald-400 flex items-center gap-2 glow-emerald">
          <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-sm font-semibold text-red-400">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Steps Slider Section */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-200 dark:border-zinc-900 relative">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Footprints className="h-5 w-5 text-indigo-400" />
                Steps Tracked
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">1 Point rewarded for every 2500 steps logged</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-indigo-400 font-mono text-glow-primary">{steps.toLocaleString()}</div>
              <div className="text-[10px] text-zinc-500 font-semibold font-mono tracking-wider">+{stepPoints} POINTS</div>
            </div>
          </div>

          <div className="mt-6">
            <input
              type="range"
              min={0}
              max={30000}
              step={500}
              value={steps}
              onChange={(e) => setSteps(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, ${primaryColor} 0%, ${primaryColor} ${(steps / 30000) * 100}%, ${trackBg} ${(steps / 30000) * 100}%, ${trackBg} 100%)`
              }}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500 transition-all duration-150"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono font-bold mt-2">
              <span>0 steps</span>
              <span>10,000 steps</span>
              <span>20,000 steps</span>
              <span>30,000 steps</span>
            </div>
          </div>
        </div>

        {/* Water Range Slider Section */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-200 dark:border-zinc-900 relative">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <GlassWater className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
                Water Drank
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">0.5 Points rewarded for every 0.5 Liters (0.5 L) logged</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-cyan-500 dark:text-cyan-400 font-mono text-glow-emerald">
                {habits.drinkWater || 0} <span className="text-xs text-zinc-500 font-bold">L</span>
              </div>
              <div className="text-[10px] text-zinc-500 font-semibold font-mono tracking-wider">
                +{habits.drinkWater || 0} POINTS
              </div>
            </div>
          </div>

          <div className="mt-6">
            <input
              type="range"
              min={0}
              max={6}
              step={0.5}
              value={habits.drinkWater || 0}
              onChange={(e) => setHabits(prev => ({ ...prev, drinkWater: Number(e.target.value) }))}
              style={{
                background: `linear-gradient(to right, ${cyanColor} 0%, ${cyanColor} ${((habits.drinkWater || 0) / 6) * 100}%, ${trackBg} ${((habits.drinkWater || 0) / 6) * 100}%, ${trackBg} 100%)`
              }}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-600 dark:accent-cyan-500 transition-all duration-150"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono font-bold mt-2">
              <span>0 L</span>
              <span>2 L (Target)</span>
              <span>4 L</span>
              <span>6 L</span>
            </div>
          </div>
        </div>

        {/* Habit Grid Section */}
        <div className="space-y-3">
          <h3 className="text-md font-extrabold text-white tracking-wider uppercase pl-1">
            Positive Habit Checklist (+1 pt each)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HABIT_DEFINITIONS.map((def) => {
              const Icon = def.icon;
              const isCompleted = habits[def.key] || false;
              return (
                <button
                  type="button"
                  key={def.key}
                  onClick={() => handleToggleHabit(def.key)}
                  className={`glass-panel p-5 rounded-2xl border text-left flex items-start gap-4 transition-all ${
                    isCompleted
                      ? 'border-indigo-500/40 bg-indigo-950/20 shadow-lg'
                      : 'border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/30'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${def.color} shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="font-bold text-sm text-white">{def.label}</h4>
                    <p className="text-zinc-500 text-xs mt-1 leading-normal">{def.desc}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border shrink-0 flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'border-zinc-800 bg-zinc-900/50'
                  }`}>
                    {isCompleted && <Check className="h-3.5 w-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes Text Area */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-200 dark:border-zinc-900">
          <h3 className="text-md font-bold text-white flex items-center gap-2 mb-3">
            <MessageSquareQuote className="h-4.5 w-4.5 text-zinc-550 dark:text-zinc-550" />
            {selectedDate === getTodayStr() ? "Today's Reflections" : "Reflections for this Day"} <span className="text-zinc-500 text-xs font-normal">(Optional)</span>
          </h3>
          <textarea
            rows={3}
            placeholder={selectedDate === getTodayStr() ? "Log your thoughts, challenges, or highlights of today..." : "Log your thoughts, challenges, or highlights of this day..."}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Save Button */}
        <div>
          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex justify-center items-center gap-2 py-4 px-6 border border-transparent rounded-2xl shadow-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-indigo"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Flame className="h-5 w-5 text-orange-400 animate-streak-fire" />
                {selectedDate === getTodayStr()
                  ? `Save Today's Progress (+${totalTodayPoints} pts)`
                  : `Save Progress for ${selectedDate} (+${totalTodayPoints} pts)`}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
