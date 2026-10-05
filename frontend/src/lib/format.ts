import {
  format,
  formatDistanceToNowStrict,
  isToday,
  isYesterday,
} from "date-fns";

/** Up-to-two-letter initials for an avatar fallback. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Short clock time, e.g. "14:05". */
export function formatTime(value: string | number | Date): string {
  try {
    return format(new Date(value), "HH:mm");
  } catch {
    return "";
  }
}

/** Chat-list style timestamp: time today, "Yesterday", else a date. */
export function formatListTimestamp(value: string | number | Date): string {
  try {
    const date = new Date(value);
    if (isToday(date)) return format(date, "HH:mm");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "dd MMM");
  } catch {
    return "";
  }
}

/** Relative time, e.g. "3m ago". */
export function formatRelative(value: string | number | Date): string {
  try {
    return `${formatDistanceToNowStrict(new Date(value))} ago`;
  } catch {
    return "";
  }
}

/** Human call duration, e.g. "2m 05s". */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return "0s";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${String(secs).padStart(2, "0")}s` : `${secs}s`;
}
