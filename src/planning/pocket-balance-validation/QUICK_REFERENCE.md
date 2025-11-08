# Pocket Balance Validation - Quick Reference

**Ultra-Fast Lookup Guide**  
**Date:** November 8, 2025

---

## 🎯 WHAT IS THIS?

Real-time pocket balance validation to prevent negative balances.

**Problem:** Users can create expenses/transfers exceeding pocket balance → negative balances!  
**Solution:** Proactive + Reactive validation with inline errors + blocking dialog

---

## 📍 WHERE?

**3 Components Modified:**
1. `/components/AddExpenseForm.tsx` - Expense validation
2. `/components/TransferDialog.tsx` - Transfer validation
3. `/components/AdditionalIncomeForm.tsx` - Deduction validation

**1 Component Created:**
- `/components/InsufficientBalanceDialog.tsx` - Blocking dialog

---

## 🔧 KEY CHANGES SUMMARY

### AddExpenseForm
```typescript
// State
const [balanceError, setBalanceError] = useState<string | null>(null);
const [isInsufficientBalance, setIsInsufficientBalance] = useState(false);

// Validation (debounced 300ms)
if (amount > pocket.availableBalance) {
  setBalanceError("Waduh, Bos! Duit di kantong...");
  setIsInsufficientBalance(true);
}

// Button disable
disabled={isAdding || isInsufficientBalance || !name || !amount}
```

### TransferDialog
Same pattern, but:
- Validates `fromPocket` balance
- Error message uses "transfer" instead of "bayar"

### AdditionalIncomeForm
Same pattern, but:
- Validates `deduction` field (not income amount)
- Error message uses "potong" instead of "bayar"

---

## 🎨 UI COMPONENTS

### Inline Error (Proactive)
```tsx
{balanceError && (
  <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
    <span className="text-red-500">⛔️</span>
    <p className="text-sm text-red-500">{balanceError}</p>
  </div>
)}
```

### Dialog (Reactive)
```tsx
<InsufficientBalanceDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  pocketName="Game"
  availableBalance={500000}
  attemptedAmount={750000}
/>
```

---

## 📝 ERROR MESSAGE PATTERNS

### Expense
```
⛔️ Waduh, Bos! Duit di kantong 'Game' (sisa Rp 500.000) 
   nggak cukup buat bayar Rp 750.000.
```

### Transfer
```
⛔️ Waduh, Bos! Duit di kantong 'Sehari-hari' (sisa Rp 1.000.000) 
   nggak cukup buat transfer Rp 1.500.000.
```

### Income Deduction
```
⛔️ Waduh, Bos! Duit di kantong 'Investasi' (sisa Rp 100.000) 
   nggak cukup buat potong Rp 150.000.
```

---

## 🔑 KEY FUNCTIONS

### Validation Function Template
```typescript
const validateBalance = useCallback((
  amount: number,
  pocketId: string | undefined,
  balances: Map<string, { availableBalance: number }> | undefined,
  pockets: Array<{ id: string; name: string }>
) => {
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

  const available = pocket.availableBalance;
  
  if (amount > available) {
    const pocketName = pockets.find(p => p.id === pocketId)?.name || 'kantong ini';
    setBalanceError(
      `Waduh, Bos! Duit di kantong '${pocketName}' (sisa ${formatCurrency(available)}) ` +
      `nggak cukup buat [ACTION] ${formatCurrency(amount)}.`
    );
    setIsInsufficientBalance(true);
    return false;
  }

  setBalanceError(null);
  setIsInsufficientBalance(false);
  return true;
}, []);
```

Replace `[ACTION]` with:
- "bayar" for AddExpenseForm
- "transfer" for TransferDialog
- "potong" for AdditionalIncomeForm

---

## ⚡ VALIDATION TRIGGERS

### Real-time (Debounced 300ms)
```typescript
useEffect(() => {
  const timeoutId = setTimeout(() => {
    validateBalance(amount, selectedPocket, balances, pockets);
  }, 300);
  return () => clearTimeout(timeoutId);
}, [amount, selectedPocket, balances, pockets, validateBalance]);
```

### Immediate (On Pocket Change)
```typescript
useEffect(() => {
  if (selectedPocket) {
    validateBalance(amount, selectedPocket, balances, pockets);
  }
}, [selectedPocket, amount, balances, pockets, validateBalance]);
```

### Pre-submit (Reactive Fail-safe)
```typescript
const handleSubmit = async () => {
  if (selectedPocket && balances) {
    const pocket = balances.get(selectedPocket);
    if (pocket && amount > pocket.availableBalance) {
      // Show dialog, BLOCK submission
      setShowInsufficientDialog(true);
      return;
    }
  }
  // ... proceed with submission
};
```

---

## 🎯 BUTTON DISABLE LOGIC

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

**Key:** Add `isInsufficientBalance` to disable condition!

---

## 🐛 COMMON ISSUES

### Error Flickers While Typing
**Cause:** No debounce  
**Fix:** Use setTimeout 300ms with cleanup

### Button Not Disabling
**Cause:** Missing `isInsufficientBalance` in disable condition  
**Fix:** Add to `useMemo` dependencies

### Validation Not Running
**Cause:** Missing `balances` prop or wrong dependencies  
**Fix:** Check useEffect dependencies array

### Dialog Not Showing
**Cause:** Missing state or render  
**Fix:** Add `showInsufficientDialog` state and render component

---

## ✅ TESTING CHECKLIST

**Quick Test:**
1. [ ] Open form
2. [ ] Select pocket with Rp 500.000
3. [ ] Enter amount: 750.000
4. [ ] Wait 300ms
5. [ ] ✅ Error appears
6. [ ] ✅ Button disabled
7. [ ] Change to 300.000
8. [ ] Wait 300ms
9. [ ] ✅ Error disappears
10. [ ] ✅ Button enabled

---

## 📊 FILES CHANGED

| File | Type | Lines Added |
|------|------|-------------|
| `/components/InsufficientBalanceDialog.tsx` | NEW | +80 |
| `/components/AddExpenseForm.tsx` | MODIFIED | +50 |
| `/components/TransferDialog.tsx` | MODIFIED | +50 |
| `/components/AdditionalIncomeForm.tsx` | MODIFIED | +50 |
| **TOTAL** | - | **+230** |

---

## 🎨 STYLING QUICK REF

### Error Message Box
```css
background: bg-red-500/10
border: border-red-500/20
text: text-red-500
animation: animate-in fade-in slide-in-from-top-2 duration-200
```

### Error Input Border
```css
className={balanceError ? "border-red-500" : ""}
```

### Disabled Button
```css
disabled={isSubmitDisabled}
opacity: 0.5 (automatic)
cursor: not-allowed (automatic)
```

---

## ⚙️ CONFIGURATION

### Debounce Timing
```typescript
const DEBOUNCE_MS = 300; // ms to wait after typing
```

### Animation Duration
```typescript
const FADE_IN = 200;  // ms
const FADE_OUT = 150; // ms
```

---

## 🔍 DEBUG SNIPPETS

### Check Balance
```typescript
console.log('Pocket:', selectedPocket);
console.log('Amount:', amount);
console.log('Balance:', balances?.get(selectedPocket)?.availableBalance);
console.log('Insufficient:', isInsufficientBalance);
```

### Check Validation Running
```typescript
console.log('Validation triggered:', Date.now());
console.log('Balance error:', balanceError);
```

---

## 📈 PERFORMANCE

**Optimizations:**
- ✅ Debounced validation (prevents excessive checks)
- ✅ Memoized functions (`useCallback`, `useMemo`)
- ✅ Early returns (skip validation if conditions not met)

**Impact:**
- Minimal: ~1-2ms per validation
- No noticeable lag

---

## 🎓 IMPORTANT NOTES

1. **Exact Balance OK:** `amount === balance` is allowed (not ">")
2. **Debounce Important:** Prevents flickering during typing
3. **Immediate on Pocket Change:** User expects instant feedback
4. **Reactive is Fail-safe:** Should rarely trigger if proactive works
5. **Income is Different:** Validates `deduction`, not income amount

---

## 🚀 QUICK START

**To Add Validation to New Form:**

1. Import dependencies
```typescript
import { InsufficientBalanceDialog } from "./InsufficientBalanceDialog";
import { formatCurrency } from "../utils/currency";
```

2. Add states
```typescript
const [balanceError, setBalanceError] = useState<string | null>(null);
const [isInsufficientBalance, setIsInsufficientBalance] = useState(false);
```

3. Create validation function (copy template above)

4. Add useEffects (debounced + immediate)

5. Update button disable logic

6. Add UI elements (error box + dialog)

7. Test!

---

## 🔗 RELATED DOCS

- [PLANNING.md](PLANNING.md) - Full specification
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Step-by-step
- [VISUAL_MOCKUPS.md](VISUAL_MOCKUPS.md) - UI designs
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Test cases

---

**Quick Reference Complete!** ⚡  
**For Full Details:** See linked docs above

---

**Document Version:** 1.0  
**Last Updated:** November 8, 2025
