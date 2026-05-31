import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Habit Tracker & Accountability Partner',
  description: 'Log in securely using your phone number and enter the accountability portal instantly.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
