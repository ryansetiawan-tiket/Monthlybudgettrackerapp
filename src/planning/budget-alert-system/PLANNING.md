# Budget Alert System - Planning Document

**Date:** November 8, 2025  
**Priority:** Phase 9 - Priority 2  
**Status:** 📋 PLANNING  

---

## 🎯 OVERVIEW

Implementasi sistem peringatan budget real-time yang terdiri dari 2 fitur:
1. **Real-Time Toast Alert** (Peringatan Pasif) - Feedback setelah transaksi saved
2. **Confirmation Dialog** (Peringatan Aktif) - Blocker sebelum transaksi saved

**Target Platform:** Desktop & Mobile  
**Tone of Voice:** Kocak, friendly, santai (sesuai brand app)

---

## 🎨 FITUR 1: REAL-TIME TOAST ALERT

### 📝 Description
Peringatan pasif yang muncul SETELAH transaksi berhasil disimpan, memberi feedback tentang status budget yang baru tercapai.

### 🔔 Trigger
- **When:** Setelah transaksi baru berhasil disimpan ke database
- **Where:** Di dalam `AddExpenseForm.tsx` atau `AddExpenseDialog.tsx`
- **How:** Hook atau callback setelah `onAddExpense()` sukses

### 🧠 Logic Flow

```
User adds expense → Save to DB → Calculate new total → Get new status
                                                           ↓
                                                   Compare with old status
                                                           ↓
                                          IF status changed (naik level)
                                                           ↓
                                                    Show Toast Alert
```

**Detailed Logic:**
```typescript
1. User submits expense with category (e.g., "Game")
2. Backend saves expense successfully
3. Frontend recalculates:
   - Previous total for "Game" category
   - New total = Previous + New Expense
   - Previous status (e.g., Safe)
   - New status (e.g., Warning)
4. Compare statuses:
   IF (new status > old status):
     Show toast with appropriate message
   ELSE:
     Don't show toast (avoid spam)
```

### 📊 Status Thresholds

| Status | Percentage | Threshold |
|--------|------------|-----------|
| **Safe** | 0% - 79% | Below warningAt (default 80%) |
| **Warning** | 80% - 89% | warningAt - 89% |
| **Danger** | 90% - 99% | 90% - 99% |
| **Exceeded** | 100%+ | 100% and above |

**Status Level Hierarchy:**
```
Safe (0) < Warning (1) < Danger (2) < Exceeded (3)
```

### 🎨 Toast UI Design

#### 1. Warning Toast (80% - 89%)
```
┌────────────────────────────────────────────────┐
│ 😅 Hati-hati, Bos!                            │
│                                                │
│ Budget 'Game' udah masuk zona kuning (85%)!   │
│ Total: Rp 425.000 dari Rp 500.000            │
└────────────────────────────────────────────────┘
Color: Amber/Yellow (#F59E0B)
Duration: 5 seconds
```

#### 2. Danger Toast (90% - 99%)
```
┌────────────────────────────────────────────────┐
│ 😱 Awas!                                       │
│                                                │
│ Budget 'Game' lo udah mepet banget (95%)!     │
│ Total: Rp 475.000 dari Rp 500.000            │
└────────────────────────────────────────────────┘
Color: Orange (#F97316)
Duration: 6 seconds
```

#### 3. Exceeded Toast (100%+)
```
┌────────────────────────────────────────────────┐
│ 🚨 WADUH!                                      │
│                                                │
│ Budget 'Game' JEBOL! Udah 110% nih!           │
│ Total: Rp 550.000 dari Rp 500.000            │
└────────────────────────────────────────────────┘
Color: Red (#EF4444)
Duration: 8 seconds
```

### 📝 Toast Message Templates

**Warning (80-89%):**
```typescript
const messages = [
  `😅 Hati-hati, Bos! Budget '${categoryLabel}' udah masuk zona kuning (${percentage}%)!`,
  `😅 Woy! Budget '${categoryLabel}' lo udah ${percentage}% nih!`,
  `😅 Pelan-pelan, Bro! Budget '${categoryLabel}' hampir habis (${percentage}%)!`
];
```

**Danger (90-99%):**
```typescript
const messages = [
  `😱 Awas! Budget '${categoryLabel}' lo udah mepet banget (${percentage}%)!`,
  `😱 Gawat! Budget '${categoryLabel}' tinggal dikit lagi jebol (${percentage}%)!`,
  `😱 Bahaya! Budget '${categoryLabel}' udah ${percentage}%!`
];
```

**Exceeded (100%+):**
```typescript
const messages = [
  `🚨 WADUH! Budget '${categoryLabel}' JEBOL! Udah ${percentage}% nih!`,
  `🚨 ANJAY! Budget '${categoryLabel}' udah lewat limit! (${percentage}%)`,
  `🚨 KEBANGETAN! Budget '${categoryLabel}' jebol parah! (${percentage}%)`
];
```

### 🔧 Implementation Plan

**File:** `/utils/budgetAlerts.ts` (NEW)
```typescript
import { toast } from 'sonner@2.0.3';
import { getBudgetStatus, getBudgetStatusColor, getBudgetPercentage } from './calculations';

export type BudgetStatus = 'safe' | 'warning' | 'danger' | 'exceeded';

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
 */
export function showBudgetAlertIfNeeded(params: BudgetAlertParams): void {
  const { categoryId, categoryLabel, oldTotal, newTotal, limit, warningAt = 80 } = params;
  
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
    style: {
      backgroundColor: '#FEF3C7',
      borderColor: '#F59E0B',
      color: '#92400E'
    }
  });
}

/**
 * Show danger toast (90-99%)
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
    style: {
      backgroundColor: '#FFF7ED',
      borderColor: '#F97316',
      color: '#9A3412'
    }
  });
}

/**
 * Show exceeded toast (100%+)
 */
function showExceededToast(label: string, percentage: number, total: number, limit: number): void {
  const messages = [
    `WADUH! Budget '${label}' JEBOL! Udah ${percentage}% nih!`,
    `ANJAY! Budget '${label}' udah lewat limit! (${percentage}%)`,
    `KEBANGETAN! Budget '${label}' jebol parah! (${percentage}%)`
  ];
  
  const message = messages[Math.floor(Math.random() * messages.length)];
  
  toast.error(`🚨 ${message}`, {
    description: `Total: ${formatCurrency(total)} dari ${formatCurrency(limit)}`,
    duration: 8000,
    style: {
      backgroundColor: '#FEF2F2',
      borderColor: '#EF4444',
      color: '#991B1B'
    }
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}
```

**Integration in AddExpenseForm.tsx:**
```typescript
import { showBudgetAlertIfNeeded } from '../utils/budgetAlerts';
import { useCategorySettings } from '../hooks/useCategorySettings';

// After successful expense save:
const handleSubmitMultiple = async () => {
  // ... existing code ...
  
  for (let i = 0; i < validEntries.length; i++) {
    const entry = validEntries[i];
    
    // Check if this category has budget limit
    if (entry.category && settings?.budgets?.[entry.category]) {
      const budgetConfig = settings.budgets[entry.category];
      
      // Calculate old total (before this expense)
      const oldTotal = calculateCategoryTotal(entry.category, expenses);
      
      // Calculate new total (after this expense)
      const finalAmount = entry.calculatedAmount || Number(entry.amount);
      const newTotal = oldTotal + finalAmount;
      
      // Get category label
      const categoryLabel = getCategoryLabel(entry.category, settings);
      
      // Show alert if needed
      showBudgetAlertIfNeeded({
        categoryId: entry.category,
        categoryLabel,
        oldTotal,
        newTotal,
        limit: budgetConfig.limit,
        warningAt: budgetConfig.warningAt
      });
    }
    
    await onAddExpense(/* ... */);
  }
};
```

---

## 🛡️ FITUR 2: CONFIRMATION DIALOG

### 📝 Description
Peringatan aktif (blocker) yang muncul SEBELUM transaksi disimpan, memberi user pilihan untuk membatalkan atau tetap melanjutkan jika akan membuat budget jebol.

### 🔔 Trigger
- **When:** User klik tombol "Simpan" di AddExpenseDialog
- **Where:** Di dalam `handleSubmitMultiple()` SEBELUM `onAddExpense()`
- **How:** Check proyeksi total, jika > limit, show dialog

### 🧠 Logic Flow

```
User clicks "Simpan" → Check each entry's category
                              ↓
                    Entry has budget limit?
                              ↓
                    Calculate projection:
                    New Total = Current Total + This Expense
                              ↓
                    Projection > Limit?
                              ↓
                        YES → Show Dialog
                              ↓
                    User chooses:
                    - "Batal Aja Deh" → Cancel, stay in form
                    - "Bodo Amat, Tetap Tambah" → Continue save
                              ↓
                    If continue → Save expense → Toast Alert (Fitur 1)
```

**Detailed Logic:**
```typescript
1. User fills expense form with:
   - Amount: Rp 150.000
   - Category: Game (limit: Rp 500.000)
2. User clicks "Simpan"
3. Before saving:
   - Get current total for "Game": Rp 450.000
   - Calculate projection: Rp 450.000 + Rp 150.000 = Rp 600.000
   - Check: Rp 600.000 > Rp 500.000? → YES!
4. Show confirmation dialog:
   "Budget 'Game' lo bakal JEBOL nih..."
5. Wait for user decision:
   - If "Batal" → Stop, close dialog, stay in form
   - If "Tetap Tambah" → Continue to save
6. If saved → Toast alert will show (Fitur 1)
```

### 🎨 Dialog UI Design

```
┌──────────────────────────────────────────────────┐
│ ⚠️  YAKIN, NIH BOS?                              │
│                                                  │
│ Budget 'Game' lo bakal JEBOL nih kalo           │
│ ditambahin!                                      │
│                                                  │
│ 📊 Detail:                                       │
│ • Sekarang: Rp 450.000 / Rp 500.000 (90%)      │
│ • Bakal jadi: Rp 600.000 (120%) 🚨              │
│ • Lebih: +Rp 100.000 dari limit                 │
│                                                  │
│ Gimana nih?                                     │
│                                                  │
│  ┌─────────────┐  ┌──────────────────────────┐ │
│  │ Batal Aja   │  │ Bodo Amat, Tetap Tambah │ │
│  │ Deh         │  │ (Red/Destructive)       │ │
│  └─────────────┘  └──────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### 📝 Dialog Message Templates

**Single Entry Exceed:**
```typescript
const title = "⚠️ YAKIN, NIH BOS?";

const description = `
Budget '${categoryLabel}' lo bakal JEBOL nih kalo ditambahin!

📊 Detail:
• Sekarang: ${formatCurrency(currentTotal)} / ${formatCurrency(limit)} (${currentPercent}%)
• Bakal jadi: ${formatCurrency(projectedTotal)} (${projectedPercent}%) 🚨
• Lebih: +${formatCurrency(excess)} dari limit

Gimana nih?
`;
```

**Multiple Entries (Multiple categories exceed):**
```typescript
const title = "⚠️ WADUH! BANYAK BUDGET BAKAL JEBOL!";

const description = `
Beberapa budget bakal jebol kalo lo tetap nambah:

${categoriesExceeded.map(cat => `
• ${cat.label}:
  - Sekarang: ${formatCurrency(cat.current)} (${cat.currentPercent}%)
  - Bakal jadi: ${formatCurrency(cat.projected)} (${cat.projectedPercent}%) 🚨
`).join('\n')}

Serius mau lanjut?
`;
```

### 🔧 Implementation Plan

**File:** `/components/BudgetExceedDialog.tsx` (NEW)
```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { formatCurrency } from "../utils/currency";

export interface BudgetExceedInfo {
  categoryId: string;
  categoryLabel: string;
  currentTotal: number;
  projectedTotal: number;
  limit: number;
  excess: number;
  currentPercent: number;
  projectedPercent: number;
}

interface BudgetExceedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exceedingCategories: BudgetExceedInfo[];
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BudgetExceedDialog({
  open,
  onOpenChange,
  exceedingCategories,
  onConfirm,
  onCancel,
  isLoading = false,
}: BudgetExceedDialogProps) {
  const isSingle = exceedingCategories.length === 1;
  const first = exceedingCategories[0];

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isSingle ? "⚠️ YAKIN, NIH BOS?" : "⚠️ WADUH! BANYAK BUDGET BAKAL JEBOL!"}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-left">
              {isSingle ? (
                <>
                  <p>
                    Budget <strong>'{first.categoryLabel}'</strong> lo bakal JEBOL nih kalo ditambahin!
                  </p>
                  <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                    <p className="font-medium">📊 Detail:</p>
                    <p>
                      • Sekarang: {formatCurrency(first.currentTotal)} / {formatCurrency(first.limit)} 
                      ({first.currentPercent}%)
                    </p>
                    <p className="text-destructive font-medium">
                      • Bakal jadi: {formatCurrency(first.projectedTotal)} ({first.projectedPercent}%) 🚨
                    </p>
                    <p>
                      • Lebih: +{formatCurrency(first.excess)} dari limit
                    </p>
                  </div>
                  <p>Gimana nih?</p>
                </>
              ) : (
                <>
                  <p>Beberapa budget bakal jebol kalo lo tetap nambah:</p>
                  <div className="bg-muted p-3 rounded-md space-y-2 text-sm max-h-[200px] overflow-y-auto">
                    {exceedingCategories.map(cat => (
                      <div key={cat.categoryId} className="space-y-1">
                        <p className="font-medium">• {cat.categoryLabel}:</p>
                        <p className="ml-4">
                          - Sekarang: {formatCurrency(cat.currentTotal)} ({cat.currentPercent}%)
                        </p>
                        <p className="ml-4 text-destructive font-medium">
                          - Bakal jadi: {formatCurrency(cat.projectedTotal)} ({cat.projectedPercent}%) 🚨
                        </p>
                      </div>
                    ))}
                  </div>
                  <p>Serius mau lanjut?</p>
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            Batal Aja Deh
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? "Memproses..." : "Bodo Amat, Tetap Tambah"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

**Integration in AddExpenseForm.tsx:**
```typescript
import { BudgetExceedDialog, BudgetExceedInfo } from './BudgetExceedDialog';

// State
const [showBudgetDialog, setShowBudgetDialog] = useState(false);
const [exceedingCategories, setExceedingCategories] = useState<BudgetExceedInfo[]>([]);
const [pendingSubmit, setPendingSubmit] = useState(false);

// Modified submit handler
const handleSubmitMultiple = async () => {
  const validEntries = entries.filter(/* ... */);
  if (validEntries.length === 0) return;
  
  // Check if any entries will exceed budget
  const exceeding: BudgetExceedInfo[] = [];
  
  for (const entry of validEntries) {
    if (entry.category && settings?.budgets?.[entry.category]) {
      const budgetConfig = settings.budgets[entry.category];
      const currentTotal = calculateCategoryTotal(entry.category, expenses);
      const finalAmount = entry.calculatedAmount || Number(entry.amount);
      const projectedTotal = currentTotal + finalAmount;
      
      // Will it exceed?
      if (projectedTotal > budgetConfig.limit) {
        const excess = projectedTotal - budgetConfig.limit;
        const currentPercent = Math.round((currentTotal / budgetConfig.limit) * 100);
        const projectedPercent = Math.round((projectedTotal / budgetConfig.limit) * 100);
        
        exceeding.push({
          categoryId: entry.category,
          categoryLabel: getCategoryLabel(entry.category, settings),
          currentTotal,
          projectedTotal,
          limit: budgetConfig.limit,
          excess,
          currentPercent,
          projectedPercent
        });
      }
    }
  }
  
  // If any will exceed, show dialog first
  if (exceeding.length > 0) {
    setExceedingCategories(exceeding);
    setShowBudgetDialog(true);
    setPendingSubmit(true);
    return; // Stop here, wait for user confirmation
  }
  
  // If no budget exceeded, proceed normally
  await proceedWithSubmit();
};

// Actual submit logic (called after confirmation or if no exceed)
const proceedWithSubmit = async () => {
  const validEntries = entries.filter(/* ... */);
  const groupId = validEntries.length > 1 ? crypto.randomUUID() : undefined;
  const isBatch = validEntries.length > 1;
  const fullTimestamp = date;

  try {
    for (let i = 0; i < validEntries.length; i++) {
      const entry = validEntries[i];
      const finalAmount = entry.calculatedAmount || Number(entry.amount);
      const finalName = entry.name.trim() || formatDateToIndonesian(date);
      const isLast = i === validEntries.length - 1;
      
      // Before save, get old total for alert
      let oldTotal = 0;
      if (entry.category && settings?.budgets?.[entry.category]) {
        oldTotal = calculateCategoryTotal(entry.category, expenses);
      }
      
      await onAddExpense(/* ... */);
      
      // After save, show budget alert if needed (Fitur 1)
      if (entry.category && settings?.budgets?.[entry.category]) {
        const budgetConfig = settings.budgets[entry.category];
        const newTotal = oldTotal + finalAmount;
        const categoryLabel = getCategoryLabel(entry.category, settings);
        
        showBudgetAlertIfNeeded({
          categoryId: entry.category,
          categoryLabel,
          oldTotal,
          newTotal,
          limit: budgetConfig.limit,
          warningAt: budgetConfig.warningAt
        });
      }
    }

    if (isBatch) {
      const { toast } = await import("sonner@2.0.3");
      toast.success(`${validEntries.length} pengeluaran berhasil ditambahkan`);
    }

    if (onSuccess) onSuccess();
    resetEntries();
  } catch (error) {
    const { toast } = await import("sonner@2.0.3");
    toast.error("Gagal menambahkan pengeluaran");
  } finally {
    setPendingSubmit(false);
  }
};

// Dialog handlers
const handleBudgetConfirm = async () => {
  await proceedWithSubmit();
};

const handleBudgetCancel = () => {
  setPendingSubmit(false);
  // Stay in form, don't reset
};

// In JSX:
<BudgetExceedDialog
  open={showBudgetDialog}
  onOpenChange={setShowBudgetDialog}
  exceedingCategories={exceedingCategories}
  onConfirm={handleBudgetConfirm}
  onCancel={handleBudgetCancel}
  isLoading={pendingSubmit}
/>
```

---

## 📊 DATA REQUIREMENTS

### Required Data Access

1. **Category Budget Settings:**
   ```typescript
   settings.budgets = {
     'game': {
       limit: 500000,
       warningAt: 80
     },
     'food': {
       limit: 2000000,
       warningAt: 80
     }
     // ...
   }
   ```

2. **Current Month Expenses:**
   ```typescript
   // Need to calculate current total per category
   function calculateCategoryTotal(categoryId: string, expenses: Expense[]): number {
     return expenses
       .filter(exp => exp.category === categoryId)
       .reduce((sum, exp) => sum + exp.amount, 0);
   }
   ```

3. **Category Labels:**
   ```typescript
   import { getCategoryLabel } from '../utils/calculations';
   const label = getCategoryLabel(categoryId, settings);
   ```

---

## 🔄 USER FLOW COMPARISON

### Scenario 1: No Budget Limit
```
User adds expense → Save → Success toast ✅
(No budget alerts)
```

### Scenario 2: Budget Safe (< 80%)
```
User adds expense → Save → Success toast ✅
(No budget alerts)
```

### Scenario 3: Budget Warning (80-89%)
```
User adds expense → Save → Success toast ✅
                         → Budget Warning Toast 😅
```

### Scenario 4: Budget Danger (90-99%)
```
User adds expense → Save → Success toast ✅
                         → Budget Danger Toast 😱
```

### Scenario 5: Will Exceed Budget (100%+)
```
User clicks "Simpan" → Confirmation Dialog ⚠️
                            ↓
                       User chooses:
                       - "Batal" → Stay in form
                       - "Tetap Tambah" → Save → Success toast ✅
                                               → Budget Exceeded Toast 🚨
```

---

## 🧪 TESTING SCENARIOS

### Test Case 1: Toast Alert - Warning
```
Setup:
- Category: Game
- Limit: Rp 500.000
- Current: Rp 350.000 (70% - Safe)
- New expense: Rp 75.000

Expected:
- New total: Rp 425.000 (85% - Warning)
- Show warning toast: "😅 Hati-hati, Bos! Budget 'Game'..."
```

### Test Case 2: Toast Alert - Danger
```
Setup:
- Category: Game
- Limit: Rp 500.000
- Current: Rp 430.000 (86% - Warning)
- New expense: Rp 25.000

Expected:
- New total: Rp 455.000 (91% - Danger)
- Show danger toast: "😱 Awas! Budget 'Game'..."
```

### Test Case 3: Confirmation Dialog - Single Category
```
Setup:
- Category: Game
- Limit: Rp 500.000
- Current: Rp 450.000 (90% - Danger)
- New expense: Rp 100.000

Expected Before Save:
- Projection: Rp 550.000 (110% - Will Exceed)
- Show dialog: "⚠️ YAKIN, NIH BOS?"

If User Cancels:
- Stay in form
- No save
- No toast

If User Confirms:
- Save expense
- Show exceeded toast: "🚨 WADUH! Budget 'Game' JEBOL!"
```

### Test Case 4: Confirmation Dialog - Multiple Categories
```
Setup:
- Entry 1: Game, Rp 100.000 (will exceed)
- Entry 2: Food, Rp 500.000 (will exceed)
- Entry 3: Transport, Rp 50.000 (safe)

Expected:
- Show dialog with 2 exceeding categories
- If confirmed, save all 3
- Show 2 exceeded toasts (for Game & Food)
```

### Test Case 5: No Alert When Status Same
```
Setup:
- Category: Game
- Limit: Rp 500.000
- Current: Rp 425.000 (85% - Warning)
- New expense: Rp 20.000

Expected:
- New total: Rp 445.000 (89% - Still Warning)
- NO toast (status didn't change)
```

---

## 🎨 DESIGN CONSIDERATIONS

### Toast Styling
- Use Sonner toast library (already in project)
- Custom colors per status level
- Auto-dismiss with longer duration for severe alerts
- Mobile-friendly positioning

### Dialog Styling
- Use AlertDialog from shadcn/ui (already in project)
- Clear visual hierarchy
- Destructive styling for "Tetap Tambah" button
- Mobile responsive

### Performance
- Calculate totals efficiently (reuse existing data)
- Debounce rapid successive alerts
- Don't block UI during calculation

---

## 📁 FILE STRUCTURE

```
/utils/
  budgetAlerts.ts                 (NEW) - Toast alert logic
  
/components/
  BudgetExceedDialog.tsx          (NEW) - Confirmation dialog
  AddExpenseForm.tsx              (MODIFY) - Add alert integration
  AddExpenseDialog.tsx            (MODIFY) - Pass budget data
  
/hooks/
  useBudgetAlerts.ts              (NEW, OPTIONAL) - Hook for easier integration
```

---

## 🚀 IMPLEMENTATION ORDER

1. **Phase 1: Toast Alert (Fitur 1)**
   - Create `/utils/budgetAlerts.ts`
   - Implement status change detection
   - Implement toast messages with tone of voice
   - Integrate in `AddExpenseForm.tsx`
   - Test all status transitions

2. **Phase 2: Confirmation Dialog (Fitur 2)**
   - Create `/components/BudgetExceedDialog.tsx`
   - Implement projection logic
   - Integrate in `AddExpenseForm.tsx` (before save)
   - Handle user decision flow
   - Test exceed scenarios

3. **Phase 3: Integration & Testing**
   - Test both features together
   - Test edge cases (multiple entries, multiple categories)
   - Mobile testing
   - Performance testing

---

## ⚠️ EDGE CASES TO HANDLE

1. **No Budget Limit Set**
   - Don't show any alerts
   - Just save normally

2. **Category Without Budget**
   - Don't check/alert for that category
   - Only check categories with limits

3. **Multiple Entries, Multiple Exceeds**
   - Show dialog with ALL exceeding categories
   - If confirmed, save all and show multiple toasts

4. **User Edits Entry After Dialog**
   - If form values change, recalculate
   - May need to show dialog again

5. **Rapid Successive Saves**
   - Don't spam toasts
   - Maybe debounce or queue alerts

6. **Offline Mode**
   - Can't calculate accurate total if expenses not synced
   - Show warning or skip alert?

---

## 🎯 SUCCESS CRITERIA

✅ **Toast Alerts:**
- Shows ONLY when status level increases
- Correct message per status (Warning/Danger/Exceeded)
- Proper formatting with category label and amounts
- Auto-dismisses after appropriate duration
- Works on both desktop & mobile

✅ **Confirmation Dialog:**
- Shows BEFORE save when budget will be exceeded
- Accurate projection calculation
- Clear messaging with detail breakdown
- "Batal" keeps user in form without saving
- "Tetap Tambah" continues with save + shows toast alert
- Works for single and multiple entries

✅ **User Experience:**
- Not annoying (only shows when truly needed)
- Tone of voice matches app personality
- Helpful information displayed
- Clear call-to-action
- Responsive on all screen sizes

---

## 📝 NOTES FOR AI IMPLEMENTATION

1. **Import Currency Formatter:**
   ```typescript
   import { formatCurrency } from '../utils/currency';
   ```

2. **Import Toast:**
   ```typescript
   import { toast } from 'sonner@2.0.3';
   ```

3. **Use Existing Components:**
   - AlertDialog from shadcn/ui
   - Badge, Card, etc. for styling

4. **Get Expense Data:**
   - May need to fetch current month expenses
   - Or pass from parent component if already available

5. **Tone of Voice:**
   - Keep it casual, friendly, slightly humorous
   - Use Indonesian slang appropriately
   - Examples: "Bos", "lo", "gawat", "anjay", etc.

6. **Mobile Considerations:**
   - Toast position should not block FAB
   - Dialog should be scrollable on small screens
   - Touch-friendly button sizes

---

**READY FOR IMPLEMENTATION!** 🚀
