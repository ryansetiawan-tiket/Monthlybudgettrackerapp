# 🏗️ Revisi Arsitektur Fundamental: Aset vs Kewajiban

**Date**: November 10, 2025  
**Type**: Architecture Fix + UI Transparency Upgrade  
**Priority**: 🔥 CRITICAL - Fundamental Logic Fix  
**Status**: 📝 Planning Phase

---

## 🎯 "Aturan Emas" Arsitektur Baru

> **"Aplikasi HARUS memisahkan logic Aset (Uang Masuk) dari Kewajiban (Uang Keluar/Utang)"**

**Definisi**:
- **ASET** = Uang yang bisa digunakan (Positif)
- **KEWAJIBAN** = Utang yang harus dibayar (Negatif)

**Prinsip Fundamental**:
```
Total Pemasukan  = Budget Awal + Pemasukan Tambahan + Carry-Over POSITIF
Total Pengeluaran = Pengeluaran Baru + Carry-Over NEGATIF (Utang)
Sisa Budget = Total Pemasukan - Total Pengeluaran
```

---

## 📋 Executive Summary

### **Problem Statement**

**Current Issue**: Sistem saat ini tidak membedakan carry-over positif (aset) dan carry-over negatif (utang/kewajiban).

**Example Problem**:
```
Oktober:
- Sehari-hari: Sisa +Rp 500.000 (ASET)
- Uang Dingin: Sisa -Rp 200.000 (UTANG)

November (CURRENT - WRONG):
❌ Total Pemasukan = Budget + Income (carry-over diabaikan)
❌ Total Pengeluaran = Expenses (carry-over diabaikan)
❌ Result: User tidak tahu ada utang -200K dari bulan lalu!

November (NEW - CORRECT):
✅ Total Pemasukan = Budget + Income + Rp 500K (carry-over positif)
✅ Total Pengeluaran = Expenses + Rp 200K (carry-over negatif/utang)
✅ Result: Transparansi penuh! User tahu semua aset dan kewajiban
```

### **Solution Overview**

**4 TUGAS UTAMA**:
1. ✅ **FIX Logic**: Total Pemasukan (include carry-over positif)
2. ✅ **FIX Logic**: Total Pengeluaran (include carry-over negatif)
3. ✅ **FIX Logic**: Sisa Budget (recalculate dengan logic baru)
4. ✅ **UPGRADE UI**: Breakdown transparan dengan popover informatif

### **Impact**

**Before** (Current):
- ❌ Carry-over negatif (utang) tidak terlihat
- ❌ Total Pemasukan/Pengeluaran tidak akurat
- ❌ User bingung kenapa sisa budget tidak sesuai ekspektasi

**After** (Fixed):
- ✅ Carry-over positif masuk ke Total Pemasukan
- ✅ Carry-over negatif masuk ke Total Pengeluaran
- ✅ UI breakdown transparan: User tahu dari mana setiap angka
- ✅ Sisa Budget akurat reflect kondisi sebenarnya

---

## 🔍 Current State Analysis

### **File Locations**

**1. BudgetOverview Component** (`/components/BudgetOverview.tsx`)
- Current: Menerima props `totalIncome`, `totalExpenses`, `remainingBudget`
- Current: Sudah ada breakdown popover untuk Total Pemasukan (hanya Budget Awal + Pemasukan Tambahan)
- **FIX NEEDED**: Tambah "Carry-Over Aset" di breakdown
- **FIX NEEDED**: Tambah ikon Info + breakdown popover untuk Total Pengeluaran

**2. Calculation Logic** (`/utils/calculations.ts`)
- Current: `calculateBudget()` function sudah ada tapi belum include carry-over per tipe
- **FIX NEEDED**: Update logic untuk pisahkan carry-over positif/negatif

**3. Budget Data Hook** (`/hooks/useBudgetData.ts`)
- Current: Fetch budget, expenses, incomes
- Current: Ada `previousMonthRemaining` tapi tidak dipakai untuk split positif/negatif
- **FIX NEEDED**: Add function untuk hitung carry-over per pocket (positif vs negatif)

**4. App.tsx** (Main Component)
- Current: Hitung totalIncome, totalExpenses, remainingBudget
- **FIX NEEDED**: Update calculation logic sesuai arsitektur baru
- **FIX NEEDED**: Pass breakdown data ke BudgetOverview

**5. Pockets Data** (`/hooks/usePockets.ts`)
- Current: Sudah ada logic untuk hitung projected balance per pocket
- **USE THIS**: Untuk identifikasi pocket mana yang positif/negatif

---

## 🎯 TUGAS 1: Fix Logika "Total Pemasukan"

### **Formula Baru**

```typescript
Total Pemasukan [Nov] = 
  (Budget Awal [Nov]) + 
  (Total Pemasukan Tambahan [Nov]) + 
  (Total Saldo Akhir Proyeksi dari SEMUA Kantong POSITIF [> 0] dari Okt)
```

### **Implementation Plan**

**Step 1.1: Calculate Carry-Over Positif**

**Location**: `/utils/calculations.ts` (new function)

**Function**:
```typescript
/**
 * Calculate carry-over assets (positive pocket balances from previous month)
 * ARCHITECTURE: Aset = Uang yang bisa digunakan
 */
export const calculateCarryOverAssets = (
  pockets: Array<{ id: string; projectedBalance: number }>,
  previousMonth: { year: number; month: number }
): number => {
  // Filter only POSITIVE balances (Assets)
  const positiveBalances = pockets.filter(p => p.projectedBalance > 0);
  
  // Sum all positive balances
  const totalAssets = positiveBalances.reduce(
    (sum, p) => sum + p.projectedBalance,
    0
  );
  
  return totalAssets;
};
```

**Step 1.2: Update calculateBudget Function**

**Location**: `/utils/calculations.ts` (modify existing)

**Change**:
```typescript
// BEFORE
const totalIncome = initialBudget + carryover + totalAdditionalIncome;

// AFTER
const carryOverAssets = calculateCarryOverAssets(pocketBalances, previousMonth);
const totalIncome = initialBudget + totalAdditionalIncome + carryOverAssets;
```

**Step 1.3: Update App.tsx Calculation**

**Location**: `/App.tsx` (modify useMemo)

**Add**:
```typescript
// Calculate carry-over assets from previous month pockets
const carryOverAssets = useMemo(() => {
  if (!previousMonthPockets || previousMonthPockets.length === 0) return 0;
  
  return previousMonthPockets
    .filter(p => p.projectedBalance > 0) // Only positive (Assets)
    .reduce((sum, p) => sum + p.projectedBalance, 0);
}, [previousMonthPockets]);

// Update totalIncome calculation
const totalIncome = useMemo(() => {
  return budget.initialBudget + totalAdditionalIncome + carryOverAssets;
}, [budget.initialBudget, totalAdditionalIncome, carryOverAssets]);
```

### **Success Criteria**

- ✅ `totalIncome` includes carry-over positif dari bulan sebelumnya
- ✅ Jika Oktober punya 3 kantong: +500K, +200K, -100K → Carry-over aset = +700K
- ✅ Console log shows correct breakdown

---

## 🎯 TUGAS 2: Fix Logika "Total Pengeluaran"

### **Formula Baru**

```typescript
Total Pengeluaran [Nov] = 
  (Total Pengeluaran BARU [Nov]) + 
  (Total Saldo Akhir Proyeksi dari SEMUA Kantong NEGATIF [< 0] dari Okt)
```

### **Implementation Plan**

**Step 2.1: Calculate Carry-Over Kewajiban**

**Location**: `/utils/calculations.ts` (new function)

**Function**:
```typescript
/**
 * Calculate carry-over liabilities (negative pocket balances from previous month)
 * ARCHITECTURE: Kewajiban = Utang yang harus dibayar
 */
export const calculateCarryOverLiabilities = (
  pockets: Array<{ id: string; projectedBalance: number }>,
  previousMonth: { year: number; month: number }
): number => {
  // Filter only NEGATIVE balances (Liabilities)
  const negativeBalances = pockets.filter(p => p.projectedBalance < 0);
  
  // Sum all negative balances (absolute value for display)
  // Note: We use absolute because in UI we show as "Utang: +Rp 200K"
  const totalLiabilities = Math.abs(
    negativeBalances.reduce((sum, p) => sum + p.projectedBalance, 0)
  );
  
  return totalLiabilities;
};
```

**Step 2.2: Update calculateBudget Function**

**Location**: `/utils/calculations.ts` (modify existing)

**Change**:
```typescript
// BEFORE
const totalExpenses = expenses
  .filter((e, i) => !excludedExpenseIds.has(i.toString()) && !e.fromIncome)
  .reduce((sum, e) => sum + e.amount, 0);

// AFTER
const totalExpensesCurrent = expenses
  .filter((e, i) => !excludedExpenseIds.has(i.toString()) && !e.fromIncome)
  .reduce((sum, e) => sum + e.amount, 0);

const carryOverLiabilities = calculateCarryOverLiabilities(
  pocketBalances,
  previousMonth
);

const totalExpenses = totalExpensesCurrent + carryOverLiabilities;
```

**Step 2.3: Update App.tsx Calculation**

**Location**: `/App.tsx` (modify useMemo)

**Add**:
```typescript
// Calculate carry-over liabilities from previous month pockets
const carryOverLiabilities = useMemo(() => {
  if (!previousMonthPockets || previousMonthPockets.length === 0) return 0;
  
  const negativeSum = previousMonthPockets
    .filter(p => p.projectedBalance < 0) // Only negative (Liabilities)
    .reduce((sum, p) => sum + p.projectedBalance, 0);
  
  return Math.abs(negativeSum); // Return positive number for display
}, [previousMonthPockets]);

// Update totalExpenses calculation
const totalExpenses = useMemo(() => {
  const currentMonthExpenses = expenses
    .filter(e => !e.fromIncome)
    .reduce((sum, e) => sum + e.amount, 0);
  
  return currentMonthExpenses + carryOverLiabilities;
}, [expenses, carryOverLiabilities]);
```

### **Success Criteria**

- ✅ `totalExpenses` includes carry-over negatif (utang) dari bulan sebelumnya
- ✅ Jika Oktober punya kantong -100K → Total Pengeluaran Nov += 100K
- ✅ Console log shows correct breakdown

---

## 🎯 TUGAS 3: Fix Kalkulasi "Sisa Budget"

### **Formula Baru**

```typescript
Sisa Budget [Nov] = 
  (Total Pemasukan BARU [dari Tugas 1]) - 
  (Total Pengeluaran BARU [dari Tugas 2])
```

### **Implementation Plan**

**Step 3.1: Update remainingBudget Calculation**

**Location**: `/App.tsx` (modify useMemo)

**Change**:
```typescript
// BEFORE (might be like this)
const remainingBudget = totalIncome - globalDeduction - totalExpenses;

// AFTER (simple and clean)
const remainingBudget = useMemo(() => {
  return totalIncome - totalExpenses;
}, [totalIncome, totalExpenses]);

// Note: globalDeduction sudah di-subtract dari totalIncome (di additionalIncome)
// Jadi tidak perlu subtract lagi di sini
```

**Step 3.2: Verify globalDeduction Logic**

**Location**: `/App.tsx` (check existing)

**Ensure**:
```typescript
// totalAdditionalIncome should ALREADY subtract globalDeduction
const totalAdditionalIncome = useMemo(() => {
  const grossIncome = additionalIncomes.reduce(
    (sum, income) => sum + income.amountIDR,
    0
  );
  return grossIncome - (budget.incomeDeduction || 0);
}, [additionalIncomes, budget.incomeDeduction]);
```

### **Success Criteria**

- ✅ `remainingBudget` correctly calculated as `totalIncome - totalExpenses`
- ✅ No double-counting of globalDeduction
- ✅ Formula simple dan jelas

---

## 🎯 TUGAS 4: Upgrade UI Transparansi

### **Part A: Total Pengeluaran Breakdown**

**4A.1: Add Info Icon**

**Location**: `/components/BudgetOverview.tsx`

**Current**:
```tsx
<p className="text-sm font-medium">Total Pengeluaran</p>
<div className="size-2 rounded-full bg-red-500"></div>
```

**Change to**:
```tsx
<div className="flex items-center gap-1.5">
  <p className="text-sm font-medium leading-none">Total Pengeluaran</p>
  {/* ✨ Info icon with breakdown popover */}
  <Popover>
    <PopoverTrigger asChild>
      <button 
        className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"
        style={{ padding: '0px', margin: '0px' }}
        onClick={(e) => e.stopPropagation()}
        aria-label="Lihat breakdown pengeluaran"
      >
        <Info className="size-3.5" />
      </button>
    </PopoverTrigger>
    <PopoverContent side="bottom" align="start" className="w-[240px] p-3">
      {/* Breakdown content here */}
    </PopoverContent>
  </Popover>
</div>
<div className="size-2 rounded-full bg-red-500"></div>
```

**4A.2: Popover Content**

**Structure**:
```tsx
<PopoverContent side="bottom" align="start" className="w-[240px] p-3">
  <div className="space-y-1.5 text-xs">
    <div className="font-semibold mb-2 text-foreground">
      Breakdown Pengeluaran:
    </div>
    
    {/* Pengeluaran Bulan Ini */}
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">Pengeluaran Bulan Ini:</span>
      <span className="text-red-600 font-medium">
        -{formatCurrency(currentMonthExpenses)}
      </span>
    </div>
    
    {/* Carry-Over Kewajiban (Utang) */}
    {carryOverLiabilities > 0 && (
      <div className="flex justify-between gap-2">
        <span className="text-muted-foreground">
          Carry-Over Kewajiban (Utang Kantong<sup>-</sup>):
        </span>
        <span className="text-red-600 font-medium">
          -{formatCurrency(carryOverLiabilities)}
        </span>
      </div>
    )}
    
    {/* Total */}
    <div className="h-px bg-border my-1.5"></div>
    <div className="flex justify-between gap-2 font-semibold">
      <span className="text-foreground">Total Pengeluaran:</span>
      <span className="text-red-600">
        -{formatCurrency(totalExpenses)}
      </span>
    </div>
  </div>
</PopoverContent>
```

**Props to Add**:
```typescript
interface BudgetOverviewProps {
  // ... existing props
  currentMonthExpenses?: number;
  carryOverLiabilities?: number;
}
```

### **Part B: Total Pemasukan Breakdown Upgrade**

**4B.1: Upgrade Existing Popover**

**Location**: `/components/BudgetOverview.tsx` (modify existing)

**Current Structure** (already exists):
```tsx
<div className="space-y-1.5 text-xs">
  <div className="font-semibold mb-2">Breakdown Pemasukan:</div>
  {/* Budget Awal */}
  {/* Pemasukan Tambahan */}
  {/* Global Deduction */}
  {/* Total Bersih */}
</div>
```

**Add After "Pemasukan Tambahan"**:
```tsx
{/* NEW: Carry-Over Aset */}
{carryOverAssets > 0 && (
  <div className="flex justify-between gap-2">
    <span className="text-muted-foreground">
      Carry-Over Aset (Sisa Kantong<sup>+</sup>):
    </span>
    <span className="text-green-600 font-medium">
      +{formatCurrency(carryOverAssets)}
    </span>
  </div>
)}
```

**Updated Complete Structure**:
```tsx
<PopoverContent side="bottom" align="start" className="w-[240px] p-3">
  <div className="space-y-1.5 text-xs">
    <div className="font-semibold mb-2 text-foreground">
      Breakdown Pemasukan:
    </div>
    
    {/* Budget Awal */}
    {initialBudget > 0 && (
      <div className="flex justify-between gap-2">
        <span className="text-muted-foreground">Budget Awal:</span>
        <span className="text-green-600 font-medium">
          +{formatCurrency(initialBudget)}
        </span>
      </div>
    )}
    
    {/* Pemasukan Tambahan */}
    {additionalIncome > 0 && (
      <div className="flex justify-between gap-2">
        <span className="text-muted-foreground">Pemasukan Tambahan:</span>
        <span className="text-green-600 font-medium">
          +{formatCurrency(additionalIncome)}
        </span>
      </div>
    )}
    
    {/* NEW: Carry-Over Aset */}
    {carryOverAssets > 0 && (
      <div className="flex justify-between gap-2">
        <span className="text-muted-foreground">
          Carry-Over Aset (Sisa Kantong<sup>+</sup>):
        </span>
        <span className="text-green-600 font-medium">
          +{formatCurrency(carryOverAssets)}
        </span>
      </div>
    )}
    
    {/* Global Deduction */}
    {globalDeduction > 0 && (
      <>
        <div className="h-px bg-border my-1.5"></div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Potongan Global:</span>
          <span className="text-red-600 font-medium">
            -{formatCurrency(globalDeduction)}
          </span>
        </div>
      </>
    )}
    
    {/* Total Bersih */}
    <div className="h-px bg-border my-1.5"></div>
    <div className="flex justify-between gap-2 font-semibold">
      <span className="text-foreground">Total Bersih:</span>
      <span className="text-green-600">
        +{formatCurrency(totalIncome)}
      </span>
    </div>
  </div>
</PopoverContent>
```

**Props to Add**:
```typescript
interface BudgetOverviewProps {
  // ... existing props
  carryOverAssets?: number;
}
```

### **Success Criteria - UI**

- ✅ Ikon Info (i) muncul di sebelah "Total Pengeluaran"
- ✅ Click ikon → Popover breakdown pengeluaran muncul
- ✅ Breakdown menampilkan: Pengeluaran Bulan Ini, Carry-Over Kewajiban, Total
- ✅ Popover Total Pemasukan diupgrade dengan "Carry-Over Aset"
- ✅ Semua angka formatCurrency dengan benar
- ✅ Color coding: Green untuk aset (+), Red untuk kewajiban (-)
- ✅ Superscript notation: Kantong+ (positif), Kantong- (negatif)

---

## 📁 Files to Modify

### **Critical Files** (Must Change)

1. **`/utils/calculations.ts`** - Add new functions
   - `calculateCarryOverAssets()`
   - `calculateCarryOverLiabilities()`
   - Update `calculateBudget()`

2. **`/App.tsx`** - Update calculation logic
   - Add `carryOverAssets` useMemo
   - Add `carryOverLiabilities` useMemo
   - Update `totalIncome` useMemo
   - Update `totalExpenses` useMemo
   - Update `remainingBudget` useMemo
   - Pass new props to BudgetOverview

3. **`/components/BudgetOverview.tsx`** - UI upgrade
   - Update interface with new props
   - Add Info icon + Popover for Total Pengeluaran
   - Update Popover for Total Pemasukan

### **Supporting Files** (May Need to Check)

4. **`/hooks/usePockets.ts`** - Verify pocket balance logic
   - Ensure `projectedBalance` calculation correct

5. **`/hooks/useBudgetData.ts`** - May need to fetch previous month pockets
   - Check if `previousMonthRemaining` needs update

---

## 🧪 Testing Strategy

### **Unit Tests** (Manual Console Testing)

**Test 1: Carry-Over Positif**
```typescript
// Scenario:
// Oktober: Sehari-hari = +500K, Uang Dingin = +200K
// Expected: carryOverAssets = 700K

console.log('Carry-Over Assets:', carryOverAssets);
// Should be: 700000
```

**Test 2: Carry-Over Negatif**
```typescript
// Scenario:
// Oktober: Sehari-hari = -100K, Uang Dingin = -50K
// Expected: carryOverLiabilities = 150K

console.log('Carry-Over Liabilities:', carryOverLiabilities);
// Should be: 150000
```

**Test 3: Mixed Carry-Over**
```typescript
// Scenario:
// Oktober: Sehari-hari = +500K, Uang Dingin = -200K, Custom = +100K
// Expected: 
// - carryOverAssets = 600K (500 + 100)
// - carryOverLiabilities = 200K (abs(-200))

console.log('Assets:', carryOverAssets);    // 600000
console.log('Liabilities:', carryOverLiabilities); // 200000
```

### **Integration Tests** (UI Verification)

**Test 4: Total Pemasukan Breakdown**
```
1. Open app with November data
2. Click Info icon next to "Total Pemasukan"
3. Verify popover shows:
   - Budget Awal: +Rp X
   - Pemasukan Tambahan: +Rp Y
   - Carry-Over Aset (Sisa Kantong+): +Rp Z
   - Total Bersih: = Total
4. Verify math: X + Y + Z = Total
```

**Test 5: Total Pengeluaran Breakdown**
```
1. Open app with November data
2. Click Info icon next to "Total Pengeluaran"
3. Verify popover shows:
   - Pengeluaran Bulan Ini: -Rp A
   - Carry-Over Kewajiban (Utang Kantong-): -Rp B
   - Total Pengeluaran: = Total
4. Verify math: A + B = Total
```

**Test 6: Sisa Budget Accuracy**
```
1. Note Total Pemasukan (from popover)
2. Note Total Pengeluaran (from popover)
3. Check Sisa Budget card
4. Verify: Sisa Budget = Total Pemasukan - Total Pengeluaran
```

### **Edge Cases**

**Test 7: No Carry-Over**
```
// First month usage (no previous month data)
// Expected:
// - carryOverAssets = 0
// - carryOverLiabilities = 0
// - "Carry-Over" rows tidak muncul di popover
```

**Test 8: All Positive Pockets**
```
// All pockets have positive balance
// Expected:
// - carryOverAssets = sum of all balances
// - carryOverLiabilities = 0
// - "Carry-Over Kewajiban" tidak muncul di popover
```

**Test 9: All Negative Pockets**
```
// All pockets have negative balance (full utang)
// Expected:
// - carryOverAssets = 0
// - carryOverLiabilities = sum of abs(all balances)
// - "Carry-Over Aset" tidak muncul di popover
```

---

## 🚨 Backward Compatibility Considerations

### **Data Schema Changes**

**NO SCHEMA CHANGES REQUIRED!** ✅

**Reason**:
- We're NOT changing database structure
- We're only changing CALCULATION logic
- Pocket balances already exist and are calculated correctly
- We're just USING them differently (split positif/negatif)

### **Existing User Impact**

**Impact**: POSITIVE - Users will see MORE accurate data

**Migration**: NONE - No data migration needed

**Example**:
```
Existing user with October data:
- Sehari-hari: +500K
- Uang Dingin: -200K

BEFORE (Current - Wrong):
November Total Pemasukan = Budget + Income (carry-over ignored)
November Total Pengeluaran = Expenses (utang -200K tidak terlihat!)

AFTER (New - Correct):
November Total Pemasukan = Budget + Income + 500K ✅
November Total Pengeluaran = Expenses + 200K ✅
Result: User bisa lihat ada utang 200K yang harus dibayar!
```

### **Compatibility Checklist**

- ✅ No database schema changes
- ✅ No breaking API changes
- ✅ Existing pockets data still valid
- ✅ Existing calculations still work (just enhanced)
- ✅ UI changes are additive (new popovers, no removals)

---

## 📊 Visual Mockups

### **Before vs After**

#### **BEFORE (Current)**

```
┌─────────────────────────────────────────────┐
│ Total Pemasukan (i)           ● green      │
│ Rp 19.810.656                               │
│ ─────────────────────────────────────────── │
│ Total Pengeluaran             ● red        │  ← NO INFO ICON!
│ Rp 5.412.368                                │
└─────────────────────────────────────────────┘

Popover Pemasukan (i):
┌─────────────────────────────────┐
│ Breakdown Pemasukan:            │
│ Budget Awal: +Rp 15.000.000     │
│ Pemasukan Tambahan: +Rp 5.000.000│
│ ───────────────────────────────  │
│ Potongan Global: -Rp 189.344    │
│ ───────────────────────────────  │
│ Total Bersih: +Rp 19.810.656    │  ← Tidak include carry-over!
└─────────────────────────────────┘

Total Pengeluaran: NO POPOVER ❌
```

#### **AFTER (Fixed)**

```
┌─────────────────────────────────────────────┐
│ Total Pemasukan (i)           ● green      │
│ Rp 20.510.656                               │
│ ─────────────────────────────────────────── │
│ Total Pengeluaran (i)         ● red        │  ← NEW INFO ICON! ✨
│ Rp 5.612.368                                │
└─────────────────────────────────────────────┘

Popover Pemasukan (i):
┌──────────────────────────────────────┐
│ Breakdown Pemasukan:                 │
│ Budget Awal: +Rp 15.000.000          │
│ Pemasukan Tambahan: +Rp 5.000.000    │
│ Carry-Over Aset (Sisa Kantong+):     │  ← NEW! ✨
│                    +Rp 700.000       │
│ ──────────────────────────────────── │
│ Potongan Global: -Rp 189.344         │
│ ──────────────────────────────────── │
│ Total Bersih: +Rp 20.510.656         │
└──────────────────────────────────────┘

Popover Pengeluaran (i):  ← NEW POPOVER! ✨
┌──────────────────────────────────────┐
│ Breakdown Pengeluaran:               │
│ Pengeluaran Bulan Ini:               │
│                    -Rp 5.412.368     │
│ Carry-Over Kewajiban (Utang Kantong-):│
│                    -Rp 200.000       │  ← TRANSPARANSI UTANG! ✨
│ ──────────────────────────────────── │
│ Total Pengeluaran: -Rp 5.612.368     │
└──────────────────────────────────────┘
```

### **Transparency Examples**

**Example 1: User dengan Carry-Over Positif (Surplus)**

```
Oktober:
- Sehari-hari: Sisa +Rp 500.000
- Uang Dingin: Sisa +Rp 200.000
- Custom: Sisa +Rp 100.000

November Breakdown:
┌─────────────────────────────────────┐
│ Total Pemasukan (i)                 │
│ Click popover:                      │
│ - Budget Awal: +Rp 10.000.000       │
│ - Pemasukan Tambahan: +Rp 2.000.000 │
│ - Carry-Over Aset (Kantong+):       │
│   +Rp 800.000 ← 500+200+100         │
│ ───────────────────────────────────  │
│ Total: Rp 12.800.000 ✅             │
└─────────────────────────────────────┘

User reaction: "Oh! Saya punya sisa 800K dari bulan lalu!"
```

**Example 2: User dengan Carry-Over Negatif (Utang)**

```
Oktober:
- Sehari-hari: Sisa -Rp 100.000 (overspent)
- Uang Dingin: Sisa -Rp 50.000 (utang)

November Breakdown:
┌─────────────────────────────────────┐
│ Total Pengeluaran (i)               │
│ Click popover:                      │
│ - Pengeluaran Bulan Ini:            │
│   -Rp 3.000.000                     │
│ - Carry-Over Kewajiban (Kantong-):  │
│   -Rp 150.000 ← 100+50 (utang!)     │
│ ───────────────────────────────────  │
│ Total: Rp 3.150.000 ⚠️              │
└─────────────────────────────────────┘

User reaction: "Ah! Saya masih punya utang 150K dari bulan lalu yang harus dibayar!"
```

**Example 3: User dengan Mixed (Positif + Negatif)**

```
Oktober:
- Sehari-hari: Sisa +Rp 500.000 (surplus)
- Uang Dingin: Sisa -Rp 200.000 (utang)
- Custom: Sisa +Rp 100.000 (surplus)

November Breakdown:
┌─────────────────────────────────────┐
│ Total Pemasukan (i):                │
│ - Budget Awal: +Rp 10.000.000       │
│ - Carry-Over Aset (Kantong+):       │
│   +Rp 600.000 ← 500+100 (positif)   │
│ Total: Rp 10.600.000                │
│                                     │
│ Total Pengeluaran (i):              │
│ - Pengeluaran Bulan Ini:            │
│   -Rp 3.000.000                     │
│ - Carry-Over Kewajiban (Kantong-):  │
│   -Rp 200.000 ← utang!              │
│ Total: Rp 3.200.000                 │
│                                     │
│ Sisa Budget:                        │
│ Rp 7.400.000 (10.6M - 3.2M)         │
└─────────────────────────────────────┘

User reaction: "Clear! Ada aset 600K dan utang 200K. Net effect: +400K carry-over."
```

---

## 🔄 Implementation Sequence

### **Phase 1: Calculation Logic** (TUGAS 1, 2, 3)

**Order**:
1. Add `calculateCarryOverAssets()` to `/utils/calculations.ts`
2. Add `calculateCarryOverLiabilities()` to `/utils/calculations.ts`
3. Update App.tsx:
   - Add `carryOverAssets` useMemo
   - Add `carryOverLiabilities` useMemo
   - Add `currentMonthExpenses` useMemo (for breakdown)
   - Update `totalIncome` calculation
   - Update `totalExpenses` calculation
   - Update `remainingBudget` calculation
4. Test in console: Verify calculations correct
5. Pass new props to BudgetOverview

**Checkpoint**: Console logs show correct values

### **Phase 2: UI Transparency** (TUGAS 4)

**Order**:
1. Update BudgetOverview interface with new props
2. Add "Carry-Over Aset" to existing Total Pemasukan popover
3. Add Info icon to Total Pengeluaran section
4. Add popover for Total Pengeluaran with breakdown
5. Test UI: Click both popovers, verify data displays correctly
6. Visual polish: Ensure consistent spacing, colors, formatting

**Checkpoint**: Both popovers functional and display correct data

### **Phase 3: Testing & Verification**

**Order**:
1. Test all scenarios (positive carry-over, negative, mixed, none)
2. Verify math in popovers matches displayed totals
3. Check edge cases (first month, all positive, all negative)
4. Mobile responsive check
5. Accessibility check (screen reader, keyboard nav)

**Checkpoint**: All tests pass ✅

---

## ⚠️ Critical Warnings

### **1. Don't Break Existing Logic**

**WARNING**: Sistem kantong sudah handle carry-over otomatis!

**What This Means**:
- Pocket balances ALREADY include carry-over dari bulan sebelumnya
- Kita TIDAK menghitung carry-over LAGI di dalam pocket
- Kita hanya MENAMPILKAN breakdown di BudgetOverview

**Example**:
```
November Sehari-hari pocket balance:
= Oktober sisa balance (auto carry-over) ✅
+ November budget allocation ✅
+ November income to this pocket ✅
- November expenses from this pocket ✅

We DO NOT add carry-over again! It's already in pocket balance!
```

### **2. Global Deduction Timing**

**WARNING**: Global deduction already subtracted from additionalIncome!

**Check**:
```typescript
// In App.tsx (verify this exists)
const totalAdditionalIncome = useMemo(() => {
  const grossIncome = additionalIncomes.reduce(
    (sum, income) => sum + income.amountIDR,
    0
  );
  // ALREADY SUBTRACTED HERE ↓
  return grossIncome - (budget.incomeDeduction || 0);
}, [additionalIncomes, budget.incomeDeduction]);
```

**Implication**:
- Do NOT subtract globalDeduction again in totalIncome
- totalIncome = initialBudget + totalAdditionalIncome + carryOverAssets
- (globalDeduction already subtracted in totalAdditionalIncome)

### **3. Previous Month Pockets Data**

**WARNING**: Need to fetch previous month pockets for carry-over calculation!

**Check**:
```typescript
// In App.tsx or useBudgetData.ts
// Do we have previousMonthPockets data?
// If not, need to fetch it!
```

**Solution** (if needed):
```typescript
// Option 1: Use usePockets hook with previous month/year
const previousMonthPockets = usePockets(prevYear, prevMonth);

// Option 2: Calculate from previousMonthRemaining
// (Less accurate, but fallback option)
```

---

## 📝 Implementation Checklist

### **Pre-Implementation**

- [ ] Read this PLANNING.md thoroughly
- [ ] Understand current calculation logic in App.tsx
- [ ] Verify pocket balance calculation is correct
- [ ] Check if previousMonthPockets data available
- [ ] Backup current code (Git commit)

### **TUGAS 1: Total Pemasukan**

- [ ] Add `calculateCarryOverAssets()` to calculations.ts
- [ ] Add `carryOverAssets` useMemo in App.tsx
- [ ] Update `totalIncome` calculation
- [ ] Console log to verify values
- [ ] Pass `carryOverAssets` to BudgetOverview

### **TUGAS 2: Total Pengeluaran**

- [ ] Add `calculateCarryOverLiabilities()` to calculations.ts
- [ ] Add `carryOverLiabilities` useMemo in App.tsx
- [ ] Add `currentMonthExpenses` useMemo in App.tsx
- [ ] Update `totalExpenses` calculation
- [ ] Console log to verify values
- [ ] Pass `currentMonthExpenses` and `carryOverLiabilities` to BudgetOverview

### **TUGAS 3: Sisa Budget**

- [ ] Update `remainingBudget` calculation (simple: totalIncome - totalExpenses)
- [ ] Verify no double-counting of globalDeduction
- [ ] Console log to verify formula correct

### **TUGAS 4A: Total Pengeluaran UI**

- [ ] Update BudgetOverview props interface
- [ ] Add Info icon next to "Total Pengeluaran"
- [ ] Add Popover component
- [ ] Add breakdown content (Pengeluaran Bulan Ini, Carry-Over Kewajiban, Total)
- [ ] Test popover functionality

### **TUGAS 4B: Total Pemasukan UI**

- [ ] Update BudgetOverview props interface (add carryOverAssets)
- [ ] Add "Carry-Over Aset" row to existing popover
- [ ] Position after "Pemasukan Tambahan"
- [ ] Test popover shows all 4 rows correctly

### **Testing**

- [ ] Test Scenario: Positive carry-over only
- [ ] Test Scenario: Negative carry-over only
- [ ] Test Scenario: Mixed carry-over
- [ ] Test Scenario: No carry-over (first month)
- [ ] Test UI: Both popovers display correctly
- [ ] Test Math: Breakdowns sum to totals
- [ ] Test Mobile: Responsive design
- [ ] Test Accessibility: Screen reader, keyboard

### **Documentation**

- [ ] Update this PLANNING.md with "Status: ✅ Complete"
- [ ] Create IMPLEMENTATION_COMPLETE.md summary
- [ ] Create QUICK_REFERENCE.md for maintenance
- [ ] Add comments in code explaining architecture

---

## 🎯 Success Definition

**This architecture fix is successful when**:

1. ✅ **Calculation Accuracy**:
   - Total Pemasukan includes carry-over aset (positif)
   - Total Pengeluaran includes carry-over kewajiban (negatif/utang)
   - Sisa Budget = Total Pemasukan - Total Pengeluaran

2. ✅ **UI Transparency**:
   - Both "Total Pemasukan" and "Total Pengeluaran" have Info icons
   - Both popovers show complete breakdown
   - User can trace setiap angka dari mana asalnya

3. ✅ **User Understanding**:
   - User tahu jika ada utang carry-over dari bulan lalu
   - User tahu jika ada aset carry-over yang bisa dipakai
   - No confusion, full visibility

4. ✅ **Code Quality**:
   - Clean separation: Assets vs Liabilities
   - No double-counting
   - Backward compatible (no migration needed)
   - Well-documented with comments

---

## 📚 References

**Related Planning Docs**:
- `/planning/kantong-architecture-fix-v3-safe/PLANNING.md` - Kantong system
- `/planning/universal-carry-over-v4-core/PLANNING.md` - Carry-over system

**Related Components**:
- `/components/BudgetOverview.tsx` - Main component to modify
- `/components/PocketsSummary.tsx` - Pocket balance display
- `/hooks/usePockets.ts` - Pocket data hook

**Key Concepts**:
- **Aset** = Positive pocket balances (can be spent)
- **Kewajiban** = Negative pocket balances (must be paid)
- **Carry-Over** = Transfer balance antar bulan
- **Transparency** = User visibility into calculations

---

## 📞 Questions & Clarifications

**Q1**: What if previous month has no data?
**A1**: `carryOverAssets = 0`, `carryOverLiabilities = 0`. Popover rows hidden.

**Q2**: What if all pockets are positive?
**A2**: `carryOverAssets = sum`, `carryOverLiabilities = 0`. Only show Aset row.

**Q3**: What if all pockets are negative?
**A3**: `carryOverAssets = 0`, `carryOverLiabilities = sum`. Only show Kewajiban row.

**Q4**: Does this affect pocket balance calculation?
**A4**: NO! Pockets already auto carry-over. We just DISPLAY breakdown.

**Q5**: Do we need database migration?
**A5**: NO! This is calculation logic change only. No schema changes.

---

## 🚀 Next Steps

1. **Review** this planning document
2. **Confirm** understanding of architecture
3. **Begin** implementation with Phase 1 (Calculation Logic)
4. **Test** thoroughly after each phase
5. **Document** as you go

---

**Status**: 📝 Planning Complete - Ready for Implementation  
**Estimated Time**: 2-3 hours (including testing)  
**Complexity**: Medium-High (Logic changes + UI upgrade)  
**Impact**: HIGH (Fundamental architecture improvement)

---

**Let's build transparency into the budget system!** 💪✨
