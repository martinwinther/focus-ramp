'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getActiveFocusPlanForUser } from '@/lib/firestore/focusPlans';
import { getUserPreferences, updateUserPreferences } from '@/lib/firestore/userPreferences';
import { GlassCard, LoadingSpinner } from '@/components/ui';
import type { FocusPlan } from '@/lib/types/focusPlan';
import type { UserPreferences } from '@/lib/firestore/userPreferences';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [plan, setPlan] = useState<FocusPlan | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      try {
        const [activePlan, userPrefs] = await Promise.all([
          getActiveFocusPlanForUser(user.uid),
          getUserPreferences(user.uid),
        ]);

        setPlan(activePlan);
        setPreferences(userPrefs);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  const handlePreferenceChange = async (
    key: keyof Omit<UserPreferences, 'userId' | 'createdAt' | 'updatedAt'>,
    value: boolean
  ) => {
    if (!user || !preferences) return;

    setSaving(true);
    try {
      await updateUserPreferences(user.uid, { [key]: value });
      setPreferences({ ...preferences, [key]: value });
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTrainingDays = (days: string[]) => {
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes('Sat') && !days.includes('Sun')) {
      return 'Monday – Friday';
    }
    return days.join(', ');
  };

  if (loading) {
    return <LoadingSpinner message="Loading settings..." />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="mb-2 text-4xl font-bold text-white">Settings</h1>
        <p className="text-lg text-white/70">
          Manage your focus plan and preferences
        </p>
      </header>

      {plan && (
        <GlassCard>
          <h2 className="mb-4 text-xl font-semibold text-white">
            Active focus plan
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between border-b border-white/10 pb-3">
              <span className="text-white/70">Target daily focus time</span>
              <span className="font-medium text-white">
                {plan.targetDailyMinutes} minutes
              </span>
            </div>

            <div className="flex justify-between border-b border-white/10 pb-3">
              <span className="text-white/70">Started</span>
              <span className="font-medium text-white">
                {formatDate(plan.startDate)}
              </span>
            </div>

            <div className="flex justify-between border-b border-white/10 pb-3">
              <span className="text-white/70">Training days</span>
              <span className="font-medium text-white">
                {formatTrainingDays(plan.trainingDaysPerWeek)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-white/70">Status</span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400"></span>
                <span className="font-medium text-green-300">Active</span>
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Link href="/today" className="btn-primary">
              Continue training
            </Link>
            <Link href="/history" className="btn-secondary">
              View history
            </Link>
          </div>
        </GlassCard>
      )}

      {preferences && (
        <GlassCard>
          <h2 className="mb-4 text-xl font-semibold text-white">
            Timer preferences
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
              <div className="flex-1">
                <div className="font-medium text-white">Sound notifications</div>
                <div className="mt-1 text-sm text-white/60">
                  Play a soft sound when a work session ends
                </div>
              </div>
              <button
                onClick={() =>
                  handlePreferenceChange('soundEnabled', !preferences.soundEnabled)
                }
                disabled={saving}
                className={`relative h-8 w-14 rounded-full transition-colors ${
                  preferences.soundEnabled ? 'bg-green-500/80' : 'bg-white/20'
                }`}
                aria-label="Toggle sound notifications"
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
                    preferences.soundEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                ></span>
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
              <div className="flex-1">
                <div className="font-medium text-white">Auto-start next session</div>
                <div className="mt-1 text-sm text-white/60">
                  Automatically start the next session after one completes
                </div>
              </div>
              <button
                onClick={() =>
                  handlePreferenceChange(
                    'autoStartNextSegment',
                    !preferences.autoStartNextSegment
                  )
                }
                disabled={saving}
                className={`relative h-8 w-14 rounded-full transition-colors ${
                  preferences.autoStartNextSegment ? 'bg-green-500/80' : 'bg-white/20'
                }`}
                aria-label="Toggle auto-start next session"
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
                    preferences.autoStartNextSegment
                      ? 'translate-x-7'
                      : 'translate-x-1'
                  }`}
                ></span>
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <h2 className="mb-4 text-xl font-semibold text-white">Account</h2>

        <div className="space-y-4">
          <div className="flex justify-between rounded-xl bg-white/5 p-4">
            <span className="text-white/70">Email</span>
            <span className="font-medium text-white">{user?.email}</span>
          </div>

          <button
            onClick={signOut}
            className="btn-secondary w-full justify-start text-white/90"
          >
            Sign out
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
