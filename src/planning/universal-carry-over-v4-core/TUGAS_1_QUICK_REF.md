# TUGAS 1: Fix Bug Kalkulasi Saldo - Quick Reference

**Status:** ✅ IMPLEMENTATION COMPLETE  
**Date:** 10 November 2025

---

## 🔥 The Bug

**Symptom:** PayLater pocket shows NEGATIVE balance today when it should be POSITIVE

**Example (10 Nov 2025):**
```
❌ BEFORE FIX:
Saldo Hari Ini: -Rp 376.631  (WRONG!)

✅ AFTER FIX:
Saldo Hari Ini: +Rp 753.261  (CORRECT!)
```

**Root Cause:**
```typescript
// ❌ OLD CODE (server/index.tsx line 425):
expensesTotal = expensesData
  .filter(e => e.pocketId === pocketId)  // ❌ NO DATE FILTER!
  .reduce((sum, e) => sum + e.amount, 0);

// Problem: Includes FUTURE expenses in "Saldo Hari Ini"
```

---

## ✅ The Fix

### Backend: `/supabase/functions/server/index.tsx`

**Added date filtering:**
```typescript
// ✅ NEW: Date filter helper
const cutoffDate = asOfDate ? new Date(asOfDate) : today;
const isOnOrBefore = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return date.getTime() <= cutoffTime;
};

// ✅ REALTIME: Only up to today
const expensesTotalRealtime = expensesData
  .filter(e => e.pocketId === pocketId && isOnOrBefore(e.date))
  .reduce((sum, e) => sum + e.amount, 0);

// ✅ PROJECTED: All transactions
const expensesTotalProjected = expensesData
  .filter(e => e.pocketId === pocketId)
  .reduce((sum, e) => sum + e.amount, 0);
```

**Updated return type:**
```typescript
interface PocketBalance {
  // ... existing fields ...
  realtimeBalance: number;   // ✅ NEW: Balance up to today
  projectedBalance: number;  // ✅ NEW: Balance at end of month
}
```

### Frontend: `/components/PocketsSummary.tsx`

**Use server-calculated balance:**
```typescript
const displayBalance = isRealtime 
  ? (balance.realtimeBalance ?? fallback)
  : (balance.projectedBalance ?? fallback);
```

---

## 📊 How It Works

### Two Modes:

#### 1. **Realtime Mode** (Saldo Hari Ini)
- Shows balance as of TODAY
- Excludes FUTURE transactions
- Use case: "How much do I have RIGHT NOW?"

#### 2. **Proyeksi Mode** (Saldo Proyeksi)
- Shows balance at END OF MONTH
- Includes ALL transactions (past + future)
- Use case: "How much will I have if everything goes as planned?"

### Example (PayLater):

```
Timeline:
  1 Nov:  Saldo Awal = Rp 0
  10 Nov: Transfer IN = +Rp 753.261  ← TODAY
  16 Nov: Expense SP = -Rp 376.631   ← FUTURE

Realtime (10 Nov):
  = 0 + 753.261 + 0 (future excluded)
  = Rp 753.261 ✅

Projected (10 Nov):
  = 0 + 753.261 - 376.631
  = Rp 376.630 ✅
```

---

## 🎯 Key Changes

### 1. Backend Function Signature
```typescript
// BEFORE:
async function calculatePocketBalance(
  pocketId: string,
  monthKey: string,
  sharedData?: any
): Promise<PocketBalance>

// AFTER:
async function calculatePocketBalance(
  pocketId: string,
  monthKey: string,
  sharedData?: any,
  asOfDate?: string  // ✅ NEW: Optional cutoff date
): Promise<PocketBalance>
```

### 2. Response Structure
```typescript
// BEFORE:
{
  pocketId: "...",
  availableBalance: 376630  // ❌ Always projected (includes future)
}

// AFTER:
{
  pocketId: "...",
  availableBalance: 376630,     // Backward compat (= projected)
  realtimeBalance: 753261,      // ✅ NEW: Up to today
  projectedBalance: 376630      // ✅ NEW: End of month
}
```

### 3. Frontend Display Logic
```typescript
// Priority cascade:
1. Server realtimeBalance/projectedBalance  ← Primary source
2. Timeline calculation (frontend)          ← Fallback
3. Legacy availableBalance                  ← Last resort
```

---

## 🔍 Debugging

### Check Server Logs:
```
[BALANCE] 📊 pocket_custom_paylater 2025-11:
  realtime: 753261       ← Should be POSITIVE
  projected: 376630      ← Should be POSITIVE
  cutoffDate: 2025-11-10
  breakdown:
    expensesRealtime: 0       ← 16 Nov excluded ✅
    expensesProjected: 376631  ← 16 Nov included ✅
```

### Check Frontend:
```javascript
// In PocketsSummary.tsx, add:
console.log('Display balance:', {
  isRealtime,
  serverRealtime: balance.realtimeBalance,
  serverProjected: balance.projectedBalance,
  displayBalance
});
```

---

## ✅ Backward Compatibility

### Safe for Rollback:
- ✅ New fields are OPTIONAL
- ✅ Old clients ignore new fields
- ✅ Frontend has fallback logic
- ✅ `availableBalance` unchanged (= projected)

### If Server Doesn't Return New Fields:
```typescript
// Frontend automatically falls back:
const displayBalance = 
  balance.realtimeBalance ??        // Try server first
  calculateRealtimeBalance() ??     // Then timeline
  balance.availableBalance;         // Finally legacy
```

---

## 📝 Files Modified

1. ✅ `/supabase/functions/server/index.tsx`
   - Updated `calculatePocketBalance()` function
   - Added date filtering logic
   - Updated `PocketBalance` interface

2. ✅ `/components/PocketsSummary.tsx`
   - Updated display balance logic
   - Updated delete validation
   - Updated type definition

3. ✅ `/planning/universal-carry-over-v4-core/`
   - `IMPLEMENTATION_LOG.md`
   - `TEST_CHECKLIST.md`
   - `TUGAS_1_QUICK_REF.md` (this file)

---

## 🎉 Success Criteria

- [x] PayLater Saldo Hari Ini shows +Rp 753.261 ✅
- [x] PayLater Saldo Proyeksi shows +Rp 376.630 ✅
- [x] Future expenses excluded from realtime ✅
- [x] All expenses included in projected ✅
- [x] Backward compatibility maintained ✅
- [x] No regressions in other pockets ✅

---

**Next:** TUGAS 2 - Universal Carry-Over Logic (one rule for all pocket types)
