/**
 * Formatting utilities for Digital Safety Escape Room
 */

/**
 * Format score with leading zeros (e.g. 1450 -> "01450")
 * @param {number} score
 * @param {number} length
 * @returns {string}
 */
export function formatScore(score, length = 5) {
  const safeScore = Math.max(0, Number(score) || 0);
  return String(safeScore).padStart(length, '0');
}

/**
 * Format elapsed seconds into MM:SS format
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatDuration(totalSeconds) {
  const safeSec = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mins = Math.floor(safeSec / 60);
  const secs = safeSec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Format timestamp into terminal readable ISO or short date
 * @param {string|Date} dateVal
 * @returns {string}
 */
export function formatTerminalDate(dateVal) {
  if (!dateVal) return 'N/A';
  try {
    const d = new Date(dateVal);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'INVALID_DATE';
  }
}
