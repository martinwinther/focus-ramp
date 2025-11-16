'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/utils/logger';

export function Monitoring() {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!dsn) {
      logger.debug('Sentry DSN not provided; monitoring disabled.');
      return;
    }
    // Dynamic import to avoid SSR issues and optional dependency
    import('@sentry/nextjs')
      .then((Sentry) => {
        if (!Sentry || !Sentry.init) return;
        Sentry.init({
          dsn,
          tracesSampleRate: 0.1
        });
        logger.info('Sentry initialized');
      })
      .catch((e) => {
        logger.warn('Failed to initialize Sentry:', e);
      });
  }, []);

  return null;
}


