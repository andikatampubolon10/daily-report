import { type ClassValue, clsx } from "clsx";

/**
 * Merge Tailwind classes safely (uses clsx for conditional class merging).
 * NOTE: clsx is a lightweight alternative; twMerge not needed at this scale.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Format a Date object or ISO string to "DD MMMM YYYY" in Indonesian locale.
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Returns true if the blocker text indicates "no blocker".
 */
export function hasBlocker(blocker: string): boolean {
  const noBlockerPatterns = ["tidak ada", "none", "no blocker", "-"];
  return !noBlockerPatterns.some((pattern) =>
    blocker.toLowerCase().includes(pattern)
  );
}

/**
 * Truncate a string to a given length, appending "..." if truncated.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}
