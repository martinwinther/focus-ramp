'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getFocusPlanById } from '@/lib/firestore/focusPlans';
import { getFocusDaysForPlan } from '@/lib/firestore/history';
import { buildFocusDayRows, type FocusDayRow } from '@/lib/focus/planDetails';
import type { FocusPlan } from '@/lib/types/focusPlan';
import { GlassCard, EmptyState, LoadingSpinner, Button, Badge } from '@/components/ui';

export const runtime = 'edge';

export default function PlanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const planId = params.planId as string;

  const [plan, setPlan] = useState<FocusPlan | null>(null);
  const [dayRows, setDayRows] = useState<FocusDayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const loadPlanDetails = useCallback(async () => {
    if (!user || !planId) return;

    setLoading(true);
    setError('');

    try {
      const [planData, days] = await Promise.all([
        getFocusPlanById(user.uid, planId),
        getFocusDaysForPlan(user.uid, planId),
      ]);

      if (!planData) {
        setError('Plan not found');
        setLoading(false);
        return;
      }

      setPlan(planData);
      const rows = buildFocusDayRows(days);
      setDayRows(rows);
    } catch (err: unknown) {
      console.error('Error loading plan details:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load plan details. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [user, planId]);

  useEffect(() => {
    loadPlanDetails();
  }, [loadPlanDetails]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTrainingDays = (days: string[]) => {
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes('Sat') && !days.includes('Sun')) {
      return 'Weekdays';
    }
    return days.join(', ');
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'success' | 'secondary' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'default';
      case 'completed':
        return 'default';
      case 'archived':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusBadgeVariantForDay = (status: string): 'default' | 'success' | 'warning' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'missed':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading plan details..." />;
  }

  if (error || !plan) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
          title="Plan not found"
          description={error || "The plan you're looking for doesn't exist or you don't have access to it."}
          action={
            <Link href="/plans">
              <Button>Back to plans</Button>
            </Link>
          }
        />
      </div>
    );
  }

  // Calculate summary stats
  const totalTrainingDays = dayRows.length;
  const totalPlannedMinutes = dayRows.reduce((sum, row) => sum + row.dailyTargetMinutes, 0);
  const completedDays = dayRows.filter((row) => row.status === 'completed').length;
  const positiveIncrements = dayRows
    .filter((row) => row.incrementMinutes > 0)
    .map((row) => row.incrementMinutes);
  const averageIncrement =
    positiveIncrements.length > 0
      ? Math.round(
          positiveIncrements.reduce((sum, inc) => sum + inc, 0) / positiveIncrements.length
        )
      : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/plans">
            <button className="rounded-lg p-2 text-white/80 hover:bg-white/10 transition-colors">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Plan Details</h1>
        </div>
      </div>

      <GlassCard>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-bold text-white">Plan Overview</h2>
            <Badge variant={getStatusBadgeVariant(plan.status)}>
              {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
            </Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 mt-4">
            <div>
              <div className="text-xs text-white/50">Start date</div>
              <div className="text-sm font-semibold text-white">{formatDate(plan.startDate)}</div>
            </div>
            {plan.endDate && (
              <div>
                <div className="text-xs text-white/50">End date</div>
                <div className="text-sm font-semibold text-white">{formatDate(plan.endDate)}</div>
              </div>
            )}
            <div>
              <div className="text-xs text-white/50">Target</div>
              <div className="text-sm font-semibold text-white">
                {plan.targetDailyMinutes} min/day
              </div>
            </div>
            <div>
              <div className="text-xs text-white/50">Training days</div>
              <div className="text-sm font-semibold text-white">
                {formatTrainingDays(plan.trainingDaysPerWeek)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div className="rounded-xl bg-white/5 p-4">
            <div className="text-sm text-white/60">Total training days</div>
            <div className="mt-1 text-2xl font-bold text-white">{totalTrainingDays}</div>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <div className="text-sm text-white/60">Total planned minutes</div>
            <div className="mt-1 text-2xl font-bold text-white">{totalPlannedMinutes}</div>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <div className="text-sm text-white/60">Completed days</div>
            <div className="mt-1 text-2xl font-bold text-white">{completedDays}</div>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <div className="text-sm text-white/60">Avg. daily increment</div>
            <div className="mt-1 text-2xl font-bold text-white">+{averageIncrement} min</div>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white mb-2">Training Days Breakdown</h2>
          <p className="text-sm text-white/60">
            Pomodoro plan shows each work/break block in minutes, in chronological order.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white/5 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Day #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                  +min
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Target (min)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Pomodoro plan
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {dayRows.map((row) => (
                <tr key={row.index} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-sm text-white">{row.index}</td>
                  <td className="px-4 py-3 text-sm text-white">{row.date}</td>
                  <td className="px-4 py-3 text-sm text-white">
                    {row.incrementMinutes > 0 ? `+${row.incrementMinutes}` : row.incrementMinutes === 0 ? '0' : `${row.incrementMinutes}`}
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{row.dailyTargetMinutes}</td>
                  <td className="px-4 py-3 text-sm text-white/80 font-mono">{row.pomodoroPlan}</td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatusBadgeVariantForDay(row.status)}>
                      {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {dayRows.length === 0 && (
          <div className="py-8 text-center text-white/60">
            No training days found for this plan.
          </div>
        )}
      </GlassCard>
    </div>
  );
}

