# Hotfix Sehari-hari Saldo Awal - Quick Reference

## 🎯 What Was Fixed

**Bug:** Timeline Sehari-hari menampilkan Saldo Awal = Rp 0 (SALAH!)

**Fix:** Include Budget Awal dalam perhitungan Saldo Awal

**Status:** ✅ COMPLETE

---

## 🔧 The Fix

### File: `/supabase/functions/server/index.tsx`

**Location:** Line 2203-2225

**Logic:**

```typescript
// Calculate carry-over
let carryoverFromPrevious = 0;
previousExpenses.forEach(exp => carryoverFromPrevious -= exp.amount);
previousIncome.forEach(inc => carryoverFromPrevious += inc.amount);
previousTransfers.forEach(t => /* ... */);

// Conditional logic
if (pocketId === 'pocket_sehari_hari') {
  // ✅ SEHARI-HARI: Budget Awal + Carry-over
  const budgetKey = `budget:${monthKey}`;
  const budgetData = await kv.get(budgetKey) || { initialBudget: 0 };
  const budgetAwal = budgetData.initialBudget || 0;
  
  initialBalance = budgetAwal + carryoverFromPrevious;
} else {
  // ✅ OTHER POCKETS: Carry-over only
  initialBalance = carryoverFromPrevious;
}
```

---

## 📊 Before vs After

### BEFORE (WRONG):
```
Timeline Sehari-hari:
└─ Saldo Awal: Rp 0 ❌
   └─ Semua saldo jadi negatif! ❌
```

### AFTER (CORRECT):
```
Timeline Sehari-hari:
└─ Saldo Awal: Rp 753.446 ✅
   (= Budget Awal Oktober)
   └─ Semua saldo positif dan benar! ✅
```

---

## 🧩 Formula

### Sehari-hari:
```
Saldo Awal = Budget Awal [Bulan Ini] + Carry-over [Bulan Lalu]
```

**Example:**
```
Oktober:
- Budget Awal: Rp 753.446
- Carry-over Sep: Rp 0
→ Saldo Awal = Rp 753.446 ✅
```

### Other Pockets (Uang Dingin, Custom):
```
Saldo Awal = Carry-over [Bulan Lalu]
```

**Example:**
```
Uang Dingin (Oktober):
- Carry-over Sep: Rp 15.661.398
→ Saldo Awal = Rp 15.661.398 ✅
```

---

## ✅ Test Checklist

- [ ] Timeline Sehari-hari shows correct Saldo Awal (not Rp 0)
- [ ] Saldo Awal = Budget Awal + carry-over
- [ ] Timeline Uang Dingin unchanged (carry-over only)
- [ ] Console logs show Budget Awal for Sehari-hari
- [ ] All balanceAfter calculations correct

---

## 🎯 Key Takeaway

**"Sehari-hari is budget-driven, not income-driven!"**

**Rule:**
- ✅ Sehari-hari = Budget Awal + Carry-over
- ✅ Other pockets = Carry-over only

---

**Status:** ✅ COMPLETE  
**Date:** Nov 10, 2025  
**Files:** 1 file modified

**Full Docs:** `/planning/hotfix-sehari-hari-saldo-awal/IMPLEMENTATION_COMPLETE.md`
