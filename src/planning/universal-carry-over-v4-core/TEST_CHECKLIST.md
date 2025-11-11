# Universal Carry-Over V4 - Test Checklist

**Date:** 10 November 2025  
**Phase:** TUGAS 1 - Fix Bug Kalkulasi Saldo

---

## Test Scenario: PayLater Bug (Critical)

### Background
- **Current Date:** 10 November 2025
- **Pocket:** PayLater (custom pocket)
- **Transactions:**
  1. Saldo Awal: Rp 0 (1 Nov)
  2. Transfer IN: Rp 753.261 (10 Nov - TODAY)
  3. Expense SP: Rp 376.631 (16 Nov - FUTURE)

### Expected Results

#### Mode: Realtime (Saldo Hari Ini) ✅
**Should show:** +Rp 753.261
**Reason:** Only transactions up to today (10 Nov)
**Calculation:**
```
Saldo Awal:     Rp 0
Transfer IN:    +Rp 753.261 (10 Nov ✅ included)
Expense SP:     -Rp 376.631 (16 Nov ❌ excluded - future)
────────────────────────────
REALTIME:       Rp 753.261
```

#### Mode: Proyeksi (Saldo Proyeksi) ✅
**Should show:** +Rp 376.630
**Reason:** All transactions including future
**Calculation:**
```
Saldo Awal:     Rp 0
Transfer IN:    +Rp 753.261 (10 Nov ✅ included)
Expense SP:     -Rp 376.631 (16 Nov ✅ included)
────────────────────────────
PROJECTED:      Rp 376.630
```

---

## Test Checklist

### Backend Tests

- [ ] **Test 1: Server Response Structure**
  - Response includes `realtimeBalance` field
  - Response includes `projectedBalance` field
  - Response includes legacy `availableBalance` field
  - `availableBalance` equals `projectedBalance` (backward compat)

- [ ] **Test 2: PayLater Realtime Calculation**
  - Call API with default (today's date)
  - `realtimeBalance` = +753.261 ✅
  - Does NOT include expense on 16 Nov ✅

- [ ] **Test 3: PayLater Projected Calculation**
  - `projectedBalance` = +376.630 ✅
  - INCLUDES expense on 16 Nov ✅

- [ ] **Test 4: Date Filtering Logic**
  - Transactions on cutoff date ARE included (<=)
  - Transactions after cutoff date are excluded (>)
  - Timezone handling is correct (00:00:00 local time)

- [ ] **Test 5: All Pocket Types**
  - Daily pocket: Both realtime and projected correct
  - Cold Money: Both realtime and projected correct
  - Custom pockets: Both realtime and projected correct

### Frontend Tests

- [ ] **Test 6: Display Balance Priority**
  - Shows server `realtimeBalance` in Realtime mode
  - Shows server `projectedBalance` in Proyeksi mode
  - Falls back to timeline calculation if server fields missing
  - Falls back to `availableBalance` if timeline fails

- [ ] **Test 7: PayLater Card Display**
  - Realtime mode shows +Rp 753.261 ✅
  - Proyeksi mode shows +Rp 376.630 ✅
  - Label updates correctly ("Saldo Hari Ini" vs "Saldo Proyeksi")
  - Color is green for positive balance ✅

- [ ] **Test 8: Mode Toggle**
  - Switching from Realtime to Proyeksi updates balance immediately
  - Switching from Proyeksi to Realtime updates balance immediately
  - Toast notification appears on toggle ✅

- [ ] **Test 9: Delete Pocket Validation**
  - Uses `projectedBalance` for validation (includes future transactions)
  - Cannot delete pocket with future expenses even if realtime balance is 0
  - Can delete pocket when projected balance is 0

### Edge Cases

- [ ] **Test 10: All Transactions in Future**
  - Pocket with only future transactions
  - Realtime balance should equal original amount (Saldo Awal)
  - Projected balance includes future transactions

- [ ] **Test 11: No Future Transactions**
  - Pocket with only past transactions
  - Realtime balance equals projected balance
  - Both show correct final balance

- [ ] **Test 12: Mixed Timezones**
  - Transaction dated "today" in different timezone
  - Date comparison uses local midnight (00:00:00)
  - No off-by-one errors

- [ ] **Test 13: Backward Compatibility**
  - Old clients without new fields still work
  - Timeline calculation fallback works
  - Legacy `availableBalance` field present

---

## Console Logging Verification

### Expected Logs (PayLater, 10 Nov)

```
[BALANCE] 📊 pocket_custom_paylater 2025-11:
  realtime: 753261
  projected: 376630
  cutoffDate: 2025-11-10
  breakdown:
    originalAmount: 0
    incomeRealtime: 0
    incomeProjected: 0
    transferInRealtime: 753261
    transferInProjected: 753261
    transferOutRealtime: 0
    transferOutProjected: 0
    expensesRealtime: 0       ← ✅ NO expense (16 Nov excluded)
    expensesProjected: 376631  ← ✅ Includes expense (16 Nov)
```

---

## Regression Tests

### Must NOT Break

- [ ] Daily pocket carry-over logic still works
- [ ] Cold Money pocket income logic still works
- [ ] Timeline display unchanged (already correct)
- [ ] Transfer dialog validation unchanged
- [ ] Wishlist simulation calculations unchanged
- [ ] Budget overview calculations unchanged
- [ ] Category breakdown still works
- [ ] Month navigation still generates carry-over correctly

---

## Success Criteria

### All Green ✅

1. **PayLater bug FIXED:**
   - Realtime: +Rp 753.261 (was showing -Rp 376.631 ❌)
   - Proyeksi: +Rp 376.630 (correct ✅)

2. **Logging shows correct breakdown:**
   - `expensesRealtime: 0` (excludes 16 Nov)
   - `expensesProjected: 376631` (includes 16 Nov)

3. **No regressions:**
   - All other features still work
   - Backward compatibility maintained
   - Timeline still correct

4. **User Experience:**
   - Mode toggle instant and smooth
   - Balance colors correct (green/red)
   - Labels accurate ("Saldo Hari Ini" vs "Saldo Proyeksi")

---

---

## 🔥 CRITICAL: Carry-Over Bug Found & Fixed

### Additional Bug: December Saldo Awal
- **Problem:** Saldo Awal Desember = -Rp 376.631 (should be +Rp 376.630)
- **Root Cause:** Carry-over used `availableBalance` instead of `projectedBalance`
- **Fix:** Backend updated to use `projectedBalance`
- **Action Required:** Click "Re-kalkulasi Saldo Awal" button in November timeline

### UI Button Test

- [ ] **Test 14: Button Visibility**
  - Navigate to November 2025
  - Open any pocket timeline
  - Click 3-dots (⋮) menu
  - Verify "Re-kalkulasi Saldo Awal" button exists (blue color) ✅
  - Navigate to other months (Oct, Dec)
  - Button should NOT appear ✅

- [ ] **Test 15: Button Functionality**
  - In November 2025, click the button
  - Verify loading state: "Mengkalkulasi..." with spinning icon ✅
  - Button should be disabled during loading ✅
  - Success toast appears ✅
  - Page refreshes automatically ✅

### Re-Generation Test

- [ ] **Test 16: Re-Generate Carry-Over**
  - Click button in November timeline
  - Wait for success + refresh
  - Navigate to December 2025
  - Open PayLater timeline
  - Verify Saldo Awal shows +Rp 376.630 ✅
  - Color should be green (positive) ✅

- [ ] **Test 17: Carry-Over Consistency**
  - November Saldo Proyeksi = +Rp 376.630
  - December Saldo Awal = +Rp 376.630
  - Both match exactly ✅
  
- [ ] **Test 18: All Pockets Updated**
  - Check Daily pocket December Saldo Awal ✅
  - Check Cold Money December Saldo Awal ✅
  - Check all Custom pockets December Saldo Awal ✅
  - All should match their November Saldo Proyeksi ✅

### Console Verification (After Re-Gen)

```
[CARRY-OVER] Generating carry-overs: 2025-11 → 2025-12
[CARRY-OVER] ✅ Saved: PayLater (pocket_custom_paylater) = 376630
                                                            ^^^^^^
                                                            Positive! ✅
```

---

**Status:** Backend fixed ✅ | User re-generation required ⚠️  
**Quick Fix:** See [QUICK_FIX_SALDO_AWAL.md](QUICK_FIX_SALDO_AWAL.md)  
**Tester:** Please verify all checkboxes above
