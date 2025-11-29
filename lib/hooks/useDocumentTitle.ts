'use client';

import { useEffect } from 'react';
import { APP_NAME } from '@/lib/config/appConfig';

interface UseDocumentTitleOptions {
  isRunning: boolean;
  secondsRemaining: number;
  segmentType: 'work' | 'break';
  defaultTitle?: string;
}

export function useDocumentTitle({
  isRunning,
  secondsRemaining,
  segmentType,
  defaultTitle = APP_NAME,
}: UseDocumentTitleOptions) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (isRunning && secondsRemaining > 0) {
      const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      };

      const timeDisplay = formatTime(secondsRemaining);
      const sessionType = segmentType === 'work' ? '🔥' : '☕';
      document.title = `${timeDisplay} ${sessionType} ${APP_NAME}`;
    } else {
      document.title = defaultTitle;
    }

    // Cleanup: restore default title when component unmounts
    return () => {
      document.title = defaultTitle;
    };
  }, [isRunning, secondsRemaining, segmentType, defaultTitle]);
}
