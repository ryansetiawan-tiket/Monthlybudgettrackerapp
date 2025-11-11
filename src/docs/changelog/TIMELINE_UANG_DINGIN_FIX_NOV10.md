# Timeline Uang Dingin Bug Fix - November 10, 2025

## 🎯 Overview

Fixed 3 critical bugs in Timeline kantong "Uang Dingin" (Cold Money pocket) that caused incorrect data display:
1. **Nominal salah** - Menampilkan USD bukan IDR
2. **Nama generic** - Semua income menampilkan "Pemasukan"
3. **Data hilang** - Hanya 3 dari 7+ transaksi yang muncul

## 🐛 Bugs Fixed

### Bug 1: Wrong Currency Display (USD vs IDR)
**Symptom:**
```
Expected: +Rp 495.000 (Fiverr $32)
Actual:   +Rp 32 (SALAH!)
```

**Root Cause:**
- Old endpoint used `income.amount` (USD field) instead of `income.amountIDR`

**Fix:**
```diff
- amount: income.amount
+ amount: (income.amountIDR || income.amount) - (income.deduction || 0)
```

### Bug 2: Generic Income Names
**Symptom:**
```
Expected: "Fiverr", "CGTrader", "Pulsa"
Actual:   "Pemasukan", "Pemasukan", "Pemasukan"
```

**Root Cause:**
- Old endpoint used `income.description` field which doesn't exist
- Fallback to "Pemasukan" was always triggered

**Fix:**
```diff
- description: income.description || 'Pemasukan'
+ description: income.name || 'Pemasukan'
```

### Bug 3: Missing Transactions
**Symptom:**
```
Expected: 7+ income entries
Actual:   Only 3 entries shown
```

**Root Cause:**
- **Duplicate endpoint routes!**
- Two endpoints with same route `/timeline/:year/:month/:pocketId`
  - Line 2209: Old endpoint (manual carry-over, buggy)
  - Line 2808: New endpoint (auto carry-over, correct)
- Hono router used FIRST defined endpoint (old buggy one)

**Fix:**
- Deprecated old endpoint by changing route:
```diff
- app.get("/make-server-3adbeaf1/timeline/:year/:month/:pocketId", ...)
+ app.get("/make-server-3adbeaf1/timeline-OLD-DEPRECATED/:year/:month/:pocketId", ...)
```

## 📝 Changes Made

### 1. Deprecated Old Timeline Endpoint
**File:** `/supabase/functions/server/index.tsx` (line 2209)

- Changed route to `/timeline-OLD-DEPRECATED/...`
- Added deprecation warning in comments
- Fixed bugs for documentation purposes
- Route conflict resolved

### 2. Fixed Income Field Mapping
**File:** `/supabase/functions/server/index.tsx` (line 2392-2398)

Even though endpoint is deprecated, fixed bugs for reference:
```typescript
currentMonthIncome.forEach((income: any) => {
  entries.push({
    // ... other fields
    description: income.name || 'Pemasukan',  // ✅ FIX
    amount: (income.amountIDR || income.amount) - (income.deduction || 0), // ✅ FIX
    metadata: { 
      amountUSD: income.amountUSD || income.amount,
      exchangeRate: income.exchangeRate,
      deduction: income.deduction
    }
  });
});
```

### 3. Fixed Typo in generatePocketTimeline
**File:** `/supabase/functions/server/index.tsx` (line 1028)

```diff
- const incomePoketId = i.pocketId || POCKET_IDS.COLD_MONEY;
+ const incomePocketId = i.pocketId || POCKET_IDS.COLD_MONEY;
```

## ✅ Testing

### Manual Test Results
- [x] Timeline shows correct IDR amounts (not USD)
- [x] Income names display correctly ("Fiverr", "CGTrader", etc.)
- [x] All 7+ transactions appear in timeline
- [x] Deduction properly subtracted from amount
- [x] Exchange rate metadata displayed correctly
- [x] No duplicate route conflicts

### Test Data
```typescript
Income Entry:
{
  name: "Fiverr",
  amountUSD: 32,
  amountIDR: 495000,
  deduction: 0,
  exchangeRate: 15468.75
}

Timeline Display:
- Description: "Fiverr" ✅
- Amount: +Rp 495.000 ✅
- Metadata shows: $32 @ 15.468,75 ✅
```

## 🔧 Technical Details

### Income Data Structure
```typescript
interface Income {
  id: string;
  name: string;           // ✅ Use for description
  amount: number;         // Legacy USD field
  amountUSD: number;      // Proper USD field
  amountIDR: number;      // ✅ Use for timeline amount
  deduction: number;      // Subtract from amountIDR
  exchangeRate: number;
  pocketId: string;
  date: string;
}
```

### Endpoint Architecture

**New Endpoint (ACTIVE):** Line 2808
- Route: `/make-server-3adbeaf1/timeline/:year/:month/:pocketId`
- Uses: `generatePocketTimeline()` function
- Features:
  - ✅ Auto carry-over via `getCarryOverForPocket()`
  - ✅ Correct field mapping
  - ✅ Consistent with FASE 3 architecture

**Old Endpoint (DEPRECATED):** Line 2209
- Route: `/make-server-3adbeaf1/timeline-OLD-DEPRECATED/:year/:month/:pocketId`
- Features:
  - ❌ Manual carry-over calculation
  - ❌ Had field mapping bugs
  - ❌ Not integrated with new system

## 📊 Impact

### Before Fix ❌
```
Timeline Uang Dingin:
- +Rp 32      | Pemasukan  (3 entries total)
- +Rp 156     | Pemasukan
- +Rp 53      | Pemasukan
```

### After Fix ✅
```
Timeline Uang Dingin:
- +Rp 48.000    | CGTrader
- +Rp 495.000   | Fiverr $32
- +Rp 2.418.000 | Fiverr $156
- +Rp 822.000   | Fiverr $53.08
- +Rp 100.000   | Pulsa
... (7+ entries total)
```

## 🔗 Related

- **Main Documentation:** `/TIMELINE_UANG_DINGIN_BUG_FIX_COMPLETE.md`
- **Quick Reference:** `/TIMELINE_UANG_DINGIN_QUICK_REF.md`
- **Related Fix:** `/SALDO_AWAL_FIX_V2_COMPLETE.md`
- **Architecture:** `/planning/kantong-architecture-fix-v3-safe/`

## 📚 Lessons Learned

1. **Remove deprecated endpoints** - Don't leave duplicate routes
2. **Add clear deprecation comments** - Mark old code clearly
3. **Test all pocket types** - Bug only visible in specific pockets
4. **Know your data structure** - Difference between `amount` vs `amountIDR` is critical
5. **Check route conflicts** - Multiple endpoints with same route causes issues

## 🚀 Next Steps

- [x] Fix implemented
- [x] Documentation created
- [x] Testing completed
- [ ] Deploy to production
- [ ] Monitor for similar issues in other pockets

---

**Status:** ✅ Ready for deployment  
**Severity:** 🔴 Critical (data display incorrect)  
**Risk:** 🟢 Low (fix is isolated and tested)
