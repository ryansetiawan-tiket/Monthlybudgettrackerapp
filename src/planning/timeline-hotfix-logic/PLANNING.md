# Timeline Kantong - Critical Logic Hotfix

## 🚨 Problem Statement

**Current Bug (Screenshot 12.01.23.jpg):**
- Timeline Kantong **memfilter berdasarkan bulan** (hanya November)
- **Memotong semua data Oktober** ke bawah
- **Saldo Awal menampilkan Rp 0** padahal seharusnya ada carry-over

**Correct Behavior (Screenshot 12.01.10.jpg - ExpenseList):**
- ExpenseList utama **menampilkan SEMUA bulan** dengan benar
- Transaksi mengalir natural: Nov 6 → Nov 5 → Nov 3 → Nov 1 → Okt 31 → Okt 30 → dst

---

## 🎯 Solution Overview

### Fix 1: Remove Month Filter (CRITICAL)
**Current (Wrong):**
```tsx
// Timeline hanya fetch transaksi bulan ini
const url = `${baseUrl}/timeline/${year}/${month}/${pocketId}`;
```

**Fixed (Correct):**
```tsx
// Timeline fetch SEMUA transaksi kantong (all-time)
const url = `${baseUrl}/timeline/all/${pocketId}`;
// OR remove month filter from query
```

**Result:** Timeline menampilkan transaksi dari **semua bulan**, sorted DESC (newest first)

---

### Fix 2: Correct Initial Balance Calculation
**Current (Wrong):**
```tsx
// Saldo Awal = 0 "Dari Oktober" (salah!)
{
  type: 'initial_balance',
  amount: 0,
  description: 'Dari Oktober'
}
```

**Fixed (Correct):**
```tsx
// Saldo Awal = carry-over aktual dari bulan sebelumnya
{
  type: 'initial_balance',
  amount: actualCarryOverAmount, // Misal: 500.000 dari Oktober
  balanceAfter: actualCarryOverAmount,
  description: 'Saldo Awal' atau 'Dari [Bulan Sebelumnya]'
}
```

**Logic:**
1. Jika ada transaksi sebelum bulan pertama timeline → Saldo Awal = balance sebelum transaksi pertama
2. Jika tidak ada transaksi sebelumnya → Saldo Awal = 0 (tapi bukan "Dari Oktober", tapi "Saldo Awal")

---

## 📋 Implementation Plan

### Phase 1: Investigate Current Implementation ✅ NEXT

**Files to Check:**
1. `/components/PocketTimeline.tsx` - Component yang render timeline
2. `/supabase/functions/server/index.tsx` - Server endpoint untuk timeline
3. `/components/PocketDetailPage.tsx` - Parent component yang fetch data

**Questions to Answer:**
- [ ] Apakah ada endpoint `/timeline/${year}/${month}/${pocketId}`?
- [ ] Atau timeline di-generate client-side dari data kantong?
- [ ] Dimana filter bulan diterapkan?
- [ ] Bagaimana Saldo Awal dihitung?

---

### Phase 2: Remove Month Filter

**Action Items:**
1. **Server-side (if endpoint exists):**
   - [ ] Find timeline endpoint in `/supabase/functions/server/index.tsx`
   - [ ] Remove month filter from query
   - [ ] Make endpoint fetch ALL transactions for pocket
   - [ ] Keep DESC sorting (newest first)

2. **Client-side (if generated locally):**
   - [ ] Find where timeline entries are built
   - [ ] Remove month filtering logic
   - [ ] Ensure all expenses/income/transfers included

**Expected Result:**
```tsx
// Before: Only Nov data
const entries = [
  { date: '2025-11-06', ... },
  { date: '2025-11-05', ... },
  { date: '2025-11-03', ... },
  // MISSING: Oktober data ❌
];

// After: All data
const entries = [
  { date: '2025-11-06', ... },
  { date: '2025-11-05', ... },
  { date: '2025-11-03', ... },
  { date: '2025-11-01', ... },
  { date: '2025-10-31', ... }, // ✅ NOW INCLUDED
  { date: '2025-10-30', ... },
  { date: '2025-10-28', ... },
  // ... all months
];
```

---

### Phase 3: Fix Initial Balance Calculation

**Action Items:**
1. [ ] Find where "Saldo Awal" entry is created
2. [ ] Calculate correct carry-over amount:
   - If timeline has entries: `balanceAfter` of oldest entry MINUS its amount
   - Or: Query actual carry-over from previous month data
3. [ ] Update entry to show correct amount
4. [ ] Fix description text (remove hardcoded month)

**Logic Flow:**
```tsx
// Pseudocode for correct Saldo Awal
const allEntries = fetchAllTransactionsForPocket(pocketId); // No month filter!
const sortedEntries = allEntries.sort(byDateDesc); // Newest first

// Find carry-over BEFORE first transaction
let initialBalance = 0;
if (sortedEntries.length > 0) {
  const oldestEntry = sortedEntries[sortedEntries.length - 1];
  initialBalance = oldestEntry.balanceAfter - oldestEntry.amount;
}

// Create Saldo Awal entry
const initialBalanceEntry = {
  id: 'initial_balance',
  type: 'initial_balance',
  amount: initialBalance, // ✅ NOT 0!
  balanceAfter: initialBalance,
  description: 'Saldo Awal',
  date: getFirstDayOfFirstMonth(sortedEntries),
  // ...
};
```

---

### Phase 4: Verify UI Structure (TUGAS 3)

**Checklist:**
- [ ] Layout tetap 3-bagian: Mendatang, Hari Ini, Riwayat
- [ ] Entry items menggunakan layout bersih:
  - [ ] Ikon +/- (circle dengan plus/minus)
  - [ ] Emoji Kategori
  - [ ] Metadata 1 baris (nama + badge kantong)
  - [ ] Hierarki Nominal (amount bold, saldo kecil)
- [ ] Date headers tetap sticky/grouped
- [ ] Scroll smooth lintas bulan

---

## 🔍 Investigation Checklist

### Step 1: Find Timeline Data Source
```bash
# Search for timeline endpoint or builder
grep -r "timeline.*pocketId" components/
grep -r "app.get.*timeline" supabase/functions/server/
```

**Expected Findings:**
- Endpoint URL pattern
- Where month filter is applied
- Where initial balance is calculated

---

### Step 2: Trace Data Flow
```
User opens Timeline
  ↓
PocketTimeline.tsx fetchTimeline()
  ↓
Fetch from server OR build locally?
  ↓
Apply filters (REMOVE MONTH FILTER HERE!)
  ↓
Calculate balanceAfter for each entry
  ↓
Add initial balance entry
  ↓
Render grouped by date
```

---

## 📊 Expected Results

### Before Fix:
```
Timeline Uang Dingin (Nov 2025):
├─ Kamis, 13 Nov 2025
│  └─ (transaction...)
├─ Sabtu, 8 Nov 2025
│  └─ Burger + kentang (-54.500)
├─ Jumat, 7 Nov 2025
│  └─ Fiverr (+2.524.484)
├─ Sabtu, 1 Nov 2025
│  ├─ Fiverr (+831.172)
│  └─ Thumb grip steam deck (-30.050)
└─ Sabtu, 1 Nov 2025
   └─ Saldo Awal: Rp 0 ❌ (Dari Oktober)

MISSING: All Oktober data!
```

---

### After Fix:
```
Timeline Uang Dingin (All Time):
├─ Kamis, 13 Nov 2025
│  └─ (transaction...)
├─ Sabtu, 8 Nov 2025
│  └─ Burger + kentang (-54.500)
├─ Jumat, 7 Nov 2025
│  └─ Fiverr (+2.524.484)
├─ Sabtu, 1 Nov 2025
│  ├─ Fiverr (+831.172)
│  └─ Thumb grip steam deck (-30.050)
├─ 📅 [Automatic divider: Oktober 2025]
├─ Jumat, 31 Okt 2025  ✅ NOW VISIBLE!
│  └─ infaq (-100.000)
├─ Kamis, 30 Okt 2025
│  ├─ Mainan anak 2 (-629.800)
│  └─ es teh + macaroni cuck (-61.000)
├─ Selasa, 28 Okt 2025
│  └─ exit8 & hollow knight (-92.098)
└─ ... (all previous months)
└─ Saldo Awal: Rp 500.000 ✅ (actual carry-over)
```

---

## 🧪 Testing Plan

### Test 1: Multi-Month Display
```
Given: Uang Dingin has transactions in Oct, Nov
When: Open Timeline Uang Dingin
Then:
  ✅ Displays Nov transactions
  ✅ Displays Oct transactions
  ✅ Displays all previous months
  ✅ Sorted chronologically (newest first)
  ✅ Date headers cross month boundaries naturally
```

---

### Test 2: Correct Initial Balance
```
Given: 
  - Oct final balance = Rp 500.000
  - Nov is new month with carry-over

When: Open Timeline
Then:
  ✅ Saldo Awal shows +Rp 500.000 (not Rp 0!)
  ✅ First transaction's balanceAfter = 500.000 ± transaction amount
  ✅ All subsequent balances calculated correctly
```

---

### Test 3: Empty Pocket
```
Given: New pocket with no transactions
When: Open Timeline
Then:
  ✅ Shows "Saldo Awal: Rp 0" (no fake month reference)
  ✅ No error/crash
  ✅ Empty state message shown
```

---

### Test 4: UI Structure Consistency
```
Given: Timeline with multi-month data
When: Scroll through timeline
Then:
  ✅ 3-section layout maintained (Mendatang, Hari Ini, Riwayat)
  ✅ Entry items have clean layout (icon + emoji + metadata + amounts)
  ✅ Date headers group correctly
  ✅ No visual glitches at month boundaries
```

---

## 📝 Files to Modify (Estimated)

### Primary Files:
1. **`/supabase/functions/server/index.tsx`** (if server endpoint exists)
   - Remove month filter from timeline query
   - Fix initial balance calculation

2. **`/components/PocketTimeline.tsx`**
   - Update fetch URL (remove month param)
   - OR remove client-side month filter
   - Fix initial balance entry generation

3. **`/components/PocketDetailPage.tsx`** (if it fetches timeline)
   - Update fetch call to not pass month

### Secondary Files (if needed):
- **`/utils/calculations.ts`** - If timeline calculation helpers exist
- **`/types/index.ts`** - If TimelineEntry type needs update

---

## ⚠️ Critical Reminders

### DO NOT:
- ❌ Add new month-based filtering logic
- ❌ Break existing ExpenseList behavior (it's correct!)
- ❌ Change UI structure (keep 3-section layout)
- ❌ Remove date grouping/headers

### DO:
- ✅ Fetch ALL transactions for pocket (no month limit)
- ✅ Calculate actual carry-over for Saldo Awal
- ✅ Keep chronological DESC sorting
- ✅ Maintain clean UI layout

---

## 🚀 Execution Order

1. **Investigation Phase** (10 min)
   - Find where timeline is fetched/built
   - Identify month filter location
   - Locate initial balance calculation

2. **Fix Phase 1: Remove Month Filter** (15 min)
   - Update server endpoint OR client query
   - Test: Verify all months display

3. **Fix Phase 2: Correct Initial Balance** (15 min)
   - Calculate actual carry-over
   - Update Saldo Awal entry
   - Test: Verify correct amount

4. **Verification Phase** (10 min)
   - Run all test scenarios
   - Verify UI consistency
   - Check no regressions

**Total Estimated Time:** 50 minutes

---

## 📚 Reference Screenshots

**Bad (Current):**
- `12.01.23.jpg` - Timeline only shows November, cuts October

**Good (Target):**
- `12.01.10.jpg` - ExpenseList shows all months correctly

---

## ✅ Success Criteria

**Timeline Kantong is FIXED when:**
1. ✅ Displays ALL transactions from ALL months (no filtering)
2. ✅ Saldo Awal shows correct carry-over amount (not Rp 0)
3. ✅ Chronological flow crosses month boundaries naturally
4. ✅ UI structure maintains 3-section layout
5. ✅ No visual regressions

---

**Status:** 📋 PLANNING COMPLETE - Ready for Investigation Phase
**Next Step:** Investigate timeline data source and filter location
