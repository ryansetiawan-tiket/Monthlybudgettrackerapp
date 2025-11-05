# Data Structure - Pockets System

## Overview

Dokumen ini mendefinisikan struktur data untuk Pockets System, termasuk TypeScript interfaces, database schema, dan API contracts.

## TypeScript Types

### Core Types

```typescript
// ============================================
// POCKET TYPES
// ============================================

/**
 * Pocket Type
 * - 'primary': Kantong utama (Sehari-hari, Uang Dingin)
 * - 'custom': User-created pockets (Phase 2)
 */
type PocketType = 'primary' | 'custom';

/**
 * Pocket ID Constants
 * For Phase 1, we use fixed IDs for the two primary pockets
 */
const POCKET_IDS = {
  DAILY: 'pocket_daily',
  COLD_MONEY: 'pocket_cold_money'
} as const;

/**
 * Pocket Interface
 */
interface Pocket {
  id: string;
  name: string;
  type: PocketType;
  description?: string;
  icon?: string; // lucide-react icon name
  color?: string; // Tailwind color class
  order: number; // Display order
  createdAt: string; // ISO date
  
  // Phase 2 fields
  targetAmount?: number;
  targetDate?: string; // ISO date
  autoTransfer?: {
    enabled: boolean;
    amount: number;
    frequency: 'daily' | 'weekly' | 'monthly';
    fromPocketId: string;
  };
}

/**
 * Default Pockets for Phase 1
 */
const DEFAULT_POCKETS: Pocket[] = [
  {
    id: POCKET_IDS.DAILY,
    name: 'Sehari-hari',
    type: 'primary',
    description: 'Budget untuk kebutuhan sehari-hari',
    icon: 'Wallet',
    color: 'blue',
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: POCKET_IDS.COLD_MONEY,
    name: 'Uang Dingin',
    type: 'primary',
    description: 'Dana untuk hobi dan hiburan',
    icon: 'Sparkles',
    color: 'purple',
    order: 2,
    createdAt: new Date().toISOString()
  }
];

// ============================================
// TRANSACTION TYPES
// ============================================

/**
 * Transaction Type
 */
type TransactionType = 'income' | 'expense' | 'transfer';

/**
 * Base Transaction Interface
 */
interface BaseTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO date
  note?: string;
  createdAt: string; // ISO date
}

/**
 * Income Transaction
 * Links to existing budget/additional income entries
 */
interface IncomeTransaction extends BaseTransaction {
  type: 'income';
  pocketId: string;
  sourceType: 'budget' | 'additional_income';
  sourceId?: string; // Reference to budget or additional income entry
}

/**
 * Expense Transaction
 * Links to existing expense entries
 */
interface ExpenseTransaction extends BaseTransaction {
  type: 'expense';
  pocketId: string;
  expenseId: string; // Reference to existing expense
}

/**
 * Transfer Transaction
 */
interface TransferTransaction extends BaseTransaction {
  type: 'transfer';
  fromPocketId: string;
  toPocketId: string;
}

/**
 * Union type for all transactions
 */
type Transaction = IncomeTransaction | ExpenseTransaction | TransferTransaction;

// ============================================
// BALANCE & SUMMARY TYPES
// ============================================

/**
 * Pocket Balance Breakdown
 */
interface PocketBalance {
  pocketId: string;
  
  // Core amounts
  originalAmount: number; // Saldo asli dari income sources
  transferIn: number; // Total transfer masuk
  transferOut: number; // Total transfer keluar
  expenses: number; // Total pengeluaran
  
  // Computed
  availableBalance: number; // originalAmount + transferIn - transferOut - expenses
  
  // Metadata
  lastUpdated: string; // ISO date
}

/**
 * Pocket Summary (for display)
 */
interface PocketSummary {
  pocket: Pocket;
  balance: PocketBalance;
  
  // Counts
  incomeCount: number;
  expenseCount: number;
  transferInCount: number;
  transferOutCount: number;
}

/**
 * Timeline Entry (unified view)
 */
interface TimelineEntry {
  id: string;
  type: TransactionType;
  date: string; // ISO date
  description: string;
  amount: number; // Positive for income/transfer-in, negative for expense/transfer-out
  balanceAfter: number;
  
  // Related data
  transaction: Transaction;
  
  // Visual
  icon: string; // lucide-react icon name
  color: string; // Tailwind color class
}

// ============================================
// MODIFIED EXISTING TYPES
// ============================================

/**
 * Extended Expense Interface
 * Add pocketId field
 */
interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  createdAt?: string;
  isExcluded?: boolean;
  
  // NEW FIELD
  pocketId: string; // Which pocket this expense is from
}

/**
 * Additional Income (no changes needed)
 * Will automatically link to POCKET_IDS.COLD_MONEY
 */
interface AdditionalIncome {
  id: string;
  name: string;
  amount: number;
  amountIDR: number;
  currency: 'IDR' | 'USD';
  exchangeRate?: number;
  conversionType?: 'auto' | 'manual';
  deduction: number;
  date: string;
  createdAt?: string;
}
```

## Database Schema (Supabase KV Store)

### Current Structure
```typescript
// Existing keys
`budget:${monthKey}` → BudgetData
`expenses:${monthKey}` → Expense[]
`additional_income:${monthKey}` → AdditionalIncome[]
`additional_income_history:${monthKey}` → string[]
`excluded_income_ids:${monthKey}` → string[]
`excluded_expense_ids:${monthKey}` → string[]
```

### New Keys for Pockets System

```typescript
// ============================================
// POCKETS
// ============================================

/**
 * Pockets Configuration (per month)
 * Key: `pockets:${monthKey}`
 * Value: Pocket[]
 * 
 * For Phase 1: This will contain the 2 default pockets
 * For Phase 2: This will contain default + custom pockets
 */
`pockets:${monthKey}` → Pocket[]

// Example:
{
  "pockets:2025-11": [
    {
      id: "pocket_daily",
      name: "Sehari-hari",
      type: "primary",
      // ... other fields
    },
    {
      id: "pocket_cold_money",
      name: "Uang Dingin",
      type: "primary",
      // ... other fields
    }
  ]
}

// ============================================
// TRANSACTIONS
// ============================================

/**
 * Transfers (per month)
 * Key: `transfers:${monthKey}`
 * Value: TransferTransaction[]
 */
`transfers:${monthKey}` → TransferTransaction[]

// Example:
{
  "transfers:2025-11": [
    {
      id: "transfer_001",
      type: "transfer",
      amount: 500000,
      fromPocketId: "pocket_cold_money",
      toPocketId: "pocket_daily",
      date: "2025-11-03T10:00:00Z",
      note: "Untuk bayar tagihan listrik",
      createdAt: "2025-11-03T10:00:00Z"
    }
  ]
}

// ============================================
// BALANCE CACHE (Optional - for performance)
// ============================================

/**
 * Cached balances per pocket
 * Key: `pocket_balance:${monthKey}:${pocketId}`
 * Value: PocketBalance
 * 
 * This is optional - can be computed on-the-fly
 * But caching improves performance for complex calculations
 */
`pocket_balance:${monthKey}:${pocketId}` → PocketBalance

// Example:
{
  "pocket_balance:2025-11:pocket_daily": {
    pocketId: "pocket_daily",
    originalAmount: 8000000,
    transferIn: 500000,
    transferOut: 0,
    expenses: 1200000,
    availableBalance: 7300000,
    lastUpdated: "2025-11-05T12:00:00Z"
  }
}
```

## Data Migration Strategy

### Phase 1 Migration (Existing → Pockets)

```typescript
/**
 * Migration Function
 * Migrate existing data to pockets structure
 */
async function migrateToPhase1(monthKey: string) {
  // 1. Create default pockets
  await kv.set(`pockets:${monthKey}`, DEFAULT_POCKETS);
  
  // 2. Update all existing expenses
  const expenses = await kv.get<Expense[]>(`expenses:${monthKey}`) || [];
  const updatedExpenses = expenses.map(expense => ({
    ...expense,
    pocketId: expense.pocketId || POCKET_IDS.DAILY // Default to daily
  }));
  await kv.set(`expenses:${monthKey}`, updatedExpenses);
  
  // 3. Initialize empty transfers
  await kv.set(`transfers:${monthKey}`, []);
  
  // 4. No changes needed for:
  // - Budget (automatically linked to pocket_daily)
  // - Additional Income (automatically linked to pocket_cold_money)
  // - Excluded IDs (still relevant)
}
```

### Backward Compatibility

```typescript
/**
 * Ensure backward compatibility
 * If pockets don't exist, create them on-the-fly
 */
async function getPockets(monthKey: string): Promise<Pocket[]> {
  let pockets = await kv.get<Pocket[]>(`pockets:${monthKey}`);
  
  if (!pockets || pockets.length === 0) {
    // Auto-migrate
    pockets = DEFAULT_POCKETS;
    await kv.set(`pockets:${monthKey}`, pockets);
  }
  
  return pockets;
}
```

## API Contracts

### New Endpoints

```typescript
// ============================================
// GET POCKETS
// ============================================

/**
 * GET /pockets
 * Get all pockets for current month
 */
Request:
  Query: { monthKey: string }
  
Response:
  {
    success: true,
    data: {
      pockets: Pocket[],
      summaries: PocketSummary[]
    }
  }

// ============================================
// CREATE TRANSFER
// ============================================

/**
 * POST /transfer
 * Create transfer between pockets
 */
Request:
  Body: {
    monthKey: string,
    fromPocketId: string,
    toPocketId: string,
    amount: number,
    date: string, // ISO
    note?: string
  }
  
Response:
  {
    success: true,
    data: {
      transfer: TransferTransaction,
      updatedBalances: {
        [pocketId: string]: PocketBalance
      }
    }
  }

// ============================================
// GET TIMELINE
// ============================================

/**
 * GET /timeline
 * Get timeline for specific pocket
 */
Request:
  Query: {
    monthKey: string,
    pocketId: string,
    sortOrder?: 'asc' | 'desc' // default: 'desc'
  }
  
Response:
  {
    success: true,
    data: {
      entries: TimelineEntry[],
      summary: {
        totalIncome: number,
        totalExpense: number,
        netTransfer: number, // transferIn - transferOut
        finalBalance: number
      }
    }
  }

// ============================================
// DELETE TRANSFER
// ============================================

/**
 * DELETE /transfer/:id
 * Delete a transfer
 */
Request:
  Params: { id: string }
  Query: { monthKey: string }
  
Response:
  {
    success: true,
    data: {
      deletedId: string,
      updatedBalances: {
        [pocketId: string]: PocketBalance
      }
    }
  }
```

### Modified Endpoints

```typescript
// ============================================
// CREATE EXPENSE (MODIFIED)
// ============================================

/**
 * POST /expense
 * Add pocketId field
 */
Request:
  Body: {
    monthKey: string,
    name: string,
    amount: number,
    date: string,
    pocketId: string // NEW FIELD - required
  }

// ============================================
// UPDATE EXPENSE (MODIFIED)
// ============================================

/**
 * PUT /expense/:id
 * Allow changing pocketId
 */
Request:
  Body: {
    // ... existing fields
    pocketId?: string // NEW FIELD - optional
  }
```

## Calculation Logic

### Balance Calculation

```typescript
/**
 * Calculate pocket balance
 */
function calculatePocketBalance(
  pocketId: string,
  monthKey: string,
  data: {
    budget: BudgetData,
    expenses: Expense[],
    additionalIncome: AdditionalIncome[],
    transfers: TransferTransaction[],
    excludedExpenseIds: Set<string>,
    excludedIncomeIds: Set<string>
  }
): PocketBalance {
  let originalAmount = 0;
  let transferIn = 0;
  let transferOut = 0;
  let expenses = 0;
  
  // Calculate original amount
  if (pocketId === POCKET_IDS.DAILY) {
    // Budget awal + carryover
    originalAmount = (data.budget.initialBudget || 0) + (data.budget.carryover || 0);
  } else if (pocketId === POCKET_IDS.COLD_MONEY) {
    // Sum of additional income (excluding excluded items and deductions)
    originalAmount = data.additionalIncome
      .filter(income => !data.excludedIncomeIds.has(income.id))
      .reduce((sum, income) => sum + income.amountIDR - income.deduction, 0);
  }
  
  // Calculate transfers
  transferIn = data.transfers
    .filter(t => t.toPocketId === pocketId)
    .reduce((sum, t) => sum + t.amount, 0);
    
  transferOut = data.transfers
    .filter(t => t.fromPocketId === pocketId)
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate expenses
  expenses = data.expenses
    .filter(e => e.pocketId === pocketId && !data.excludedExpenseIds.has(e.id))
    .reduce((sum, e) => sum + e.amount, 0);
  
  // Available balance
  const availableBalance = originalAmount + transferIn - transferOut - expenses;
  
  return {
    pocketId,
    originalAmount,
    transferIn,
    transferOut,
    expenses,
    availableBalance,
    lastUpdated: new Date().toISOString()
  };
}
```

### Timeline Generation

```typescript
/**
 * Generate timeline entries for a pocket
 */
function generateTimeline(
  pocketId: string,
  monthKey: string,
  data: {
    budget: BudgetData,
    expenses: Expense[],
    additionalIncome: AdditionalIncome[],
    transfers: TransferTransaction[]
  }
): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  
  // 1. Add income entries
  if (pocketId === POCKET_IDS.DAILY) {
    // Budget awal
    if (data.budget.initialBudget > 0) {
      entries.push({
        id: `income_budget_${monthKey}`,
        type: 'income',
        date: `${monthKey}-01T00:00:00Z`,
        description: 'Budget Awal',
        amount: data.budget.initialBudget,
        balanceAfter: 0, // Will be calculated later
        transaction: {
          type: 'income',
          pocketId: POCKET_IDS.DAILY,
          sourceType: 'budget',
          // ... other fields
        },
        icon: 'Wallet',
        color: 'green'
      });
    }
    
    // Carryover
    if (data.budget.carryover > 0) {
      entries.push({
        id: `income_carryover_${monthKey}`,
        type: 'income',
        date: `${monthKey}-01T00:00:01Z`,
        description: 'Carryover dari bulan lalu',
        amount: data.budget.carryover,
        balanceAfter: 0,
        transaction: {
          type: 'income',
          pocketId: POCKET_IDS.DAILY,
          sourceType: 'budget',
          // ... other fields
        },
        icon: 'TrendingUp',
        color: 'green'
      });
    }
  } else if (pocketId === POCKET_IDS.COLD_MONEY) {
    // Additional income
    data.additionalIncome.forEach(income => {
      const netAmount = income.amountIDR - income.deduction;
      entries.push({
        id: `income_${income.id}`,
        type: 'income',
        date: income.date,
        description: income.name,
        amount: netAmount,
        balanceAfter: 0,
        transaction: {
          type: 'income',
          pocketId: POCKET_IDS.COLD_MONEY,
          sourceType: 'additional_income',
          sourceId: income.id,
          // ... other fields
        },
        icon: 'DollarSign',
        color: 'green'
      });
    });
  }
  
  // 2. Add expense entries
  data.expenses
    .filter(e => e.pocketId === pocketId)
    .forEach(expense => {
      entries.push({
        id: `expense_${expense.id}`,
        type: 'expense',
        date: expense.date,
        description: expense.name,
        amount: -expense.amount, // Negative
        balanceAfter: 0,
        transaction: {
          type: 'expense',
          pocketId,
          expenseId: expense.id,
          // ... other fields
        },
        icon: 'ShoppingBag',
        color: 'red'
      });
    });
  
  // 3. Add transfer entries
  data.transfers.forEach(transfer => {
    // Transfer out
    if (transfer.fromPocketId === pocketId) {
      entries.push({
        id: `transfer_out_${transfer.id}`,
        type: 'transfer',
        date: transfer.date,
        description: `Transfer ke ${getPocketName(transfer.toPocketId)}`,
        amount: -transfer.amount, // Negative
        balanceAfter: 0,
        transaction: transfer,
        icon: 'ArrowRight',
        color: 'blue'
      });
    }
    
    // Transfer in
    if (transfer.toPocketId === pocketId) {
      entries.push({
        id: `transfer_in_${transfer.id}`,
        type: 'transfer',
        date: transfer.date,
        description: `Transfer dari ${getPocketName(transfer.fromPocketId)}`,
        amount: transfer.amount, // Positive
        balanceAfter: 0,
        transaction: transfer,
        icon: 'ArrowLeft',
        color: 'blue'
      });
    }
  });
  
  // 4. Sort by date
  entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // 5. Calculate running balance
  let runningBalance = 0;
  entries.forEach(entry => {
    runningBalance += entry.amount;
    entry.balanceAfter = runningBalance;
  });
  
  return entries;
}
```

## Validation Rules

### Transfer Validation

```typescript
/**
 * Validate transfer request
 */
function validateTransfer(
  transfer: {
    fromPocketId: string,
    toPocketId: string,
    amount: number
  },
  balances: Map<string, PocketBalance>
): { valid: boolean; error?: string } {
  // 1. Cannot transfer to same pocket
  if (transfer.fromPocketId === transfer.toPocketId) {
    return { valid: false, error: 'Tidak bisa transfer ke kantong yang sama' };
  }
  
  // 2. Amount must be positive
  if (transfer.amount <= 0) {
    return { valid: false, error: 'Jumlah transfer harus lebih dari 0' };
  }
  
  // 3. Check sufficient balance
  const sourceBalance = balances.get(transfer.fromPocketId);
  if (!sourceBalance) {
    return { valid: false, error: 'Kantong sumber tidak ditemukan' };
  }
  
  if (sourceBalance.availableBalance < transfer.amount) {
    return { 
      valid: false, 
      error: `Saldo tidak cukup. Tersedia: ${formatCurrency(sourceBalance.availableBalance)}` 
    };
  }
  
  return { valid: true };
}
```

### Expense Validation

```typescript
/**
 * Validate expense against pocket balance
 */
function validateExpense(
  expense: { pocketId: string; amount: number },
  balances: Map<string, PocketBalance>
): { valid: boolean; warning?: string } {
  const balance = balances.get(expense.pocketId);
  
  if (!balance) {
    return { valid: false, warning: 'Kantong tidak ditemukan' };
  }
  
  // Allow expense even if balance insufficient (just show warning)
  if (balance.availableBalance < expense.amount) {
    return {
      valid: true,
      warning: `Peringatan: Pengeluaran melebihi saldo kantong (Tersedia: ${formatCurrency(balance.availableBalance)})`
    };
  }
  
  return { valid: true };
}
```

## Index & Query Patterns

### Common Queries

```typescript
// 1. Get all pockets for a month
const pockets = await kv.get<Pocket[]>(`pockets:${monthKey}`);

// 2. Get all transfers for a month
const transfers = await kv.get<TransferTransaction[]>(`transfers:${monthKey}`);

// 3. Get expenses for specific pocket
const allExpenses = await kv.get<Expense[]>(`expenses:${monthKey}`);
const pocketExpenses = allExpenses.filter(e => e.pocketId === targetPocketId);

// 4. Get balance for specific pocket
const balance = await kv.get<PocketBalance>(`pocket_balance:${monthKey}:${pocketId}`);
// OR calculate on-the-fly if not cached

// 5. Get timeline for pocket
// (Requires fetching multiple keys and computing)
```

## Notes

- **Phase 1**: Focus on 2 fixed pockets, simple structure
- **Phase 2**: Add custom pockets, requires CRUD operations
- **Performance**: Consider caching balances for large datasets
- **Consistency**: All date fields use ISO 8601 format
- **Validation**: Balance checks are warnings, not blockers (allow negative balances)

---

**Version**: 1.0
**Last Updated**: November 5, 2025
**Status**: Ready for Implementation
