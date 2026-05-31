import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Accountability Groups | Habit Tracker',
  description: 'Manage your active accountability groups, create new rooms, or join with invite codes.',
};

export default function GroupsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
