# Income Breakdown Display - Quick Fix

## 🐛 Problem
Pemasukan untuk Uang Dingin **tidak tampil** di breakdown Info tab

---

## ✅ Solution

### 1. Server - Add `income` to Response

**`/supabase/functions/server/index.tsx`**

```diff
// Type definition (line 59-67)
interface PocketBalance {
  pocketId: string;
  originalAmount: number;
+ income: number; // 💰 NEW
  transferIn: number;
  transferOut: number;
  expenses: number;
  availableBalance: number;
  lastUpdated: string;
}

// Return value (line 441-449)
return {
  pocketId,
  originalAmount,
+ income: incomeTotal, // 💰 NEW
  transferIn,
  transferOut,
  expenses: expensesTotal,
  availableBalance,
  lastUpdated: new Date().toISOString()
};
```

---

### 2. Frontend - Display Income

**`/components/PocketTimeline.tsx`**

```diff
// Type definition (line 38-45)
interface PocketBalance {
  pocketId: string;
  originalAmount: number;
+ income: number; // 💰 NEW
  transferIn: number;
  transferOut: number;
  expenses: number;
  availableBalance: number;
}

// Display in breakdown (line 584-598)
+ {balance.income > 0 && (
+   <div className="flex items-center justify-between">
+     <div className="flex items-center gap-2">
+       <TrendingUp className="size-4 text-green-600" />
+       <span className="text-sm text-muted-foreground">Pemasukan</span>
+     </div>
+     <span className="font-medium text-green-600">+{formatCurrency(balance.income)}</span>
+   </div>
+ )}
```

---

## 📸 Result

### Before:
```
📊 Saldo Asli     Rp 2.000.000
📉 Pengeluaran    Rp 500.000
📈 Transfer Masuk Rp 500.000

Saldo Proyeksi: Rp 5.000.000 (❓ dari mana?)
```

### After:
```
📊 Saldo Asli      Rp 2.000.000
📉 Pengeluaran     Rp 500.000
💰 Pemasukan      +Rp 3.000.000 ✅
📈 Transfer Masuk  Rp 500.000

Saldo Proyeksi: Rp 5.000.000 (✅ jelas!)
```

---

## 🎯 Applies To:
- ✅ Uang Dingin (Cold Money)
- ✅ Custom Pockets
- ❌ Daily Pocket (no income field)

---

**Full Docs**: `/INCOME_BREAKDOWN_DISPLAY_FIX.md`
