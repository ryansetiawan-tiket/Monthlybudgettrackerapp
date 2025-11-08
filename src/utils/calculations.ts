/**
 * Budget calculation utilities
 */

export interface BudgetCalculation {
  totalIncome: number;
  totalExpenses: number;
  totalAdditionalIncome: number;
  deduction: number;
  remainingBudget: number;
  percentUsed: number;
}

export interface Expense {
  amount: number;
  fromIncome?: boolean;
}

export interface AdditionalIncome {
  amount: number;
  deduction?: number;
}

/**
 * Calculate comprehensive budget metrics
 */
export const calculateBudget = (
  initialBudget: number,
  expenses: Expense[],
  additionalIncomes: AdditionalIncome[],
  carryover: number = 0,
  excludedExpenseIds: Set<string> = new Set(),
  excludedIncomeIds: Set<string> = new Set(),
  isDeductionExcluded: boolean = false
): BudgetCalculation => {
  const totalExpenses = expenses
    .filter((e, i) => !excludedExpenseIds.has(i.toString()) && !e.fromIncome)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalAdditionalIncome = additionalIncomes
    .filter((_, i) => !excludedIncomeIds.has(i.toString()))
    .reduce((sum, inc) => sum + inc.amount, 0);

  const deduction = isDeductionExcluded
    ? 0
    : additionalIncomes
        .filter((_, i) => !excludedIncomeIds.has(i.toString()))
        .reduce((sum, inc) => sum + (inc.deduction || 0), 0);

  const totalIncome = initialBudget + carryover + totalAdditionalIncome;
  const remainingBudget = totalIncome - deduction - totalExpenses;
  const percentUsed = totalIncome > 0 ? ((totalExpenses + deduction) / totalIncome) * 100 : 0;

  return {
    totalIncome,
    totalExpenses,
    totalAdditionalIncome,
    deduction,
    remainingBudget,
    percentUsed,
  };
};

/**
 * Calculate pocket balance from transactions
 */
export const calculatePocketBalance = (
  transactions: Array<{
    type: 'initial' | 'income' | 'expense' | 'transfer_in' | 'transfer_out';
    amount: number;
  }>
): number => {
  return transactions.reduce((balance, transaction) => {
    switch (transaction.type) {
      case 'initial':
      case 'income':
      case 'transfer_in':
        return balance + transaction.amount;
      case 'expense':
      case 'transfer_out':
        return balance - transaction.amount;
      default:
        return balance;
    }
  }, 0);
};

/**
 * Calculate percentage of budget used
 */
export const calculateBudgetPercentage = (spent: number, total: number): number => {
  if (total === 0) return 0;
  return (spent / total) * 100;
};

/**
 * Determine budget health status
 */
export const getBudgetHealth = (percentUsed: number): 'healthy' | 'warning' | 'danger' => {
  if (percentUsed < 50) return 'healthy';
  if (percentUsed < 80) return 'warning';
  return 'danger';
};

/**
 * Calculate days remaining in month
 */
export const getDaysRemainingInMonth = (year: number, month: number): number => {
  const now = new Date();
  const lastDay = new Date(year, month, 0).getDate();
  const currentDay = now.getDate();
  
  if (now.getFullYear() !== year || now.getMonth() + 1 !== month) {
    return 0;
  }
  
  return lastDay - currentDay;
};

/**
 * Calculate daily budget based on remaining amount and days
 */
export const calculateDailyBudget = (remainingAmount: number, daysRemaining: number): number => {
  if (daysRemaining <= 0) return 0;
  return Math.floor(remainingAmount / daysRemaining);
};

/**
 * Evaluate math expression safely (for transfer dialog)
 */
export const evaluateMathExpression = (expression: string): number | null => {
  try {
    // Remove any non-numeric characters except operators and decimal point
    const sanitized = expression.replace(/[^0-9+\-*/().]/g, '');
    
    // Prevent dangerous expressions
    if (/[a-zA-Z]/.test(sanitized)) return null;
    
    // Use Function constructor as safe alternative to eval
    const result = new Function(`return ${sanitized}`)();
    
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return Math.round(result);
    }
    
    return null;
  } catch {
    return null;
  }
};

/**
 * Calculate savings rate
 */
export const calculateSavingsRate = (saved: number, income: number): number => {
  if (income === 0) return 0;
  return (saved / income) * 100;
};

/**
 * Project future balance based on average spending
 */
export const projectFutureBalance = (
  currentBalance: number,
  averageDailySpending: number,
  days: number
): number => {
  return currentBalance - (averageDailySpending * days);
};

/**
 * Get category emoji with fallback
 * Phase 8: Now supports custom categories via settings parameter
 */
export const getCategoryEmoji = (category?: string, settings?: any): string => {
  if (!category) return '📦';
  
  // Phase 8: Check custom categories first
  if (settings?.custom?.[category]) {
    return settings.custom[category].emoji;
  }
  
  // Phase 8: Check overrides for default categories
  if (settings?.overrides?.[category]?.emoji) {
    return settings.overrides[category].emoji;
  }
  
  // 🔥 BACKWARD COMPATIBILITY: Map old numeric index to category name
  const indexToCategoryMap: Record<string, string> = {
    '0': 'food',
    '1': 'transport',
    '2': 'savings',
    '3': 'bills',
    '4': 'health',
    '5': 'loan',
    '6': 'family',
    '7': 'entertainment',
    '8': 'installment',
    '9': 'shopping',
    '10': 'other'
  };
  
  const categoryName = indexToCategoryMap[category] || category.toLowerCase();
  
  const categoryMap: Record<string, string> = {
    food: '🍔',
    transport: '🚗',
    savings: '💰',
    bills: '📄',
    health: '🏥',
    loan: '💳',
    family: '👨‍👩‍👧‍👦',
    entertainment: '🎬',
    installment: '💸',
    shopping: '🛒',
    other: '📦'
  };
  
  return categoryMap[categoryName] || '📦';
};

/**
 * Get category label with fallback
 * Phase 8: Now supports custom categories via settings parameter
 */
export const getCategoryLabel = (category?: string, settings?: any): string => {
  if (!category) return 'Lainnya';
  
  // Phase 8: Check custom categories first
  if (settings?.custom?.[category]) {
    return settings.custom[category].label;
  }
  
  // Phase 8: Check overrides for default categories
  if (settings?.overrides?.[category]?.label) {
    return settings.overrides[category].label;
  }
  
  // 🔥 BACKWARD COMPATIBILITY: Map old numeric index to category name
  const indexToCategoryMap: Record<string, string> = {
    '0': 'food',
    '1': 'transport',
    '2': 'savings',
    '3': 'bills',
    '4': 'health',
    '5': 'loan',
    '6': 'family',
    '7': 'entertainment',
    '8': 'installment',
    '9': 'shopping',
    '10': 'other'
  };
  
  const categoryName = indexToCategoryMap[category] || category.toLowerCase();
  
  const labelMap: Record<string, string> = {
    food: 'Makanan',
    transport: 'Transportasi',
    savings: 'Tabungan',
    bills: 'Tagihan',
    health: 'Kesehatan',
    loan: 'Pinjaman',
    family: 'Keluarga',
    entertainment: 'Hiburan',
    installment: 'Cicilan',
    shopping: 'Belanja',
    other: 'Lainnya'
  };
  
  return labelMap[categoryName] || 'Lainnya';
};

/**
 * CATEGORY BREAKDOWN REFACTOR - Budget Status Helpers
 * Phase 8: Budget limit status calculations
 */

export type BudgetStatus = 'safe' | 'warning' | 'danger' | 'exceeded';

/**
 * Calculate budget status based on spending percentage
 * Matches the logic from BudgetLimitEditor Status Indicators
 */
export function getBudgetStatus(
  spent: number,
  limit: number,
  warningAt: number = 80
): BudgetStatus {
  if (limit === 0) return 'safe';
  
  const percentage = (spent / limit) * 100;
  
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 90) return 'danger';
  if (percentage >= warningAt) return 'warning';
  return 'safe';
}

/**
 * Get color for budget status
 * Colors match BudgetLimitEditor indicators
 */
export function getBudgetStatusColor(status: BudgetStatus): string {
  const colors: Record<BudgetStatus, string> = {
    safe: '#10B981',      // green-500
    warning: '#F59E0B',   // amber-500
    danger: '#F97316',    // orange-500
    exceeded: '#EF4444'   // red-500
  };
  return colors[status];
}

/**
 * Get label for budget status
 */
export function getBudgetStatusLabel(status: BudgetStatus, warningAt: number = 80): string {
  const labels: Record<BudgetStatus, string> = {
    safe: `Safe (below ${warningAt}%)`,
    warning: `Warning (${warningAt}% - 89%)`,
    danger: 'Danger (90% - 99%)',
    exceeded: 'Exceeded (100%+)'
  };
  return labels[status];
}

/**
 * Calculate budget percentage
 */
export function getBudgetPercentage(spent: number, limit: number): number {
  if (limit === 0) return 0;
  return (spent / limit) * 100;
}
