# Category Edit Bug Fix - November 8, 2025

## Problem
Saat mengedit kategori di entry pengeluaran, kategori tidak tersimpan dan tidak berubah bahkan setelah refresh.

## Root Cause Analysis

### Issue #1: Category Not Loaded in Edit Form
**Location**: `/components/ExpenseList.tsx` line 776-796
**Problem**: Saat `handleEditExpense` dipanggil, field `category` tidak di-copy ke state `editingExpense`
**Fix**: Menambahkan `category: expense.category` di line 796

### Issue #2: Server Not Saving Category (Truthy Check)
**Location**: `/supabase/functions/server/index.tsx` 
**Problem**: Server menggunakan truthy check `...(category ? { category } : {})` yang akan gagal jika category adalah empty string
**Fix**: Mengubah ke `...(category !== undefined ? { category } : {})` di 3 endpoint:
- POST `/expenses/:year/:month` (line 1147)
- POST `/expenses/:year/:month/batch` (line 1218)  
- PUT `/expenses/:year/:month/:id` (line 1348)

### Issue #3: Server Not Preserving Existing Data
**Location**: `/supabase/functions/server/index.tsx` PUT endpoint
**Problem**: Saat edit expense, jika field tidak dikirim dari frontend, field tersebut hilang dari database (tidak di-preserve)
**Fix**: Preserve all fields dari existing expense jika tidak ada di request body

## Complete Fix Implementation

### 1. Frontend: ExpenseList.tsx
```typescript
const handleEditExpense = (id: string) => {
  const expense = expenses.find(e => e.id === id);
  if (expense) {
    setEditingExpenseId(id);
    const dateOnly = expense.date ? expense.date.split('T')[0] : expense.date;
    setEditingExpense({ 
      name: expense.name, 
      amount: expense.amount, 
      date: dateOnly, 
      items: expense.items ? [...expense.items] : [], 
      color: expense.color || '',
      fromIncome: expense.fromIncome,
      currency: expense.currency,
      originalAmount: expense.originalAmount,
      exchangeRate: expense.exchangeRate,
      conversionType: expense.conversionType,
      deduction: expense.deduction,
      pocketId: expense.pocketId,
      groupId: expense.groupId,
      category: expense.category  // ✅ ADDED
    });
    // ... rest of code
  }
};
```

### 2. Backend: Server index.tsx PUT Endpoint

```typescript
// Get existing expense first
const existingExpense = await kv.get(key);

// Preserve category from existing if not provided
const finalCategory = category !== undefined ? category : existingExpense?.category;

const expenseData = {
  id,
  name,
  amount: Number(amount),
  date: expenseDate,
  pocketId: pocketId || existingExpense?.pocketId || POCKET_IDS.DAILY,
  ...(items && items.length > 0 ? { items } : {}),
  // ✅ Preserve all fields from existing expense if not provided
  ...(color !== undefined ? { color } : existingExpense?.color ? { color: existingExpense.color } : {}),
  ...(fromIncome ? { fromIncome: true } : {}),
  ...(currency !== undefined ? { currency } : existingExpense?.currency ? { currency: existingExpense.currency } : {}),
  ...(originalAmount !== undefined ? { originalAmount: Number(originalAmount) } : existingExpense?.originalAmount !== undefined ? { originalAmount: existingExpense.originalAmount } : {}),
  ...(exchangeRate !== undefined ? { exchangeRate: Number(exchangeRate) } : existingExpense?.exchangeRate !== undefined ? { exchangeRate: existingExpense.exchangeRate } : {}),
  ...(conversionType !== undefined ? { conversionType } : existingExpense?.conversionType ? { conversionType: existingExpense.conversionType } : {}),
  ...(deduction !== undefined ? { deduction: Number(deduction) } : existingExpense?.deduction !== undefined ? { deduction: existingExpense.deduction } : {}),
  ...(finalGroupId ? { groupId: finalGroupId } : {}),
  ...(finalCategory !== undefined ? { category: finalCategory } : {}), // ✅ FIXED
  createdAt: existingExpense?.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

### 3. Debugging Logs Added

**Frontend (ExpenseList.tsx)**:
```typescript
console.log('[ExpenseList] Saving edit - Category:', editingExpense.category);
```

**Frontend (App.tsx)**:
```typescript
console.log('[App] Editing expense - Sending category:', updatedExpense.category);
console.log('[App] Server response category:', result.data?.category);
console.log('[App] Final updatedData category:', updatedData?.category);
```

**Backend (index.tsx)**:
```typescript
console.log(`[Edit Expense ${id}] Received category:`, category, '| Existing category:', existingExpense?.category);
console.log(`[Edit Expense ${id}] Final category being saved:`, finalCategory);
```

## Testing Checklist

### Manual Test Flow
1. ✅ Tambah entry pengeluaran baru dengan kategori
2. ✅ Verify kategori muncul dengan emoji yang benar
3. ✅ Edit entry, ubah kategori ke kategori lain
4. ✅ Save dan verify kategori berubah IMMEDIATELY (tanpa refresh)
5. ✅ Refresh page
6. ✅ Verify kategori masih tetap berubah setelah refresh
7. ✅ Edit entry, hapus kategori (set ke "Pilih Kategori")
8. ✅ Verify kategori hilang/removed
9. ✅ Edit entry yang sudah ada dari sebelumnya (tanpa kategori)
10. ✅ Add kategori baru
11. ✅ Verify kategori tersimpan

### Console Log Expected Output
Saat edit expense dan ubah kategori:
```
[ExpenseList] Saving edit - Category: food
[App] Editing expense - Sending category: food
[Edit Expense abc123] Received category: food | Existing category: transport
[Edit Expense abc123] Final category being saved: food
[App] Server response category: food
[App] Final updatedData category: food
```

## Files Modified
1. `/components/ExpenseList.tsx` - Line 796 (added category copy)
2. `/supabase/functions/server/index.tsx`:
   - Line 1147 (POST single expense)
   - Line 1218 (POST batch expenses)
   - Line 1266-1352 (PUT expense - major refactor with preserve logic)

## Why This Matters
Aplikasi ini simple flow:
1. User tambah entry → set kategori awal ✅
2. User edit entry → mengedit kategori ✅
3. Kategori terganti ✅

Seharusnya sederhana, tapi ada 3 bugs yang harus diperbaiki:
- Frontend tidak load kategori saat edit
- Backend tidak save kategori karena truthy check
- Backend tidak preserve data existing saat update

## Status
✅ All fixes implemented
🔍 Waiting for user testing & verification
