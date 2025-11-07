/**
 * Currency formatting utilities for Indonesian Rupiah
 */

/**
 * Format number as Indonesian Rupiah currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format currency in compact notation (e.g., Rp 1.5jt, Rp 2.3M)
 */
export const formatCurrencyCompact = (amount: number): string => {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
  } else if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)}jt`;
  } else if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)}rb`;
  }
  return formatCurrency(amount);
};

/**
 * Format number as plain Rupiah string (without Rp prefix)
 */
export const formatNumber = (amount: number): string => {
  return amount.toLocaleString('id-ID');
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
};

/**
 * Format number for currency input field (with thousand separators)
 */
export const formatCurrencyInput = (value: number | string): string => {
  if (value === '' || value === null || value === undefined) return '';
  const num = typeof value === 'string' ? parseCurrencyInput(value) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('id-ID');
};

/**
 * Parse currency input field value to number (removes thousand separators)
 */
export const parseCurrencyInput = (value: string): number => {
  if (!value) return 0;
  // Remove all dots (thousand separators) and parse
  const cleaned = value.replace(/\./g, '');
  return parseFloat(cleaned) || 0;
};

/**
 * Format number as percentage
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * Convert USD to IDR using exchange rate
 */
export const convertUSDtoIDR = (usdAmount: number, exchangeRate: number): number => {
  return Math.round(usdAmount * exchangeRate);
};

/**
 * Calculate deduction from amount based on percentage
 */
export const calculateDeduction = (amount: number, percentage: number): number => {
  return Math.round(amount * (percentage / 100));
};
