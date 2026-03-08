import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

// Format timestamp to "2 hours ago", "Today 5:30 PM", etc.
export function formatMessageTime(dateString: string): string {
  const date = parseISO(dateString);
  
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  
  if (isYesterday(date)) {
    return `Yesterday ${format(date, 'h:mm a')}`;
  }
  
  // Older than yesterday
  return format(date, 'MMM d, h:mm a');
}

// Format relative time: "2 hours ago", "5 minutes ago"
export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
}

// Format date: "Jan 15, 2026"
export function formatDate(dateString: string): string {
  return format(parseISO(dateString), 'MMM d, yyyy');
}

// Format date with time: "Jan 15, 2026 at 5:30 PM"
export function formatDateTime(dateString: string): string {
  return format(parseISO(dateString), 'MMM d, yyyy \'at\' h:mm a');
}

// Calculate trip duration
export function calculateDuration(startDate: string, endDate: string): string {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day';
  return `${diffDays} days`;
}
