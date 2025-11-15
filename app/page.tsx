import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="glass-card text-center">
          {/* Logo / Brand Mark */}
          <div className="mb-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="mb-4 text-5xl font-bold text-white text-balance md:text-6xl">
            Build your focus capacity, gradually
          </h1>

          {/* Subheading */}
          <p className="mb-8 text-lg text-white/90 text-balance md:text-xl">
            Set a goal and target date. We'll create a gentle training plan with Pomodoro sessions that grow with you.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/onboarding" className="btn-primary">
              Get started
            </Link>
            <Link href="/auth/signin" className="btn-secondary">
              Sign in
            </Link>
          </div>

          {/* Feature Pills */}
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <div className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              📈 Gradual progression
            </div>
            <div className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              🍅 Pomodoro-based
            </div>
            <div className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              🎯 Goal-oriented
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-center text-sm text-white/60">
          No pressure. No perfectionism. Just steady progress.
        </p>
      </div>
    </div>
  );
}

