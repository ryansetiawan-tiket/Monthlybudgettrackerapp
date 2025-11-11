# Monthly Statement Refactor V2 - Final Architecture Fix

## 🎯 Executive Summary

**Purpose:** Refactor aplikasi untuk mengikuti model **"Monthly Statement" (Laporan Bulanan)** yang ketat, dimana filter bulan di header mengontrol SEMUA data yang ditampilkan.

**Current Problem:**
- ❌ ExpenseList "rusak" - menampilkan data bulan lalu (Okt) saat filter Nov
- ❌ TimelineKantong mengikuti logic "Buku Besar" yang salah (all-time data)
- ❌ Modal Budget tidak efisien (perlu klik manual Auto-fill)

**New Architecture:**
- ✅ Filter bulan = **STRICT** monthly statement
- ✅ Timeline = **Month-scoped** (bukan all-time)
- ✅ Saldo Awal = **Carry-over** dari bulan sebelumnya
- ✅ Budget modal = **Auto-fill** carryover

---

## 📋 5 TUGAS UTAMA

### TUGAS 1: Fix ExpenseList (Layar Utama) 🔧
**Problem:** ExpenseList menampilkan transaksi Oktober saat user filter November

**Root Cause:**
- Query expenses tidak filter berdasarkan month yang dipilih
- Atau filter tapi logic-nya salah

**Solution:**
- Modifikasi query `expenses` untuk filter KETAT berdasarkan `year` dan `month` dari header
- ONLY show transactions yang datenya dalam range bulan tersebut

**Files:**
- `/components/ExpenseList.tsx` - Query logic
- `/App.tsx` - Month selector state

**Expected Result:**
```
Filter Header: "November 2025"
ExpenseList: ONLY Nov 1-30 transactions ✅
```

---

### TUGAS 2: Revert TimelineKantong ke Month-Scoped 🔄
**Problem:** Hotfix sebelumnya (`/timeline/all/:pocketId`) adalah arsitektur SALAH

**Why Wrong:**
- Aplikasi = Monthly Statement model
- Timeline seharusnya = Monthly view (bukan all-time ledger)
- Saldo Awal = Carry-over (bukan cumulative dari awal waktu)

**Solution:**
1. **REVERT endpoint** `/timeline/all/:pocketId` 
2. **CREATE/FIX endpoint** `/timeline/:year/:month/:pocketId`
3. Timeline hanya fetch data untuk bulan yang aktif

**Files:**
- `/supabase/functions/server/index.tsx` - Server endpoint
- `/components/PocketTimeline.tsx` - Frontend fetch
- `/components/PocketsSummary.tsx` - Prefetch logic

**Expected Result:**
```
Filter Header: "November 2025"
Timeline Uang Dingin: ONLY Nov 1-30 transactions ✅
Saldo Awal: Carry-over dari Okt 31 ✅
```

---

### TUGAS 3: Fix Perhitungan Saldo Awal (CRITICAL) 💰
**Problem:** Saldo Awal menampilkan Rp 0 (salah!)

**Correct Logic:**
```
Timeline November:
├─ Saldo Awal (item pertama)
│  = Total saldo akhir dari semua transaksi SEBELUM 1 Nov
│  = Balance 31 Okt 23:59:59
│
├─ 1 Nov - Transaction 1
├─ 2 Nov - Transaction 2
└─ ... Nov transactions
```

**Implementation:**
```typescript
// Pseudocode
function calculateInitialBalance(pocketId, year, month) {
  // 1. Get previous month
  const prevMonth = getPreviousMonth(year, month);
  
  // 2. Fetch ALL transactions for pocket BEFORE current month
  const allPreviousTransactions = await kv.getByPrefix(`expense:`)
    .filter(exp => 
      exp.pocketId === pocketId && 
      exp.date < `${year}-${month}-01T00:00:00Z`
    );
  
  // 3. Calculate cumulative balance
  let balance = 0;
  allPreviousTransactions.forEach(tx => {
    balance += tx.amount; // +income, -expense
  });
  
  // 4. Return as "Saldo Awal"
  return {
    id: 'initial_balance',
    type: 'initial_balance',
    amount: balance,
    balanceAfter: balance,
    description: 'Saldo Awal',
    date: `${year}-${month}-01T00:00:00Z`
  };
}
```

**Files:**
- `/supabase/functions/server/index.tsx` - Endpoint `/timeline/:year/:month/:pocketId`

**Expected Result:**
```
Timeline November (Uang Dingin):
└─ Saldo Awal: Rp 15.661.398 ✅ (bukan Rp 0!)
   (Carry-over dari semua transaksi sampai 31 Okt)
```

---

### TUGAS 4: Verifikasi "Perutean Transaksi Cerdas" ✅
**Goal:** Pastikan logic "lupa input" tetap berfungsi

**Scenario:**
```
User di view: November 2025
User input transaksi: 31 Oktober (lupa input bulan lalu)

Expected Behavior:
1. ✅ Transaksi disimpan dengan key `expense:2024-10:${id}` (ke Oktober!)
2. ✅ Timeline November auto-refresh
3. ✅ Saldo Awal November auto-update (include transaksi Okt yang baru)
```

**Implementation Check:**
- Server endpoint sudah handle routing ke bulan yang benar (based on date, not current month)
- Frontend refresh timeline setelah add transaction
- Saldo Awal recalculate otomatis

**Files:**
- `/supabase/functions/server/index.tsx` - Add expense endpoint
- `/components/PocketTimeline.tsx` - Refresh logic

**No Changes Needed** (should already work) - Just VERIFY!

---

### TUGAS 5: Otomatisasi Modal "Budget Bulanan" 🤖
**Problem:** User harus klik [Auto-fill] untuk isi Carryover → Tidak efisien

**Current UX:**
```
Modal Budget Desember:
├─ Budget Awal: [________]
├─ Carryover Bulan Sebelumnya: [________] 
│  └─ [Auto-fill] ← User harus klik ini!
└─ [Simpan]
```

**New UX:**
```
Modal Budget Desember:
├─ Budget Awal: [________]
├─ Carryover Bulan Sebelumnya: [Rp 1.234.567] ✅ AUTO-FILLED!
│  (Sisa Saldo 'Sehari-hari' dari November)
└─ [Simpan]
```

**Implementation:**
1. **onOpen modal** → Auto-calculate carryover
2. Fetch balance pocket "Sehari-hari" bulan sebelumnya
3. Auto-fill field dengan nilai tersebut
4. **REMOVE** tombol [Auto-fill] (not needed anymore!)

**Files:**
- `/components/BudgetForm.tsx` - Modal component
- `/components/BudgetOverview.tsx` - Open modal trigger

**Expected Result:**
```
User klik "Set Budget" untuk Desember
  ↓
Modal opens dengan Carryover PRE-FILLED ✅
  ↓
User langsung isi Budget Awal, klik Simpan
  ↓
DONE! (1 step less)
```

---

## 🏗️ Architecture Overview

### Old Architecture (WRONG - "Buku Besar"):
```
Timeline:
├─ Fetch ALL data (all months)
├─ Calculate cumulative from beginning
└─ Display everything

Problem:
❌ Tidak sesuai mental model "Monthly Statement"
❌ Slow untuk data banyak
❌ Saldo Awal tidak jelas (cumulative dari kapan?)
```

### New Architecture (CORRECT - "Monthly Statement"):
```
Timeline November:
├─ Fetch ONLY November data
├─ Calculate Saldo Awal = Carry-over from Oct 31
├─ Display:
│  ├─ Saldo Awal (from previous months)
│  ├─ Nov 1 transaction
│  ├─ Nov 2 transaction
│  └─ ... Nov transactions
└─ Saldo Akhir = Saldo Awal + Nov transactions

Benefits:
✅ Sesuai mental model "Laporan Bulanan"
✅ Fast (only 1 month data)
✅ Saldo Awal jelas (carry-over from previous month)
✅ Easy to understand
```

---

## 📊 Data Flow

### Timeline Request Flow:
```
1. User selects "November 2025" from header
   ↓
2. App fetches timeline for Nov:
   GET /timeline/2025/11/pocket_uang_dingin
   ↓
3. Server calculates:
   a) Initial Balance = SUM(all transactions BEFORE Nov 1)
   b) Nov Transactions = Filter by date in Nov
   c) Balance After = Initial + Nov transactions
   ↓
4. Response:
   {
     entries: [
       { id: 'initial_balance', amount: 15661398, ... },
       { date: '2025-11-01', amount: -30050, balanceAfter: 15631348 },
       { date: '2025-11-02', amount: 831172, balanceAfter: 16462520 },
       ...
     ]
   }
   ↓
5. Timeline displays month-scoped view ✅
```

---

## 🔧 Implementation Plan

### Phase 1: Server Endpoint Fix (60 min)

**Step 1.1: Create/Fix `/timeline/:year/:month/:pocketId`**
- Location: `/supabase/functions/server/index.tsx`
- Logic:
  1. Parse year, month, pocketId
  2. Calculate Initial Balance (all transactions BEFORE month start)
  3. Fetch transactions for current month ONLY
  4. Calculate balanceAfter for each entry
  5. Return month-scoped timeline

**Step 1.2: Remove `/timeline/all/:pocketId`**
- Delete the wrong endpoint
- Add deprecation comment

**Step 1.3: Fix ExpenseList query**
- Location: `/components/ExpenseList.tsx` or `/App.tsx`
- Ensure expenses filtered by current month from header

---

### Phase 2: Frontend Update (30 min)

**Step 2.1: Update PocketTimeline.tsx**
- Change fetch URL back to `/timeline/${year}/${month}/${pocketId}`
- Remove comments about "all data"

**Step 2.2: Update PocketsSummary.tsx**
- Change prefetch URL back to month-scoped
- Update cache key strategy

**Step 2.3: Verify ExpenseList**
- Check if already filtering by month
- If not, add month filter

---

### Phase 3: Saldo Awal Logic (45 min)

**Step 3.1: Implement Initial Balance Calculation**
- Server-side: Calculate from ALL previous transactions
- Client-side: Display as first entry

**Step 3.2: Handle Edge Cases**
- First month ever → Initial Balance = 0
- No previous transactions → Initial Balance = 0
- Multiple pockets → Calculate per pocket

**Step 3.3: Test with Real Data**
- November timeline should show Oct 31 balance
- December timeline should show Nov 30 balance

---

### Phase 4: Budget Modal Auto-fill (30 min)

**Step 4.1: Add useEffect to BudgetForm**
- OnOpen → Calculate carryover
- Fetch previous month balance for "Sehari-hari"
- Auto-set field value

**Step 4.2: Remove [Auto-fill] Button**
- Delete button from UI
- Clean up handler function

**Step 4.3: Update UX Flow**
- Modal opens → Carryover pre-filled
- User just enters initial budget
- Save

---

### Phase 5: Testing & Verification (30 min)

**Test Cases:**
1. ✅ ExpenseList only shows current month
2. ✅ Timeline only shows current month
3. ✅ Saldo Awal = carry-over from previous month
4. ✅ Switch month → Timeline updates correctly
5. ✅ Add transaction to previous month → Saldo Awal updates
6. ✅ Budget modal auto-fills carryover

---

## 📝 Files to Modify

| File | Task | Changes |
|------|------|---------|
| `/supabase/functions/server/index.tsx` | 1, 2, 3 | Remove `/timeline/all/:pocketId`, Create/fix `/timeline/:year/:month/:pocketId` with Initial Balance logic |
| `/components/PocketTimeline.tsx` | 2 | Change fetch URL to month-scoped |
| `/components/PocketsSummary.tsx` | 2 | Change prefetch URL to month-scoped |
| `/components/ExpenseList.tsx` or `/App.tsx` | 1 | Add/fix month filter for expenses |
| `/components/BudgetForm.tsx` | 5 | Add auto-fill logic, remove button |

---

## ⚠️ Critical Considerations

### 1. Backward Compatibility
**Question:** Do we have data from multiple months?
- **YES** → Need to ensure Initial Balance calculation is correct
- Need to test with real Oct + Nov data

### 2. Performance
**Old:** Fetch ALL data (slow for 100+ transactions)
**New:** Fetch only 1 month (fast! ~10-30 transactions)

### 3. UX Consistency
**Rule:** Filter bulan = SEMUA view harus respect filter ini
- ExpenseList ✅
- Timeline ✅
- Income List ✅ (verify)
- Category Breakdown ✅ (verify)

---

## 🧪 Testing Scenarios

### Scenario 1: Normal Month Switch
```
Given: User di view Oktober
When: Switch ke November
Then:
  ✅ ExpenseList shows Nov data only
  ✅ Timeline shows Nov data only
  ✅ Saldo Awal = Balance from Oct 31
```

### Scenario 2: First Month Ever
```
Given: User baru, no previous data
When: View November (first month)
Then:
  ✅ ExpenseList empty (no data yet)
  ✅ Timeline shows Saldo Awal = Rp 0
```

### Scenario 3: Late Transaction Entry
```
Given: User di view November
When: Add transaction tanggal 31 Oktober
Then:
  ✅ Transaction saved to Oktober (smart routing)
  ✅ November Saldo Awal auto-updates
  ✅ Timeline refreshes
```

### Scenario 4: Budget Modal
```
Given: User di view Desember (month belum ada budget)
When: Open Budget modal
Then:
  ✅ Carryover field pre-filled dengan saldo Nov
  ✅ No [Auto-fill] button
  ✅ User langsung isi Budget Awal, save
```

---

## 📚 Documentation to Update

After implementation:
1. Update `/planning/timeline-hotfix-logic/` - Mark as DEPRECATED
2. Create new docs in `/planning/monthly-statement-refactor-v2-final/`
3. Update architecture diagrams
4. Add "Monthly Statement Model" explanation

---

## 🚀 Execution Order

**Total Estimated Time:** ~3 hours

1. **Planning** (This document) - 30 min ✅
2. **Phase 1: Server** - 60 min
   - Remove `/timeline/all/:pocketId`
   - Create `/timeline/:year/:month/:pocketId`
   - Implement Initial Balance calculation
3. **Phase 2: Frontend** - 30 min
   - Update PocketTimeline.tsx
   - Update PocketsSummary.tsx
   - Fix ExpenseList filtering
4. **Phase 3: Saldo Awal** - 45 min
   - Test Initial Balance logic
   - Handle edge cases
5. **Phase 4: Budget Auto-fill** - 30 min
   - Add useEffect
   - Remove button
6. **Phase 5: Testing** - 30 min
   - Run all test scenarios
   - Verify correctness

---

## ✅ Success Criteria

### ExpenseList Fixed:
- [x] Only shows transactions for selected month
- [x] No Oct data when viewing Nov

### Timeline Fixed:
- [x] Fetches month-scoped data only
- [x] Saldo Awal = carry-over from previous month (not Rp 0!)
- [x] Fast loading (10-30 entries, not 100+)

### Budget Modal Improved:
- [x] Auto-fills carryover on open
- [x] No manual [Auto-fill] button
- [x] 1 step less for user

### Architecture Correct:
- [x] Follows "Monthly Statement" model
- [x] Filter bulan controls ALL data views
- [x] Saldo Awal clearly defined (carry-over)

---

## 🎯 Key Takeaways

**Wrong Approach (Hotfix):**
- Timeline = All-time ledger
- Saldo = Cumulative from beginning
- Mental model = "Buku Besar"

**Correct Approach (This Refactor):**
- Timeline = Monthly statement
- Saldo Awal = Carry-over from previous month
- Mental model = "Laporan Bulanan"

**Why This Matters:**
- ✅ User expects monthly view (like bank statement)
- ✅ Faster performance
- ✅ Clearer financial picture per month
- ✅ Easier to audit/review

---

**Status:** 📋 PLANNING COMPLETE - Ready for Implementation  
**Next:** Execute Phase 1 - Server Endpoint Fix
