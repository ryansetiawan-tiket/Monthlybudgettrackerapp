# 🚀 POCKET BALANCE VALIDATION - QUICK START

**Need to understand this feature in 2 minutes? Read this!**

---

## 🎯 WHAT IS IT?

Prevents users from creating **Pengeluaran/Transfer/Deduction** when the pocket balance is **INSUFFICIENT**.

---

## 📍 WHERE DOES IT WORK?

| Form | What's Validated | Error When |
|------|------------------|------------|
| **AddExpenseForm** | Each expense entry | `amount > pocket.availableBalance` |
| **TransferDialog** | Transfer amount | `amount > fromPocket.availableBalance` |
| **AdditionalIncomeForm** | Deduction amount | `deduction > targetPocket.availableBalance` |

---

## 🎨 HOW IT LOOKS

### ✅ Normal State
```
┌─────────────────────────┐
│ Nominal                 │
│ ┌─────────────────────┐ │
│ │ 100000             │ │  ← Normal border
│ └─────────────────────┘ │
└─────────────────────────┘
```

### ❌ Error State
```
┌─────────────────────────┐
│ Nominal                 │
│ ┌─────────────────────┐ │
│ │ 500000             │ │  ← RED border
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ ⛔️ Waduh, Bos!      │ │  ← Animated error
│ │ Duit di kantong     │ │
│ │ 'Daily' (sisa       │ │
│ │ Rp 300.000) nggak   │ │
│ │ cukup buat bayar    │ │
│ │ Rp 500.000.         │ │
│ └─────────────────────┘ │
│                         │
│ [Tambah] ← DISABLED     │
└─────────────────────────┘
```

---

## 🔒 TWO-LAYER VALIDATION

### Layer 1: Proactive (Real-time)
- Shows error WHILE typing (debounced 300ms)
- Disables submit button
- User sees error BEFORE clicking

### Layer 2: Reactive (Fail-safe)
- Validates AGAIN on submit
- Shows blocking dialog if insufficient
- Last defense against bugs/race conditions

---

## 🛠️ FOR DEVELOPERS

### Using InsufficientBalanceDialog

```tsx
import { InsufficientBalanceDialog } from "./InsufficientBalanceDialog";

// State
const [showDialog, setShowDialog] = useState(false);
const [details, setDetails] = useState(null);

// On validation fail
setDetails({
  pocketName: "Game",
  availableBalance: 500000,
  attemptedAmount: 750000,
});
setShowDialog(true);

// Render
<InsufficientBalanceDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  pocketName={details.pocketName}
  availableBalance={details.availableBalance}
  attemptedAmount={details.attemptedAmount}
/>
```

### Adding to New Form

**Step 1:** Add imports
```tsx
import { InsufficientBalanceDialog } from "./InsufficientBalanceDialog";
import { formatCurrency } from "../utils/currency";
```

**Step 2:** Add props
```tsx
interface Props {
  balances?: Map<string, {availableBalance: number}>;
  pockets?: Array<{id: string; name: string}>;
}
```

**Step 3:** Add states
```tsx
const [balanceError, setBalanceError] = useState<string | null>(null);
const [isInsufficientBalance, setIsInsufficientBalance] = useState(false);
const [showInsufficientDialog, setShowInsufficientDialog] = useState(false);
const [insufficientDetails, setInsufficientDetails] = useState(null);
```

**Step 4:** Add validation function
```tsx
const validateBalance = useCallback((amount, pocketId) => {
  if (!pocketId || !amount || amount <= 0) {
    setBalanceError(null);
    setIsInsufficientBalance(false);
    return true;
  }

  if (!balances) {
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

  if (amount > pocket.availableBalance) {
    const pocketName = pockets.find(p => p.id === pocketId)?.name || 'kantong ini';
    setBalanceError(
      `Waduh, Bos! Duit di kantong '${pocketName}' (sisa ${formatCurrency(pocket.availableBalance)}) ` +
      `nggak cukup buat bayar ${formatCurrency(amount)}.`
    );
    setIsInsufficientBalance(true);
    return false;
  }

  setBalanceError(null);
  setIsInsufficientBalance(false);
  return true;
}, [balances, pockets]);
```

**Step 5:** Add useEffect hooks
```tsx
// Debounced
useEffect(() => {
  const timeoutId = setTimeout(() => {
    validateBalance(amount, pocketId);
  }, 300);
  return () => clearTimeout(timeoutId);
}, [amount, pocketId, validateBalance]);

// Immediate on pocket change
useEffect(() => {
  if (pocketId) {
    validateBalance(amount, pocketId);
  }
}, [pocketId, amount, validateBalance]);
```

**Step 6:** Add reactive validation in submit handler
```tsx
const handleSubmit = () => {
  // ... other validations

  // BALANCE VALIDATION (Reactive fail-safe)
  if (pocketId && amount > 0 && balances) {
    const pocket = balances.get(pocketId);
    if (pocket && amount > pocket.availableBalance) {
      const pocketName = pockets.find(p => p.id === pocketId)?.name || 'kantong ini';
      setInsufficientDetails({
        pocketName,
        availableBalance: pocket.availableBalance,
        attemptedAmount: amount,
      });
      setShowInsufficientDialog(true);
      return; // BLOCK SUBMISSION!
    }
  }

  // ... proceed with submission
};
```

**Step 7:** Update UI
```tsx
// Add red border to input
<Input
  className={balanceError ? "border-red-500" : ""}
  // ... other props
/>

// Add error message after input
{balanceError && (
  <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
    <span className="text-red-500 text-lg flex-shrink-0">⛔️</span>
    <p className="text-sm text-red-500 leading-relaxed">{balanceError}</p>
  </div>
)}

// Disable submit button
<Button
  disabled={isInsufficientBalance || /* other conditions */}
>
  Submit
</Button>
```

**Step 8:** Render dialog
```tsx
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

---

## 🧪 QUICK TEST

1. Find pocket with Rp 100k balance
2. Try to create expense Rp 150k from that pocket
3. **Expected:**
   - ❌ Red border on amount input
   - ❌ Error message appears
   - ❌ Submit button disabled
   - ❌ Clicking submit shows blocking dialog

---

## 📖 FULL DOCUMENTATION

- **Planning:** `/planning/pocket-balance-validation/PLANNING.md`
- **Implementation:** `/planning/pocket-balance-validation/IMPLEMENTATION_COMPLETE.md`
- **Visual Design:** `/planning/pocket-balance-validation/VISUAL_MOCKUPS.md`
- **Testing:** `/planning/pocket-balance-validation/TESTING_GUIDE.md`

---

**Status:** ✅ Production Ready  
**Last Updated:** November 8, 2025
