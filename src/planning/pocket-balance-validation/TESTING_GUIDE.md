# Pocket Balance Validation - Testing Guide

**Comprehensive Test Scenarios**  
**Date:** November 8, 2025  
**Coverage:** Unit, Integration, E2E, Edge Cases

---

## 📋 TABLE OF CONTENTS

1. [Testing Overview](#testing-overview)
2. [Manual Testing](#manual-testing)
3. [Edge Case Testing](#edge-case-testing)
4. [Integration Testing](#integration-testing)
5. [Mobile Testing](#mobile-testing)
6. [Regression Testing](#regression-testing)
7. [Performance Testing](#performance-testing)

---

## 🎯 TESTING OVERVIEW

### Test Pyramid

```
         /\
        /  \       E2E Tests (20%)
       /____\      - Full user flows
      /      \     - Real scenarios
     /________\    
    /          \   Integration Tests (30%)
   /____________\  - Component interactions
  /              \ 
 /________________\Unit Tests (50%)
                   - Validation logic
                   - Edge cases
```

### Coverage Goals

- **Unit Tests:** 100% (validation functions)
- **Integration Tests:** 90% (form interactions)
- **E2E Tests:** 80% (critical flows)

---

## 🧪 MANUAL TESTING

### Test Suite 1: AddExpenseForm Validation

#### Test 1.1: Basic Insufficient Balance

**Precondition:**
- Kantong "Game" has Rp 500.000

**Steps:**
1. Open AddExpenseForm (FAB → Pengeluaran OR desktop button)
2. Enter name: "Beli Skin Valorant"
3. Select category: "Hiburan"
4. Select pocket: "Game"
5. Enter amount: 750000
6. Wait 300ms

**Expected:**
```
✅ Error message appears:
   "⛔️ Waduh, Bos! Duit di kantong 'Game' (sisa Rp 500.000) 
    nggak cukup buat bayar Rp 750.000."
✅ Input border turns red
✅ Button "Simpan" disabled (opacity 0.5, cursor not-allowed)
✅ Error box has red background (bg-red-500/10)
```

**Actual:** [PASS/FAIL]  
**Notes:** _______________

---

#### Test 1.2: Fix Insufficient to Sufficient

**Precondition:**
- Continue from Test 1.1 (error state)

**Steps:**
1. Change amount to: 300000
2. Wait 300ms

**Expected:**
```
✅ Error message disappears (fade-out 150ms)
✅ Input border back to normal (gray)
✅ Button "Simpan" enabled
✅ Can click "Simpan" successfully
✅ Expense saved to database
```

**Actual:** [PASS/FAIL]  
**Notes:** _______________

---

#### Test 1.3: Exact Balance

**Precondition:**
- Kantong "Game" has exactly Rp 500.000

**Steps:**
1. Open AddExpenseForm
2. Select pocket: "Game"
3. Enter amount: 500000
4. Wait 300ms

**Expected:**
```
✅ NO error message (exact match is OK)
✅ Button enabled
✅ Can submit successfully
✅ After submit, pocket balance = Rp 0 (not negative)
```

**Actual:** [PASS/FAIL]  
**Notes:** _______________

---

#### Test 1.4: Pocket Switch with Error

**Precondition:**
- Kantong "Game": Rp 200.000
- Kantong "Investasi": Rp 1.000.000

**Steps:**
1. Enter amount: 500000
2. Select pocket: "Game"
3. Wait 300ms (error appears)
4. Switch pocket to: "Investasi"

**Expected:**
```
✅ Error appears for "Game" (step 3)
✅ Error DISAPPEARS IMMEDIATELY when switch to "Investasi" (no 300ms wait)
✅ Button becomes enabled
✅ Can submit
```

**Actual:** [PASS/FAIL]  
**Notes:** _______________

---

#### Test 1.5: Rapid Typing (No Flicker)

**Precondition:**
- Kantong "Game": Rp 500.000

**Steps:**
1. Select pocket: "Game"
2. Type rapidly without pausing:
   - 1 → 10 → 100 → 1000 → 10000 → 100000 → 1000000
3. Stop typing
4. Wait 300ms

**Expected:**
```
✅ NO error messages during typing (no flicker)
✅ After 300ms, single error appears (for 1.000.000)
✅ Error message correct
✅ Button disabled
```

**Actual:** [PASS/FAIL]  
**Notes:** _______________

---

### Test Suite 2: TransferDialog Validation

#### Test 2.1: Transfer Exceeds Balance

**Precondition:**
- Kantong "Sehari-hari": Rp 1.000.000

**Steps:**
1. Open TransferDialog
2. From: "Sehari-hari"
3. To: "Tabungan"
4. Amount: 1500000
5. Wait 300ms

**Expected:**
```
✅ Error message appears:
   "⛔️ Waduh, Bos! Duit di kantong 'Sehari-hari' (sisa Rp 1.000.000) 
    nggak cukup buat transfer Rp 1.500.000."
✅ Error uses "transfer" (not "bayar")
✅ Button "Transfer" disabled
```

**Actual:** [PASS/FAIL]  
**Notes:** _______________

---

#### Test 2.2: Transfer to Same Pocket

**Precondition:**
- Any pocket

**Steps:**
1. From: "Game"
2. To: "Game" (same pocket)
3. Amount: 100000

**Expected:**
```
✅ Different error: "Tidak bisa transfer ke kantong yang sama"
✅ This error takes precedence over balance error
✅ Button disabled
```

**Actual:** [PASS/FAIL]  
**Notes:** _______________

---

### Test Suite 3: AdditionalIncomeForm Validation

#### Test 3.1: Deduction Exceeds Balance

**Precondition:**
- Kantong "Investasi": Rp 500.000

**Steps:**
1. Open AdditionalIncomeForm
2. Name: "Gaji Freelance"
3. Amount: 5000000 (income amount - doesn't matter)
4. Target pocket: "Investasi"
5. Deduction: 800000
6. Wait 300ms

**Expected:**
```
✅ Error message appears:
   "⛔️ Waduh, Bos! Duit di kantong 'Investasi' (sisa Rp 500.000) 
    nggak cukup buat potong Rp 800.000."
✅ Error uses "potong" (not "bayar" or "transfer")
✅ Button "Simpan" disabled
✅ Income amount (5.000.000) NOT validated (only deduction)
```

**Actual:** [PASS/FAIL]  
**Notes:** _______________

---

#### Test 3.2: Zero Deduction (No Validation)

**Precondition:**
- Any pocket

**Steps:**
1. Open income form
2. Enter income: 5000000
3. Target pocket: any
4. Deduction: 0 (or leave empty)

**Expected:**
```
✅ NO balance error (deduction is optional)
✅ Button enabled (assuming other fields valid)
✅ Can submit successfully
```

**Actual:** [PASS/FAIL]  
**Notes:** _______________

---

### Test Suite 4: Reactive Dialog (Fail-safe)

#### Test 4.1: Dialog Blocks Transaction

**Precondition:**
- Kantong "Game": Rp 500.000

**Steps:**
1. Open AddExpenseForm
2. Use browser DevTools to bypass validation:
   ```javascript
   // Manually enable button
   document.querySelector('button[type="submit"]').disabled = false;
   ```
3. Enter amount: 750000
4. Click "Simpan"

**Expected:**
```
✅ InsufficientBalanceDialog appears IMMEDIATELY
✅ Title: "⛔️ SALDONYA NGGAK CUKUP, BOS!"
✅ Message shows pocket name, available, attempted
✅ Transaction NOT saved to database
✅ Can dismiss dialog (button or backdrop)
✅ Form still open after dismiss
```

**Actual:** [PASS/FAIL]  
**Notes:** _______________

---

## 🔬 EDGE CASE TESTING

### Edge Case 1: Zero Amount

**Steps:**
1. Select pocket
2. Enter amount: 0

**Expected:**
```
✅ NO balance error (different validation handles this)
✅ Button disabled (due to amount <= 0 check)
```

**Actual:** [PASS/FAIL]

---

### Edge Case 2: Negative Amount

**Steps:**
1. Select pocket
2. Enter amount: -100

**Expected:**
```
✅ NO balance error
✅ Button disabled (other validation)
```

**Actual:** [PASS/FAIL]

---

### Edge Case 3: No Pocket Selected

**Steps:**
1. Enter amount: 1000000
2. Don't select pocket (leave empty)

**Expected:**
```
✅ NO balance error (can't validate without pocket)
✅ Button disabled (due to no pocket selected)
```

**Actual:** [PASS/FAIL]

---

### Edge Case 4: Pocket Not in Balances

**Steps:**
1. Create scenario where pocket exists but not in balances Map
2. Select that pocket
3. Enter amount

**Expected:**
```
✅ NO balance error (assumes valid to be safe)
✅ Button enabled (if other validations pass)
```

**Actual:** [PASS/FAIL]

---

### Edge Case 5: Balance Changes While Form Open

**Scenario:** User has form open, another device creates expense from same pocket

**Steps:**
1. Open expense form
2. Select pocket "Game" (Rp 500.000)
3. Enter amount: 300000 (valid)
4. Wait 1 minute (don't submit)
5. On another device/tab: Create expense Rp 400.000 from "Game"
6. Back to first tab: Click "Simpan"

**Expected:**
```
✅ Realtime update reduces balance to Rp 100.000
✅ Validation re-runs automatically
✅ Error appears (300.000 > 100.000)
✅ Button becomes disabled
✅ User sees updated error with new balance
```

**Actual:** [PASS/FAIL]  
**Notes:** _______________

---

### Edge Case 6: Very Large Numbers

**Steps:**
1. Enter amount: 999999999999999

**Expected:**
```
✅ Validation still works
✅ Currency formatting correct
✅ No JavaScript precision errors
```

**Actual:** [PASS/FAIL]

---

### Edge Case 7: Decimal Amounts

**Steps:**
1. Enter amount: 100.50 (with decimal)

**Expected:**
```
✅ Input accepts decimal (if input type="number")
✅ Validation compares correctly
✅ Currency formatting handles decimal
```

**Actual:** [PASS/FAIL]

---

## 🔗 INTEGRATION TESTING

### Integration 1: Expense + Budget Alert

**Scenario:** Expense exceeds both pocket balance AND budget limit

**Steps:**
1. Set budget limit for "Hiburan": Rp 500.000
2. Already spent Rp 400.000 in "Hiburan"
3. Kantong "Game": Rp 100.000
4. Create expense:
   - Amount: 200.000
   - Category: Hiburan
   - Pocket: Game

**Expected:**
```
✅ Balance error shows FIRST (proactive)
✅ Button disabled
✅ User can't even attempt to submit
✅ Budget alert dialog NOT shown (blocked before that)

IF user somehow fixes balance to valid pocket:
✅ THEN budget alert dialog shows
```

**Actual:** [PASS/FAIL]

---

### Integration 2: Transfer + Multiple Pockets

**Steps:**
1. Create 5 custom pockets with varying balances
2. Test transfer from each to each (25 combinations)

**Expected:**
```
✅ Validation works for all pocket combinations
✅ Correct balance checked (FROM pocket)
✅ TO pocket balance doesn't affect validation
```

**Actual:** [PASS/FAIL]

---

### Integration 3: Expense + Category Override

**Scenario:** Category has custom budget limit

**Steps:**
1. Category "Game" has custom limit: Rp 1.000.000
2. Pocket "Game" has balance: Rp 500.000
3. Create expense:
   - Amount: 600.000
   - Category: Game (custom limit)
   - Pocket: Game

**Expected:**
```
✅ Balance validation shows error (600K > 500K pocket)
✅ Button disabled
✅ Category limit NOT checked (blocked by balance first)
```

**Actual:** [PASS/FAIL]

---

### Integration 4: Income + Transfer Chain

**Scenario:**
1. Add income Rp 1.000.000 to Pocket A
2. Transfer Rp 800.000 from A to B
3. Create expense Rp 500.000 from B

**Expected:**
```
✅ After income: Pocket A = Rp 1.000.000
✅ After transfer: Pocket A = Rp 200.000, Pocket B = Rp 800.000
✅ Expense from B succeeds (500K < 800K)
✅ All balances update correctly
✅ Validations work at each step
```

**Actual:** [PASS/FAIL]

---

## 📱 MOBILE TESTING

### Mobile 1: Touch Interactions

**Device:** Mobile phone or simulator

**Steps:**
1. Open expense form (FAB)
2. Use on-screen keyboard
3. Trigger error
4. Dismiss dialog

**Expected:**
```
✅ Keyboard doesn't obscure error message
✅ Error message wraps correctly on narrow screen
✅ Dialog shows as Drawer on mobile (full width)
✅ Touch targets large enough (44x44 min)
```

**Actual:** [PASS/FAIL]

---

### Mobile 2: Screen Rotation

**Steps:**
1. Portrait: Open form, trigger error
2. Rotate to landscape
3. Rotate back to portrait

**Expected:**
```
✅ Error message persists through rotation
✅ Layout adjusts correctly
✅ No loss of state
```

**Actual:** [PASS/FAIL]

---

### Mobile 3: Slow Network

**Steps:**
1. Enable slow 3G in DevTools
2. Open form
3. Select pocket (may load slowly)
4. Trigger validation

**Expected:**
```
✅ Validation waits for balances to load
✅ No false errors while loading
✅ Loading states handled gracefully
```

**Actual:** [PASS/FAIL]

---

## 🔄 REGRESSION TESTING

### Regression 1: Existing Expense Creation

**Scenario:** Ensure normal expense creation still works

**Steps:**
1. Create expense with SUFFICIENT balance
2. Verify all existing fields work

**Expected:**
```
✅ Name input works
✅ Amount input works
✅ Category selector works
✅ Date picker works
✅ Template system works
✅ Multi-item expenses work
✅ Submit succeeds
```

**Actual:** [PASS/FAIL]

---

### Regression 2: Edit Expense

**Scenario:** Edit existing expense

**Steps:**
1. Create expense (valid)
2. Edit amount to INVALID (exceeds balance)
3. Try to save

**Expected:**
```
✅ Validation triggers on edit
✅ Error shows
✅ Can't save invalid edit
```

**Actual:** [PASS/FAIL]

---

### Regression 3: Bulk Operations

**Scenario:** Bulk delete doesn't trigger validation

**Steps:**
1. Select multiple expenses
2. Bulk delete

**Expected:**
```
✅ No balance validation on delete (makes no sense)
✅ Deletion succeeds
✅ Balances update correctly
```

**Actual:** [PASS/FAIL]

---

## ⚡ PERFORMANCE TESTING

### Performance 1: Validation Speed

**Test:**
1. Enter amount
2. Measure time from last keystroke to error display

**Expected:**
```
✅ Debounce: 300ms
✅ Validation logic: <5ms
✅ Total: ~305ms
✅ No noticeable lag
```

**Actual:** [PASS/FAIL]  
**Measured:** ______ms

---

### Performance 2: Large Pocket List

**Test:**
1. Create 50 pockets
2. Open expense form
3. Trigger validation

**Expected:**
```
✅ Validation still <10ms
✅ No dropdown lag
✅ Pocket lookup efficient (Map data structure)
```

**Actual:** [PASS/FAIL]

---

### Performance 3: Memory Leaks

**Test:**
1. Open/close form 100 times
2. Check browser memory

**Expected:**
```
✅ Memory usage stable
✅ No event listeners leak
✅ Timeouts cleaned up (useEffect cleanup)
```

**Actual:** [PASS/FAIL]

---

## ✅ TEST SUMMARY TEMPLATE

```
===========================================
POCKET BALANCE VALIDATION - TEST REPORT
===========================================

Date: _________________
Tester: _______________
Environment: __________

MANUAL TESTING:
  AddExpenseForm:         [ ] PASS  [ ] FAIL
  TransferDialog:         [ ] PASS  [ ] FAIL
  AdditionalIncomeForm:   [ ] PASS  [ ] FAIL
  Reactive Dialog:        [ ] PASS  [ ] FAIL

EDGE CASES:
  Zero/Negative:          [ ] PASS  [ ] FAIL
  No Pocket:              [ ] PASS  [ ] FAIL
  Realtime Updates:       [ ] PASS  [ ] FAIL
  Large Numbers:          [ ] PASS  [ ] FAIL

INTEGRATION:
  Budget Alerts:          [ ] PASS  [ ] FAIL
  Multiple Pockets:       [ ] PASS  [ ] FAIL
  Category Override:      [ ] PASS  [ ] FAIL

MOBILE:
  Touch Interactions:     [ ] PASS  [ ] FAIL
  Screen Rotation:        [ ] PASS  [ ] FAIL
  Slow Network:           [ ] PASS  [ ] FAIL

REGRESSION:
  Existing Features:      [ ] PASS  [ ] FAIL
  Bulk Operations:        [ ] PASS  [ ] FAIL

PERFORMANCE:
  Validation Speed:       [ ] PASS  [ ] FAIL
  Memory Leaks:           [ ] PASS  [ ] FAIL

OVERALL:                  [ ] PASS  [ ] FAIL

CRITICAL ISSUES:
  1. ______________________________
  2. ______________________________
  3. ______________________________

NOTES:
_________________________________________
_________________________________________
_________________________________________
```

---

## 🎯 ACCEPTANCE CRITERIA

Feature is ready for production when:

- [ ] All manual tests PASS
- [ ] All edge cases handled
- [ ] Integration tests PASS
- [ ] Mobile tests PASS
- [ ] No regressions
- [ ] Performance acceptable (<10ms validation)
- [ ] No memory leaks
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] User experience smooth

---

**Testing Guide Complete!**  
**Ready for QA!** ✅

---

**Document Version:** 1.0  
**Last Updated:** November 8, 2025  
**Total Test Scenarios:** 40+
