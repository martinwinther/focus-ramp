'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePlanConfig } from '@/lib/hooks/usePlanConfig';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DEFAULT_TRAINING_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

type ConfigMode = 'endDate' | 'trainingDaysCount';

export default function OnboardingPage() {
  const router = useRouter();
  const { savePlanConfig } = usePlanConfig();

  const [targetDailyMinutes, setTargetDailyMinutes] = useState(180);
  const [configMode, setConfigMode] = useState<ConfigMode>('endDate');
  const [endDate, setEndDate] = useState('');
  const [trainingDaysCount, setTrainingDaysCount] = useState(30);
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState<string[]>(
    DEFAULT_TRAINING_DAYS
  );
  const [error, setError] = useState('');

  const toggleTrainingDay = (day: string) => {
    if (trainingDaysPerWeek.includes(day)) {
      setTrainingDaysPerWeek(trainingDaysPerWeek.filter((d) => d !== day));
    } else {
      setTrainingDaysPerWeek([...trainingDaysPerWeek, day]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (trainingDaysPerWeek.length === 0) {
      setError('Please select at least one training day per week');
      return;
    }

    if (targetDailyMinutes < 10) {
      setError('Target daily minutes must be at least 10');
      return;
    }

    if (configMode === 'endDate' && !endDate) {
      setError('Please select an end date');
      return;
    }

    if (configMode === 'trainingDaysCount' && trainingDaysCount < 1) {
      setError('Training days count must be at least 1');
      return;
    }

    const config = {
      targetDailyMinutes,
      trainingDaysPerWeek,
      ...(configMode === 'endDate' ? { endDate } : { trainingDaysCount }),
    };

    savePlanConfig(config);
    router.push('/auth/signup');
  };

  const getMinEndDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-card w-full max-w-2xl">
        <div className="mb-6 flex justify-center">
          <Link href="/">
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </Link>
        </div>

        <h1 className="mb-2 text-center text-3xl font-bold text-white">
          Create your focus plan
        </h1>
        <p className="mb-8 text-center text-white/80">
          We'll slowly ramp up your daily focus time from a small start to your goal
        </p>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-200 backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="targetDailyMinutes"
              className="mb-2 block text-sm font-medium text-white/90"
            >
              Target daily focus time (minutes)
            </label>
            <input
              id="targetDailyMinutes"
              type="number"
              min="10"
              max="480"
              value={targetDailyMinutes}
              onChange={(e) => setTargetDailyMinutes(Number(e.target.value))}
              className="input-field"
              required
            />
            <p className="mt-1 text-xs text-white/60">
              Your end goal for daily focus time (e.g., 180 minutes = 3 hours)
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-white/90">
              Plan duration
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfigMode('endDate')}
                className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  configMode === 'endDate'
                    ? 'bg-white/20 text-white ring-2 ring-white/30'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                Set end date
              </button>
              <button
                type="button"
                onClick={() => setConfigMode('trainingDaysCount')}
                className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  configMode === 'trainingDaysCount'
                    ? 'bg-white/20 text-white ring-2 ring-white/30'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                Set number of days
              </button>
            </div>

            {configMode === 'endDate' ? (
              <div>
                <label
                  htmlFor="endDate"
                  className="mb-2 block text-sm font-medium text-white/90"
                >
                  End date
                </label>
                <input
                  id="endDate"
                  type="date"
                  min={getMinEndDate()}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field"
                  required={configMode === 'endDate'}
                />
              </div>
            ) : (
              <div>
                <label
                  htmlFor="trainingDaysCount"
                  className="mb-2 block text-sm font-medium text-white/90"
                >
                  Number of training days
                </label>
                <input
                  id="trainingDaysCount"
                  type="number"
                  min="1"
                  max="365"
                  value={trainingDaysCount}
                  onChange={(e) => setTrainingDaysCount(Number(e.target.value))}
                  className="input-field"
                  required={configMode === 'trainingDaysCount'}
                />
              </div>
            )}
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-white/90">
              Training days per week
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleTrainingDay(day)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    trainingDaysPerWeek.includes(day)
                      ? 'bg-white/20 text-white ring-2 ring-white/30'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-white/60">
              Choose which days you'll train (we recommend starting with weekdays)
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Link href="/" className="btn-secondary flex-1">
              Back
            </Link>
            <button type="submit" className="btn-primary flex-1">
              Continue to sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

