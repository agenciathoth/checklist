import {
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
} from "date-fns";

export function formatShortTimeDistance(
  from: Date,
  to: Date = new Date()
): string {
  const days = differenceInDays(to, from);
  if (days > 0) return `${days}d`;

  const hours = differenceInHours(to, from);
  if (hours > 0) return `${hours}h`;

  const minutes = differenceInMinutes(to, from);
  if (minutes > 0) return `${minutes}m`;

  const seconds = differenceInSeconds(to, from);
  return `${seconds}s`;
}
