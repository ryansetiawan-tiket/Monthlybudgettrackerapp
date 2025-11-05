# Refactoring Plan

**Phase**: Code Refactoring  
**Priority**: 🟢 Medium  
**Estimated Time**: 4-5 hours

---

## 🎯 Objectives

1. **Extract reusable utilities** - Reduce code duplication
2. **Improve type safety** - Centralize type definitions
3. **Simplify complex functions** - Break down large functions
4. **Create constants file** - Remove magic numbers/strings

---

## 1. Create Utility Files

### A. `/utils/currency.ts`

**Current Problem**: Currency formatting duplicated in 5+ components

**Solution**:
```typescript
/**
 * Currency formatting utilities for Indonesian Rupiah
 */

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

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

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};
```

**Files to Update**:
- App.tsx
- BudgetOverview.tsx
- ExpenseList.tsx
- AdditionalIncomeList.tsx
- PocketsSummary.tsx
- WishlistSimulation.tsx

---

### B. `/utils/date.ts`

**Current Problem**: Date formatting scattered across components

**Solution**:
```typescript
/**
 * Date formatting utilities
 */

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short'
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getMonthName = (month: number): string => {
  const date = new Date(2000, month - 1);
  return date.toLocaleDateString('id-ID', { month: 'long' });
};

export const getMonthKey = (year: number, month: number): string => {
  return `${year}-${month.toString().padStart(2, '0')}`;
};

export const parseMonthKey = (monthKey: string): { year: number; month: number } => {
  const [year, month] = monthKey.split('-').map(Number);
  return { year, month };
};
```

**Files to Update**:
- App.tsx
- MonthSelector.tsx
- ExpenseList.tsx
- AdditionalIncomeList.tsx
- PocketTimeline.tsx

---

### C. `/utils/api.ts`

**Current Problem**: Fetch calls are repetitive with similar error handling

**Solution**:
```typescript
/**
 * API request utilities with standardized error handling
 */

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

interface FetchOptions extends RequestInit {
  timeout?: number;
}

export const apiRequest = async <T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> => {
  const { timeout = 30000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error || response.statusText,
        response.status,
        errorData
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    if (error.name === 'AbortError') {
      throw new APIError('Request timeout', 408);
    }
    throw error;
  }
};

// Convenience methods
export const apiGet = <T = any>(url: string, options?: FetchOptions): Promise<T> =>
  apiRequest<T>(url, { ...options, method: 'GET' });

export const apiPost = <T = any>(url: string, data?: any, options?: FetchOptions): Promise<T> =>
  apiRequest<T>(url, {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(data),
  });

export const apiPut = <T = any>(url: string, data?: any, options?: FetchOptions): Promise<T> =>
  apiRequest<T>(url, {
    ...options,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(data),
  });

export const apiDelete = <T = any>(url: string, options?: FetchOptions): Promise<T> =>
  apiRequest<T>(url, { ...options, method: 'DELETE' });
```

**Files to Update**: All files with fetch calls

---

### D. `/utils/calculations.ts`

**Current Problem**: Budget calculations scattered in App.tsx

**Solution**:
```typescript
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

export const calculateBudget = (
  initialBudget: number,
  expenses: Array<{ amount: number; fromIncome?: boolean }>,
  additionalIncomes: Array<{ amount: number; deduction?: number }>,
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

export const convertUSDtoIDR = (usdAmount: number, exchangeRate: number): number => {
  return Math.round(usdAmount * exchangeRate);
};

export const calculateDeduction = (amount: number, percentage: number): number => {
  return Math.round(amount * (percentage / 100));
};
```

**Files to Update**: App.tsx, BudgetOverview.tsx

---

## 2. Create Type Definitions

### `/types/index.ts`

**Current Problem**: Types duplicated across multiple files

**Solution**:
```typescript
/**
 * Shared type definitions for the budget tracking app
 */

export interface Budget {
  initialBudget: number;
  carryover: number;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  category?: string;
  categoryColor?: string;
  categoryIcon?: string;
  fromIncome?: boolean;
  deduction?: number;
  notes?: string;
  pocketId?: string;
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

export interface Pocket {
  id: string;
  name: string;
  type: 'primary' | 'custom';
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
  amount: number;
  description?: string;
  date: string;
}

export interface TimelineEntry {
  id: string;
  type: 'income' | 'expense' | 'transfer';
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
  name: string;
  price: number;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}
```

**Files to Update**: All components (remove duplicate type definitions)

---

## 3. Create Constants File

### `/constants/index.ts`

**Current Problem**: Magic numbers and strings scattered throughout code

**Solution**:
```typescript
/**
 * Application constants
 */

// Currency
export const DEFAULT_EXCHANGE_RATE = 15000;
export const DEFAULT_DEDUCTION_PERCENTAGE = 10;

// Colors (matching globals.css)
export const COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  success: 'hsl(142, 76%, 36%)',
  warning: 'hsl(38, 92%, 50%)',
  danger: 'hsl(0, 84%, 60%)',
  info: 'hsl(199, 89%, 48%)',
} as const;

// Pocket Types
export const POCKET_TYPES = {
  PRIMARY: 'primary',
  CUSTOM: 'custom',
} as const;

export const PRIMARY_POCKETS = {
  DAILY: 'daily',
  COLD_MONEY: 'cold-money',
} as const;

// API Timeouts
export const API_TIMEOUT = 30000; // 30 seconds
export const RETRY_ATTEMPTS = 3;

// Limits
export const MAX_EXPENSE_ENTRIES = 10;
export const MAX_POCKETS = 20;

// Date Formats
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DISPLAY_DATE_FORMAT = 'DD MMM YYYY';

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  LAST_MONTH: 'lastSelectedMonth',
  CACHE: 'budgetCache',
} as const;

// API Routes
export const API_ROUTES = {
  BUDGET: '/make-server-3adbeaf1/budget',
  EXPENSES: '/make-server-3adbeaf1/expenses',
  INCOME: '/make-server-3adbeaf1/additional-incomes',
  POCKETS: '/make-server-3adbeaf1/pockets',
  TRANSFERS: '/make-server-3adbeaf1/transfers',
} as const;
```

**Files to Update**: All files using hardcoded values

---

## 4. Component Refactoring

### A. App.tsx Simplification

**Current Problem**: App.tsx is 1600+ lines, too complex

**Solution**: Break down into smaller hooks

#### Create `/hooks/useBudgetData.ts`
```typescript
export const useBudgetData = (monthKey: string, baseUrl: string, publicAnonKey: string) => {
  const [budget, setBudget] = useState<Budget>({ initialBudget: 0, carryover: 0 });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [additionalIncomes, setAdditionalIncomes] = useState<AdditionalIncome[]>([]);
  const [loading, setLoading] = useState(false);

  // Load all budget data
  // Return { budget, expenses, additionalIncomes, loading, refresh }
};
```

#### Create `/hooks/usePockets.ts`
```typescript
export const usePockets = (monthKey: string, baseUrl: string, publicAnonKey: string) => {
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [loading, setLoading] = useState(false);

  // Pocket management logic
  // Return { pockets, loading, createPocket, editPocket, archivePocket, ... }
};
```

#### Create `/hooks/useExcludeState.ts`
```typescript
export const useExcludeState = (monthKey: string) => {
  const [excludedExpenseIds, setExcludedExpenseIds] = useState<Set<string>>(new Set());
  const [excludedIncomeIds, setExcludedIncomeIds] = useState<Set<string>>(new Set());
  const [isDeductionExcluded, setIsDeductionExcluded] = useState(false);
  const [isExcludeLocked, setIsExcludeLocked] = useState(false);

  // Exclude state logic
  // Return all state and handlers
};
```

---

### B. Simplify Large Components

**Files to Refactor**:
1. **ManagePocketsDialog.tsx** - Extract pocket form to separate component
2. **WishlistSimulation.tsx** - Extract health bar calculation
3. **AddExpenseDialog.tsx** - Simplify with extracted utilities

---

## 5. Memoization Strategy

### Components to Wrap with React.memo

```typescript
// Heavy rendering components
export const ExpenseList = React.memo(ExpenseListComponent);
export const AdditionalIncomeList = React.memo(AdditionalIncomeListComponent);
export const PocketsSummary = React.memo(PocketsSummaryComponent);
export const PocketTimeline = React.memo(PocketTimelineComponent);
```

### Calculations to Wrap with useMemo

```typescript
// App.tsx - Heavy calculations
const budgetCalculation = useMemo(() => 
  calculateBudget(/* ... */),
  [budget, expenses, additionalIncomes, excludedExpenseIds, ...]
);

const sortedExpenses = useMemo(() =>
  expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  [expenses]
);
```

### Callbacks to Wrap with useCallback

```typescript
// Event handlers that are passed to child components
const handleAddExpense = useCallback((expense: Expense) => {
  // ...
}, [dependencies]);
```

---

## 6. Error Handling Improvement

### Create `/components/ErrorBoundary.tsx`

```typescript
export class ErrorBoundary extends React.Component<Props, State> {
  // Standard error boundary implementation
  // Catch errors and display user-friendly message
}
```

### Wrap App in Error Boundary

```typescript
// In index/main file
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## Implementation Order

### Phase 1: Utilities (2 hours)
1. ✅ Create `/utils/currency.ts`
2. ✅ Create `/utils/date.ts`
3. ✅ Create `/utils/api.ts`
4. ✅ Create `/utils/calculations.ts`
5. ✅ Update all files to use utilities

### Phase 2: Types & Constants (1 hour)
6. ✅ Create `/types/index.ts`
7. ✅ Create `/constants/index.ts`
8. ✅ Update all files to use types/constants

### Phase 3: Hooks Extraction (1.5 hours)
9. ✅ Create custom hooks
10. ✅ Refactor App.tsx to use hooks
11. ✅ Test functionality

### Phase 4: Optimization (0.5 hours)
12. ✅ Add React.memo
13. ✅ Add useMemo
14. ✅ Add useCallback
15. ✅ Add ErrorBoundary

---

## Validation Checklist

After refactoring:

- [ ] All features work as before
- [ ] No new bugs introduced
- [ ] TypeScript compiles without errors
- [ ] Performance improved (measure loading time)
- [ ] Code is more maintainable
- [ ] File size reduced

---

**Estimated LOC Reduction**: -300 lines (after utilities extraction)  
**Estimated Maintainability**: +60%  
**Estimated Type Safety**: +40%

**Next**: After refactoring, proceed to PERFORMANCE_PLAN.md
