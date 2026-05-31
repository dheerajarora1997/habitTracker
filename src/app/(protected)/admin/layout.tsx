import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Command Center | Habit Partner Moderation',
  description: 'View global platform statistics, moderate user ban states, and audit active groups.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
