'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface FocusSegment {
  type: 'work' | 'break';
  minutes: number;
}

export interface UsePomodoroTimerOptions {
  segments: FocusSegment[];
  autoStartFirstWorkSegment?: boolean;
  onSegmentComplete?: (segmentIndex: number, segment: FocusSegment) => void;
  onWorkSegmentStart?: (segmentIndex: number, segment: FocusSegment) => void;
  initialSegmentIndex?: number;
  initialSecondsRemaining?: number;
  initialIsRunning?: boolean;
  onStateChange?: (state: PomodoroTimerState) => void;
  onExternalStateUpdate?: (updateFn: (state: PomodoroTimerState) => void) => void;
}

export interface PomodoroTimerState {
  currentIndex: number;
  currentSegment: FocusSegment | null;
  secondsRemaining: number;
  isRunning: boolean;
  isFinished: boolean;
  completedSegments: number[];
}

export interface PomodoroTimerControls {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skipSegment: () => void;
  goToSegment: (index: number) => void;
}

export function usePomodoroTimer(
  options: UsePomodoroTimerOptions
): { state: PomodoroTimerState; controls: PomodoroTimerControls } {
  const {
    segments,
    autoStartFirstWorkSegment = false,
    onSegmentComplete,
    onWorkSegmentStart,
    initialSegmentIndex = 0,
    initialSecondsRemaining,
    initialIsRunning = false,
    onStateChange,
    onExternalStateUpdate,
  } = options;

  const [currentIndex, setCurrentIndex] = useState(initialSegmentIndex);
  const initialSeconds = initialSecondsRemaining !== undefined
    ? initialSecondsRemaining
    : segments.length > 0
    ? segments[initialSegmentIndex]?.minutes * 60 || 0
    : 0;
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(initialIsRunning);
  const [isFinished, setIsFinished] = useState(false);
  const [completedSegments, setCompletedSegments] = useState<number[]>([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const segmentStartTimeRef = useRef<Date | null>(null);
  const segmentPlannedSecondsRef = useRef<number>(initialSeconds);
  const accumulatedSecondsRef = useRef<number>(0);
  const isExternalUpdateRef = useRef(false);

  const currentSegment = segments[currentIndex] || null;

  // Initialize refs with initial values
  useEffect(() => {
    segmentPlannedSecondsRef.current = initialSeconds;
    if (initialIsRunning) {
      segmentStartTimeRef.current = new Date();
    }
  }, [initialSeconds, initialIsRunning]);

  // Calculate remaining seconds from timestamp (works even when device sleeps)
  const calculateRemainingFromTimestamp = useCallback((): number => {
    const planned = segmentPlannedSecondsRef.current;
    const accumulated = accumulatedSecondsRef.current;
    
    if (!segmentStartTimeRef.current || !isRunning) {
      // If paused or not started, return remaining based on accumulated time
      return Math.max(0, planned - accumulated);
    }

    // If running, calculate elapsed since current start and subtract from remaining
    const now = Date.now();
    const elapsedSinceCurrentStart = Math.floor((now - segmentStartTimeRef.current.getTime()) / 1000);
    const remaining = Math.max(0, planned - accumulated - elapsedSinceCurrentStart);
    return remaining;
  }, [isRunning]);

  // Expose update function for external state sync (e.g., Firestore)
  useEffect(() => {
    if (onExternalStateUpdate) {
      onExternalStateUpdate((externalState: PomodoroTimerState) => {
        isExternalUpdateRef.current = true;
        
        // Update state from external source
        if (externalState.currentIndex !== currentIndex) {
          setCurrentIndex(externalState.currentIndex);
        }
        
        if (externalState.secondsRemaining !== secondsRemaining) {
          setSecondsRemaining(externalState.secondsRemaining);
        }
        
        if (externalState.isRunning !== isRunning) {
          setIsRunning(externalState.isRunning);
        }
        
        if (externalState.isFinished !== isFinished) {
          setIsFinished(externalState.isFinished);
        }
        
        // Update completed segments
        setCompletedSegments(externalState.completedSegments);
        
        // Clear interval if paused
        if (!externalState.isRunning && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // Reset flag after state updates
        setTimeout(() => {
          isExternalUpdateRef.current = false;
        }, 0);
      });
    }
  }, [onExternalStateUpdate, currentIndex, secondsRemaining, isRunning, isFinished]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Notify parent component of state changes for persistence
  // Skip notification if this is an external update (to prevent circular updates)
  useEffect(() => {
    if (onStateChange && !isExternalUpdateRef.current) {
      onStateChange({
        currentIndex,
        currentSegment,
        secondsRemaining,
        isRunning,
        isFinished,
        completedSegments,
      });
    }
  }, [currentIndex, secondsRemaining, isRunning, isFinished, completedSegments, currentSegment, onStateChange]);

  // Handle timer tick - use timestamp-based calculation (works when device sleeps)
  useEffect(() => {
    if (isRunning && segmentStartTimeRef.current) {
      // Calculate initial remaining time
      const initialRemaining = calculateRemainingFromTimestamp();
      if (initialRemaining !== secondsRemaining) {
        setSecondsRemaining(initialRemaining);
      }

      // Update every second by recalculating from timestamp
      intervalRef.current = setInterval(() => {
        const remaining = calculateRemainingFromTimestamp();
        setSecondsRemaining(remaining);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, calculateRemainingFromTimestamp, secondsRemaining]);

  // Handle segment completion and auto-advance
  useEffect(() => {
    if (isRunning && secondsRemaining === 0) {
      // Current segment is complete
      const completedIndex = currentIndex;
      const completedSegment = segments[completedIndex];

      // Mark segment as completed
      setCompletedSegments((prev) => [...prev, completedIndex]);

      // Notify completion
      if (onSegmentComplete) {
        onSegmentComplete(completedIndex, completedSegment);
      }

      // Check if there are more segments
      if (currentIndex < segments.length - 1) {
        const nextIndex = currentIndex + 1;
        const nextSegment = segments[nextIndex];
        
        setCurrentIndex(nextIndex);
        const nextPlannedSeconds = nextSegment.minutes * 60;
        setSecondsRemaining(nextPlannedSeconds);
        
        // Auto-start the next segment if it's a work segment or a break
        // For now, auto-start all segments for smooth UX
        segmentPlannedSecondsRef.current = nextPlannedSeconds;
        segmentStartTimeRef.current = new Date();
        accumulatedSecondsRef.current = 0;
        setIsRunning(true);
        
        // Notify if starting a work segment
        if (nextSegment.type === 'work' && onWorkSegmentStart) {
          onWorkSegmentStart(nextIndex, nextSegment);
        }
      } else {
        // No more segments
        setIsRunning(false);
        setIsFinished(true);
      }
    }
  }, [isRunning, secondsRemaining, currentIndex, segments, onSegmentComplete, onWorkSegmentStart]);

  const start = useCallback(() => {
    if (isFinished) return;
    
    const plannedSeconds = currentSegment?.minutes * 60 || segments[currentIndex]?.minutes * 60 || 0;
    segmentPlannedSecondsRef.current = plannedSeconds;
    segmentStartTimeRef.current = new Date();
    accumulatedSecondsRef.current = 0;
    setIsRunning(true);
    
    // Set initial remaining time
    setSecondsRemaining(plannedSeconds);
    
    // Notify if starting a work segment
    if (currentSegment?.type === 'work' && onWorkSegmentStart) {
      onWorkSegmentStart(currentIndex, currentSegment);
    }
  }, [isFinished, currentSegment, currentIndex, segments, onWorkSegmentStart]);

  const pause = useCallback(() => {
    if (segmentStartTimeRef.current && isRunning) {
      // Calculate accumulated time before pausing
      const elapsed = Math.floor(
        (Date.now() - segmentStartTimeRef.current.getTime()) / 1000
      );
      accumulatedSecondsRef.current += elapsed;
      segmentStartTimeRef.current = null;
    }
    setIsRunning(false);
  }, [isRunning]);

  const resume = useCallback(() => {
    if (!isFinished) {
      const remaining = segmentPlannedSecondsRef.current - accumulatedSecondsRef.current;
      if (remaining > 0) {
        // Start a new timer run from the remaining time
        segmentStartTimeRef.current = new Date();
        setIsRunning(true);
        setSecondsRemaining(remaining);
      } else {
        // Time already expired
        setSecondsRemaining(0);
      }
    }
  }, [isFinished]);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    const initialSeconds = segments.length > 0 ? segments[0].minutes * 60 : 0;
    setSecondsRemaining(initialSeconds);
    setIsRunning(false);
    setIsFinished(false);
    setCompletedSegments([]);
    segmentStartTimeRef.current = null;
    segmentPlannedSecondsRef.current = initialSeconds;
    accumulatedSecondsRef.current = 0;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [segments]);

  const skipSegment = useCallback(() => {
    if (isFinished) return;

    // Note: Skipped segments are NOT logged as completed work sessions
    // They are only marked in the UI as "completed" for progress tracking
    // The onSegmentComplete callback is not called for skipped segments
    if (!completedSegments.includes(currentIndex)) {
      setCompletedSegments((prev) => [...prev, currentIndex]);
    }

    if (currentIndex < segments.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextSegment = segments[nextIndex];
      
      setCurrentIndex(nextIndex);
      const nextPlannedSeconds = nextSegment.minutes * 60;
      setSecondsRemaining(nextPlannedSeconds);
      segmentPlannedSecondsRef.current = nextPlannedSeconds;
      segmentStartTimeRef.current = new Date();
      accumulatedSecondsRef.current = 0;
      
      // Keep running state if timer was running
      if (isRunning && nextSegment.type === 'work' && onWorkSegmentStart) {
        onWorkSegmentStart(nextIndex, nextSegment);
      }
    } else {
      setIsRunning(false);
      setIsFinished(true);
    }
  }, [currentIndex, segments, completedSegments, isFinished, isRunning, onWorkSegmentStart]);

  const goToSegment = useCallback(
    (index: number) => {
      if (index < 0 || index >= segments.length) return;

      setCurrentIndex(index);
      const plannedSeconds = segments[index].minutes * 60;
      setSecondsRemaining(plannedSeconds);
      setIsRunning(false);
      setIsFinished(false);
      segmentStartTimeRef.current = null;
      segmentPlannedSecondsRef.current = plannedSeconds;
      accumulatedSecondsRef.current = 0;
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    },
    [segments]
  );

  // Auto-start first segment if configured
  useEffect(() => {
    if (autoStartFirstWorkSegment && segments.length > 0 && segments[0].type === 'work') {
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return {
    state: {
      currentIndex,
      currentSegment,
      secondsRemaining,
      isRunning,
      isFinished,
      completedSegments,
    },
    controls: {
      start,
      pause,
      resume,
      reset,
      skipSegment,
      goToSegment,
    },
  };
}

