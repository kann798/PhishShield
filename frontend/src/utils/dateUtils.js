/**
 * Date and relative time formatting utilities for PhishShield.
 * Ensures consistent UTC parsing and localized relative time calculations across all timezones.
 */

export function parseScanDate(timestamp) {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;

  const str = String(timestamp).trim();
  if (!str) return null;

  // If timestamp is already formatted with timezone indicator (e.g. ends with Z or has +XX:XX or -XX:XX)
  if (str.endsWith('Z') || str.includes('+') || /[-+]\d{2}:\d{2}$/.test(str)) {
    const d = new Date(str.replace(' ', 'T'));
    return isNaN(d.getTime()) ? null : d;
  }

  // SQLite stores UTC timestamp as "YYYY-MM-DD HH:MM:SS"
  // Without timezone specifier, JS parses as local time, creating a severe timezone skew!
  // Appending 'Z' explicitly instructs JS to parse it as UTC epoch time.
  const utcIso = str.replace(' ', 'T') + 'Z';
  const parsed = new Date(utcIso);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function formatRelativeTime(timestamp) {
  if (!timestamp) return 'No scans yet';
  const scanDate = parseScanDate(timestamp);
  if (!scanDate) return String(timestamp);

  const now = Date.now();
  const diffMs = now - scanDate.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  // If clock skew or future by a few seconds:
  if (diffSec < 45) return 'Just now';
  if (diffSec < 90) return '1 minute ago';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutes ago`;
  if (diffSec < 7200) return '1 hour ago';
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
  if (diffSec < 172800) return '1 day ago';
  return `${Math.floor(diffSec / 86400)} days ago`;
}

export function formatLocalDate(timestamp) {
  const date = parseScanDate(timestamp);
  if (!date) return timestamp || '';
  return date
    .toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    .replace(',', '');
}
