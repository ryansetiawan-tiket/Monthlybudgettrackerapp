/**
 * Currency Formatting Utilities
 * 
 * Centralized formatting functions for IDR and USD currencies
 * Used across ExpenseList, ExpenseListItem, IncomeListItem components
 */

/**
 * Format amount to IDR currency
 * @param amount - Amount in IDR
 * @returns Formatted string (e.g., "Rp 100.000")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format amount to USD currency
 * @param amount - Amount in USD
 * @returns Formatted string (e.g., "$100.00")
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
