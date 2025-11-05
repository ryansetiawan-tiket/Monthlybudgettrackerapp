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
