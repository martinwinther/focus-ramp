/**
 * Pure TypeScript ramp generator for Focus Ramp.
 * Generates training dates, daily targets, and Pomodoro segments.
 */

export type TrainingDayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface FocusSegment {
  type: 'work' | 'break';
  minutes: number;
}

export interface FocusDayPlan {
  index: number;
  date: string;
  dailyTargetMinutes: number;
  segments: FocusSegment[];
}

export interface FocusPlanConfig {
  startDate: string;
  targetDailyMinutes: number;
  trainingDaysPerWeek: TrainingDayOfWeek[];
  startingDailyMinutes?: number;
  endDate?: string;
  trainingDaysCount?: number;
}

const DAY_MAP: Record<TrainingDayOfWeek, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/**
 * Computes all training dates between startDate and endDate (or until trainingDaysCount is reached).
 * Only includes dates that match the selected training days of the week.
 */
export function getTrainingDates(config: FocusPlanConfig): string[] {
  const { startDate, trainingDaysPerWeek, endDate, trainingDaysCount } = config;
  
  const trainingDayIndices = trainingDaysPerWeek.map(day => DAY_MAP[day]);
  const start = new Date(startDate);
  const dates: string[] = [];
  
  let current = new Date(start);
  let maxDate: Date | null = null;
  
  if (endDate) {
    maxDate = new Date(endDate);
  }
  
  // Generate dates until we hit the end date or reach the desired count
  while (true) {
    const dayOfWeek = current.getDay();
    
    if (trainingDayIndices.includes(dayOfWeek)) {
      dates.push(current.toISOString().split('T')[0]);
      
      if (trainingDaysCount && dates.length >= trainingDaysCount) {
        break;
      }
    }
    
    if (maxDate && current >= maxDate) {
      break;
    }
    
    current.setDate(current.getDate() + 1);
    
    // Safety: prevent infinite loops
    if (dates.length > 1000) {
      break;
    }
  }
  
  return dates;
}

/**
 * Generates daily target minutes for each training date.
 * Creates a smooth, monotonic increase from starting level to target.
 */
export function generateDailyTargets(
  config: FocusPlanConfig,
  trainingDates: string[]
): number[] {
  const { targetDailyMinutes, startingDailyMinutes = 10 } = config;
  const n = trainingDates.length;
  
  // Edge case: single day or no days
  if (n === 0) return [];
  if (n === 1) return [targetDailyMinutes];
  
  const start = startingDailyMinutes;
  const target = targetDailyMinutes;
  
  // If already at or above target, just use target for all days
  if (start >= target) {
    return Array(n).fill(target);
  }
  
  // Calculate linear ramp: distribute the increase across all days
  const totalIncrease = target - start;
  const increment = totalIncrease / (n - 1);
  
  const targets: number[] = [];
  
  for (let i = 0; i < n; i++) {
    const rawValue = start + (increment * i);
    // Round to nearest integer, ensuring the last day is exactly the target
    const value = i === n - 1 ? target : Math.round(rawValue);
    targets.push(value);
  }
  
  return targets;
}

/**
 * Builds a Pomodoro-style segment plan for a given daily target.
 * Rules:
 * - Work sessions are ≤ 25 minutes
 * - Standard break between work sessions is 5 minutes
 * - If totalMinutes < 20: no breaks, just work segments
 * - If totalMinutes ≥ 20: split into work segments with 5-min breaks between them
 */
export function buildPomodoroSegmentsForDay(totalMinutes: number): FocusSegment[] {
  const segments: FocusSegment[] = [];
  
  // Short days: no breaks
  if (totalMinutes < 20) {
    segments.push({ type: 'work', minutes: totalMinutes });
    return segments;
  }
  
  // Longer days: split into 25-min work blocks with 5-min breaks
  const MAX_WORK_SEGMENT = 25;
  const BREAK_DURATION = 5;
  
  let remainingMinutes = totalMinutes;
  
  while (remainingMinutes > 0) {
    const workMinutes = Math.min(remainingMinutes, MAX_WORK_SEGMENT);
    segments.push({ type: 'work', minutes: workMinutes });
    remainingMinutes -= workMinutes;
    
    // Add break only if there's more work to do
    if (remainingMinutes > 0) {
      segments.push({ type: 'break', minutes: BREAK_DURATION });
    }
  }
  
  return segments;
}

/**
 * Generates the complete focus day plan for a given configuration.
 * Returns an array of FocusDayPlan with date, index, target minutes, and segments.
 */
export function generateFocusDayPlans(config: FocusPlanConfig): FocusDayPlan[] {
  const trainingDates = getTrainingDates(config);
  const dailyTargets = generateDailyTargets(config, trainingDates);
  
  const dayPlans: FocusDayPlan[] = trainingDates.map((date, idx) => {
    const dailyTargetMinutes = dailyTargets[idx];
    const segments = buildPomodoroSegmentsForDay(dailyTargetMinutes);
    
    return {
      index: idx + 1, // 1-based day index
      date,
      dailyTargetMinutes,
      segments,
    };
  });
  
  return dayPlans;
}

