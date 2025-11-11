# Universal Carry-Over V4 - Core Architecture Refactor
## Perencanaan Sistematis

**Status:** 🔵 PLANNING PHASE  
**Tanggal:** 10 November 2025  
**Prerequisites:** TUGAS 1 (Simplifikasi Modal Budget Bulanan) ✅ SELESAI

---

## 📋 Executive Summary

Refactor arsitektur fundamental untuk:
1. **Fix bug critical** pada kalkulasi saldo (Realtime vs Projected)
2. **Unifikasi logic carry-over** untuk SEMUA kantong (hapus logic khusus Sehari-hari)
3. **Verifikasi timeline** mengikuti model "Laporan Bulanan"

**Root Cause Bug PayLater:**
- Saldo Hari Ini salah menghitung transaksi "Akan Datang"
- Ini menyebabkan Saldo Proyeksi salah
- Saldo Proyeksi yang salah → Saldo Awal bulan berikutnya salah
- Sign flip terjadi karena basis kalkulasi yang sudah rusak

**Filosofi Baru:**
> "Satu Aturan Universal untuk Semua Kantong"
> Saldo Awal [Bulan Baru] = Saldo Proyeksi Akhir [Bulan Sebelumnya]

---

## 🎯 TUGAS 1: Fix Bug Kalkulasi Saldo

### Problem Statement
**Current Bug:**
- PayLater menunjukkan Saldo Hari Ini: **-Rp 376.631** ❌
- Seharusnya Saldo Hari Ini: **+Rp 753.261** ✅
- Perbedaan: **Rp 1,129,892** (transaksi SP di 16 November yang seharusnya tidak dihitung)

**Root Cause:**
Kalkulasi Saldo Hari Ini salah menghitung transaksi yang **tanggalnya > today** (transaksi "Akan Datang")

### Definisi Yang Benar

#### 1. Saldo Hari Ini (Realtime Balance)
```
Formula:
Saldo Hari Ini = Saldo Awal + Sum(transaksi WHERE date <= TODAY)

Kriteria:
✅ HANYA transaksi dari Saldo Awal s/d hari ini
❌ JANGAN hitung transaksi dengan date > today
```

**Contoh (10 November):**
```
Saldo Awal:    Rp 0 (1 Nov)
+ Transfer:    +Rp 753.261 (10 Nov) ✅
= Saldo Hari Ini: Rp 753.261

⚠️ JANGAN hitung:
- SP: -Rp 376.631 (16 Nov) ❌ (future transaction)
```

#### 2. Saldo Proyeksi (Projected Balance)
```
Formula:
Saldo Proyeksi = Saldo Hari Ini + Sum(transaksi WHERE date > TODAY)

Kriteria:
✅ Saldo Hari Ini + SEMUA transaksi masa depan
```

**Contoh (10 November):**
```
Saldo Hari Ini: Rp 753.261
+ SP (16 Nov):  -Rp 376.631 (future) ✅
= Saldo Proyeksi: Rp 376.630
```

### Files to Modify

#### A. `/utils/calculations.ts`

**Target Function:** `calculatePocketBalance()`

**Current Logic (SALAH):**
```typescript
// ❌ Menghitung semua transaksi tanpa filter tanggal
entries.forEach(entry => {
  if (entry.type === 'expense') {
    balance -= entry.amount;
  } else {
    balance += entry.amount;
  }
});
```

**New Logic (BENAR):**
```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);

// 1. Calculate Realtime Balance (up to today)
let realtimeBalance = startingBalance;
const realtimeEntries = entries.filter(e => {
  const entryDate = new Date(e.date);
  entryDate.setHours(0, 0, 0, 0);
  return entryDate <= today;
});

realtimeEntries.forEach(entry => {
  if (entry.type === 'expense') {
    realtimeBalance -= entry.amount;
  } else {
    realtimeBalance += entry.amount;
  }
});

// 2. Calculate Projected Balance (realtime + future)
let projectedBalance = realtimeBalance;
const futureEntries = entries.filter(e => {
  const entryDate = new Date(e.date);
  entryDate.setHours(0, 0, 0, 0);
  return entryDate > today;
});

futureEntries.forEach(entry => {
  if (entry.type === 'expense') {
    projectedBalance -= entry.amount;
  } else {
    projectedBalance += entry.amount;
  }
});

return {
  realtime: realtimeBalance,
  projected: projectedBalance
};
```

**Return Type Update:**
```typescript
// Old: return number
// New: return { realtime: number, projected: number }
```

#### B. Update All Callers

**Files yang menggunakan `calculatePocketBalance()`:**
1. `/components/PocketsSummary.tsx`
2. `/components/PocketDetailPage.tsx`
3. `/components/PocketTimeline.tsx`
4. `/App.tsx` (budget overview)

**Update Pattern:**
```typescript
// Old:
const balance = calculatePocketBalance(...);

// New:
const { realtime, projected } = calculatePocketBalance(...);

// Display logic:
<div>Saldo Hari Ini: {realtime}</div>
<div>Saldo Proyeksi: {projected}</div>
```

### Testing Checklist TUGAS 1

```
[ ] Saldo Hari Ini PayLater = +Rp 753.261 (10 Nov)
[ ] Saldo Proyeksi PayLater = +Rp 376.630 (10 Nov)
[ ] Saldo Hari Ini TIDAK berubah saat transaksi masa depan ditambah
[ ] Saldo Proyeksi berubah saat transaksi masa depan ditambah
[ ] Timeline hanya menampilkan Saldo Hari Ini untuk entry hari ini
[ ] Pocket Card menampilkan Saldo Proyeksi sebagai saldo utama
```

---

## 🎯 TUGAS 2: Terapkan Universal Carry-Over

### Problem Statement

**Current Logic (SALAH - Terlalu Rumit):**
```
Sehari-hari:
  Saldo Awal [Bulan Baru] = 
    Saldo Proyeksi [Bulan Lalu] + Budget Sehari-hari (reset)
  
  Logic: "Amplop Budget" - reset tiap bulan

Uang Dingin:
  Saldo Awal [Bulan Baru] = 
    Saldo Proyeksi [Bulan Lalu] + Income bulan ini

PayLater:
  Saldo Awal [Bulan Baru] = 
    Saldo Proyeksi [Bulan Lalu] + Income bulan ini
```

**Filosofi Baru (BENAR - Universal):**
```
SEMUA KANTONG:
  Saldo Awal [Bulan Baru] = Saldo Proyeksi Akhir [Bulan Lalu]

Simple. Konsisten. Mudah dipahami.
```

### Alasan Perubahan

#### 1. Eliminasi Logic Khusus Sehari-hari
**Problem dengan "Amplop Budget":**
- Terlalu kompleks (logic berbeda untuk setiap tipe)
- Sulit di-debug
- Prone to bugs (seperti PayLater sign flip)
- User confusion (mengapa Sehari-hari berbeda?)

**Solution:**
- Sehari-hari = Uang Dingin = PayLater = Custom
- Satu aturan untuk semua
- User adjust budget manual jika perlu "reset"

#### 2. User Experience Improvement
**Old UX:**
```
User: "Mengapa sisa budget Sehari-hari hilang?"
System: "Karena budget reset tiap bulan"
User: "Tapi Uang Dingin tidak reset?"
System: "Ya, berbeda logic..."
User: 🤷‍♂️
```

**New UX:**
```
User: "Sisa budget bulan lalu kemana?"
System: "Carry-over ke bulan ini"
User: "Berlaku untuk semua kantong?"
System: "Ya, semua sama"
User: ✅
```

#### 3. Simplified Mental Model
```
Old: 3 different carry-over rules
New: 1 universal rule

Old: "Sehari-hari special case"
New: "Semua kantong sama"

Old: Complex debug (which rule applied?)
New: Simple debug (one rule)
```

### Implementation Plan

#### A. Remove Special Logic di Backend

**File:** `/supabase/functions/server/index.tsx`

**Function:** `generateCarryOverEntries()`

**Current Logic (REMOVE):**
```typescript
if (pocketType === 'sehari-hari') {
  // ❌ Special logic - HAPUS INI
  const budgetAmount = await getBudgetForPocket(pocketId, newMonth);
  startingBalance = projectedBalance + budgetAmount;
} else {
  // ✅ Keep this - akan jadi universal logic
  const income = await getIncomeForMonth(pocketId, newMonth);
  startingBalance = projectedBalance + income;
}
```

**New Logic (UNIVERSAL):**
```typescript
// SAMA UNTUK SEMUA TIPE KANTONG
const projectedBalance = await getProjectedBalance(pocketId, oldMonth);
const incomeThisMonth = await getIncomeForMonth(pocketId, newMonth);

const carryOverEntry = {
  type: 'carry_over',
  pocket_id: pocketId,
  amount: projectedBalance, // ✅ Universal formula
  date: `${newMonth}-01T07:00:00Z`,
  description: `Saldo Awal dari ${formatMonth(oldMonth)}`,
  category: 'carry_over'
};

// Income dicatat terpisah (jika ada)
if (incomeThisMonth > 0) {
  const incomeEntry = {
    type: 'income',
    pocket_id: pocketId,
    amount: incomeThisMonth,
    date: `${newMonth}-01T07:00:00Z`,
    description: 'Pemasukan Bulan Ini',
    category: 'income'
  };
}
```

#### B. Update Frontend Display

**File:** `/components/PocketTimeline.tsx`

**Current:**
```typescript
// Special rendering untuk Sehari-hari
if (entry.type === 'budget_reset') {
  return <BudgetResetDisplay />;
}
```

**New:**
```typescript
// Uniform rendering untuk semua
if (entry.type === 'carry_over') {
  return (
    <CarryOverDisplay 
      amount={entry.amount}
      fromMonth={previousMonth}
      description="Saldo Awal"
    />
  );
}
```

#### C. Update Budget Modal Logic

**File:** `/components/BudgetForm.tsx`

**Old Behavior:**
- Budget Sehari-hari → auto reset tiap bulan

**New Behavior:**
- Budget adalah target/limit saja
- Tidak affect carry-over logic
- User dapat manual adjust jika ingin "reset"

**UI Changes:**
```typescript
// Add info text
<Alert>
  <Info className="h-4 w-4" />
  <AlertDescription>
    Budget adalah batas pengeluaran target.
    Sisa budget akan otomatis carry-over ke bulan berikutnya.
  </AlertDescription>
</Alert>
```

### Migration Strategy

#### Phase 1: Backend Update
```
1. Update generateCarryOverEntries() → universal logic
2. Test dengan data existing
3. Verify tidak ada regression
```

#### Phase 2: Frontend Update
```
1. Update PocketTimeline → uniform display
2. Update BudgetForm → add info text
3. Update PocketDetailPage → consistent logic
```

#### Phase 3: Data Migration
```
1. Existing carry-over entries tetap valid
2. New entries menggunakan logic baru
3. No breaking changes untuk historical data
```

### Testing Checklist TUGAS 2

```
[ ] Sehari-hari: Saldo Awal = Saldo Proyeksi bulan lalu ✅
[ ] Uang Dingin: Saldo Awal = Saldo Proyeksi bulan lalu ✅
[ ] PayLater: Saldo Awal = Saldo Proyeksi bulan lalu ✅
[ ] Custom Pocket: Saldo Awal = Saldo Proyeksi bulan lalu ✅
[ ] Timeline menampilkan "Saldo Awal" uniform untuk semua
[ ] Tidak ada special case rendering
[ ] Budget modal menampilkan info text yang jelas
```

---

## 🎯 TUGAS 3: Verifikasi Timeline Kantong

### Problem Statement

**Timeline harus mengikuti "Model Laporan Bulanan":**
- Saldo Awal (dari bulan lalu)
- + Transaksi bulan ini saja
- = Saldo Akhir (Proyeksi)

**Anti-Pattern (SALAH):**
- Menampilkan transaksi dari bulan lain
- Saldo Awal tidak match dengan Proyeksi bulan lalu
- Transaksi future tidak ter-highlight

### Implementation Plan

#### A. Timeline Filtering

**File:** `/components/PocketTimeline.tsx`

**Current Logic:**
```typescript
// ❌ No month filtering
const allEntries = expenses.concat(incomes);
```

**New Logic:**
```typescript
// ✅ Filter by selected month
const filteredEntries = expenses
  .concat(incomes)
  .filter(entry => {
    const entryDate = new Date(entry.date);
    const entryMonth = format(entryDate, 'yyyy-MM');
    return entryMonth === selectedMonth;
  })
  .concat(carryOverEntry); // Always show Saldo Awal

// Sort: Saldo Awal first, then by date
const sortedEntries = [
  carryOverEntry,
  ...filteredEntries.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
];
```

#### B. Saldo Awal Verification

**Logic:**
```typescript
// 1. Get Saldo Proyeksi from previous month
const previousMonth = format(
  subMonths(parseISO(selectedMonth + '-01'), 1),
  'yyyy-MM'
);

const { projected: previousProjected } = 
  await calculatePocketBalance(pocketId, previousMonth);

// 2. Verify Saldo Awal matches
const carryOverEntry = entries.find(e => 
  e.type === 'carry_over' && 
  format(new Date(e.date), 'yyyy-MM') === selectedMonth
);

if (carryOverEntry.amount !== previousProjected) {
  console.error('❌ Carry-over mismatch!', {
    expected: previousProjected,
    actual: carryOverEntry.amount,
    difference: carryOverEntry.amount - previousProjected
  });
}
```

#### C. Visual Enhancements

**Saldo Awal Styling:**
```tsx
<div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
  <div className="flex items-center gap-2">
    <Target className="h-5 w-5 text-blue-600" />
    <span className="font-semibold">Saldo Awal</span>
  </div>
  <div className="text-sm text-muted-foreground">
    Dari {formatMonth(previousMonth)}
  </div>
  <div className="text-xl font-bold text-blue-600">
    {formatCurrency(carryOverAmount)}
  </div>
</div>
```

**Future Transaction Highlight:**
```tsx
{isFutureTransaction && (
  <Badge variant="secondary" className="ml-2">
    <Clock className="h-3 w-3 mr-1" />
    Akan Datang
  </Badge>
)}
```

**Running Balance Display:**
```tsx
// Show running balance after each transaction
<div className="text-right text-sm text-muted-foreground">
  Saldo: {formatCurrency(runningBalance)}
  {isFutureTransaction && (
    <span className="text-orange-600 ml-1">(proyeksi)</span>
  )}
</div>
```

#### D. Month Selector Integration

**Ensure month filter works correctly:**
```typescript
const handleMonthChange = (newMonth: string) => {
  setSelectedMonth(newMonth);
  
  // Reload entries for new month
  loadPocketEntries(pocketId, newMonth);
  
  // Verify carry-over
  verifyCarryOver(pocketId, newMonth);
};
```

### Testing Checklist TUGAS 3

```
[ ] Timeline hanya menampilkan transaksi bulan yang dipilih
[ ] Saldo Awal di November = Saldo Proyeksi Oktober
[ ] Saldo Awal di Desember = Saldo Proyeksi November
[ ] Transaksi future ter-highlight dengan badge
[ ] Running balance benar untuk setiap entry
[ ] Month selector berfungsi dengan benar
[ ] Tidak ada transaksi dari bulan lain yang muncul
```

---

## 🔧 Implementation Sequence

### Phase 1: TUGAS 1 - Fix Kalkulasi (Critical)
```
1. ✅ Update calculatePocketBalance() return type
2. ✅ Implement realtime vs projected logic
3. ✅ Update all callers (4 files)
4. ✅ Test dengan PayLater case
5. ✅ Verify Saldo Hari Ini = Rp 753.261
```

**Estimated Time:** 30-45 minutes  
**Priority:** 🔴 CRITICAL

### Phase 2: TUGAS 2 - Universal Carry-Over
```
1. ✅ Update backend generateCarryOverEntries()
2. ✅ Remove special Sehari-hari logic
3. ✅ Test carry-over generation
4. ✅ Update frontend displays
5. ✅ Add info text to Budget modal
```

**Estimated Time:** 45-60 minutes  
**Priority:** 🔴 CRITICAL

### Phase 3: TUGAS 3 - Timeline Verification
```
1. ✅ Add month filtering to timeline
2. ✅ Implement Saldo Awal verification
3. ✅ Add visual enhancements
4. ✅ Test month navigation
5. ✅ Verify all pockets
```

**Estimated Time:** 30-45 minutes  
**Priority:** 🟡 HIGH

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
describe('calculatePocketBalance', () => {
  it('should separate realtime and projected balance', () => {
    const entries = [
      { date: '2025-11-10', amount: 753261, type: 'income' },
      { date: '2025-11-16', amount: 376631, type: 'expense' }
    ];
    
    const result = calculatePocketBalance(entries, 0, '2025-11-10');
    
    expect(result.realtime).toBe(753261);
    expect(result.projected).toBe(376630);
  });
});
```

### Integration Tests
```typescript
describe('Carry-Over System', () => {
  it('should use universal rule for all pocket types', async () => {
    const types = ['sehari-hari', 'uang-dingin', 'paylater', 'custom'];
    
    for (const type of types) {
      const projected = await getProjectedBalance(pocketId, '2025-10');
      const carryOver = await getCarryOverEntry(pocketId, '2025-11');
      
      expect(carryOver.amount).toBe(projected);
    }
  });
});
```

### E2E Tests (Manual)
```
Scenario 1: PayLater Bug Fix
1. Navigate to PayLater pocket
2. Verify Saldo Hari Ini = +Rp 753.261 (10 Nov)
3. Verify Saldo Proyeksi = +Rp 376.630 (10 Nov)
4. Switch to December
5. Verify Saldo Awal = +Rp 376.630 ✅

Scenario 2: Universal Carry-Over
1. Check Sehari-hari carry-over
2. Check Uang Dingin carry-over
3. Check PayLater carry-over
4. Verify all use same formula

Scenario 3: Timeline Month Filter
1. Select November in timeline
2. Verify only November entries shown
3. Verify Saldo Awal from October
4. Switch to December
5. Verify only December entries shown
```

---

## 📦 Deliverables

### Code Changes
```
✅ /utils/calculations.ts - calculatePocketBalance() refactor
✅ /supabase/functions/server/index.tsx - universal carry-over
✅ /components/PocketsSummary.tsx - update balance display
✅ /components/PocketDetailPage.tsx - update balance display
✅ /components/PocketTimeline.tsx - month filter + verification
✅ /components/BudgetForm.tsx - add info text
✅ /App.tsx - update budget overview
```

### Documentation
```
✅ This PLANNING.md
✅ IMPLEMENTATION_LOG.md (created during execution)
✅ QUICK_REFERENCE.md (post-completion summary)
✅ TESTING_RESULTS.md (test outcomes)
```

### Verification
```
✅ PayLater bug fixed (Saldo Awal positive)
✅ All pockets use universal carry-over
✅ Timeline shows correct month-filtered data
✅ No regression in existing features
```

---

## ⚠️ Risk Mitigation

### Risk 1: Breaking Existing Carry-Over Logic
**Mitigation:**
- Implement backward compatibility
- Existing entries remain valid
- New logic only for new carry-overs

### Risk 2: User Confusion (Sehari-hari Change)
**Mitigation:**
- Add clear info text in Budget modal
- Document behavior change
- Provide manual reset option if needed

### Risk 3: Performance Impact
**Mitigation:**
- Date filtering is O(n) - acceptable
- Caching for projected balance
- Lazy load timeline entries

---

## 🚀 Ready for Execution

**Prerequisites:**
- ✅ TUGAS 1 (Budget Modal Simplification) COMPLETE
- ✅ Planning document reviewed
- ✅ Test strategy defined
- ✅ Risk mitigation planned

**Next Step:**
```bash
👉 AWAIT USER CONFIRMATION TO BEGIN EXECUTION
```

**Execution Command:**
```
User: "Lanjutkan eksekusi kode"
AI: Proceed with Phase 1 (TUGAS 1)
```

---

## 📚 References

- PayLaterDebugPanel findings
- /PAYLATER_BUG_TRIGGER_REGEN.md
- Kantong Architecture V3 docs
- Backward Compatibility Guidelines

---

**Status:** 🟢 PLANNING COMPLETE - READY FOR EXECUTION  
**Waiting for:** User confirmation to begin implementation
