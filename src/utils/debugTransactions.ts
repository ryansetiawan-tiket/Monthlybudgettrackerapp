import { projectId, publicAnonKey } from './supabase/info';

/**
 * Debug function to check if there are future transactions
 * This helps us understand why realtime === projected
 */
export async function debugTransactions(year: number, month: number) {
  try {
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-3adbeaf1/debug-transactions/${year}/${month}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('[DEBUG] Failed to fetch debug data:', response.statusText);
      return null;
    }
    
    const result = await response.json();
    
    console.log('\n🔍 ==================== DEBUG TRANSACTIONS ====================');
    console.log(`📅 Month: ${monthKey}`);
    console.log(`📆 Today: ${result.data.today}`);
    console.log(`\n📊 Summary:`);
    console.log(`  - Total Expenses: ${result.data.summary.totalExpenses}`);
    console.log(`  - Total Income: ${result.data.summary.totalIncome}`);
    console.log(`  - Total Transfers: ${result.data.summary.totalTransfers}`);
    
    console.log(`\n💰 Expenses by Pocket:`);
    for (const [pocketId, data] of Object.entries<any>(result.data.expensesByPocket)) {
      console.log(`\n  📦 ${pocketId}:`);
      console.log(`    Total: ${data.count} transactions, Rp ${new Intl.NumberFormat('id-ID').format(data.total)}`);
      console.log(`    ✅ Past (≤ today): ${data.past.count} transactions, Rp ${new Intl.NumberFormat('id-ID').format(data.past.total)}`);
      console.log(`    🔮 Future (> today): ${data.future.count} transactions, Rp ${new Intl.NumberFormat('id-ID').format(data.future.total)}`);
      
      if (data.future.count > 0) {
        console.log(`    📅 Future dates:`, data.future.dates);
      }
      
      if (data.future.count === 0) {
        console.log(`    ⚠️  NO FUTURE TRANSACTIONS - This is why realtime === projected!`);
      }
    }
    
    console.log(`\n💡 ${result.data.debugNote}`);
    console.log('🔍 ============================================================\n');
    
    return result.data;
  } catch (error: any) {
    console.error('[DEBUG] Error fetching debug data:', error.message);
    return null;
  }
}
