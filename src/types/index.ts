/**
 * Shared type definitions for the budget tracking app
 */

export interface Budget {
  initialBudget: number;
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

// Category Filter State (Phase 7)
export interface CategoryFilterState {
  activeCategories: Set<ExpenseCategory>;
  source: 'pie-chart' | 'dropdown' | 'manual';
}

// Phase 8: Custom Categories & Customization
export interface CustomCategory {
  id: string;
  emoji: string;
  label: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryOverride {
  emoji?: string;
  label?: string;
  color?: string;
}

export interface CategoryBudget {
  limit: number;
  warningAt: number; // percentage (e.g., 80 for 80%)
  enabled: boolean;
  resetDay: number; // 1-31, day of month
}

export interface CategorySettings {
  version: number;
  custom: Record<string, CustomCategory>;
  overrides: Partial<Record<ExpenseCategory, CategoryOverride>>;
  budgets: Record<string, CategoryBudget>; // key can be ExpenseCategory or custom ID
  order: string[]; // category IDs in display order
  keywords: Record<string, string[]>; // for auto-categorization
  aliases: Record<string, string>; // alias -> category ID
}

export interface CategoryConfig {
  id: string;
  emoji: string;
  label: string;
  color: string;
  isCustom: boolean;
  budget?: CategoryBudget;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  category?: string; // Can be ExpenseCategory or custom category ID (Phase 8)
  categoryColor?: string;
  categoryIcon?: string;
  fromIncome?: boolean;
  deduction?: number;
  notes?: string;
  pocketId?: string;
  groupId?: string;
  emoji?: string; // Template emoji
  color?: string; // Template color
  items?: Array<{name: string; amount: number; category?: string}>; // Template items
  currency?: string; // "USD" or "IDR" for additional income
  originalAmount?: number; // Original USD amount for additional income
  exchangeRate?: number; // Exchange rate used for conversion
  conversionType?: string; // "auto" or "manual"
}

export interface AdditionalIncome {
  id: string;
  name: string; // Income source name (e.g., "Fiverr", "CGTrader")
  amountUSD: number;
  exchangeRate: number;
  amount: number;
  amountIDR: number; // Actual IDR amount after conversion
  deduction: number;
  date: string;
  pocketId?: string;
  currency?: string; // "USD" or "IDR"
  conversionType?: string; // "auto" or "manual"
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
  emoji?: string; // New emoji property (Phase 1.5)
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
