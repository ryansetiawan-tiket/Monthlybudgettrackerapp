/**
 * Date formatting utilities
 */

/**
 * Format date string to Indonesian locale (e.g., "5 November 2025")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Format date in short notation (e.g., "5 Nov")
 */
export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short'
  });
};

/**
 * Format date with time (e.g., "5 Nov, 14:30")
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get month name from month number (1-12)
 */
export const getMonthName = (month: number): string => {
  const date = new Date(2000, month - 1);
  return date.toLocaleDateString('id-ID', { month: 'long' });
};

/**
 * Create month key string from year and month (e.g., "2025-11")
 */
export const getMonthKey = (year: number, month: number): string => {
  return `${year}-${month.toString().padStart(2, '0')}`;
};

/**
 * Parse month key string to year and month
 */
export const parseMonthKey = (monthKey: string): { year: number; month: number } => {
  const [year, month] = monthKey.split('-').map(Number);
  return { year, month };
};

/**
 * Get relative time string (e.g., "2 hari lalu", "3 minggu lalu")
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`;
  return `${Math.floor(diffDays / 365)} tahun lalu`;
};

/**
 * Check if date is in the past
 */
export const isPastDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return date < now;
};

/**
 * Check if date is today
 */
export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};
