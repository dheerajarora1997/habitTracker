import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | Habit Tracker & Accountability Partner',
  description: 'Manage push notifications, toggle streak milestone reminders, and audit secure sessions.',
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
