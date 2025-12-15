import Link from 'next/link';
import { PublicHeader } from '@/components/PublicHeader';
import { Footer } from '@/components/Footer';
import { APP_NAME, APP_TAGLINE } from '@/lib/config/appConfig';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="flex-1 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="glass-card text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M5.21 17.89A10 10 0 1118.8 6.1a10 10 0 01-13.59 11.8z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="mb-3 text-4xl font-bold text-white">Page not found</h1>
            <p className="mb-6 text-white/80">
              The page you&apos;re looking for doesn&apos;t exist. {APP_NAME} helps you build your focus capacity—let&apos;s get you back to it.
            </p>
            <p className="mb-8 text-white/60">{APP_TAGLINE}</p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/" className="btn-primary">
                Go to homepage
              </Link>
              <Link href="/contact" className="btn-secondary">
                Contact support
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

