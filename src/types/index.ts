/**
 * Shared type definitions for the budget tracking app
 */

export interface Budget {
  initialBudget: number;
  carryover: number;
}

// Expense Categories
export type ExpenseCategory = 
  | 'food'
  | 'transport'
  | 'savings'
  | 'bills'
  | 'health'
  | 'loan'
  | 'family'
  | 'entertainment'
  | 'installment'
  | 'shopping'
  | 'other';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  category?: ExpenseCategory; // Updated to use ExpenseCategory type
  categoryColor?: string;
  categoryIcon?: string;
  fromIncome?: boolean;
  deduction?: number;
  notes?: string;
  pocketId?: string;
  groupId?: string;
}

export interface AdditionalIncome {
  id: string;
  name: string;
  amountUSD: number;
  exchangeRate: number;
  amount: number;
  deduction: number;
  date: string;
  pocketId?: string;
}

export interface Template {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export type PocketType = 'primary' | 'custom';

export interface Pocket {
  id: string;
  name: string;
  type: PocketType;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  enableWishlist?: boolean;
}

export interface PocketBalance {
  pocketId: string;
  originalAmount: number;
  transferIn: number;
  transferOut: number;
  expenses: number;
  availableBalance: number;
}

export interface Transfer {
  id: string;
  fromPocketId: string;
  toPocketId: string;
  fromPocketName?: string; // Preserved for history (backward compatibility)
  toPocketName?: string;   // Preserved for history (backward compatibility)
  amount: number;
  description?: string;
  date: string;
  note?: string;
}

export type TimelineEntryType = 'income' | 'expense' | 'transfer' | 'initial';

export interface TimelineEntry {
  id: string;
  type: TimelineEntryType;
  date: string;
  description: string;
  amount: number;
  balanceAfter: number;
  icon: string;
  color: string;
  metadata?: any;
}

export interface WishlistItem {
  id: string;
  pocketId: string;
  name: string;
  amount: number;
  priority: 1 | 2 | 3;
  description?: string;
  url?: string;
  targetDate?: string;
  status: 'planned' | 'saving' | 'ready' | 'purchased';
  createdAt: string;
  notes?: string;
}

export interface SimulationScenario {
  itemId: string;
  itemName: string;
  amount: number;
  currentBalance: number;
  balanceAfter: number;
  status: 'affordable' | 'low-balance' | 'insufficient';
  blockedItems: string[];
  warning?: string;
}

export interface SimulationResult {
  pocketId: string;
  pocketName: string;
  currentBalance: number;
  wishlist: {
    total: number;
    count: number;
    byPriority: {
      high: { count: number; total: number };
      medium: { count: number; total: number };
      low: { count: number; total: number };
    };
  };
  affordableNow: string[];
  affordableSoon: Array<{
    itemId: string;
    amountNeeded: number;
    estimatedWeeks: number;
  }>;
  notAffordable: string[];
  scenarios: SimulationScenario[];
  recommendations: Array<{
    type: 'warning' | 'info' | 'suggestion';
    message: string;
    actionable: boolean;
    action?: {
      type: string;
      params?: any;
    };
  }>;
}

export interface SavingsPlan {
  itemId: string;
  itemName: string;
  targetAmount: number;
  currentAmount: number;
  amountNeeded: number;
  targetDate?: string;
  estimatedDate: string;
  weeklyTransfer: number;
  monthlyTransfer: number;
  weeksNeeded: number;
}

// Form data types
export interface BudgetFormData {
  initialBudget: number;
  carryover: number;
}

export interface ExpenseFormData {
  name: string;
  amount: number;
  date: string;
  category?: string;
  notes?: string;
  pocketId?: string;
}

export interface IncomeFormData {
  name: string;
  amountUSD: number;
  exchangeRate: number;
  deduction: number;
  date: string;
  pocketId?: string;
}

export interface TransferFormData {
  fromPocketId: string;
  toPocketId: string;
  amount: number;
  description?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PocketsResponse {
  pockets: Pocket[];
}

export interface BalanceResponse {
  balance: PocketBalance;
}
