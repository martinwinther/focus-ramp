// Note: Keeping legacy storage key prefix to avoid breaking existing user sessions
// TODO: Consider migration strategy if needed
const STORAGE_KEY_PREFIX = 'focusRamp:activeSession:';

export type PersistedSessionState = {
  userId: string;
  planId: string;
  dayId: string;
  date: string; // ISO for the focus day
  segmentIndex: number;
  segmentType: 'work' | 'break';
  segmentPlannedMinutes: number;
  secondsRemaining: number;
  isRunning: boolean;
  lastUpdatedAt: number; // ms since epoch
};

function getStorageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

function isValidPersistedState(state: unknown): state is PersistedSessionState {
  if (!state || typeof state !== 'object') return false;
  
  const s = state as Record<string, unknown>;
  
  return (
    typeof s.userId === 'string' &&
    typeof s.planId === 'string' &&
    typeof s.dayId === 'string' &&
    typeof s.date === 'string' &&
    typeof s.segmentIndex === 'number' &&
    (s.segmentType === 'work' || s.segmentType === 'break') &&
    typeof s.segmentPlannedMinutes === 'number' &&
    typeof s.secondsRemaining === 'number' &&
    typeof s.isRunning === 'boolean' &&
    typeof s.lastUpdatedAt === 'number'
  );
}

export function saveSessionState(state: PersistedSessionState): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = getStorageKey(state.userId);
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save session state to localStorage:', error);
  }
}

export function clearSessionState(userId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = getStorageKey(userId);
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear session state from localStorage:', error);
  }
}

export function loadSessionState(userId: string): PersistedSessionState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const key = getStorageKey(userId);
    const raw = window.localStorage.getItem(key);
    
    if (!raw) return null;
    
    const parsed = JSON.parse(raw);
    
    if (!isValidPersistedState(parsed)) {
      console.warn('Invalid persisted session state found, clearing');
      clearSessionState(userId);
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to load session state from localStorage:', error);
    return null;
  }
}

export function calculateEffectiveSecondsRemaining(
  persistedState: PersistedSessionState
): number {
  const now = Date.now();
  const elapsedMs = now - persistedState.lastUpdatedAt;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  
  if (!persistedState.isRunning) {
    return persistedState.secondsRemaining;
  }
  
  const effectiveSeconds = persistedState.secondsRemaining - elapsedSeconds;
  return Math.max(0, effectiveSeconds);
}

