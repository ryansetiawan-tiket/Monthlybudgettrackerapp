# Fix: Expense Grouping untuk Multiple Entries

**Tanggal:** 6 November 2025  
**Status:** ✅ Complete

## Masalah

Ketika menambahkan 2 atau lebih expense entries sekaligus melalui fitur "Multiple Entry", entries tersebut tidak tergabung menjadi 1 grup di ExpenseList. Setiap entry ditampilkan sebagai card terpisah meskipun ditambahkan di waktu yang sama dan tanggal yang sama.

### Root Cause
- Setiap expense ditambahkan satu per satu dengan `date` yang sama, tapi tanpa identifier yang menghubungkan mereka sebagai satu grup
- Logic pengelompokan di ExpenseList hanya menggunakan `expense.date` sebagai key
- Karena setiap expense mungkin memiliki timestamp yang sedikit berbeda (beberapa milidetik), mereka tidak dikelompokkan

## Solusi Implemented

### 1. Menambahkan Field `groupId` ke Expense Type

**Files Modified:**
- `/types/index.ts` - Added `groupId?: string` to Expense interface
- `/App.tsx` - Added `groupId?: string` to local Expense interface
- `/components/ExpenseList.tsx` - Added `groupId?: string` to local Expense interface

### 2. Update Add Expense Flow

**Files Modified:**
- `/App.tsx` - `handleAddExpense` now accepts optional `groupId` parameter
- `/components/AddExpenseDialog.tsx` - Updated props interface to pass `groupId`
- `/components/AddExpenseForm.tsx`:
  - Updated props interface to accept `groupId`
  - Modified `handleSubmitMultiple` to generate a unique `groupId` when submitting multiple entries (2+ entries)
  - Single entries don't get a `groupId` (undefined)

```typescript
// Generate groupId for multiple entries added together
const groupId = validEntries.length > 1 ? crypto.randomUUID() : undefined;
```

### 3. Update Grouping Logic di ExpenseList

**File Modified:** `/components/ExpenseList.tsx`

**Changes:**
1. Updated `groupExpensesByDate` function:
   ```typescript
   // Use groupId as the primary key if it exists, otherwise use date
   const groupKey = expense.groupId || expense.date;
   ```

2. Updated `renderGroupedExpenseItem` function:
   - Renamed parameter from `date` to `groupKey` untuk clarity
   - Extract actual date dari first expense in group
   - Use `actualDate` untuk formatting dan date-related checks

## Behavior Sekarang

### Multiple Entries (2+ items ditambah bersamaan)
- ✅ Semua entries mendapat `groupId` yang sama
- ✅ Dikelompokkan sebagai 1 card dengan collapsible content
- ✅ Menampilkan total amount dari semua entries
- ✅ Menampilkan "X items" untuk jumlah entries dalam grup

### Single Entry
- ✅ Tidak mendapat `groupId` (undefined)
- ✅ Ditampilkan sebagai single card seperti biasa
- ✅ Behavior tidak berubah

### Expenses di Hari yang Sama tapi Ditambah di Waktu Berbeda
- ✅ Tidak dikelompokkan (karena tidak ada shared `groupId`)
- ✅ Ditampilkan sebagai separate cards
- ✅ User bisa membedakan mana yang ditambah bersamaan vs ditambah terpisah

## Testing Checklist

- [x] Tambah 2 expenses sekaligus → Harus grouped
- [x] Tambah 3+ expenses sekaligus → Harus grouped
- [x] Tambah 1 expense → Tidak grouped, tampil normal
- [x] Tambah 2 expenses terpisah di hari yang sama → Tidak grouped
- [x] Group expansion/collapse berfungsi
- [x] Bulk select untuk grouped expenses
- [x] Edit/delete individual expense dalam group
- [x] Excluded expenses dalam group tetap berfungsi

## Backward Compatibility

✅ **Fully Backward Compatible**
- Existing expenses tanpa `groupId` akan tetap berfungsi normal
- `groupId` adalah optional field
- Fallback ke date-based grouping untuk expenses lama

## Database Schema

⚠️ **Note:** Field `groupId` perlu ditambahkan ke expense records di KV store.

Backend sudah siap menerima `groupId` dalam request body:
```typescript
body: JSON.stringify({ name, amount, date, items, color, pocketId, groupId })
```

## Next Steps (Optional Enhancements)

1. **Manual Grouping**: Allow user to manually group/ungroup expenses
2. **Group Naming**: Option to give custom name to a group
3. **Group Templates**: Save groups as templates for reuse
4. **Split Group**: Allow splitting a group into individual expenses

## Related Files

- `/types/index.ts` - Type definitions
- `/App.tsx` - Main app logic
- `/components/AddExpenseForm.tsx` - Form logic with groupId generation
- `/components/AddExpenseDialog.tsx` - Dialog wrapper
- `/components/ExpenseList.tsx` - Grouping and rendering logic
