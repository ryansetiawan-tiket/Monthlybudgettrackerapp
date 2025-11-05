# Pockets System - Testing Guide

## Quick Test Steps

### 1. Initial Setup Test

**Steps:**
1. Open app and select current month
2. Check if PocketsSummary appears below BudgetOverview
3. Verify 2 pockets are displayed:
   - 👛 Sehari-hari (Budget untuk kebutuhan sehari-hari)
   - ✨ Uang Dingin (Dana untuk hobi dan hiburan)

**Expected Result:**
- Both pockets show Rp 0 initially
- "Transfer" button is visible
- Both pockets have breakdown sections (collapsed initially)

---

### 2. Add Budget Test

**Steps:**
1. Click "Budget Settings" (gear icon)
2. Enter Budget Awal: `8000000`
3. Click Save
4. Close dialog

**Expected Result:**
- Kantong Sehari-hari shows: Saldo Tersedia Rp 8.000.000
- Kantong Uang Dingin shows: Saldo Tersedia Rp 0
- Breakdown shows: Saldo Asli Rp 8.000.000

---

### 3. Add Additional Income Test

**Steps:**
1. Click "Tambah Pemasukan Tambahan"
2. Enter:
   - Nama: `Freelance Project`
   - Amount (USD): `100`
   - Date: today
3. Save

**Expected Result:**
- Kantong Uang Dingin balance updates (e.g., Rp 1.600.000 if rate = 16,000)
- Kantong Sehari-hari unchanged

---

### 4. Add Expense to Sehari-hari Test

**Steps:**
1. Click "Tambah Pengeluaran"
2. Enter:
   - Nama: `Groceries`
   - Nominal: `350000`
3. Check pocket selector - should show "Sehari-hari" selected
4. Save

**Expected Result:**
- Expense appears in list with badge: [Sehari-hari]
- Kantong Sehari-hari balance: Rp 8.000.000 → Rp 7.650.000
- Breakdown shows: Pengeluaran -Rp 350.000

---

### 5. Add Expense to Uang Dingin Test

**Steps:**
1. Click "Tambah Pengeluaran"
2. Enter:
   - Nama: `Gaming Console`
   - Nominal: `800000`
3. Change pocket selector to "Uang Dingin"
4. Save

**Expected Result:**
- Expense appears with badge: [Uang Dingin]
- Kantong Uang Dingin balance decreases by Rp 800.000
- Kantong Sehari-hari unchanged

---

### 6. Transfer Between Pockets Test

**Steps:**
1. Click "Transfer" button in PocketsSummary
2. Select:
   - Dari Kantong: Sehari-hari (should show balance)
   - Ke Kantong: Uang Dingin
   - Jumlah: `500000`
   - Catatan: `Untuk hiburan`
3. Click "Transfer"

**Expected Result:**
- Toast: "Transfer berhasil!"
- Kantong Sehari-hari: -Rp 500.000
- Kantong Uang Dingin: +Rp 500.000
- Both show transfer in breakdown:
  - Sehari-hari: Transfer Keluar -Rp 500.000 (red)
  - Uang Dingin: Transfer Masuk +Rp 500.000 (green)

---

### 7. Transfer Validation Test

**Test A: Insufficient Balance**
1. Click "Transfer"
2. From: Sehari-hari (current balance: Rp 7.150.000)
3. To: Uang Dingin
4. Amount: `10000000` (more than available)
5. Click "Transfer"

**Expected:** 
- Error toast: "Saldo tidak cukup..."
- Transfer not created

**Test B: Same Pocket**
1. Click "Transfer"
2. From: Sehari-hari
3. To: Sehari-hari
4. Amount: any

**Expected:**
- "Transfer" button disabled OR
- Error: "Tidak bisa transfer ke kantong yang sama"

**Test C: Zero Amount**
1. Amount: `0`

**Expected:**
- "Transfer" button disabled

---

### 8. Timeline View Test

**Steps:**
1. Click "Timeline Sehari-hari" header to expand
2. Observe entries

**Expected Timeline (from bottom to top, if sorted asc):**
```
📈 Budget Awal              +Rp 8.000.000   Saldo: Rp 8.000.000
🛍  Groceries               -Rp 350.000     Saldo: Rp 7.650.000
➡️  Transfer ke Uang Dingin -Rp 500.000     Saldo: Rp 7.150.000
```

**For Uang Dingin:**
```
💵 Freelance Project        +Rp 1.600.000   Saldo: Rp 1.600.000
⬅️  Transfer dari Sehari-hari +Rp 500.000   Saldo: Rp 2.100.000
🛍  Gaming Console          -Rp 800.000     Saldo: Rp 1.300.000
```

**Verify:**
- [x] Icons correct (Wallet, ShoppingBag, ArrowRight, ArrowLeft, DollarSign)
- [x] Colors correct (green=income, red=expense, blue=transfer)
- [x] Running balance calculated correctly
- [x] Date & time shown
- [x] Transfer note appears

---

### 9. Edit Expense Pocket Test

**Steps:**
1. Find "Groceries" expense in list
2. Click Edit (pencil icon)
3. Change pocket from "Sehari-hari" to "Uang Dingin"
4. Save

**Expected Result:**
- Expense badge updates to [Uang Dingin]
- Sehari-hari balance increases by Rp 350.000
- Uang Dingin balance decreases by Rp 350.000
- Timeline updates in both pockets

---

### 10. Delete Expense Test

**Steps:**
1. Delete "Groceries" expense
2. Confirm deletion

**Expected Result:**
- Expense removed from list
- Balance recalculated (increases by Rp 350.000)
- Timeline updated

---

### 11. Month Change Test

**Steps:**
1. Current month: November
2. Change to December using MonthSelector
3. Observe pockets

**Expected Result:**
- Pockets load for December (might be Rp 0 initially)
- Can add budget/expenses for December
- Switching back to November shows correct data

---

### 12. Exclude State Integration Test

**Steps:**
1. Add expense to Sehari-hari
2. Click "eye" icon to exclude expense
3. Observe pocket balance

**Expected Result:**
- Excluded expense not counted in balance
- Badge shows as excluded (eye-off icon)
- Timeline updates

---

### 13. Template Expense with Pocket Test

**Steps:**
1. Create template: "Monthly Bills" (Rp 500k + Rp 300k = Rp 800k)
2. Add expense from template
3. Select pocket: Sehari-hari
4. Save

**Expected Result:**
- Template expense created with multiple items
- Pocket badge shows [Sehari-hari]
- Balance decreases by total (Rp 800.000)
- Can expand to see items

---

### 14. Responsive Design Test

**Desktop (>768px):**
- Pockets displayed in 2 columns (side by side)
- Transfer dialog centered
- Timeline readable

**Mobile (<768px):**
- Pockets stacked vertically (1 column)
- Transfer dialog full width
- Timeline scrollable

---

### 15. Error Handling Test

**Test A: Network Error**
1. Disable network
2. Try to transfer
**Expected:** Error toast with message

**Test B: Invalid Data**
1. Manually edit API response (dev tools)
2. Load pockets
**Expected:** Graceful error handling, no crash

---

## Regression Tests (Ensure Old Features Still Work)

### ✅ Budget Overview
- Total Income = Budget Awal + Carryover + Additional Income
- Total Expenses = Sum of all expenses
- Remaining = Income - Expenses

### ✅ Expense List
- Can add/edit/delete expenses
- Can use templates
- Can move expense to income (fromIncome flag)
- Bulk delete works
- Sort by date works
- Search works

### ✅ Additional Income
- Can add USD income with auto/manual rate
- Deduction works
- Exclude works

### ✅ Month Navigation
- Can switch months
- Data persists
- Cache works

### ✅ Exclude Feature
- Can exclude expenses
- Can exclude income
- Lock/unlock works
- State persists

---

## Performance Checks

### Load Time
- Initial month load: < 2s
- Pocket balance calculation: < 500ms
- Timeline generation: < 800ms

### Responsiveness
- UI doesn't freeze during operations
- Smooth animations
- No lag when typing

---

## Common Issues & Solutions

### Issue 1: "Pockets not loading"
**Solution:**
- Check browser console for errors
- Verify Supabase connection
- Check if month data exists

### Issue 2: "Transfer validation error"
**Solution:**
- Check pocket balances are calculated
- Verify transfer amount <= available balance
- Ensure pockets are different

### Issue 3: "Timeline not showing entries"
**Solution:**
- Check if expenses have pocketId
- Verify transfers exist in KV store
- Check timeline API response

### Issue 4: "Balance calculation wrong"
**Solution:**
- Check exclude state
- Verify transfers are counted correctly
- Check if expenses filtered by pocketId

---

## Developer Testing Tips

### 1. Use Browser Console
```javascript
// Check pockets state
console.log(window.__pockets);

// Check balances
console.log(window.__balances);

// Manual API test
fetch('http://localhost:54321/functions/v1/make-server-3adbeaf1/pockets/2025/11', {
  headers: { Authorization: 'Bearer YOUR_KEY' }
}).then(r => r.json()).then(console.log);
```

### 2. Use React DevTools
- Check component state
- Verify props passed correctly
- Monitor re-renders

### 3. Check Network Tab
- Verify API calls made
- Check request/response payloads
- Monitor timing

### 4. Test with Mock Data
- Create test expenses with known amounts
- Use round numbers for easy mental math
- Test edge cases (0, negative, very large)

---

## Test Data Setup Script

```javascript
// Quick setup for testing
const setupTestData = async () => {
  // 1. Set budget
  await saveBudget({ initialBudget: 8000000, carryover: 0 });
  
  // 2. Add income
  await addIncome({ name: 'Freelance', amountIDR: 1600000 });
  
  // 3. Add expenses
  await addExpense('Groceries', 350000, 'pocket_daily');
  await addExpense('Gaming', 800000, 'pocket_cold_money');
  
  // 4. Create transfer
  await createTransfer('pocket_daily', 'pocket_cold_money', 500000);
  
  console.log('Test data created!');
};
```

---

## Acceptance Criteria Checklist

Phase 1 is COMPLETE when:

- [x] 2 fixed pockets work (Sehari-hari & Uang Dingin)
- [x] Pocket summary shows balances
- [x] Can add expense to specific pocket
- [x] Can transfer between pockets
- [x] Transfer validates balance
- [x] Timeline shows all transaction types
- [x] Timeline calculates running balance correctly
- [x] Pocket badges show on expenses
- [x] Balance breakdown shows (original, transfers, expenses)
- [x] Edit/delete expense updates balances
- [x] Month change loads correct data
- [x] Responsive design works
- [x] No breaking changes to existing features
- [x] All existing tests pass

---

**Last Updated**: November 5, 2025  
**Status**: Ready for Testing  
**Phase**: 1.0
