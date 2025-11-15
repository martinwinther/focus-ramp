import type { FocusDay, FocusSegment } from '@/lib/types/focusPlan';

export type FocusDayRow = {
  index: number;
  date: string;
  isoDate: string;
  incrementMinutes: number;
  dailyTargetMinutes: number;
  pomodoroPlan: string;
  status: 'pending' | 'completed' | 'missed';
};

/**
 * Formats a date string (ISO format) into a human-readable format.
 * Example: "2025-11-17" -> "Mon 17 Nov 2025"
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Converts segments array into a Pomodoro plan string.
 * Example: [{ type: "work", minutes: 25 }, { type: "break", minutes: 5 }]
 * -> "25 / 5"
 */
function formatPomodoroPlan(segments: FocusSegment[]): string {
  return segments.map((segment) => segment.minutes).join(' / ');
}

/**
 * Builds an array of FocusDayRow from an array of FocusDay.
 * Computes increment minutes and formats data for display.
 */
export function buildFocusDayRows(days: FocusDay[]): FocusDayRow[] {
  // Ensure days are sorted by index ascending
  const sortedDays = [...days].sort((a, b) => a.index - b.index);

  return sortedDays.map((day, index) => {
    // Compute increment minutes
    let incrementMinutes = 0;
    if (index > 0) {
      const previousDay = sortedDays[index - 1];
      incrementMinutes = day.dailyTargetMinutes - previousDay.dailyTargetMinutes;
    }

    // Normalize status (default to 'pending' if missing)
    const status: 'pending' | 'completed' | 'missed' = day.status || 'pending';

    return {
      index: day.index,
      date: formatDate(day.date),
      isoDate: day.date,
      incrementMinutes,
      dailyTargetMinutes: day.dailyTargetMinutes,
      pomodoroPlan: formatPomodoroPlan(day.segments),
      status,
    };
  });
}

