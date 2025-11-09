/**
 * Date Helper Functions - Timezone-Safe Operations
 * 
 * PROBLEM: <input type="date"> gives "YYYY-MM-DD" string
 *          new Date("2025-11-07") → parses as UTC midnight → timezone shift causes off-by-1-day bug
 * 
 * SOLUTION: Parse date parts manually to avoid timezone conversion
 */

/**
 * Parse date string from <input type="date"> to local date (no timezone conversion)
 * @param dateString - Format: "YYYY-MM-DD"
 * @returns Date string in "YYYY-MM-DD" format
 */
export function parseLocalDate(dateString: string): string {
  if (!dateString) return '';
  
  // Already in correct format, just validate and normalize
  const [year, month, day] = dateString.split('-').map(s => s.trim());
  
  if (!year || !month || !day) {
    console.warn('[parseLocalDate] Invalid date format:', dateString);
    return dateString;
  }
  
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Format date string/timestamp for <input type="date"> value
 * @param dateString - Format: "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss"
 * @returns Date string in "YYYY-MM-DD" format
 */
export function formatDateForInput(dateString: string | undefined | null): string {
  if (!dateString) {
    // Return today's date in YYYY-MM-DD format (local timezone)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Extract date part only (before 'T')
  return dateString.split('T')[0];
}

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 */
export function getTodayLocal(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Create ISO timestamp from date string (for database storage)
 * Preserves the date part, adds local time
 * @param dateString - Format: "YYYY-MM-DD"
 * @returns ISO string with local time
 */
export function createTimestampFromLocalDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toISOString();
}

/**
 * Compare two date strings (YYYY-MM-DD format)
 * @returns -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareDates(a: string, b: string): number {
  const dateA = a.split('T')[0];
  const dateB = b.split('T')[0];
  
  if (dateA < dateB) return -1;
  if (dateA > dateB) return 1;
  return 0;
}

/**
 * Format date safely without timezone conversion issues
 * Parses YYYY-MM-DD string and formats in local timezone
 * 
 * FIX: Prevents off-by-1-day bug caused by UTC midnight parsing
 * 
 * @param dateString - Format: "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss"
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 * 
 * @example
 * formatDateSafe("2025-11-08") → "8 Nov 2025" (NOT "9 Nov 2025")
 */
export function formatDateSafe(
  dateString: string,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
): string {
  if (!dateString) return '';
  
  // Extract date part only (before 'T' if timestamp)
  const datePart = dateString.split('T')[0];
  const [yearStr, monthStr, dayStr] = datePart.split('-');
  
  if (!yearStr || !monthStr || !dayStr) {
    console.warn('[formatDateSafe] Invalid date format:', dateString);
    return dateString;
  }
  
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // 0-indexed for Date constructor
  const day = parseInt(dayStr, 10);
  
  // Create date using local timezone (NOT UTC) - prevents timezone shift
  const date = new Date(year, month, day);
  
  return new Intl.DateTimeFormat('id-ID', options).format(date);
}
