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
 * ⚠️ DEPRECATED: Use getLocalDateFromISO() instead for timezone-safe conversion!
 * @param dateString - Format: "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss"
 * @returns Date string in "YYYY-MM-DD" format
 */
export function formatDateForInput(dateString: string | undefined | null): string {
  if (!dateString) {
    return getTodayLocal();
  }
  
  // ❌ TIMEZONE BUG: .split('T')[0] returns UTC date, not local date!
  // For "2025-10-27T23:21:21.000Z" in WIB (UTC+7):
  //   - .split('T')[0] → "2025-10-27" (UTC, WRONG!)
  //   - Should be → "2025-10-28" (WIB, CORRECT!)
  //
  // Use getLocalDateFromISO() instead!
  return dateString.split('T')[0];
}

/**
 * Extract local date from ISO timestamp (timezone-safe!)
 * Converts UTC timestamp to user's local date
 * 
 * @param isoTimestamp - Format: "YYYY-MM-DDTHH:mm:ss.sssZ"
 * @returns Local date string in "YYYY-MM-DD" format
 * 
 * @example
 * // User in WIB (UTC+7):
 * getLocalDateFromISO("2025-10-27T23:21:21.000Z")
 * // Returns: "2025-10-28" (next day in WIB!)
 * 
 * getLocalDateFromISO("2025-10-27T16:00:00.000Z")
 * // Returns: "2025-10-27" (same day in WIB)
 */
export function getLocalDateFromISO(isoTimestamp: string): string {
  if (!isoTimestamp) return getTodayLocal();
  
  // Convert to Date object (automatically uses local timezone)
  const localDate = new Date(isoTimestamp);
  
  // Extract local date components
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
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
