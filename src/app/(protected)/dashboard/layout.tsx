import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Dashboard | Habit Tracker & Accountability Partner',
  description: 'View your daily progress scores, streaks, consistency charts, and accountability partner summaries.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
