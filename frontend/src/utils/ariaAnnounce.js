/**
 * Accessible ARIA Live Announcer Utility
 * Dispatches custom events to update off-screen live regions for screen-reader users.
 */

export function announce(message, priority = 'polite') {
  if (typeof window === 'undefined') return;

  const event = new CustomEvent('facility:announce', {
    detail: { message, priority },
  });
  window.dispatchEvent(event);
}

export function announceAlert(message) {
  announce(message, 'assertive');
}
