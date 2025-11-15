'use client';

/**
 * Browser notification helper for Focus Ramp.
 * Provides a thin wrapper over the browser Notification API.
 * 
 * Usage:
 * - Call canUseNotifications() to check if notifications are supported
 * - Call requestNotificationPermission() when user enables notifications
 * - Call showSessionNotification() to display notifications
 */

export function canUseNotifications(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!canUseNotifications()) return 'denied';

  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission;
  }

  return await Notification.requestPermission();
}

export interface SessionNotificationOptions {
  title: string;
  body?: string;
  // Future enhancement: Add icon support and user-adjustable message templates
}

export function showSessionNotification(options: SessionNotificationOptions): void {
  if (!canUseNotifications()) return;

  if (Notification.permission !== 'granted') return;

  new Notification(options.title, {
    body: options.body,
    // Use app icon if available in the future
    // icon: '/icon.svg',
    badge: '/icon.svg',
    requireInteraction: false, // Auto-dismiss after a few seconds
    silent: false, // Allow system notification sound
  });
}

