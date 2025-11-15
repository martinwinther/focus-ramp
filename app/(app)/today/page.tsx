'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { usePlanConfig } from '@/lib/hooks/usePlanConfig';
import {
  getActiveFocusPlanForUser,
  createFocusPlan,
} from '@/lib/firestore/focusPlans';
import { getFocusDayForDate, getNextTrainingDay } from '@/lib/firestore/focusDays';
import type { FocusPlan, FocusDay } from '@/lib/types/focusPlan';

export default function TodayPage() {
  const { user } = useAuth();
  const { config, clearPlanConfig } = usePlanConfig();
  const [plan, setPlan] = useState<FocusPlan | null>(null);
  const [todayDay, setTodayDay] = useState<FocusDay | null>(null);
  const [nextDay, setNextDay] = useState<FocusDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function loadPlan() {
      if (!user) return;

      setLoading(true);
      try {
        const existingPlan = await getActiveFocusPlanForUser(user.uid);

        if (existingPlan) {
          setPlan(existingPlan);
          clearPlanConfig();
          
          // Load today's focus day
          const today = new Date().toISOString().split('T')[0];
          const dayData = await getFocusDayForDate(existingPlan.id!, today);
          setTodayDay(dayData);
          
          // If no day for today, get the next upcoming training day
          if (!dayData) {
            const upcoming = await getNextTrainingDay(existingPlan.id!);
            setNextDay(upcoming);
          }
        } else if (config) {
          setCreating(true);
          const planId = await createFocusPlan(user.uid, config);
          const newPlan = await getActiveFocusPlanForUser(user.uid);
          setPlan(newPlan);
          clearPlanConfig();
          
          // Load today's focus day for the new plan
          if (newPlan) {
            const today = new Date().toISOString().split('T')[0];
            const dayData = await getFocusDayForDate(newPlan.id!, today);
            setTodayDay(dayData);
            
            if (!dayData) {
              const upcoming = await getNextTrainingDay(newPlan.id!);
              setNextDay(upcoming);
            }
          }
          setCreating(false);
        }
      } catch (error) {
        console.error('Error loading plan:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPlan();
  }, [user, config, clearPlanConfig]);

  if (loading || creating) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="glass-card">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
            <p className="text-white">
              {creating ? 'Creating your plan...' : 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="glass-card text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10">
              <svg
                className="h-10 w-10 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>

          <h1 className="mb-3 text-3xl font-bold text-white">
            No active plan
          </h1>
          <p className="mb-6 text-lg text-white/80">
            You don't have an active focus plan yet. Create one to get started with your training journey.
          </p>

          <Link href="/onboarding" className="btn-primary inline-block">
            Create your plan
          </Link>
        </div>
      </div>
    );
  }

  const formatTrainingDays = (days: string[]) => {
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes('Sat') && !days.includes('Sun')) {
      return 'Weekdays';
    }
    return days.join(', ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Show message when there's no training day for today
  if (plan && !todayDay && nextDay) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="glass-card text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10">
              <svg
                className="h-10 w-10 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          <h1 className="mb-3 text-3xl font-bold text-white">
            No training scheduled today
          </h1>
          <p className="mb-6 text-lg text-white/80">
            Today is a rest day. Your next training session is on:
          </p>

          <div className="mb-6 rounded-xl bg-white/5 p-6">
            <div className="text-sm text-white/60">Next training day</div>
            <div className="mt-2 text-2xl font-bold text-white">
              {formatDate(nextDay.date)}
            </div>
            <div className="mt-1 text-white/70">
              Day {nextDay.index} • {nextDay.dailyTargetMinutes} minutes
            </div>
          </div>

          <Link href="/history" className="btn-secondary inline-block">
            View training history
          </Link>
        </div>
      </div>
    );
  }

  // Show message when plan is complete or no upcoming days
  if (plan && !todayDay && !nextDay) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="glass-card text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10">
              <svg
                className="h-10 w-10 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <h1 className="mb-3 text-3xl font-bold text-white">
            Plan complete!
          </h1>
          <p className="mb-6 text-lg text-white/80">
            You've finished your training plan. Great work!
          </p>

          <div className="flex justify-center gap-3">
            <Link href="/history" className="btn-secondary inline-block">
              View history
            </Link>
            <Link href="/onboarding" className="btn-primary inline-block">
              Create new plan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {todayDay && (
        <>
          <div className="glass-card">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white">Today</h1>
              <p className="mt-1 text-white/70">
                {formatDate(todayDay.date)} • Day {todayDay.index} of your focus journey
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white/5 p-4">
                <div className="text-sm text-white/60">Target today</div>
                <div className="mt-1 text-2xl font-bold text-white">
                  {todayDay.dailyTargetMinutes} min
                </div>
              </div>

              <div className="rounded-xl bg-white/5 p-4">
                <div className="text-sm text-white/60">Final goal</div>
                <div className="mt-1 text-2xl font-bold text-white">
                  {plan.targetDailyMinutes} min
                </div>
              </div>

              <div className="rounded-xl bg-white/5 p-4">
                <div className="text-sm text-white/60">Training days</div>
                <div className="mt-1 text-lg font-semibold text-white">
                  {formatTrainingDays(plan.trainingDaysPerWeek)}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Today's Focus Plan
            </h2>
            <p className="mb-6 text-sm text-white/70">
              Follow these Pomodoro-style segments to complete your {todayDay.dailyTargetMinutes}{' '}
              minutes of focused work today.
            </p>

            <div className="space-y-3">
              {todayDay.segments.map((segment, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between rounded-xl p-4 ${
                    segment.type === 'work'
                      ? 'bg-white/10'
                      : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        segment.type === 'work'
                          ? 'bg-white/20'
                          : 'bg-white/10'
                      }`}
                    >
                      {segment.type === 'work' ? (
                        <svg
                          className="h-5 w-5 text-white"
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
                      ) : (
                        <svg
                          className="h-5 w-5 text-white/70"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {segment.type === 'work' ? 'Work Session' : 'Break'}
                      </div>
                      <div className="text-sm text-white/60">
                        Segment {index + 1}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">
                      {segment.minutes} min
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg bg-white/5 p-4 text-center">
              <div className="text-sm text-white/60">
                Total focus time today
              </div>
              <div className="mt-1 text-2xl font-bold text-white">
                {todayDay.segments
                  .filter(s => s.type === 'work')
                  .reduce((sum, s) => sum + s.minutes, 0)}{' '}
                minutes
              </div>
            </div>
          </div>

          <div className="glass-card text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                <svg
                  className="h-8 w-8 text-white/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <h3 className="mb-2 text-xl font-semibold text-white">
              Timer coming soon
            </h3>
            <p className="mb-6 text-white/70">
              The interactive Pomodoro timer will be implemented in the next phase.
              For now, you can see your daily plan above.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
