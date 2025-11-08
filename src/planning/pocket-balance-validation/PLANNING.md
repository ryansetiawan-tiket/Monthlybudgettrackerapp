# Pocket Balance Validation - Complete Planning Document

**Feature:** Real-time Pocket Balance Validation  
**Priority:** P0 - Critical Data Integrity  
**Date:** November 8, 2025  
**Estimated Time:** 90-120 minutes

---

## 📋 TABLE OF CONTENTS

1. [Problem Analysis](#problem-analysis)
2. [Solution Design](#solution-design)
3. [Technical Specification](#technical-specification)
4. [UI/UX Design](#uiux-design)
5. [Implementation Strategy](#implementation-strategy)
6. [Edge Cases](#edge-cases)
7. [Testing Plan](#testing-plan)
8. [Rollout Plan](#rollout-plan)

---

## 🔍 PROBLEM ANALYSIS

### Current Behavior (BROKEN!)

#### Scenario 1: Expense from Low Balance Pocket
```
User State:
- Kantong "Game": Rp 200.000 saldo
- User creates expense: Rp 500.000
- User selects pocket: "Game"
- User clicks "Simpan"

Current System Response:
❌ Validates: NOTHING
✅ Saves expense: Rp 500.000
💥 Result: Kantong "Game" saldo = -Rp 300.000 (NEGATIF!)
```

#### Scenario 2: Transfer Exceeding Balance
```
User State:
- Kantong "Sehari-hari": Rp 1.000.000
- User transfers: Rp 1.500.000
- From: "Sehari-hari" → To: "Tabungan"
- User clicks "Transfer"

Current System Response:
❌ Validates: NOTHING
✅ Saves transfer: Rp 1.500.000
💥 Result: Kantong "Sehari-hari" = -Rp 500.000 (NEGATIF!)
```

### Root Cause Analysis

**Missing Validation:**
1. ❌ No balance check in `AddExpenseForm`
2. ❌ No balance check in `AdditionalIncomeForm` (deduction)
3. ❌ No balance check in `TransferDialog`
4. ❌ No backend validation (trust frontend)

**Why This Happened:**
- Focus on feature velocity over validation
- Assumed users wouldn't do this (wrong!)
- No automated tests for edge cases

**Impact Assessment:**
- **Severity:** CRITICAL (data corruption)
- **Frequency:** Medium (users discover by accident)
- **User Impact:** HIGH (confusion, broken reports)
- **Business Impact:** HIGH (trust issues)

---

## 💡 SOLUTION DESIGN

### Design Principles

1. **Proactive > Reactive**
   - Prevent mistakes BEFORE they happen
   - Real-time feedback as user types
   - Disable actions when invalid

2. **Clear Communication**
   - Error messages in natural language (kocak tone)
   - Show WHAT's wrong and WHY
   - Suggest HOW to fix

3. **Defense in Depth**
   - Validation Layer 1: UI (proactive)
   - Validation Layer 2: Submit handler (reactive)
   - Validation Layer 3: Backend (future - nice to have)

### Validation Flow

```
┌─────────────────────────────────────────────┐
│ User Types Amount                           │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ onChange Event Fires                        │
│ - Debounced 300ms                          │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Validation Check:                           │
│ amount > pocket.availableBalance?           │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
   [TRUE]               [FALSE]
        │                   │
        ▼                   ▼
┌──────────────┐    ┌──────────────┐
│ Show Error   │    │ Hide Error   │
│ Disable Btn  │    │ Enable Btn   │
└──────────────┘    └──────────────┘
```

---

## 🔧 TECHNICAL SPECIFICATION

### 1. AddExpenseForm Validation

**File:** `/components/AddExpenseForm.tsx`

**State to Add:**
```typescript
const [balanceError, setBalanceError] = useState<string | null>(null);
const [isInsufficientBalance, setIsInsufficientBalance] = useState(false);
```

**Validation Function:**
```typescript
const validateBalance = useCallback((
  amount: number,
  pocketId: string,
  balances: Map<string, { availableBalance: number }>
) => {
  if (!pocketId || !amount || amount <= 0) {
    setBalanceError(null);
    setIsInsufficientBalance(false);
    return true;
  }

  const pocket = balances.get(pocketId);
  if (!pocket) {
    setBalanceError(null);
    setIsInsufficientBalance(false);
    return true;
  }

  const available = pocket.availableBalance;
  
  if (amount > available) {
    const pocketName = pockets.find(p => p.id === pocketId)?.name || 'kantong ini';
    setBalanceError(
      `Waduh, Bos! Duit di kantong '${pocketName}' (sisa ${formatCurrency(available)}) ` +
      `nggak cukup buat bayar ${formatCurrency(amount)}.`
    );
    setIsInsufficientBalance(true);
    return false;
  }

  setBalanceError(null);
  setIsInsufficientBalance(false);
  return true;
}, [pockets, balances]);
```

**Trigger Points:**
```typescript
// 1. When amount changes
useEffect(() => {
  const timeoutId = setTimeout(() => {
    validateBalance(amount, selectedPocket, balances);
  }, 300); // Debounce 300ms

  return () => clearTimeout(timeoutId);
}, [amount, selectedPocket, balances, validateBalance]);

// 2. When pocket changes
useEffect(() => {
  if (selectedPocket) {
    validateBalance(amount, selectedPocket, balances);
  }
}, [selectedPocket, amount, balances, validateBalance]);
```

**Button Disable Logic:**
```typescript
const isSubmitDisabled = useMemo(() => {
  return isAdding || isInsufficientBalance || !name || !amount;
}, [isAdding, isInsufficientBalance, name, amount]);
```

**UI Rendering:**
```tsx
{/* Amount Input */}
<Input
  type="number"
  value={amount}
  onChange={(e) => setAmount(Number(e.target.value))}
  className={balanceError ? "border-red-500" : ""}
/>

{/* Error Message */}
{balanceError && (
  <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
    <span className="text-red-500">⛔️</span>
    <p className="text-sm text-red-500">{balanceError}</p>
  </div>
)}

{/* Submit Button */}
<Button
  onClick={handleSubmit}
  disabled={isSubmitDisabled}
>
  {isAdding ? "Menyimpan..." : "Simpan"}
</Button>
```

---

### 2. TransferDialog Validation

**File:** `/components/TransferDialog.tsx`

**Similar Implementation:**

**State:**
```typescript
const [balanceError, setBalanceError] = useState<string | null>(null);
const [isInsufficientBalance, setIsInsufficientBalance] = useState(false);
```

**Validation Function:**
```typescript
const validateTransferBalance = useCallback((
  amount: number,
  fromPocketId: string,
  balances: Map<string, { availableBalance: number }>
) => {
  if (!fromPocketId || !amount || amount <= 0) {
    setBalanceError(null);
    setIsInsufficientBalance(false);
    return true;
  }

  const fromPocket = balances.get(fromPocketId);
  if (!fromPocket) {
    setBalanceError(null);
    setIsInsufficientBalance(false);
    return true;
  }

  const available = fromPocket.availableBalance;
  
  if (amount > available) {
    const pocketName = pockets.find(p => p.id === fromPocketId)?.name || 'kantong ini';
    setBalanceError(
      `Waduh, Bos! Duit di kantong '${pocketName}' (sisa ${formatCurrency(available)}) ` +
      `nggak cukup buat transfer ${formatCurrency(amount)}.`
    );
    setIsInsufficientBalance(true);
    return false;
  }

  setBalanceError(null);
  setIsInsufficientBalance(false);
  return true;
}, [pockets, balances]);
```

**Trigger:**
```typescript
useEffect(() => {
  const timeoutId = setTimeout(() => {
    validateTransferBalance(amount, fromPocket, balances);
  }, 300);

  return () => clearTimeout(timeoutId);
}, [amount, fromPocket, balances, validateTransferBalance]);
```

---

### 3. AdditionalIncomeForm Validation

**File:** `/components/AdditionalIncomeForm.tsx`

**Notes:**
- Income usually doesn't reduce balance (it adds!)
- BUT: Income has `deduction` field
- Deduction is taken from the target pocket
- So we need to validate: `deduction > targetPocket.availableBalance`

**Validation:**
```typescript
const validateDeductionBalance = useCallback((
  deduction: number,
  targetPocketId: string,
  balances: Map<string, { availableBalance: number }>
) => {
  if (!targetPocketId || !deduction || deduction <= 0) {
    setBalanceError(null);
    setIsInsufficientBalance(false);
    return true;
  }

  const pocket = balances.get(targetPocketId);
  if (!pocket) {
    setBalanceError(null);
    setIsInsufficientBalance(false);
    return true;
  }

  const available = pocket.availableBalance;
  
  if (deduction > available) {
    const pocketName = pockets.find(p => p.id === targetPocketId)?.name || 'kantong ini';
    setBalanceError(
      `Waduh, Bos! Duit di kantong '${pocketName}' (sisa ${formatCurrency(available)}) ` +
      `nggak cukup buat potong ${formatCurrency(deduction)}.`
    );
    setIsInsufficientBalance(true);
    return false;
  }

  setBalanceError(null);
  setIsInsufficientBalance(false);
  return true;
}, [pockets, balances]);
```

---

### 4. Reactive Validation (Fail-safe)

**Create New Component:** `/components/InsufficientBalanceDialog.tsx`

```typescript
interface InsufficientBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pocketName: string;
  availableBalance: number;
  attemptedAmount: number;
}

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
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">⛔️</span>
            SALDONYA NGGAK CUKUP, BOS!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-neutral-300">
            Duit di kantong <span className="font-semibold text-white">'{pocketName}'</span> 
            {' '}(sisa <span className="font-semibold text-yellow-500">{formatCurrency(availableBalance)}</span>) 
            {' '}nggak cukup buat transaksi <span className="font-semibold text-red-500">{formatCurrency(attemptedAmount)}</span> ini.
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

**Usage in Forms:**

```typescript
// State
const [showInsufficientDialog, setShowInsufficientDialog] = useState(false);
const [insufficientDetails, setInsufficientDetails] = useState<{
  pocketName: string;
  availableBalance: number;
  attemptedAmount: number;
} | null>(null);

// Pre-submit validation
const handleSubmit = async () => {
  // Final validation check (fail-safe)
  const pocket = balances.get(selectedPocket);
  if (pocket && amount > pocket.availableBalance) {
    const pocketName = pockets.find(p => p.id === selectedPocket)?.name || 'kantong ini';
    setInsufficientDetails({
      pocketName,
      availableBalance: pocket.availableBalance,
      attemptedAmount: amount,
    });
    setShowInsufficientDialog(true);
    return; // BLOCK!
  }

  // Proceed with submission...
  await onAddExpense(...);
};

// Render dialog
<InsufficientBalanceDialog
  open={showInsufficientDialog}
  onOpenChange={setShowInsufficientDialog}
  pocketName={insufficientDetails?.pocketName || ''}
  availableBalance={insufficientDetails?.availableBalance || 0}
  attemptedAmount={insufficientDetails?.attemptedAmount || 0}
/>
```

---

## 🎨 UI/UX DESIGN

### Error Message Patterns

#### Pattern 1: Expense
```
⛔️ Waduh, Bos! Duit di kantong 'Game' (sisa Rp 200.000) 
   nggak cukup buat bayar Rp 500.000.
```

#### Pattern 2: Transfer
```
⛔️ Waduh, Bos! Duit di kantong 'Sehari-hari' (sisa Rp 1.000.000) 
   nggak cukup buat transfer Rp 1.500.000.
```

#### Pattern 3: Income Deduction
```
⛔️ Waduh, Bos! Duit di kantong 'Investasi' (sisa Rp 100.000) 
   nggak cukup buat potong Rp 150.000.
```

### Visual States

#### State 1: Valid (Default)
```
┌─────────────────────────────────────┐
│ Jumlah                              │
│ ┌─────────────────────────────────┐ │
│ │ 100000                          │ │ ← Normal border
│ └─────────────────────────────────┘ │
│                                     │
│ [✓ Simpan]  ← Enabled              │
└─────────────────────────────────────┘
```

#### State 2: Insufficient Balance
```
┌─────────────────────────────────────┐
│ Jumlah                              │
│ ┌─────────────────────────────────┐ │
│ │ 500000                          │ │ ← Red border
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ⛔️ Waduh, Bos! Duit di kantong │ │
│ │ 'Game' (sisa Rp 200.000) nggak │ │ ← Red background
│ │ cukup buat bayar Rp 500.000.   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [🚫 Simpan]  ← Disabled             │
└─────────────────────────────────────┘
```

#### State 3: Dialog Blocker
```
┌─────────────────────────────────────┐
│ ⛔️ SALDONYA NGGAK CUKUP, BOS!      │
├─────────────────────────────────────┤
│ Duit di kantong 'Game' (sisa       │
│ Rp 200.000) nggak cukup buat       │
│ transaksi Rp 500.000 ini.          │
│                                     │
│ Coba cek lagi angkanya.            │
├─────────────────────────────────────┤
│         [ Oke, Aku Ngerti ]        │
└─────────────────────────────────────┘
```

---

## 🔨 IMPLEMENTATION STRATEGY

### Phase 1: Proactive Validation (60 min)

**Step 1.1: AddExpenseForm (20 min)**
1. Add state: `balanceError`, `isInsufficientBalance`
2. Create `validateBalance` function
3. Add `useEffect` for real-time validation
4. Update UI to show error
5. Update button disable logic

**Step 1.2: TransferDialog (20 min)**
1. Same as AddExpenseForm
2. Different error message (transfer vs bayar)

**Step 1.3: AdditionalIncomeForm (20 min)**
1. Similar logic for deduction validation
2. Only trigger when deduction > 0

---

### Phase 2: Reactive Validation (30 min)

**Step 2.1: Create InsufficientBalanceDialog (15 min)**
1. Create component file
2. Add props interface
3. Implement dialog UI
4. Export component

**Step 2.2: Integrate to Forms (15 min)**
1. Import dialog in each form
2. Add state for dialog
3. Add pre-submit validation
4. Render dialog

---

### Phase 3: Testing & Polish (30 min)

**Step 3.1: Manual Testing (15 min)**
- Test each form with insufficient balance
- Test edge cases
- Test mobile & desktop

**Step 3.2: Polish (15 min)**
- Adjust error messages
- Fine-tune debounce timing
- Verify accessibility

---

## 🐛 EDGE CASES

### Edge Case 1: Rapid Amount Changes
**Scenario:** User types quickly: 100 → 1000 → 10000  
**Solution:** Debounce validation (300ms)  
**Expected:** Only validates final value

### Edge Case 2: Pocket Switch Mid-Entry
**Scenario:** User enters 500K, then switches pocket  
**Solution:** Re-validate on pocket change  
**Expected:** Error updates immediately

### Edge Case 3: Balance Changes While Form Open
**Scenario:** User has form open, balance changes (realtime)  
**Solution:** `useEffect` watches `balances` dependency  
**Expected:** Validation updates automatically

### Edge Case 4: Zero or Negative Amount
**Scenario:** User enters 0 or negative  
**Solution:** Skip validation (other validations handle this)  
**Expected:** No balance error shown

### Edge Case 5: No Pocket Selected
**Scenario:** User enters amount but no pocket  
**Solution:** Skip validation  
**Expected:** No balance error (other validations handle)

### Edge Case 6: Pocket Not Found in Balances
**Scenario:** Race condition, pocket not loaded yet  
**Solution:** Assume valid, return early  
**Expected:** No false positive errors

### Edge Case 7: Exact Balance Match
**Scenario:** Amount === Available Balance  
**Solution:** Allow (not greater than)  
**Expected:** No error, button enabled

---

## 🧪 TESTING PLAN

### Test Case 1: Expense Insufficient Balance
```
GIVEN: Kantong "Game" has Rp 200.000
WHEN: User creates expense Rp 500.000 from "Game"
THEN:
  - Error message appears
  - Button is disabled
  - Message: "Waduh, Bos! Duit di kantong 'Game' (sisa Rp 200.000)..."
```

### Test Case 2: Expense Sufficient Balance
```
GIVEN: Kantong "Game" has Rp 500.000
WHEN: User creates expense Rp 200.000 from "Game"
THEN:
  - No error message
  - Button is enabled
  - Can submit successfully
```

### Test Case 3: Transfer Insufficient Balance
```
GIVEN: Kantong "Sehari-hari" has Rp 1.000.000
WHEN: User transfers Rp 1.500.000 to "Tabungan"
THEN:
  - Error message appears
  - Button is disabled
  - Message: "Waduh, Bos! Duit di kantong 'Sehari-hari'..."
```

### Test Case 4: Fix Insufficient to Sufficient
```
GIVEN: User has insufficient balance error
WHEN: User reduces amount to valid value
THEN:
  - Error disappears (debounced 300ms)
  - Button becomes enabled
```

### Test Case 5: Reactive Dialog Trigger
```
GIVEN: Validation somehow bypassed (bug/race)
WHEN: User clicks "Simpan" with insufficient balance
THEN:
  - Dialog appears
  - Transaction NOT saved
  - User must dismiss dialog
```

### Test Case 6: Exact Balance
```
GIVEN: Kantong has exactly Rp 500.000
WHEN: User creates expense Rp 500.000
THEN:
  - No error (exact match OK)
  - Can submit
  - Balance becomes Rp 0
```

---

## 📊 ROLLOUT PLAN

### Pre-Deployment Checklist
- [ ] All 3 forms have validation
- [ ] Dialog component created
- [ ] Error messages match tone
- [ ] Mobile tested
- [ ] Desktop tested
- [ ] Edge cases tested
- [ ] TypeScript no errors
- [ ] Console no errors

### Deployment Strategy
1. Deploy to staging
2. Test thoroughly
3. Monitor for 1 day
4. Deploy to production
5. Monitor for issues

### Rollback Plan
If critical bugs found:
1. Disable validation (comment out)
2. Hotfix separately
3. Re-deploy with fix

---

## 📈 SUCCESS METRICS

**Before Implementation:**
```
Negative Balances: Possible (100%)
User Confusion: High
Support Tickets: Medium
Data Integrity: Broken
```

**After Implementation:**
```
Negative Balances: Impossible (0%)
User Confusion: Low (clear errors)
Support Tickets: Low
Data Integrity: Protected
```

---

## 🎯 ACCEPTANCE CRITERIA

### Must Have (P0)
- [x] Proactive validation in AddExpenseForm
- [x] Proactive validation in TransferDialog
- [x] Proactive validation in AdditionalIncomeForm
- [x] Inline error messages
- [x] Button disable when insufficient
- [x] Reactive dialog blocker

### Should Have (P1)
- [ ] Error message animations
- [ ] Accessibility improvements
- [ ] Backend validation (future)

### Nice to Have (P2)
- [ ] Suggest alternative pockets
- [ ] Quick transfer option in error
- [ ] Balance preview in form

---

**Planning Complete!**  
**Next:** See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)

---

**Document Version:** 1.0  
**Last Updated:** November 8, 2025  
**Status:** READY FOR IMPLEMENTATION
