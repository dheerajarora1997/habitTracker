import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Profile | Habit Tracker & Accountability Partner',
  description: 'Update your display name, view account statistics, and customize your avatar settings.',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
