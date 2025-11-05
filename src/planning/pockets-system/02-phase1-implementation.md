# Phase 1 Implementation Guide

## Overview

Panduan step-by-step untuk mengimplementasikan Pockets System Phase 1 dengan 2 kantong tetap.

## Implementation Checklist

### Backend (Supabase Server Functions)

- [ ] **Step 1**: Add TypeScript types untuk pockets system
- [ ] **Step 2**: Implement helper functions untuk balance calculation
- [ ] **Step 3**: Create transfer endpoint
- [ ] **Step 4**: Create timeline endpoint
- [ ] **Step 5**: Modify expense endpoints (add pocketId)
- [ ] **Step 6**: Add migration logic untuk existing data

### Frontend Components

- [ ] **Step 7**: Create `PocketsSummary.tsx` component
- [ ] **Step 8**: Create `PocketTimeline.tsx` component
- [ ] **Step 9**: Create `TransferDialog.tsx` component
- [ ] **Step 10**: Modify `AddExpenseDialog.tsx` (add pocket selector)
- [ ] **Step 11**: Modify `ExpenseList.tsx` (show pocket info)
- [ ] **Step 12**: Integrate `PocketsSummary` into `App.tsx`

### Testing & Polish

- [ ] **Step 13**: Test transfer flows
- [ ] **Step 14**: Test timeline display
- [ ] **Step 15**: Test balance calculations
- [ ] **Step 16**: Mobile responsive testing
- [ ] **Step 17**: Error handling & edge cases

---

## Detailed Implementation Steps

## BACKEND IMPLEMENTATION

### Step 1: Add TypeScript Types

**File**: `/supabase/functions/server/kv_store.tsx`

```typescript
// Add these types at the top of the file

// ============ POCKETS TYPES ============

type PocketType = 'primary' | 'custom';

const POCKET_IDS = {
  DAILY: 'pocket_daily',
  COLD_MONEY: 'pocket_cold_money'
} as const;

interface Pocket {
  id: string;
  name: string;
  type: PocketType;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  createdAt: string;
}

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

interface PocketBalance {
  pocketId: string;
  originalAmount: number;
  transferIn: number;
  transferOut: number;
  expenses: number;
  availableBalance: number;
  lastUpdated: string;
}

interface TransferTransaction {
  id: string;
  type: 'transfer';
  amount: number;
  fromPocketId: string;
  toPocketId: string;
  date: string;
  note?: string;
  createdAt: string;
}

type TransactionType = 'income' | 'expense' | 'transfer';

interface TimelineEntry {
  id: string;
  type: TransactionType;
  date: string;
  description: string;
  amount: number;
  balanceAfter: number;
  icon: string;
  color: string;
  metadata?: any;
}

// ============ MODIFY EXISTING EXPENSE INTERFACE ============

// Add pocketId to Expense interface
interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  createdAt?: string;
  pocketId: string; // NEW FIELD
}
```

### Step 2: Implement Helper Functions

**File**: `/supabase/functions/server/kv_store.tsx`

```typescript
// ============ HELPER FUNCTIONS ============

/**
 * Get or create pockets for a month
 */
async function getPockets(monthKey: string): Promise<Pocket[]> {
  let pockets = await kv.get<Pocket[]>(`pockets:${monthKey}`);
  
  if (!pockets || pockets.length === 0) {
    // Auto-create default pockets
    pockets = DEFAULT_POCKETS;
    await kv.set(`pockets:${monthKey}`, pockets);
  }
  
  return pockets;
}

/**
 * Calculate balance for a specific pocket
 */
async function calculatePocketBalance(
  pocketId: string,
  monthKey: string
): Promise<PocketBalance> {
  // Get all data
  const budget = await kv.get<BudgetData>(`budget:${monthKey}`) || { initialBudget: 0, carryover: 0 };
  const expenses = await kv.get<Expense[]>(`expenses:${monthKey}`) || [];
  const additionalIncome = await kv.get<AdditionalIncome[]>(`additional_income:${monthKey}`) || [];
  const transfers = await kv.get<TransferTransaction[]>(`transfers:${monthKey}`) || [];
  const excludedExpenseIds = new Set(await kv.get<string[]>(`excluded_expense_ids:${monthKey}`) || []);
  const excludedIncomeIds = new Set(await kv.get<string[]>(`excluded_income_ids:${monthKey}`) || []);
  
  let originalAmount = 0;
  let transferIn = 0;
  let transferOut = 0;
  let expensesTotal = 0;
  
  // Calculate original amount
  if (pocketId === POCKET_IDS.DAILY) {
    originalAmount = (budget.initialBudget || 0) + (budget.carryover || 0);
  } else if (pocketId === POCKET_IDS.COLD_MONEY) {
    originalAmount = additionalIncome
      .filter(income => !excludedIncomeIds.has(income.id))
      .reduce((sum, income) => sum + income.amountIDR - income.deduction, 0);
  }
  
  // Calculate transfers
  transferIn = transfers
    .filter(t => t.toPocketId === pocketId)
    .reduce((sum, t) => sum + t.amount, 0);
    
  transferOut = transfers
    .filter(t => t.fromPocketId === pocketId)
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate expenses
  expensesTotal = expenses
    .filter(e => e.pocketId === pocketId && !excludedExpenseIds.has(e.id))
    .reduce((sum, e) => sum + e.amount, 0);
  
  const availableBalance = originalAmount + transferIn - transferOut - expensesTotal;
  
  return {
    pocketId,
    originalAmount,
    transferIn,
    transferOut,
    expenses: expensesTotal,
    availableBalance,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Generate timeline for a pocket
 */
async function generatePocketTimeline(
  pocketId: string,
  monthKey: string,
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<TimelineEntry[]> {
  const budget = await kv.get<BudgetData>(`budget:${monthKey}`) || { initialBudget: 0, carryover: 0 };
  const expenses = await kv.get<Expense[]>(`expenses:${monthKey}`) || [];
  const additionalIncome = await kv.get<AdditionalIncome[]>(`additional_income:${monthKey}`) || [];
  const transfers = await kv.get<TransferTransaction[]>(`transfers:${monthKey}`) || [];
  const excludedExpenseIds = new Set(await kv.get<string[]>(`excluded_expense_ids:${monthKey}`) || []);
  const excludedIncomeIds = new Set(await kv.get<string[]>(`excluded_income_ids:${monthKey}`) || []);
  
  const entries: TimelineEntry[] = [];
  
  // Get pocket name
  const pockets = await getPockets(monthKey);
  const otherPocket = pockets.find(p => p.id !== pocketId);
  const otherPocketName = otherPocket?.name || 'Unknown';
  
  // Add income entries
  if (pocketId === POCKET_IDS.DAILY) {
    if (budget.initialBudget > 0) {
      entries.push({
        id: `income_budget_${monthKey}`,
        type: 'income',
        date: `${monthKey}-01T00:00:00Z`,
        description: 'Budget Awal',
        amount: budget.initialBudget,
        balanceAfter: 0,
        icon: 'Wallet',
        color: 'green'
      });
    }
    
    if (budget.carryover > 0) {
      entries.push({
        id: `income_carryover_${monthKey}`,
        type: 'income',
        date: `${monthKey}-01T00:00:01Z`,
        description: 'Carryover',
        amount: budget.carryover,
        balanceAfter: 0,
        icon: 'TrendingUp',
        color: 'green'
      });
    }
  } else if (pocketId === POCKET_IDS.COLD_MONEY) {
    additionalIncome
      .filter(income => !excludedIncomeIds.has(income.id))
      .forEach(income => {
        const netAmount = income.amountIDR - income.deduction;
        entries.push({
          id: `income_${income.id}`,
          type: 'income',
          date: income.date,
          description: income.name,
          amount: netAmount,
          balanceAfter: 0,
          icon: 'DollarSign',
          color: 'green',
          metadata: { incomeId: income.id }
        });
      });
  }
  
  // Add expense entries
  expenses
    .filter(e => e.pocketId === pocketId && !excludedExpenseIds.has(e.id))
    .forEach(expense => {
      entries.push({
        id: `expense_${expense.id}`,
        type: 'expense',
        date: expense.date,
        description: expense.name,
        amount: -expense.amount,
        balanceAfter: 0,
        icon: 'ShoppingBag',
        color: 'red',
        metadata: { expenseId: expense.id }
      });
    });
  
  // Add transfer entries
  transfers.forEach(transfer => {
    if (transfer.fromPocketId === pocketId) {
      entries.push({
        id: `transfer_out_${transfer.id}`,
        type: 'transfer',
        date: transfer.date,
        description: `Transfer ke ${otherPocketName}`,
        amount: -transfer.amount,
        balanceAfter: 0,
        icon: 'ArrowRight',
        color: 'blue',
        metadata: { transferId: transfer.id, note: transfer.note }
      });
    }
    
    if (transfer.toPocketId === pocketId) {
      entries.push({
        id: `transfer_in_${transfer.id}`,
        type: 'transfer',
        date: transfer.date,
        description: `Transfer dari ${otherPocketName}`,
        amount: transfer.amount,
        balanceAfter: 0,
        icon: 'ArrowLeft',
        color: 'blue',
        metadata: { transferId: transfer.id, note: transfer.note }
      });
    }
  });
  
  // Sort by date
  entries.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });
  
  // Calculate running balance
  let runningBalance = 0;
  const orderedEntries = sortOrder === 'asc' ? entries : [...entries].reverse();
  
  orderedEntries.forEach(entry => {
    runningBalance += entry.amount;
    entry.balanceAfter = runningBalance;
  });
  
  if (sortOrder === 'desc') {
    entries.reverse();
  }
  
  return entries;
}

/**
 * Validate transfer
 */
function validateTransfer(
  transfer: { fromPocketId: string; toPocketId: string; amount: number },
  fromBalance: PocketBalance
): { valid: boolean; error?: string } {
  if (transfer.fromPocketId === transfer.toPocketId) {
    return { valid: false, error: 'Tidak bisa transfer ke kantong yang sama' };
  }
  
  if (transfer.amount <= 0) {
    return { valid: false, error: 'Jumlah transfer harus lebih dari 0' };
  }
  
  if (fromBalance.availableBalance < transfer.amount) {
    return { 
      valid: false, 
      error: `Saldo tidak cukup. Tersedia: Rp ${fromBalance.availableBalance.toLocaleString('id-ID')}` 
    };
  }
  
  return { valid: true };
}
```

### Step 3: Create Transfer Endpoint

**File**: `/supabase/functions/server/index.tsx`

Add new route handler:

```typescript
// ============ CREATE TRANSFER ============
if (url.pathname === '/transfer' && req.method === 'POST') {
  try {
    const body = await req.json();
    const { monthKey, fromPocketId, toPocketId, amount, date, note } = body;
    
    if (!monthKey || !fromPocketId || !toPocketId || !amount) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get current balance
    const fromBalance = await calculatePocketBalance(fromPocketId, monthKey);
    
    // Validate transfer
    const validation = validateTransfer(
      { fromPocketId, toPocketId, amount },
      fromBalance
    );
    
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: validation.error 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create transfer
    const transfer: TransferTransaction = {
      id: `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'transfer',
      amount,
      fromPocketId,
      toPocketId,
      date: date || new Date().toISOString(),
      note,
      createdAt: new Date().toISOString()
    };
    
    // Save to KV
    const transfers = await kv.get<TransferTransaction[]>(`transfers:${monthKey}`) || [];
    transfers.push(transfer);
    await kv.set(`transfers:${monthKey}`, transfers);
    
    // Recalculate balances
    const updatedFromBalance = await calculatePocketBalance(fromPocketId, monthKey);
    const updatedToBalance = await calculatePocketBalance(toPocketId, monthKey);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          transfer,
          updatedBalances: {
            [fromPocketId]: updatedFromBalance,
            [toPocketId]: updatedToBalance
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating transfer:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

// ============ DELETE TRANSFER ============
if (url.pathname.startsWith('/transfer/') && req.method === 'DELETE') {
  try {
    const transferId = url.pathname.split('/')[2];
    const monthKey = url.searchParams.get('monthKey');
    
    if (!monthKey || !transferId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get transfers
    const transfers = await kv.get<TransferTransaction[]>(`transfers:${monthKey}`) || [];
    const transferToDelete = transfers.find(t => t.id === transferId);
    
    if (!transferToDelete) {
      return new Response(
        JSON.stringify({ success: false, error: 'Transfer not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // Delete transfer
    const updatedTransfers = transfers.filter(t => t.id !== transferId);
    await kv.set(`transfers:${monthKey}`, updatedTransfers);
    
    // Recalculate balances
    const updatedFromBalance = await calculatePocketBalance(transferToDelete.fromPocketId, monthKey);
    const updatedToBalance = await calculatePocketBalance(transferToDelete.toPocketId, monthKey);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          deletedId: transferId,
          updatedBalances: {
            [transferToDelete.fromPocketId]: updatedFromBalance,
            [transferToDelete.toPocketId]: updatedToBalance
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting transfer:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}
```

### Step 4: Create Timeline Endpoint

```typescript
// ============ GET TIMELINE ============
if (url.pathname === '/timeline' && req.method === 'GET') {
  try {
    const monthKey = url.searchParams.get('monthKey');
    const pocketId = url.searchParams.get('pocketId');
    const sortOrder = (url.searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    
    if (!monthKey || !pocketId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const entries = await generatePocketTimeline(pocketId, monthKey, sortOrder);
    
    // Calculate summary
    const summary = {
      totalIncome: entries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0),
      totalExpense: Math.abs(entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)),
      netTransfer: entries.filter(e => e.type === 'transfer').reduce((sum, e) => sum + e.amount, 0),
      finalBalance: entries.length > 0 ? entries[0].balanceAfter : 0
    };
    
    return new Response(
      JSON.stringify({
        success: true,
        data: { entries, summary }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching timeline:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

// ============ GET POCKETS & BALANCES ============
if (url.pathname === '/pockets' && req.method === 'GET') {
  try {
    const monthKey = url.searchParams.get('monthKey');
    
    if (!monthKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing monthKey' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const pockets = await getPockets(monthKey);
    
    // Calculate balances for all pockets
    const balances = await Promise.all(
      pockets.map(pocket => calculatePocketBalance(pocket.id, monthKey))
    );
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          pockets,
          balances
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching pockets:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}
```

### Step 5: Modify Expense Endpoints

```typescript
// Modify existing POST /expense endpoint
// Add pocketId to expense object

// Before:
const newExpense: Expense = {
  id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name,
  amount,
  date,
  createdAt: new Date().toISOString()
};

// After:
const newExpense: Expense = {
  id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name,
  amount,
  date,
  pocketId: body.pocketId || POCKET_IDS.DAILY, // Default to daily if not specified
  createdAt: new Date().toISOString()
};

// Also modify PUT /expense/:id to allow updating pocketId
```

### Step 6: Migration Logic

```typescript
// Add migration function (called automatically when pockets don't exist)
// Already handled in getPockets() function - auto-creates DEFAULT_POCKETS

// For existing expenses without pocketId, add default:
async function migrateExpenses(monthKey: string) {
  const expenses = await kv.get<Expense[]>(`expenses:${monthKey}`) || [];
  const needsMigration = expenses.some(e => !e.pocketId);
  
  if (needsMigration) {
    const migratedExpenses = expenses.map(e => ({
      ...e,
      pocketId: e.pocketId || POCKET_IDS.DAILY
    }));
    await kv.set(`expenses:${monthKey}`, migratedExpenses);
  }
}

// Call this in relevant endpoints
```

---

## FRONTEND IMPLEMENTATION

### Step 7: Create PocketsSummary Component

**File**: `/components/PocketsSummary.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Wallet, Sparkles, ArrowRightLeft, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";

interface Pocket {
  id: string;
  name: string;
  type: 'primary' | 'custom';
  description?: string;
  icon?: string;
  color?: string;
  order: number;
}

interface PocketBalance {
  pocketId: string;
  originalAmount: number;
  transferIn: number;
  transferOut: number;
  expenses: number;
  availableBalance: number;
}

interface PocketsSummaryProps {
  monthKey: string;
  onTransferClick: () => void;
  onRefresh?: () => void;
}

export function PocketsSummary({ monthKey, onTransferClick, onRefresh }: PocketsSummaryProps) {
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [balances, setBalances] = useState<Map<string, PocketBalance>>(new Map());
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fetchPockets = async () => {
    // TODO: Implement API call
    // const response = await fetch(`${baseUrl}/pockets?monthKey=${monthKey}`);
    // const data = await response.json();
    // setPockets(data.data.pockets);
    // setBalances(new Map(data.data.balances.map(b => [b.pocketId, b])));
  };

  useEffect(() => {
    fetchPockets();
  }, [monthKey]);

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Wallet': return <Wallet className="size-5" />;
      case 'Sparkles': return <Sparkles className="size-5" />;
      default: return <Wallet className="size-5" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Ringkasan Kantong</span>
          <Button onClick={onTransferClick} variant="outline" size="sm">
            <ArrowRightLeft className="size-4 mr-2" />
            Transfer
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pockets.map(pocket => {
            const balance = balances.get(pocket.id);
            if (!balance) return null;

            return (
              <div 
                key={pocket.id} 
                className="border rounded-lg p-4 space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIcon(pocket.icon)}
                    <div>
                      <h3 className="font-medium">{pocket.name}</h3>
                      {pocket.description && (
                        <p className="text-xs text-muted-foreground">{pocket.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Balance */}
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground">Saldo Tersedia</span>
                    <span className={`text-lg font-semibold ${balance.availableBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(balance.availableBalance)}
                    </span>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-1 pt-2 border-t text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saldo Asli</span>
                    <span>{formatCurrency(balance.originalAmount)}</span>
                  </div>
                  {balance.transferIn > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="size-3" />
                        Transfer Masuk
                      </span>
                      <span>+{formatCurrency(balance.transferIn)}</span>
                    </div>
                  )}
                  {balance.transferOut > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span className="flex items-center gap-1">
                        <TrendingDown className="size-3" />
                        Transfer Keluar
                      </span>
                      <span>-{formatCurrency(balance.transferOut)}</span>
                    </div>
                  )}
                  {balance.expenses > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pengeluaran</span>
                      <span>-{formatCurrency(balance.expenses)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 8: Create PocketTimeline Component

**File**: `/components/PocketTimeline.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ChevronDown, Wallet, Sparkles, DollarSign, ShoppingBag, ArrowRight, ArrowLeft, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface TimelineEntry {
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

interface PocketTimelineProps {
  pocketId: string;
  pocketName: string;
  monthKey: string;
}

export function PocketTimeline({ pocketId, pocketName, monthKey }: PocketTimelineProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'd MMM yyyy, HH:mm', { locale: localeId });
    } catch {
      return dateStr;
    }
  };

  const fetchTimeline = async () => {
    if (!isOpen) return;
    setLoading(true);
    // TODO: Implement API call
    // const response = await fetch(`${baseUrl}/timeline?monthKey=${monthKey}&pocketId=${pocketId}`);
    // const data = await response.json();
    // setEntries(data.data.entries);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchTimeline();
    }
  }, [isOpen, monthKey, pocketId]);

  const getIcon = (iconName: string) => {
    const iconClass = "size-4";
    switch (iconName) {
      case 'Wallet': return <Wallet className={iconClass} />;
      case 'Sparkles': return <Sparkles className={iconClass} />;
      case 'DollarSign': return <DollarSign className={iconClass} />;
      case 'ShoppingBag': return <ShoppingBag className={iconClass} />;
      case 'ArrowRight': return <ArrowRight className={iconClass} />;
      case 'ArrowLeft': return <ArrowLeft className={iconClass} />;
      case 'TrendingUp': return <TrendingUp className={iconClass} />;
      default: return <Wallet className={iconClass} />;
    }
  };

  const getColorClass = (color: string, isAmount: boolean = false) => {
    if (isAmount) {
      switch (color) {
        case 'green': return 'text-green-600';
        case 'red': return 'text-red-600';
        case 'blue': return 'text-blue-600';
        default: return 'text-foreground';
      }
    } else {
      switch (color) {
        case 'green': return 'bg-green-100 text-green-700';
        case 'red': return 'bg-red-100 text-red-700';
        case 'blue': return 'bg-blue-100 text-blue-700';
        default: return 'bg-gray-100 text-gray-700';
      }
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-accent/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ChevronDown className={`size-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                Timeline {pocketName}
              </span>
              <Badge variant="secondary">{entries.length} aktivitas</Badge>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : entries.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Belum ada aktivitas
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry, index) => (
                  <div 
                    key={entry.id}
                    className="flex gap-3 pb-3 border-b last:border-b-0"
                  >
                    {/* Icon */}
                    <div className={`rounded-full p-2 h-fit ${getColorClass(entry.color)}`}>
                      {getIcon(entry.icon)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium truncate">{entry.description}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
                          {entry.metadata?.note && (
                            <p className="text-xs text-muted-foreground italic mt-1">
                              {entry.metadata.note}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${getColorClass(entry.color, true)}`}>
                            {entry.amount > 0 ? '+' : ''}{formatCurrency(entry.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Saldo: {formatCurrency(entry.balanceAfter)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
```

### Step 9: Create TransferDialog Component

**File**: `/components/TransferDialog.tsx`

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "./ui/utils";

interface Pocket {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface PocketBalance {
  pocketId: string;
  availableBalance: number;
}

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pockets: Pocket[];
  balances: Map<string, PocketBalance>;
  onTransfer: (transfer: {
    fromPocketId: string;
    toPocketId: string;
    amount: number;
    date: string;
    note?: string;
  }) => Promise<void>;
}

export function TransferDialog({ 
  open, 
  onOpenChange, 
  pockets, 
  balances,
  onTransfer 
}: TransferDialogProps) {
  const [fromPocketId, setFromPocketId] = useState('');
  const [toPocketId, setToPocketId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const selectedFromBalance = fromPocketId ? balances.get(fromPocketId) : null;
  const amountNum = parseFloat(amount) || 0;
  const isValid = fromPocketId && toPocketId && fromPocketId !== toPocketId && amountNum > 0;
  const insufficientBalance = selectedFromBalance && amountNum > selectedFromBalance.availableBalance;

  const handleSubmit = async () => {
    if (!isValid) return;

    setLoading(true);
    try {
      await onTransfer({
        fromPocketId,
        toPocketId,
        amount: amountNum,
        date: date.toISOString(),
        note: note.trim() || undefined
      });

      // Reset form
      setFromPocketId('');
      setToPocketId('');
      setAmount('');
      setDate(new Date());
      setNote('');
      onOpenChange(false);
    } catch (error) {
      console.error('Transfer failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transfer Antar Kantong</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* From Pocket */}
          <div className="space-y-2">
            <Label>Dari Kantong</Label>
            <Select value={fromPocketId} onValueChange={setFromPocketId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kantong sumber" />
              </SelectTrigger>
              <SelectContent>
                {pockets.map(pocket => {
                  const balance = balances.get(pocket.id);
                  return (
                    <SelectItem key={pocket.id} value={pocket.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{pocket.name}</span>
                        {balance && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {formatCurrency(balance.availableBalance)}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedFromBalance && (
              <p className="text-xs text-muted-foreground">
                Saldo tersedia: {formatCurrency(selectedFromBalance.availableBalance)}
              </p>
            )}
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="size-5 text-muted-foreground" />
          </div>

          {/* To Pocket */}
          <div className="space-y-2">
            <Label>Ke Kantong</Label>
            <Select value={toPocketId} onValueChange={setToPocketId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kantong tujuan" />
              </SelectTrigger>
              <SelectContent>
                {pockets
                  .filter(p => p.id !== fromPocketId)
                  .map(pocket => (
                    <SelectItem key={pocket.id} value={pocket.id}>
                      {pocket.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {insufficientBalance && (
              <p className="text-xs text-red-600">
                Saldo tidak cukup
              </p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Tanggal</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left")}>
                  <CalendarIcon className="mr-2 size-4" />
                  {format(date, "d MMMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Catatan (opsional)</Label>
            <Textarea
              id="note"
              placeholder="Contoh: Untuk bayar tagihan"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isValid || insufficientBalance || loading}
          >
            {loading ? 'Memproses...' : 'Transfer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Step 10: Modify AddExpenseDialog

Add pocket selector to the expense form:

```typescript
// In AddExpenseDialog.tsx or AddExpenseForm.tsx

// Add state
const [selectedPocketId, setSelectedPocketId] = useState(POCKET_IDS.DAILY);

// Add to form
<div className="space-y-2">
  <Label>Ambil dari Kantong</Label>
  <Select value={selectedPocketId} onValueChange={setSelectedPocketId}>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="pocket_daily">Sehari-hari</SelectItem>
      <SelectItem value="pocket_cold_money">Uang Dingin</SelectItem>
    </SelectContent>
  </Select>
</div>

// Include in submit
await onAddExpense({
  name,
  amount: parseFloat(amount),
  date: date.toISOString(),
  pocketId: selectedPocketId // NEW
});
```

### Step 11: Modify ExpenseList

Show pocket badge/info for each expense:

```typescript
// In ExpenseList.tsx
// Add pocket info display

<div className="flex items-center gap-2">
  <p className="truncate">{expense.name}</p>
  <Badge variant="outline" className="text-xs">
    {expense.pocketId === 'pocket_daily' ? 'Sehari-hari' : 'Uang Dingin'}
  </Badge>
</div>
```

### Step 12: Integrate into App.tsx

```typescript
// In App.tsx

import { PocketsSummary } from "./components/PocketsSummary";
import { PocketTimeline } from "./components/PocketTimeline";
import { TransferDialog } from "./components/TransferDialog";

// Add state
const [showTransferDialog, setShowTransferDialog] = useState(false);
const [pockets, setPockets] = useState([]);
const [balances, setBalances] = useState(new Map());

// Add after MonthSelector, before Tabs
<PocketsSummary
  monthKey={currentMonth}
  onTransferClick={() => setShowTransferDialog(true)}
  onRefresh={fetchData}
/>

// Add after all Tabs
<div className="space-y-4">
  {pockets.map(pocket => (
    <PocketTimeline
      key={pocket.id}
      pocketId={pocket.id}
      pocketName={pocket.name}
      monthKey={currentMonth}
    />
  ))}
</div>

// Add TransferDialog
<TransferDialog
  open={showTransferDialog}
  onOpenChange={setShowTransferDialog}
  pockets={pockets}
  balances={balances}
  onTransfer={handleTransfer}
/>
```

---

## Testing Checklist

### Unit Tests
- [ ] Balance calculation logic
- [ ] Timeline generation logic
- [ ] Transfer validation logic

### Integration Tests
- [ ] Create transfer → balances update correctly
- [ ] Delete transfer → balances revert correctly
- [ ] Add expense → correct pocket balance decreases
- [ ] Timeline shows all transactions in order

### UI/UX Tests
- [ ] Pockets summary displays correctly
- [ ] Transfer dialog validates input
- [ ] Timeline expands/collapses smoothly
- [ ] Mobile responsive design
- [ ] Loading states work properly

### Edge Cases
- [ ] Transfer with insufficient balance
- [ ] Transfer to same pocket (should be blocked)
- [ ] Negative balances display correctly
- [ ] Empty timeline displays message
- [ ] Very large amounts format correctly

---

## Rollback Plan

If issues occur:

1. **Backend**: Comment out new routes, revert to previous version
2. **Frontend**: Hide PocketsSummary component, remove pocket selector from expense form
3. **Data**: Existing expenses without pocketId will default to 'pocket_daily'
4. **Migration**: Can be re-run safely (idempotent)

---

**Next**: See `04-ui-ux-design.md` for detailed mockups and design specifications.
