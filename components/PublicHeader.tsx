'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { APP_NAME } from '@/lib/config/appConfig';

export function PublicHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label={`${APP_NAME} home`}>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-base sm:text-lg font-semibold text-white">{APP_NAME}</span>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-6" aria-label="Public navigation">
            <Link 
              href="/about" 
              className="hidden sm:inline-block text-sm text-white/80 transition-colors hover:text-white"
            >
              About
            </Link>
            <Link 
              href="/privacy" 
              className="hidden sm:inline-block text-sm text-white/80 transition-colors hover:text-white"
            >
              Privacy
            </Link>
            
            {user ? (
              <Link href="/today" className="btn-primary !px-4 !py-2 !text-xs sm:!px-5 sm:!py-2 sm:!text-sm whitespace-nowrap">
                Go to app
              </Link>
            ) : (
              <Link href="/auth/signin" className="btn-secondary !px-4 !py-2 !text-xs sm:!text-sm whitespace-nowrap">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

