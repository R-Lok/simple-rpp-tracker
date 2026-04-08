/**
 * Browser notification helpers.
 *
 * NOTE: setTimeout-based notifications do NOT survive tab close.
 * This is communicated to the user inline. No service worker in v1.
 */

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function isNotificationSupported(): boolean {
  return 'Notification' in window
}

export function isNotificationGranted(): boolean {
  return 'Notification' in window && Notification.permission === 'granted'
}

/**
 * Schedule a browser notification after `delayMs` milliseconds.
 * Returns the timeout ID so the caller can cancel it.
 * Returns null if notifications are not available/permitted.
 */
export function scheduleNotification(
  title: string,
  body: string,
  delayMs: number
): ReturnType<typeof setTimeout> | null {
  if (!isNotificationGranted()) return null

  return setTimeout(() => {
    try {
      new Notification(title, { body, icon: '/vite.svg' })
    } catch {
      // Silently ignore — notification may have been revoked
    }
  }, delayMs)
}

export const ONE_HOUR_MS = 60 * 60 * 1000
