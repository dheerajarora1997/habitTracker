import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log Today\'s Habits | Habit Tracker & Accountability Partner',
  description: 'Log steps, drag the water slider, check off your healthy checklist, and record notes of today.',
};

export default function TrackerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
