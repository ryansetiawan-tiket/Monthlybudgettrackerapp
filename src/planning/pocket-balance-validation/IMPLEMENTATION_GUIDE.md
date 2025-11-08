# Pocket Balance Validation - Implementation Guide

**Step-by-Step Coding Instructions**  
**Date:** November 8, 2025  
**Estimated Time:** 90-120 minutes

---

## 📋 TABLE OF CONTENTS

1. [Pre-Implementation Checklist](#pre-implementation-checklist)
2. [Step 1: Create InsufficientBalanceDialog](#step-1-create-insufficientbalancedialog)
3. [Step 2: Add Validation to AddExpenseForm](#step-2-add-validation-to-addexpenseform)
4. [Step 3: Add Validation to TransferDialog](#step-3-add-validation-to-transferdialog)
5. [Step 4: Add Validation to AdditionalIncomeForm](#step-4-add-validation-to-additionalincomeform)
6. [Step 5: Testing](#step-5-testing)
7. [Step 6: Verification](#step-6-verification)
8. [Troubleshooting](#troubleshooting)

---

## ✅ PRE-IMPLEMENTATION CHECKLIST

Before starting:

- [ ] Read [PLANNING.md](PLANNING.md) completely
- [ ] Reviewed [VISUAL_MOCKUPS.md](VISUAL_MOCKUPS.md)
- [ ] Understand pocket balance system
- [ ] Understand existing form components
- [ ] Development environment ready
- [ ] Git branch created (`feature/pocket-balance-validation`)
- [ ] No pending changes to commit

---

## 🔨 STEP 1: CREATE INSUFFICIENTBALANCEDIALOG

### 1.1 Create New File

**Path:** `/components/InsufficientBalanceDialog.tsx`

### 1.2 Full Component Code

```typescript
/**
 * InsufficientBalanceDialog Component
 * 
 * Reactive validation dialog that blocks transactions
 * when pocket balance is insufficient.
 * 
 * This is a fail-safe mechanism in case proactive
 * validation is bypassed due to bugs or race conditions.
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { formatCurrency } from "../utils/currency";

interface InsufficientBalanceDialogProps {
  /** Dialog open state */
  open: boolean;
  /** Callback to control dialog state */
  onOpenChange: (open: boolean) => void;
  /** Name of the pocket with insufficient balance */
  pocketName: string;
  /** Available balance in the pocket */
  availableBalance: number;
  /** Amount user attempted to transact */
  attemptedAmount: number;
}

/**
 * Displays a blocking dialog when a transaction exceeds pocket balance
 * 
 * @example
 * <InsufficientBalanceDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   pocketName="Game"
 *   availableBalance={500000}
 *   attemptedAmount={750000}
 * />
 */
export function InsufficientBalanceDialog({
  open,
  onOpenChange,
  pocketName,
  availableBalance,
  attemptedAmount,
}: InsufficientBalanceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl">⛔️</span>
            SALDONYA NGGAK CUKUP, BOS!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-neutral-300 leading-relaxed">
            Duit di kantong{' '}
            <span className="font-semibold text-white">'{pocketName}'</span>{' '}
            (sisa{' '}
            <span className="font-semibold text-yellow-500">
              {formatCurrency(availableBalance)}
            </span>
            ) nggak cukup buat transaksi{' '}
            <span className="font-semibold text-red-500">
              {formatCurrency(attemptedAmount)}
            </span>{' '}
            ini.
          </p>
          
          <p className="text-neutral-400 text-sm">
            Coba cek lagi angkanya.
          </p>
        </div>
        
        <DialogFooter>
          <Button
            variant="default"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Oke, Aku Ngerti
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 1.3 Verification Checklist

After creating the file:

- [ ] File created at `/components/InsufficientBalanceDialog.tsx`
- [ ] All imports correct
- [ ] Props interface defined
- [ ] Component exports properly
- [ ] TypeScript has no errors
- [ ] formatCurrency imported from utils

---

## 🔧 STEP 2: ADD VALIDATION TO ADDEXPENSEFORM

### 2.1 Import Dependencies

**File:** `/components/AddExpenseForm.tsx`

**Add to imports (around line 1-10):**

```typescript
import { InsufficientBalanceDialog } from "./InsufficientBalanceDialog";
import { formatCurrency } from "../utils/currency";
```

### 2.2 Add State Variables

**Location:** After existing useState declarations (around line 30-50)

**Add these states:**

```typescript
// Balance validation state
const [balanceError, setBalanceError] = useState<string | null>(null);
const [isInsufficientBalance, setIsInsufficientBalance] = useState(false);

// Reactive validation dialog state
const [showInsufficientDialog, setShowInsufficientDialog] = useState(false);
const [insufficientDetails, setInsufficientDetails] = useState<{
  pocketName: string;
  availableBalance: number;
  attemptedAmount: number;
} | null>(null);
```

### 2.3 Create Validation Function

**Location:** Before handleSubmit function

**Add this function:**

```typescript
/**
 * Validates if the expense amount exceeds the selected pocket's balance
 * Shows inline error and disables submit button if insufficient
 */
const validateBalance = useCallback((
  amount: number,
  pocketId: string | undefined,
  balances: Map<string, { availableBalance: number }> | undefined,
  pockets: Array<{ id: string; name: string }>
) => {
  // Skip validation if no pocket selected or no amount
  if (!pocketId || !amount || amount <= 0) {
    setBalanceError(null);
    setIsInsufficientBalance(false);
    return true;
  }

  // Skip if balances not loaded yet
  if (!balances) {
    setBalanceError(null);
    setIsInsufficientBalance(false);
    return true;
  }

  // Get pocket balance
  const pocket = balances.get(pocketId);
  if (!pocket) {
    // Pocket not found in balances (shouldn't happen, but be safe)
    setBalanceError(null);
    setIsInsufficientBalance(false);
    return true;
  }

  const available = pocket.availableBalance;
  
  // Check if amount exceeds available balance
  if (amount > available) {
    const pocketName = pockets.find(p => p.id === pocketId)?.name || 'kantong ini';
    setBalanceError(
      `Waduh, Bos! Duit di kantong '${pocketName}' (sisa ${formatCurrency(available)}) ` +
      `nggak cukup buat bayar ${formatCurrency(amount)}.`
    );
    setIsInsufficientBalance(true);
    return false;
  }

  // All good!
  setBalanceError(null);
  setIsInsufficientBalance(false);
  return true;
}, []);
```

### 2.4 Add Real-time Validation (useEffect)

**Location:** After useState declarations, before handleSubmit

**Add these useEffects:**

```typescript
// Validate when amount changes (debounced)
useEffect(() => {
  const timeoutId = setTimeout(() => {
    validateBalance(amount, selectedPocket, balances, pockets || []);
  }, 300); // Debounce 300ms

  return () => clearTimeout(timeoutId);
}, [amount, selectedPocket, balances, pockets, validateBalance]);

// Validate when pocket changes (immediate)
useEffect(() => {
  if (selectedPocket) {
    validateBalance(amount, selectedPocket, balances, pockets || []);
  }
}, [selectedPocket, amount, balances, pockets, validateBalance]);
```

### 2.5 Update Submit Handler

**Location:** Find the existing `handleSubmit` function

**Add validation check at the beginning:**

```typescript
const handleSubmit = async () => {
  // VALIDATION 1: Basic field validation (existing)
  if (!name || !amount) {
    toast.error("Nama dan jumlah harus diisi");
    return;
  }

  // VALIDATION 2: Balance validation (NEW! - Reactive fail-safe)
  if (selectedPocket && balances) {
    const pocket = balances.get(selectedPocket);
    if (pocket && amount > pocket.availableBalance) {
      const pocketName = pockets?.find(p => p.id === selectedPocket)?.name || 'kantong ini';
      setInsufficientDetails({
        pocketName,
        availableBalance: pocket.availableBalance,
        attemptedAmount: amount,
      });
      setShowInsufficientDialog(true);
      return; // BLOCK SUBMISSION!
    }
  }

  // ... rest of existing submit logic
};
```

### 2.6 Update Button Disable Logic

**Location:** Find where submit button is rendered

**Update the disabled condition:**

```typescript
const isSubmitDisabled = useMemo(() => {
  return (
    isAdding ||
    isInsufficientBalance || // NEW!
    !name ||
    !amount ||
    amount <= 0
  );
}, [isAdding, isInsufficientBalance, name, amount]);
```

### 2.7 Update UI - Add Error Display

**Location:** Find where the Amount input is rendered

**After the Amount input, add:**

```tsx
{/* Amount input */}
<Input
  type="number"
  value={amount}
  onChange={(e) => setAmount(Number(e.target.value))}
  className={balanceError ? "border-red-500" : ""}
/>

{/* Balance Error Message (NEW!) */}
{balanceError && (
  <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
    <span className="text-red-500 text-lg flex-shrink-0">⛔️</span>
    <p className="text-sm text-red-500 leading-relaxed">{balanceError}</p>
  </div>
)}
```

### 2.8 Update UI - Render Dialog

**Location:** End of component JSX, before closing tag

**Add the dialog:**

```tsx
{/* Insufficient Balance Dialog (Reactive Fail-safe) */}
{insufficientDetails && (
  <InsufficientBalanceDialog
    open={showInsufficientDialog}
    onOpenChange={setShowInsufficientDialog}
    pocketName={insufficientDetails.pocketName}
    availableBalance={insufficientDetails.availableBalance}
    attemptedAmount={insufficientDetails.attemptedAmount}
  />
)}
```

### 2.9 Verification Checklist

- [ ] State variables added
- [ ] validateBalance function created
- [ ] useEffect hooks added (debounced + immediate)
- [ ] Submit handler updated with validation
- [ ] Button disable logic updated
- [ ] Error message UI added
- [ ] Dialog rendered
- [ ] No TypeScript errors

---

## 🔄 STEP 3: ADD VALIDATION TO TRANSFERDIALOG

### 3.1 Import Dependencies

**File:** `/components/TransferDialog.tsx`

**Add to imports:**

```typescript
import { InsufficientBalanceDialog } from "./InsufficientBalanceDialog";
import { formatCurrency } from "../utils/currency";
```

### 3.2 Add State Variables

**Add these states:**

```typescript
// Balance validation state
const [balanceError, setBalanceError] = useState<string | null>(null);
const [isInsufficientBalance, setIsInsufficientBalance] = useState(false);

// Reactive validation dialog state
const [showInsufficientDialog, setShowInsufficientDialog] = useState(false);
const [insufficientDetails, setInsufficientDetails] = useState<{
  pocketName: string;
  availableBalance: number;
  attemptedAmount: number;
} | null>(null);
```

### 3.3 Create Validation Function

```typescript
/**
 * Validates if the transfer amount exceeds the FROM pocket's balance
 */
const validateTransferBalance = useCallback((
  amount: number,
  fromPocketId: string | undefined,
  balances: Map<string, { availableBalance: number }> | undefined,
  pockets: Array<{ id: string; name: string }>
) => {
  // Skip validation if no FROM pocket selected or no amount
  if (!fromPocketId || !amount || amount <= 0) {
    setBalanceError(null);
    setIsInsufficientBalance(false);
    return true;
  }

  // Skip if balances not loaded yet
  if (!balances) {
    setBalanceError(null);
    setIsInsufficientBalance(false);
    return true;
  }

  // Get FROM pocket balance
  const fromPocket = balances.get(fromPocketId);
  if (!fromPocket) {
    setBalanceError(null);
    setIsInsufficientBalance(false);
    return true;
  }

  const available = fromPocket.availableBalance;
  
  // Check if transfer amount exceeds available balance
  if (amount > available) {
    const pocketName = pockets.find(p => p.id === fromPocketId)?.name || 'kantong ini';
    setBalanceError(
      `Waduh, Bos! Duit di kantong '${pocketName}' (sisa ${formatCurrency(available)}) ` +
      `nggak cukup buat transfer ${formatCurrency(amount)}.`
    );
    setIsInsufficientBalance(true);
    return false;
  }

  // All good!
  setBalanceError(null);
  setIsInsufficientBalance(false);
  return true;
}, []);
```

### 3.4 Add Real-time Validation

```typescript
// Validate when amount changes (debounced)
useEffect(() => {
  const timeoutId = setTimeout(() => {
    validateTransferBalance(amount, fromPocket, balances, pockets || []);
  }, 300);

  return () => clearTimeout(timeoutId);
}, [amount, fromPocket, balances, pockets, validateTransferBalance]);

// Validate when FROM pocket changes (immediate)
useEffect(() => {
  if (fromPocket) {
    validateTransferBalance(amount, fromPocket, balances, pockets || []);
  }
}, [fromPocket, amount, balances, pockets, validateTransferBalance]);
```

### 3.5 Update Submit Handler

```typescript
const handleTransfer = async () => {
  // Basic validation (existing)
  if (!fromPocket || !toPocket || !amount) {
    toast.error("Semua field harus diisi");
    return;
  }

  if (fromPocket === toPocket) {
    toast.error("Tidak bisa transfer ke kantong yang sama");
    return;
  }

  // BALANCE VALIDATION (NEW! - Reactive fail-safe)
  if (balances) {
    const pocket = balances.get(fromPocket);
    if (pocket && amount > pocket.availableBalance) {
      const pocketName = pockets?.find(p => p.id === fromPocket)?.name || 'kantong ini';
      setInsufficientDetails({
        pocketName,
        availableBalance: pocket.availableBalance,
        attemptedAmount: amount,
      });
      setShowInsufficientDialog(true);
      return; // BLOCK TRANSFER!
    }
  }

  // ... rest of existing transfer logic
};
```

### 3.6 Update Button Disable Logic

```typescript
const isTransferDisabled = useMemo(() => {
  return (
    isTransferring ||
    isInsufficientBalance || // NEW!
    !fromPocket ||
    !toPocket ||
    !amount ||
    amount <= 0 ||
    fromPocket === toPocket
  );
}, [isTransferring, isInsufficientBalance, fromPocket, toPocket, amount]);
```

### 3.7 Update UI - Add Error Display

**After Amount input:**

```tsx
<Input
  type="number"
  value={amount}
  onChange={(e) => setAmount(Number(e.target.value))}
  className={balanceError ? "border-red-500" : ""}
/>

{/* Balance Error Message */}
{balanceError && (
  <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
    <span className="text-red-500 text-lg flex-shrink-0">⛔️</span>
    <p className="text-sm text-red-500 leading-relaxed">{balanceError}</p>
  </div>
)}
```

### 3.8 Render Dialog

```tsx
{/* Insufficient Balance Dialog */}
{insufficientDetails && (
  <InsufficientBalanceDialog
    open={showInsufficientDialog}
    onOpenChange={setShowInsufficientDialog}
    pocketName={insufficientDetails.pocketName}
    availableBalance={insufficientDetails.availableBalance}
    attemptedAmount={insufficientDetails.attemptedAmount}
  />
)}
```

### 3.9 Verification Checklist

- [ ] State variables added
- [ ] validateTransferBalance function created
- [ ] useEffect hooks added
- [ ] Submit handler updated
- [ ] Button disable logic updated
- [ ] Error message UI added
- [ ] Dialog rendered
- [ ] No TypeScript errors

---

## 💰 STEP 4: ADD VALIDATION TO ADDITIONALINCOMEFORM

### 4.1 Import Dependencies

**File:** `/components/AdditionalIncomeForm.tsx`

**Add to imports:**

```typescript
import { InsufficientBalanceDialog } from "./InsufficientBalanceDialog";
import { formatCurrency } from "../utils/currency";
```

### 4.2 Add State Variables

```typescript
// Balance validation state (for deduction validation)
const [balanceError, setBalanceError] = useState<string | null>(null);
const [isInsufficientBalance, setIsInsufficientBalance] = useState(false);

// Reactive validation dialog state
const [showInsufficientDialog, setShowInsufficientDialog] = useState(false);
const [insufficientDetails, setInsufficientDetails] = useState<{
  pocketName: string;
  availableBalance: number;
  attemptedAmount: number;
} | null>(null);
```

### 4.3 Create Validation Function

**NOTE:** Income validation is different - we validate the DEDUCTION field, not the income amount!

```typescript
/**
 * Validates if the deduction amount exceeds the target pocket's balance
 * 
 * IMPORTANT: Deduction is taken FROM the target pocket, so we validate against it
 */
const validateDeductionBalance = useCallback((
  deduction: number,
  targetPocketId: string | undefined,
  balances: Map<string, { availableBalance: number }> | undefined,
  pockets: Array<{ id: string; name: string }>
) => {
  // Skip validation if no deduction or no target pocket
  if (!targetPocketId || !deduction || deduction <= 0) {
    setBalanceError(null);
    setIsInsufficientBalance(false);
    return true;
  }

  // Skip if balances not loaded yet
  if (!balances) {
    setBalanceError(null);
    setIsInsufficientBalance(false);
    return true;
  }

  // Get target pocket balance
  const pocket = balances.get(targetPocketId);
  if (!pocket) {
    setBalanceError(null);
    setIsInsufficientBalance(false);
    return true;
  }

  const available = pocket.availableBalance;
  
  // Check if deduction exceeds available balance
  if (deduction > available) {
    const pocketName = pockets.find(p => p.id === targetPocketId)?.name || 'kantong ini';
    setBalanceError(
      `Waduh, Bos! Duit di kantong '${pocketName}' (sisa ${formatCurrency(available)}) ` +
      `nggak cukup buat potong ${formatCurrency(deduction)}.`
    );
    setIsInsufficientBalance(true);
    return false;
  }

  // All good!
  setBalanceError(null);
  setIsInsufficientBalance(false);
  return true;
}, []);
```

### 4.4 Add Real-time Validation

```typescript
// Validate when deduction changes (debounced)
useEffect(() => {
  const timeoutId = setTimeout(() => {
    validateDeductionBalance(deduction, targetPocket, balances, pockets || []);
  }, 300);

  return () => clearTimeout(timeoutId);
}, [deduction, targetPocket, balances, pockets, validateDeductionBalance]);

// Validate when target pocket changes (immediate)
useEffect(() => {
  if (targetPocket && deduction > 0) {
    validateDeductionBalance(deduction, targetPocket, balances, pockets || []);
  }
}, [targetPocket, deduction, balances, pockets, validateDeductionBalance]);
```

### 4.5 Update Submit Handler

```typescript
const handleSubmit = async () => {
  // Basic validation (existing)
  if (!name || !amountIDR) {
    toast.error("Nama dan jumlah harus diisi");
    return;
  }

  // DEDUCTION BALANCE VALIDATION (NEW! - Reactive fail-safe)
  if (targetPocket && deduction > 0 && balances) {
    const pocket = balances.get(targetPocket);
    if (pocket && deduction > pocket.availableBalance) {
      const pocketName = pockets?.find(p => p.id === targetPocket)?.name || 'kantong ini';
      setInsufficientDetails({
        pocketName,
        availableBalance: pocket.availableBalance,
        attemptedAmount: deduction,
      });
      setShowInsufficientDialog(true);
      return; // BLOCK SUBMISSION!
    }
  }

  // ... rest of existing submit logic
};
```

### 4.6 Update Button Disable Logic

```typescript
const isSubmitDisabled = useMemo(() => {
  return (
    isAdding ||
    isInsufficientBalance || // NEW!
    !name ||
    !amountIDR ||
    amountIDR <= 0
  );
}, [isAdding, isInsufficientBalance, name, amountIDR]);
```

### 4.7 Update UI - Add Error Display

**After Deduction input:**

```tsx
<Input
  type="number"
  value={deduction}
  onChange={(e) => setDeduction(Number(e.target.value))}
  placeholder="0"
  className={balanceError ? "border-red-500" : ""}
/>

{/* Deduction Balance Error Message */}
{balanceError && (
  <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
    <span className="text-red-500 text-lg flex-shrink-0">⛔️</span>
    <p className="text-sm text-red-500 leading-relaxed">{balanceError}</p>
  </div>
)}
```

### 4.8 Render Dialog

```tsx
{/* Insufficient Balance Dialog */}
{insufficientDetails && (
  <InsufficientBalanceDialog
    open={showInsufficientDialog}
    onOpenChange={setShowInsufficientDialog}
    pocketName={insufficientDetails.pocketName}
    availableBalance={insufficientDetails.availableBalance}
    attemptedAmount={insufficientDetails.attemptedAmount}
  />
)}
```

### 4.9 Verification Checklist

- [ ] State variables added
- [ ] validateDeductionBalance function created
- [ ] useEffect hooks added
- [ ] Submit handler updated
- [ ] Button disable logic updated
- [ ] Error message UI added (after deduction input)
- [ ] Dialog rendered
- [ ] No TypeScript errors

---

## 🧪 STEP 5: TESTING

### Test Scenario 1: Expense Insufficient Balance

**Steps:**
1. Open AddExpenseForm (click FAB → Pengeluaran OR desktop button)
2. Enter name: "Test Expense"
3. Select pocket: "Game" (assume has Rp 500.000)
4. Enter amount: 750000
5. Wait 300ms (debounce)

**Expected:**
- ⛔️ Error message appears
- Input border turns red
- Button "Simpan" becomes disabled
- Error text: "Waduh, Bos! Duit di kantong 'Game' (sisa Rp 500.000) nggak cukup buat bayar Rp 750.000."

### Test Scenario 2: Fix Insufficient Amount

**Steps:**
1. Continue from Test 1 (error state)
2. Change amount to: 300000
3. Wait 300ms (debounce)

**Expected:**
- Error message disappears (smooth fade-out)
- Input border back to normal
- Button "Simpan" becomes enabled
- Can submit successfully

### Test Scenario 3: Transfer Insufficient Balance

**Steps:**
1. Open TransferDialog
2. From pocket: "Sehari-hari" (assume Rp 1.000.000)
3. To pocket: "Tabungan"
4. Amount: 1500000
5. Wait 300ms

**Expected:**
- Error message appears
- Button disabled
- Error mentions "transfer" (not "bayar")

### Test Scenario 4: Reactive Dialog Trigger

**Steps:**
1. Manually bypass validation (dev tools)
2. Click "Simpan" with insufficient balance

**Expected:**
- Dialog appears immediately
- Title: "⛔️ SALDONYA NGGAK CUKUP, BOS!"
- Transaction NOT saved
- Can dismiss dialog

### Test Scenario 5: Income Deduction Validation

**Steps:**
1. Open AdditionalIncomeForm
2. Enter income: 5000000
3. Target pocket: "Investasi" (assume Rp 800.000)
4. Deduction: 1000000
5. Wait 300ms

**Expected:**
- Error appears
- Error mentions "potong" (not "bayar" or "transfer")
- Button disabled

### Test Scenario 6: Exact Balance

**Steps:**
1. Open expense form
2. Pocket has exactly Rp 500.000
3. Enter amount: 500000

**Expected:**
- NO error (exact match is OK)
- Button enabled
- Can submit successfully

### Test Scenario 7: Switch Pocket Mid-Entry

**Steps:**
1. Enter amount: 1000000
2. Select pocket A (insufficient)
3. Error appears
4. Switch to pocket B (sufficient)

**Expected:**
- Error disappears immediately (no debounce)
- Button becomes enabled

### Test Scenario 8: Rapid Typing

**Steps:**
1. Type rapidly: 1 → 10 → 100 → 1000 → 10000 → 100000 → 1000000
2. Stop typing

**Expected:**
- No flickering errors during typing
- Single validation after 300ms from last keystroke
- Final state correct (error if insufficient)

---

## ✅ STEP 6: VERIFICATION

### 6.1 Code Quality Checklist

- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] No console errors
- [ ] Code formatted consistently
- [ ] All components documented
- [ ] No unused imports
- [ ] No hardcoded values

### 6.2 Functional Checklist

- [ ] Validation in AddExpenseForm works
- [ ] Validation in TransferDialog works
- [ ] Validation in AdditionalIncomeForm works
- [ ] Inline errors show correctly
- [ ] Buttons disable when insufficient
- [ ] Buttons enable when fixed
- [ ] Reactive dialog blocks transactions
- [ ] Debouncing works (no flicker)
- [ ] Immediate validation on pocket change

### 6.3 Visual Checklist

- [ ] Error message styling correct (red background)
- [ ] Input border red when error
- [ ] Animations smooth (fade in/out)
- [ ] Dialog styling matches design system
- [ ] Mobile responsive
- [ ] Desktop responsive

### 6.4 Edge Cases Checklist

- [ ] Handles zero amount
- [ ] Handles negative amount
- [ ] Handles no pocket selected
- [ ] Handles pocket not in balances
- [ ] Handles exact balance match
- [ ] Handles pocket switch mid-entry
- [ ] Handles rapid typing
- [ ] Handles balance changes (realtime)

---

## 🐛 TROUBLESHOOTING

### Issue: Error Message Flickers

**Symptom:** Error appears/disappears rapidly while typing

**Cause:** Debounce not working or too short

**Fix:**
1. Check debounce timeout is 300ms
2. Verify cleanup in useEffect return
3. Increase timeout if needed

---

### Issue: Button Still Enabled with Error

**Symptom:** Error shows but button not disabled

**Cause:** isInsufficientBalance not in disable logic

**Fix:**
```typescript
const isSubmitDisabled = useMemo(() => {
  return (
    isAdding ||
    isInsufficientBalance || // Must be here!
    !name ||
    !amount
  );
}, [isAdding, isInsufficientBalance, name, amount]);
```

---

### Issue: Validation Not Triggering

**Symptom:** No error even with insufficient balance

**Cause:** Missing dependency in useEffect or validation function

**Fix:**
1. Check all dependencies in useEffect array
2. Verify balances prop passed to component
3. Check pocket exists in balances Map

---

### Issue: Dialog Not Showing

**Symptom:** Reactive dialog doesn't appear

**Cause:** Missing state or render

**Fix:**
1. Verify `showInsufficientDialog` state exists
2. Check dialog component is rendered
3. Verify pre-submit validation runs

---

### Issue: Wrong Error Message

**Symptom:** Error says "bayar" for transfer, etc.

**Cause:** Copy-paste from AddExpenseForm

**Fix:**
- TransferDialog: Use "transfer" not "bayar"
- AdditionalIncomeForm: Use "potong" not "bayar"

---

## 📚 ADDITIONAL NOTES

### Performance Considerations

**Debounce Timing:**
- 300ms is optimal for balance between responsiveness and performance
- Too short (<200ms): Feels laggy, many validations
- Too long (>500ms): Feels unresponsive

**Memoization:**
- `validateBalance` is memoized with `useCallback`
- Button disable state uses `useMemo`
- Prevents unnecessary re-renders

### Accessibility

**ARIA Attributes:**
```tsx
<div
  role="alert"
  aria-live="polite"
  aria-atomic="true"
>
  {balanceError}
</div>

<button
  disabled={isSubmitDisabled}
  aria-disabled={isSubmitDisabled}
  aria-label={isInsufficientBalance ? "Simpan (Tidak tersedia karena saldo tidak cukup)" : "Simpan"}
>
  Simpan
</button>
```

### Animation Details

**Error Message:**
- Fade in: 200ms ease-out
- Slide from top: 8px
- Fade out: 150ms ease-in

**Using Tailwind:**
```tsx
className="animate-in fade-in slide-in-from-top-2 duration-200"
```

---

## 🎉 SUCCESS CRITERIA

Implementation is complete when:

✅ **All 3 forms have validation**  
✅ **Inline errors show correctly**  
✅ **Buttons disable appropriately**  
✅ **Reactive dialog blocks transactions**  
✅ **No TypeScript errors**  
✅ **No console errors**  
✅ **All tests pass**  
✅ **Mobile & desktop work**  
✅ **User experience smooth**

---

## 📝 POST-IMPLEMENTATION

After implementation:

1. [ ] Test thoroughly (all scenarios)
2. [ ] Document any edge cases found
3. [ ] Update changelog
4. [ ] Create PR with description
5. [ ] Request code review
6. [ ] Merge to main
7. [ ] Deploy to production
8. [ ] Monitor for issues
9. [ ] Celebrate! 🎉

---

**Implementation Guide Complete!**  
**Ready to Code!** 🚀

---

**Document Version:** 1.0  
**Last Updated:** November 8, 2025  
**Estimated Coding Time:** 90-120 minutes
