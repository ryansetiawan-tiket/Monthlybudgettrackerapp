# Quick Reference: Realtime Update Pattern

## Problem
Timeline kantong dan card kantong tidak update setelah operasi CRUD pada expense/income/transfer.

## Solution Pattern

Setiap function yang mengubah data expense, income, atau transfer harus menambahkan 2 baris ini sebelum toast success:

```tsx
// Reload pockets to update balances
loadPockets();

// Trigger refresh for PocketsSummary timeline
setPocketsRefreshKey(prev => prev + 1);
```

## Example Implementation

```tsx
const handleAddExpense = async (...) => {
  try {
    // 1. API call
    const response = await fetch(...);
    const result = await response.json();
    
    // 2. Update local state
    setExpenses([...expenses, result.data]);
    
    // 3. Update cache
    updateCachePartial('expenses', newExpenses);
    invalidateCache(selectedYear, selectedMonth);
    
    // 4. Reload pockets (IMPORTANT!)
    loadPockets();
    
    // 5. Trigger refresh (IMPORTANT!)
    setPocketsRefreshKey(prev => prev + 1);
    
    // 6. Show success
    toast.success("Pengeluaran berhasil ditambahkan");
  } catch (error) {
    // Error handling
  }
};
```

## Functions Updated ✅

| Function | Update Balance | Update Timeline |
|----------|---------------|-----------------|
| handleTransfer | ✅ | ✅ |
| handleAddExpense | ✅ | ✅ |
| handleEditExpense | ✅ | ✅ |
| handleDeleteExpense | ✅ | ✅ |
| handleBulkDeleteExpenses | ✅ | ✅ |
| handleAddIncome | ✅ | ✅ |
| handleDeleteIncome | ✅ | ✅ |
| handleUpdateIncome | ✅ | ✅ |
| handleMoveIncomeToExpense | ✅ | ✅ |
| handleMoveExpenseToIncome | ✅ | ✅ |

## Testing

Test checklist untuk setiap operasi:
1. ✅ Lakukan operasi (add/edit/delete)
2. ✅ Check card kantong → saldo harus update
3. ✅ Buka timeline kantong → entry harus muncul/update/hilang
4. ✅ Tidak perlu refresh manual

## Remember

> **ALWAYS add these 2 lines before toast.success() in any function that modifies expense/income/transfer data!**

```tsx
loadPockets();
setPocketsRefreshKey(prev => prev + 1);
```
