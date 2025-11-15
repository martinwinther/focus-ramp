import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Focus Ramp – Build your focus capacity, gradually',
  description: 'A calm, structured approach to building deep work capacity. Set a goal and target date, then follow a personalized training plan with Pomodoro sessions that grow with you.',
  keywords: ['focus', 'pomodoro', 'productivity', 'deep work', 'training', 'focus training', 'attention', 'concentration'],
  authors: [{ name: 'Focus Ramp' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#667eea',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

