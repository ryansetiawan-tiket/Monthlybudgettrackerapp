# Expense Grouping - Quick Reference

## Fitur: Multiple Expense Grouping

**Status:** ✅ Production Ready  
**Tanggal:** 6 November 2025

## Cara Kerja

### 1. User Flow
```
User adds 2+ expenses → All get same groupId → Grouped as collapsible card
User adds 1 expense → No groupId → Shows as single card
```

### 2. Data Structure
```typescript
interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  groupId?: string;  // ← New field
  // ... other fields
}
```

### 3. Grouping Logic (ExpenseList.tsx)
```typescript
const groupKey = expense.groupId || expense.date;
// If groupId exists, use it. Otherwise fallback to date.
```

## Key Implementation Points

### ✅ Functional State Update (CRITICAL)
```typescript
// CORRECT WAY:
setExpenses(prev => [...prev, newExpense]);

// WRONG WAY (causes race condition):
setExpenses([...expenses, newExpense]);
```

### ✅ Sequential Await
```typescript
for (let i = 0; i < entries.length; i++) {
  await onAddExpense(...); // Wait for each
}
```

### ✅ Silent Mode untuk Batch
```typescript
// Silent for all except last
await onAddExpense(..., !isLast && isBatch);

// Show summary toast
if (isBatch) {
  toast.success(`${count} pengeluaran berhasil ditambahkan`);
}
```

## Debugging Tips

### Problem: Only 1 expense appears
**Solution:** Check if using functional state update in handleAddExpense

### Problem: Expenses not grouped
**Check:**
1. Do they have the same `groupId`?
2. Is `groupExpensesByDate` using `groupId || date`?
3. Backend saved `groupId`?

### Problem: Expense leaves group after edit
**Solution:** 
1. Check frontend preserves `groupId` in `setEditingExpense`
2. Check backend includes `groupId` in destructuring and expenseData
3. Verify `groupId` sent in PUT request body

### Problem: Multiple toasts
**Solution:** Check silent mode logic in handleSubmitMultiple

## API Endpoints

### Single Add
```http
POST /expenses/:year/:month
Body: { name, amount, date, groupId, ... }
```

### Batch Add (Available but not used)
```http
POST /expenses/:year/:month/batch
Body: { expenses: [...] }
```

## Files Involved

**Core Logic:**
- `/App.tsx` - handleAddExpense (state management)
- `/components/AddExpenseForm.tsx` - handleSubmitMultiple (groupId generation)
- `/components/ExpenseList.tsx` - groupExpensesByDate (display logic)

**Backend:**
- `/supabase/functions/server/index.tsx` - Expense endpoints

**Types:**
- `/types/index.ts` - Expense interface

## Testing Scenarios

```bash
# Scenario 1: Add 2 entries
1. Open Add Expense dialog
2. Click "Tambah Entry Baru"
3. Fill both entries
4. Click "Tambah 2 Pengeluaran"
✅ Both should appear immediately as 1 grouped card

# Scenario 2: Add 1 entry
1. Fill single entry
2. Click "Tambah 1 Pengeluaran"
✅ Should appear as single card (no group)

# Scenario 3: Add 3+ entries
1. Add multiple entries
2. Submit
✅ All appear immediately as 1 grouped card with "3 items"
```

## Common Pitfalls

❌ **Don't:** Use stale closure in state updates
✅ **Do:** Use functional state update

❌ **Don't:** Parallel Promise.all for sequential operations
✅ **Do:** Sequential await in loop

❌ **Don't:** Show toast for each item in batch
✅ **Do:** Show summary toast after batch completes

❌ **Don't:** Forget to preserve groupId when editing
✅ **Do:** Always include groupId in edit state and backend update

## Future Enhancements

1. **Manual Grouping** - Let user merge existing expenses
2. **Split Group** - Ungroup expenses
3. **Batch Endpoint** - Switch to single batch request
4. **Group Naming** - Custom names for groups
5. **Drag to Group** - Drag expenses to create groups

## Related Docs

- `EXPENSE_GROUPING_FIX.md` - Initial implementation
- `EXPENSE_GROUPING_RACE_CONDITION_FIX.md` - Critical race condition bug fix
- `EXPENSE_GROUPING_UPDATE_FIX.md` - Preserve groupId during update fix
- `MULTIPLE_ENTRY_EXPENSE.md` - Original multiple entry feature
