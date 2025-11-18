import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import ClientMonitoring from '@/components/ClientMonitoring';
import { APP_NAME, APP_DESCRIPTION, APP_CANONICAL_URL } from '@/lib/config/appConfig';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: `${APP_NAME} – ${APP_DESCRIPTION.split('.')[0]}`,
  description: APP_DESCRIPTION,
  keywords: ['focus', 'pomodoro', 'productivity', 'deep work', 'training', 'focus training', 'attention', 'concentration'],
  authors: [{ name: APP_NAME }],
  openGraph: {
    title: `${APP_NAME} – ${APP_DESCRIPTION.split('.')[0]}`,
    description: APP_DESCRIPTION,
    type: 'website',
    locale: 'en_US',
    siteName: APP_NAME,
    url: APP_CANONICAL_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} – ${APP_DESCRIPTION.split('.')[0]}`,
    description: APP_DESCRIPTION,
  },
  metadataBase: new URL(APP_CANONICAL_URL),
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
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
        {/* Client-side monitoring initialization */}
        <ClientMonitoring />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

