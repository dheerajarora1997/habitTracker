import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify Code | Habit Tracker & Accountability Partner',
  description: 'Enter your 6-digit session verification OTP code to confirm your phone identity and start tracking.',
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
