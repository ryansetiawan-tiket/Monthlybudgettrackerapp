/**
 * 🔧 Cross-Month Expense Key Migration Utility
 * 
 * This utility fixes expenses that were saved with wrong month keys
 * due to the bug where client used URL params instead of date field.
 * 
 * Example of the bug:
 * - User on November page adds expense with date 2025-10-25
 * - Before fix: Saved as expense:2025-11:xxx (WRONG!)
 * - After fix: Should be expense:2025-10:xxx (CORRECT!)
 * 
 * Usage:
 * 1. Open browser console
 * 2. Run: migrateExpenseKeys(2025, 11, true)  // Dry run
 * 3. Check results
 * 4. Run: migrateExpenseKeys(2025, 11, false) // Actual migration
 */

import { projectId, publicAnonKey } from './supabase/info';

function getBaseUrl(projectId: string): string {
  return `https://${projectId}.supabase.co/functions/v1/make-server-3adbeaf1`;
}

export interface MigrationResult {
  success: boolean;
  dryRun: boolean;
  summary: {
    scanned: number;
    needsMigration: number;
    migrated: number;
    skipped: number;
    errors: number;
  };
  details: Array<{
    id: string;
    status: string;
    oldKey?: string;
    newKey?: string;
    oldMonth?: string;
    actualMonth?: string;
    reason?: string;
  }>;
  message: string;
}

/**
 * Migrate expenses with wrong month keys
 * 
 * @param year - Year to scan (e.g., 2025)
 * @param month - Month to scan (e.g., 11 for November)
 * @param dryRun - If true, only show what would be migrated without actually doing it
 * @returns Migration result with statistics
 * 
 * @example
 * // Dry run to see what would be migrated
 * const result = await migrateExpenseKeys(2025, 11, true);
 * console.log(result.summary);
 * 
 * // Actual migration
 * const result = await migrateExpenseKeys(2025, 11, false);
 * console.log(`Migrated ${result.summary.migrated} expenses`);
 */
export async function migrateExpenseKeys(
  year: number,
  month: number,
  dryRun: boolean = true
): Promise<MigrationResult> {
  const baseUrl = getBaseUrl(projectId);
  
  console.log(`%c🔧 Starting Expense Key Migration`, 'font-weight: bold; font-size: 14px; color: #4CAF50');
  console.log(`Year: ${year}, Month: ${month}, Dry Run: ${dryRun}`);
  
  try {
    const response = await fetch(
      `${baseUrl}/migrate-expense-keys`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ year, month, dryRun }),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Migration failed');
    }
    
    const result: MigrationResult = await response.json();
    
    // Pretty print results
    console.log(`%c✅ Migration ${dryRun ? 'Dry Run' : 'Complete'}`, 'font-weight: bold; font-size: 14px; color: #4CAF50');
    console.log(`%cSummary:`, 'font-weight: bold; color: #2196F3');
    console.table(result.summary);
    
    if (result.details.length > 0) {
      console.log(`%cDetails (first 10):`, 'font-weight: bold; color: #2196F3');
      console.table(result.details.slice(0, 10));
      
      if (result.details.length > 10) {
        console.log(`... and ${result.details.length - 10} more`);
      }
    }
    
    if (dryRun && result.summary.needsMigration > 0) {
      console.log(`%c⚠️ To actually migrate, run:`, 'font-weight: bold; color: #FF9800');
      console.log(`%cmigrateExpenseKeys(${year}, ${month}, false)`, 'background: #f5f5f5; padding: 4px 8px; color: #333');
    }
    
    return result;
  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

/**
 * Migrate all months in a year
 * 
 * @param year - Year to scan
 * @param dryRun - If true, only dry run
 * 
 * @example
 * // Check all months in 2025
 * await migrateAllMonths(2025, true);
 */
export async function migrateAllMonths(
  year: number,
  dryRun: boolean = true
): Promise<MigrationResult[]> {
  console.log(`%c🔧 Starting Migration for All Months in ${year}`, 'font-weight: bold; font-size: 14px; color: #4CAF50');
  
  const results: MigrationResult[] = [];
  
  for (let month = 1; month <= 12; month++) {
    console.log(`\n--- Month ${month} ---`);
    const result = await migrateExpenseKeys(year, month, dryRun);
    results.push(result);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Total summary
  const totalSummary = results.reduce((acc, r) => ({
    scanned: acc.scanned + r.summary.scanned,
    needsMigration: acc.needsMigration + r.summary.needsMigration,
    migrated: acc.migrated + r.summary.migrated,
    skipped: acc.skipped + r.summary.skipped,
    errors: acc.errors + r.summary.errors,
  }), {
    scanned: 0,
    needsMigration: 0,
    migrated: 0,
    skipped: 0,
    errors: 0,
  });
  
  console.log(`\n%c📊 Total Summary for ${year}:`, 'font-weight: bold; font-size: 14px; color: #4CAF50');
  console.table(totalSummary);
  
  return results;
}

// Make it available in browser console
if (typeof window !== 'undefined') {
  (window as any).migrateExpenseKeys = migrateExpenseKeys;
  (window as any).migrateAllMonths = migrateAllMonths;
  
  console.log(`%c✅ Migration utilities loaded!`, 'font-weight: bold; color: #4CAF50');
  console.log(`Available functions:`);
  console.log(`  - migrateExpenseKeys(year, month, dryRun)`);
  console.log(`  - migrateAllMonths(year, dryRun)`);
  console.log(`\nExample:`);
  console.log(`  migrateExpenseKeys(2025, 11, true)  // Dry run`);
  console.log(`  migrateExpenseKeys(2025, 11, false) // Actual migration`);
}
