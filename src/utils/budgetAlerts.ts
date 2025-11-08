/**
 * Budget Alert System - Toast Notifications
 * Phase 9 - Priority 2: Real-time budget monitoring alerts
 * 
 * Shows toast alerts when budget status changes to higher level:
 * - Safe (0-79%) → Warning (80-89%) → Danger (90-99%) → Exceeded (100%+)
 * 
 * Only shows alert when status INCREASES to avoid spam.
 */

import { toast } from 'sonner@2.0.3';
import { getBudgetStatus, getBudgetPercentage } from './calculations';
import { formatCurrency } from './currency';
import type { BudgetStatus } from './calculations';

export interface BudgetAlertParams {
  categoryId: string;
  categoryLabel: string;
  oldTotal: number;
  newTotal: number;
  limit: number;
  warningAt?: number;
}

/**
 * Show budget alert toast if status changed to higher level
 * 
 * @example
 * showBudgetAlertIfNeeded({
 *   categoryId: 'game',
 *   categoryLabel: 'Game',
 *   oldTotal: 350000,      // Before this expense (70% - Safe)
 *   newTotal: 450000,      // After this expense (90% - Danger)
 *   limit: 500000,
 *   warningAt: 80
 * });
 * // Shows danger toast: "😱 Awas! Budget 'Game' lo udah mepet banget (90%)!"
 */
export function showBudgetAlertIfNeeded(params: BudgetAlertParams): void {
  const { categoryLabel, oldTotal, newTotal, limit, warningAt = 80 } = params;
  
  // Get old and new status
  const oldStatus = getBudgetStatus(oldTotal, limit, warningAt);
  const newStatus = getBudgetStatus(newTotal, limit, warningAt);
  
  // Only show if status increased
  if (!shouldShowAlert(oldStatus, newStatus)) {
    return;
  }
  
  // Calculate percentage
  const percentage = Math.round(getBudgetPercentage(newTotal, limit));
  
  // Show appropriate toast
  switch (newStatus) {
    case 'warning':
      showWarningToast(categoryLabel, percentage, newTotal, limit);
      break;
    case 'danger':
      showDangerToast(categoryLabel, percentage, newTotal, limit);
      break;
    case 'exceeded':
      showExceededToast(categoryLabel, percentage, newTotal, limit);
      break;
  }
}

/**
 * Check if we should show alert based on status change
 * Only show when status increases (e.g., Safe → Warning, Warning → Danger)
 */
function shouldShowAlert(oldStatus: BudgetStatus, newStatus: BudgetStatus): boolean {
  const statusLevels: Record<BudgetStatus, number> = {
    safe: 0,
    warning: 1,
    danger: 2,
    exceeded: 3
  };
  
  return statusLevels[newStatus] > statusLevels[oldStatus];
}

/**
 * Show warning toast (80-89%)
 * Color: Amber/Yellow (#F59E0B)
 * Duration: 5 seconds
 */
function showWarningToast(label: string, percentage: number, total: number, limit: number): void {
  const messages = [
    `Hati-hati, Bos! Budget '${label}' udah masuk zona kuning (${percentage}%)!`,
    `Woy! Budget '${label}' lo udah ${percentage}% nih!`,
    `Pelan-pelan, Bro! Budget '${label}' hampir habis (${percentage}%)!`
  ];
  
  const message = messages[Math.floor(Math.random() * messages.length)];
  
  toast.warning(`😅 ${message}`, {
    description: `Total: ${formatCurrency(total)} dari ${formatCurrency(limit)}`,
    duration: 5000,
  });
}

/**
 * Show danger toast (90-99%)
 * Color: Orange (#F97316)
 * Duration: 6 seconds
 */
function showDangerToast(label: string, percentage: number, total: number, limit: number): void {
  const messages = [
    `Awas! Budget '${label}' lo udah mepet banget (${percentage}%)!`,
    `Gawat! Budget '${label}' tinggal dikit lagi jebol (${percentage}%)!`,
    `Bahaya! Budget '${label}' udah ${percentage}%!`
  ];
  
  const message = messages[Math.floor(Math.random() * messages.length)];
  
  toast.error(`😱 ${message}`, {
    description: `Total: ${formatCurrency(total)} dari ${formatCurrency(limit)}`,
    duration: 6000,
  });
}

/**
 * Show exceeded toast (100%+)
 * Color: Red (#EF4444)
 * Duration: 8 seconds
 */
function showExceededToast(label: string, percentage: number, total: number, limit: number): void {
  const messages = [
    `WADUH! Budget '${label}' JEBOL! Udah ${percentage}% nih!`,
    `ANJAY! Budget '${label}' udah lewat limit! (${percentage}%)`,
    `KEBANGETEN! Budget '${label}' jebol parah! (${percentage}%)`
  ];
  
  const message = messages[Math.floor(Math.random() * messages.length)];
  
  toast.error(`🚨 ${message}`, {
    description: `Total: ${formatCurrency(total)} dari ${formatCurrency(limit)}`,
    duration: 8000,
  });
}

/**
 * Calculate total expenses for a category in current month
 * 
 * @param categoryId - Category identifier (e.g., 'game', 'food', custom ID)
 * @param expenses - Array of expenses to sum up
 * @returns Total amount for the category
 * 
 * @example
 * const total = calculateCategoryTotal('game', expenses);
 * // Returns: 450000 (sum of all game expenses)
 */
export function calculateCategoryTotal(
  categoryId: string,
  expenses: Array<{ category?: string; amount: number }>
): number {
  return expenses
    .filter(exp => exp.category === categoryId && exp.amount > 0)
    .reduce((sum, exp) => sum + exp.amount, 0);
}
