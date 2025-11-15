/**
 * 📦 ExpenseList Type Definitions
 * 
 * Extracted from ExpenseList.tsx for better modularity and reusability.
 * All types related to expenses, incomes, and pockets.
 */

/**
 * Single item within a template expense
 */
export interface ExpenseItem {
  name: string;
  amount: number;
  category?: string; // Per-item category support
}

/**
 * Main expense entry
 * Can be either:
 * - Template expense (with multiple items)
 * - Single expense (without items)
 */
export interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  items?: ExpenseItem[];
  color?: string;
  fromIncome?: boolean;
  currency?: string;
  originalAmount?: number;
  exchangeRate?: number;
  conversionType?: string;
  deduction?: number;
  pocketId?: string;
  groupId?: string;
  category?: string;
}

/**
 * Additional income entry (from income tab)
 */
export interface AdditionalIncome {
  id: string;
  name: string;
  amount: number;
  currency: string;
  exchangeRate: number | null;
  amountIDR: number;
  conversionType: string;
  date: string;
  deduction: number;
  pocketId?: string;
  createdAt?: string;
}

/**
 * Pocket balance calculation
 */
export interface PocketBalance {
  pocketId: string;
  originalAmount: number;
  transferIn: number;
  transferOut: number;
  expenses: number;
  availableBalance: number;
}

/**
 * Props for ExpenseList component
 */
export interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
  onBulkDeleteExpenses: (ids: string[]) => Promise<void>;
  onBulkUpdateCategory?: (ids: string[], category: string) => Promise<void>;
  onMoveToIncome?: (expense: Expense) => void;
  pockets?: Array<{id: string; name: string}>;
  balances?: PocketBalance[];
  categoryFilter?: Set<import('../types').ExpenseCategory>; // Phase 7
  onClearFilter?: () => void; // Phase 7
  onCategoryClick?: (category: import('../types').ExpenseCategory) => void; // 📜 Scroll to filtered results
  // Income-related props
  incomes?: AdditionalIncome[];
  onDeleteIncome?: (id: string) => void;
  onUpdateIncome?: (id: string, income: {
    name: string;
    amount: number;
    currency: string;
    exchangeRate: number | null;
    amountIDR: number;
    conversionType: string;
    date: string;
    deduction: number;
    pocketId: string;
  }) => void;
  globalDeduction?: number;
  onUpdateGlobalDeduction?: (deduction: number) => void;
  onOpenCategoryManager?: () => void; // Phase 8: Open CategoryManager
  onOpenAddTransaction?: () => void; // Desktop transaction entry
  onOpenTemplateManager?: () => void; // Desktop template manager
  // Budget-related props (for SimulationSandbox)
  initialBudget?: number;
  // 🏗️ ARCHITECTURE FIX: NEW - Carry-over breakdown props
  carryOverAssets?: number;
  carryOverLiabilities?: number;
  // Month/Year for CategoryBreakdown MoM calculation
  selectedMonth?: number;
  selectedYear?: number;
  // ✨ NEW: External control for opening Category Breakdown modal
  externalOpenCategoryBreakdown?: boolean;
  onCategoryBreakdownClose?: () => void;
  // 🔒 NEW: Modal state callback (for pull-to-refresh control)
  onModalStateChange?: (isOpen: boolean) => void;
}
