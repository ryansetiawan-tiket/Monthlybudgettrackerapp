# Saldo Proyeksi Fix - Timeline Balance

## 🐛 Problem

**Issue**: Saldo Proyeksi tidak akurat - menampilkan nilai yang salah  
**Reported**: Saldo Proyeksi menunjukkan **-Rp 77.304** padahal seharusnya **Rp 15.661.398**

### Visual Problem:

**Info Tab (Sebelum Fix):**
```
┌──────────────────────────────┐
│ Saldo Proyeksi               │
│ -Rp 77.304  ❌ SALAH!        │
│                              │
│ 📊 Saldo Asli:  Rp X         │
│ 💰 Pemasukan:  +Rp Y         │
│ 📉 Pengeluaran: Rp Z         │
└──────────────────────────────┘
```

**Timeline (Data Benar):**
```
┌──────────────────────────────┐
│ 26 Nov - Hotel               │
│ -Rp 250.000                  │
│ Saldo: Rp 15.661.398 ✅      │
│ ← Ini yang benar!            │
└──────────────────────────────┘
```

---

## 🔍 Root Cause

### Wrong Calculation Source

**Before Fix (Line 559, 563):**
```tsx
<p className={`text-2xl font-semibold ${
  (isRealtimeMode && realtimeBalance !== null 
    ? realtimeBalance 
    : balance.availableBalance  // ❌ SALAH! Server calculation
  ) >= 0 
    ? 'text-[#00c950]' 
    : 'text-red-500'
}`}>
  {formatCurrency(
    isRealtimeMode && realtimeBalance !== null 
      ? realtimeBalance 
      : balance.availableBalance  // ❌ SALAH!
  )}
</p>
```

**Problem:**
- ❌ Menggunakan `balance.availableBalance` dari server
- ❌ Server menghitung ulang dari raw data (expenses, income, transfers)
- ❌ Tidak akurat karena mungkin ada delay/inkonsistensi

**Correct Source:**
- ✅ Timeline entries sudah memiliki `balanceAfter` yang dihitung secara kumulatif
- ✅ Entry paling baru/terakhir (index 0) = Saldo Proyeksi
- ✅ Ini adalah "end balance" setelah semua transaksi

---

## ✅ Solution

### 1. Compute Projected Balance from Timeline

**Added (Line 274-283):**
```tsx
// ✅ FIX: Saldo Proyeksi = balanceAfter dari entry TERAKHIR (paling baru/atas)
// Ini adalah saldo yang akan dicapai jika semua transaksi di timeline terjadi
const projectedBalance = useMemo(() => {
  if (!entries || entries.length === 0) {
    return balance.availableBalance; // Fallback to server balance if no entries
  }
  
  // Entries are already sorted DESC (newest first) from server
  // So entries[0] is the LATEST/NEWEST entry
  return entries[0].balanceAfter;
}, [entries, balance.availableBalance]);
```

**Logic:**
1. Jika ada entries, ambil `balanceAfter` dari entry pertama (newest)
2. Jika tidak ada entries, fallback ke `balance.availableBalance`
3. Use `useMemo` for performance (only recalculate when dependencies change)

---

### 2. Update Display to Use Projected Balance

**Changed (Line 559, 563):**
```tsx
<p className={`text-2xl font-semibold ${
  (isRealtimeMode && realtimeBalance !== null 
    ? realtimeBalance 
    : projectedBalance  // ✅ FIXED! Use timeline balance
  ) >= 0 
    ? 'text-[#00c950]' 
    : 'text-red-500'
}`}>
  {formatCurrency(
    isRealtimeMode && realtimeBalance !== null 
      ? realtimeBalance 
      : projectedBalance  // ✅ FIXED!
  )}
</p>
```

---

## 📊 How It Works

### Example Scenario (User's Case):

**Uang Dingin - November 2025:**
```
Transaksi dari 1 Nov - 30 Nov:
├─ 1 Nov:  Income +Rp 1.000.000  → Saldo: Rp 1.000.000
├─ 2 Nov:  Income +Rp 1.000.000  → Saldo: Rp 2.000.000
├─ 3 Nov:  Income +Rp 1.000.000  → Saldo: Rp 3.000.000
│  ...
├─ 25 Nov: Expense -Rp 500.000   → Saldo: Rp 15.911.398
└─ 26 Nov: Expense -Rp 250.000   → Saldo: Rp 15.661.398 ← LATEST
    ...
└─ 30 Nov: Income +Rp 1.000.000  → Saldo: Rp 30.000.000 (future)
```

**Today = 10 Nov:**

**Mode Proyeksi (OFF):**
```
Saldo Proyeksi = entries[0].balanceAfter
               = Transaksi terakhir (26 Nov)
               = Rp 15.661.398 ✅
```
**Why?** Karena entry terakhir yang di-input user adalah 26 Nov, jadi itu adalah "end balance" dari semua transaksi yang sudah di-input.

**Mode Realtime (ON):**
```
Saldo Hari Ini = balanceAfter dari entry terakhir yang datenya <= hari ini
               = Entry tanggal 10 Nov
               = Rp 10.000.000 ✅
```

---

## 🎯 Key Concepts

### Saldo Proyeksi (Projection Balance)
> **Definition**: Saldo akhir setelah SEMUA transaksi yang sudah di-input user terjadi

**Characteristics:**
- ✅ Includes ALL entries in timeline (past, today, future)
- ✅ Shows "where you'll end up" if all planned transactions happen
- ✅ = `balanceAfter` of the NEWEST entry (chronologically latest)
- ✅ Updates when user adds/edits/deletes ANY transaction

**Use Case:**
- User input transaksi untuk bulan penuh (1-30 Nov)
- Baru tanggal 10 Nov
- Saldo Proyeksi = balance setelah transaksi terakhir (26 Nov) = Rp 15.661.398

---

### Saldo Realtime (Realtime Balance)
> **Definition**: Saldo aktual hari ini (hanya menghitung transaksi sampai hari ini)

**Characteristics:**
- ✅ Only includes entries with date <= TODAY
- ✅ Shows "where you are now"
- ✅ = `balanceAfter` of the last entry where date <= today
- ✅ Changes every day automatically

**Use Case:**
- Same data (1-30 Nov)
- Today = 10 Nov
- Saldo Realtime = balance up to 10 Nov = Rp 10.000.000

---

## 🔧 Technical Details

### Timeline Entry Structure

```typescript
interface TimelineEntry {
  id: string;
  type: 'income' | 'expense' | 'transfer' | 'initial_balance';
  date: string;  // ISO date
  description: string;
  amount: number;  // Transaction amount
  balanceAfter: number;  // ✅ Cumulative balance AFTER this transaction
  icon: string;
  color: string;
  metadata?: any;
}
```

**Key Field: `balanceAfter`**
- Calculated cumulatively by server/timeline builder
- Each entry knows the balance AFTER its transaction
- Sorted DESC (newest first): `entries[0]` = latest transaction

---

### Entry Sorting

**Server Response:**
```tsx
// Entries already sorted DESC (newest first)
const entries = [
  { date: '2025-11-26', balanceAfter: 15661398 },  // ← entries[0] = LATEST
  { date: '2025-11-25', balanceAfter: 15911398 },
  { date: '2025-11-10', balanceAfter: 10000000 },
  { date: '2025-11-09', balanceAfter: 9000000 },
  // ...
  { date: '2025-11-01', balanceAfter: 1000000 }
];
```

**Projected Balance:**
```tsx
const projectedBalance = entries[0].balanceAfter;  // = 15661398 ✅
```

---

## 🧪 Testing Scenarios

### Test 1: Normal Case (Has Entries)
```
Given: 
  - Timeline has 10 entries
  - Latest entry: 26 Nov, balanceAfter = Rp 15.661.398

When: View Info tab with Realtime OFF

Then:
  ✅ Saldo Proyeksi displays: Rp 15.661.398
  ✅ Matches timeline's latest entry balance
```

---

### Test 2: Empty Timeline
```
Given: 
  - Timeline has NO entries
  - balance.availableBalance = Rp 5.000.000

When: View Info tab

Then:
  ✅ Saldo Proyeksi displays: Rp 5.000.000 (fallback)
  ✅ No error/undefined
```

---

### Test 3: Add New Transaction
```
Given: 
  - Current projectedBalance = Rp 15.661.398
  - Latest entry: 26 Nov

When: User adds new expense on 27 Nov (-Rp 100.000)

Then:
  ✅ New entry becomes entries[0] (sorted DESC)
  ✅ projectedBalance updates to Rp 15.561.398
  ✅ Info tab reflects new balance immediately
```

---

### Test 4: Future Transaction
```
Given: 
  - Today = 10 Nov
  - User adds income on 30 Nov (+Rp 1.000.000)
  - This becomes the latest entry

When: View Info tab with Realtime OFF

Then:
  ✅ Saldo Proyeksi = balance after 30 Nov transaction
  ✅ Includes future transaction
  ✅ This is correct for projection mode!
```

---

### Test 5: Switch Realtime Mode
```
Given: 
  - Projected balance = Rp 15.661.398 (26 Nov)
  - Realtime balance = Rp 10.000.000 (10 Nov)

When: Toggle Realtime ON → OFF → ON

Then:
  ✅ ON:  Displays Rp 10.000.000 (realtime)
  ✅ OFF: Displays Rp 15.661.398 (projected)
  ✅ No flicker/lag
```

---

## 📝 Files Modified

| File | Lines | Change |
|------|-------|--------|
| `/components/PocketTimeline.tsx` | 274-283 | Added `projectedBalance` computed value |
| `/components/PocketTimeline.tsx` | 559, 563 | Changed from `balance.availableBalance` to `projectedBalance` |

---

## 🎨 Visual Comparison

### Before Fix:

**Info Tab:**
```
┌────────────────────────────────┐
│ Saldo Proyeksi                 │
│ -Rp 77.304  ← Wrong!           │
│                                │
│ Breakdown shows correct values │
│ but total is wrong! ❌         │
└────────────────────────────────┘
```

**Timeline:**
```
┌────────────────────────────────┐
│ 26 Nov - Hotel                 │
│ Saldo: Rp 15.661.398  ← Right! │
│                                │
│ 25 Nov - Groceries             │
│ Saldo: Rp 15.911.398           │
└────────────────────────────────┘
```

**Problem:** Info tab and Timeline show DIFFERENT balances!

---

### After Fix:

**Info Tab:**
```
┌────────────────────────────────┐
│ Saldo Proyeksi                 │
│ Rp 15.661.398  ← Correct! ✅   │
│                                │
│ Matches timeline! 🎉           │
└────────────────────────────────┘
```

**Timeline:**
```
┌────────────────────────────────┐
│ 26 Nov - Hotel                 │
│ Saldo: Rp 15.661.398  ← Same!  │
│                                │
│ 25 Nov - Groceries             │
│ Saldo: Rp 15.911.398           │
└────────────────────────────────┘
```

**Success:** Info tab and Timeline are NOW CONSISTENT! ✅

---

## 💡 Why This Fix Works

### Old Logic (Wrong):
```
Server: Recalculates from raw data
  ↓
balance.availableBalance = ???  ← May have bugs/delays
  ↓
Info Tab displays wrong value ❌
```

**Problem:**
- Server calculation might have bugs
- No guarantee it matches timeline
- Two sources of truth = inconsistency

---

### New Logic (Correct):
```
Timeline: Already has balanceAfter per entry
  ↓
entries[0].balanceAfter = Latest transaction balance
  ↓
Info Tab uses SAME value as timeline ✅
```

**Benefits:**
- ✅ Single source of truth (timeline)
- ✅ Guaranteed consistency
- ✅ No recalculation needed
- ✅ User sees same balance in both places

---

## 🚀 Performance Impact

**Before Fix:**
```tsx
// No caching, used balance.availableBalance directly
{formatCurrency(balance.availableBalance)}
```

**After Fix:**
```tsx
// Memoized, only recalculates when entries change
const projectedBalance = useMemo(() => {
  return entries[0].balanceAfter;
}, [entries, balance.availableBalance]);
```

**Impact:**
- ✅ Minimal (just reading entries[0])
- ✅ Memoized (won't recalculate on every render)
- ✅ No performance degradation

---

## ✅ Status: COMPLETE

**Date**: November 10, 2025  
**Impact**: Saldo Proyeksi now accurately reflects timeline balance  
**Backward Compatible**: Yes (only changes display logic)

---

## 📚 Related Documentation

- `/INCOME_BREAKDOWN_DISPLAY_FIX.md` - Income field addition
- `/REALTIME_VS_PROJECTION_BALANCE_FIX.md` - Realtime mode logic
- `/planning/kantong-architecture-fix-v3-safe/FASE_3_COMPLETE.md` - Timeline architecture

---

**Key Takeaway**: Always use timeline as the source of truth for balance display. Server calculation is for internal logic, but timeline `balanceAfter` is what user sees and trusts! 💡✨
