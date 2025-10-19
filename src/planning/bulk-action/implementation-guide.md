# Bulk Delete Implementation Guide

## 🎯 Quick Start

Dokumen ini adalah panduan step-by-step untuk mengimplementasikan fitur bulk delete berdasarkan planning document.

## 📋 Pre-Implementation Checklist

- [ ] Review `bulk-delete-planning.md`
- [ ] Understand current ExpenseList.tsx structure
- [ ] Understand current App.tsx expense handlers
- [ ] Verify shadcn/ui Checkbox component available
- [ ] Backup current code (git commit)

## 🛠️ Implementation Steps

### Step 1: Add State Management to ExpenseList.tsx

**Location**: `/components/ExpenseList.tsx`

**Add these imports**:
```typescript
import { Checkbox } from "./ui/checkbox";
```

**Add new state variables** (after existing useState declarations):
```typescript
const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
const [selectedExpenseIds, setSelectedExpenseIds] = useState<Set<string>>(new Set());
const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
```

**Add computed value**:
```typescript
const isAllSelected = useMemo(() => {
  return sortedAndFilteredExpenses.length > 0 && 
         selectedExpenseIds.size === sortedAndFilteredExpenses.length;
}, [selectedExpenseIds, sortedAndFilteredExpenses]);
```

---

### Step 2: Add Selection Handler Functions

**Add after existing handler functions**:

```typescript
const handleActivateBulkMode = () => {
  setIsBulkSelectMode(true);
  setSelectedExpenseIds(new Set());
};

const handleCancelBulkMode = () => {
  setIsBulkSelectMode(false);
  setSelectedExpenseIds(new Set());
};

const handleToggleExpense = (id: string) => {
  setSelectedExpenseIds(prev => {
    const newSet = new Set(prev);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    return newSet;
  });
};

const handleSelectAll = () => {
  if (isAllSelected) {
    setSelectedExpenseIds(new Set());
  } else {
    const allIds = new Set(sortedAndFilteredExpenses.map(exp => exp.id));
    setSelectedExpenseIds(allIds);
  }
};

const handleBulkDelete = () => {
  if (selectedExpenseIds.size === 0) return;
  setShowBulkDeleteDialog(true);
};

const handleConfirmBulkDelete = async () => {
  const idsToDelete = Array.from(selectedExpenseIds);
  
  try {
    await onBulkDeleteExpenses(idsToDelete);
    
    setSelectedExpenseIds(new Set());
    setIsBulkSelectMode(false);
    setShowBulkDeleteDialog(false);
    
    toast.success(`${idsToDelete.length} pengeluaran berhasil dihapus`);
  } catch (error) {
    console.log(`Error in bulk delete: ${error}`);
    toast.error("Gagal menghapus beberapa pengeluaran");
  }
};
```

---

### Step 3: Update Props Interface

**Modify ExpenseListProps**:
```typescript
interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
  onBulkDeleteExpenses: (ids: string[]) => Promise<void>; // ADD THIS
}
```

**Update function signature**:
```typescript
export function ExpenseList({ 
  expenses, 
  onDeleteExpense, 
  onEditExpense,
  onBulkDeleteExpenses // ADD THIS
}: ExpenseListProps) {
```

---

### Step 4: Update Header Section

**Replace existing CardHeader content**:

```typescript
<CardHeader>
  <CardTitle className="flex items-center justify-between">
    {!isBulkSelectMode ? (
      // Normal Mode
      <>
        <span>Daftar Pengeluaran</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleActivateBulkMode}
          >
            Pilih
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSortOrder}
            className="h-8 w-8"
            title={sortOrder === 'asc' ? 'Terlama ke Terbaru' : 'Terbaru ke Terlama'}
          >
            <ArrowUpDown className="size-4" />
          </Button>
          <span className="text-sm text-red-600">{formatCurrency(totalExpenses)}</span>
        </div>
      </>
    ) : (
      // Bulk Select Mode
      <>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm">
            {selectedExpenseIds.size > 0
              ? `${selectedExpenseIds.size} item dipilih`
              : "Pilih semua"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={selectedExpenseIds.size === 0}
          >
            Hapus ({selectedExpenseIds.size})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancelBulkMode}
          >
            Batal
          </Button>
        </div>
      </>
    )}
  </CardTitle>
</CardHeader>
```

---

### Step 5: Update renderExpenseItem Function

**For items WITH subitems (Collapsible)**:

Find the section:
```typescript
<div className="flex items-center justify-between p-3 cursor-pointer">
  <div className="flex-1 flex items-center gap-2">
```

Replace with:
```typescript
<div className="flex items-center justify-between p-3 cursor-pointer">
  <div className="flex-1 flex items-center gap-2">
    {isBulkSelectMode && (
      <Checkbox
        checked={selectedExpenseIds.has(expense.id)}
        onCheckedChange={() => handleToggleExpense(expense.id)}
        onClick={(e) => e.stopPropagation()}
      />
    )}
```

Find the action buttons section:
```typescript
<div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
  <p className="text-red-600">{formatCurrency(expense.amount)}</p>
  <Button
```

Replace with:
```typescript
<div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
  <p className="text-red-600">{formatCurrency(expense.amount)}</p>
  {!isBulkSelectMode && (
    <>
      <Button
```

Make sure to close the fragment after the Delete button:
```typescript
      </Button>
    </>
  )}
</div>
```

**For items WITHOUT subitems**:

Find the section:
```typescript
<div className="flex-1 flex items-center gap-2">
  {isToday(expense.date) && (
```

Replace with:
```typescript
<div className="flex-1 flex items-center gap-2">
  {isBulkSelectMode && (
    <Checkbox
      checked={selectedExpenseIds.has(expense.id)}
      onCheckedChange={() => handleToggleExpense(expense.id)}
    />
  )}
  {isToday(expense.date) && (
```

Find the action buttons section:
```typescript
<div className="flex items-center gap-3">
  <p className="text-red-600">{formatCurrency(expense.amount)}</p>
  <Button
```

Replace with:
```typescript
<div className="flex items-center gap-3">
  <p className="text-red-600">{formatCurrency(expense.amount)}</p>
  {!isBulkSelectMode && (
    <>
      <Button
```

Close the fragment after the Delete button:
```typescript
      </Button>
    </>
  )}
</div>
```

---

### Step 6: Add Bulk Delete Confirmation Dialog

**Add before the closing `</Card>` tag**:

```typescript
<AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
  <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
    <AlertDialogHeader>
      <AlertDialogTitle>Hapus {selectedExpenseIds.size} Pengeluaran</AlertDialogTitle>
      <AlertDialogDescription asChild>
        <div className="space-y-3">
          <p>Anda yakin ingin menghapus pengeluaran berikut?</p>
          <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
            {Array.from(selectedExpenseIds).map(id => {
              const expense = expenses.find(e => e.id === id);
              if (!expense) return null;
              return (
                <div key={id} className="flex justify-between text-sm border-b pb-2 last:border-b-0">
                  <span>{expense.name}</span>
                  <span className="text-red-600">{formatCurrency(expense.amount)}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span>Total:</span>
            <span className="text-red-600">
              {formatCurrency(
                Array.from(selectedExpenseIds).reduce((sum, id) => {
                  const expense = expenses.find(e => e.id === id);
                  return sum + (expense?.amount || 0);
                }, 0)
              )}
            </span>
          </div>
        </div>
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>
        Batal
      </AlertDialogCancel>
      <AlertDialogAction
        onClick={handleConfirmBulkDelete}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        Hapus Semua
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

### Step 7: Add Handler in App.tsx

**Location**: `/App.tsx`

**Add this function** (after existing expense handlers):

```typescript
const handleBulkDeleteExpenses = async (ids: string[]) => {
  try {
    // Delete all expenses in parallel
    const deletePromises = ids.map(id =>
      fetch(
        `${baseUrl}/expenses/${selectedYear}/${selectedMonth}/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      )
    );

    const results = await Promise.allSettled(deletePromises);
    
    // Check for failures
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      console.log(`Some deletes failed: ${failures.length} out of ${ids.length}`);
    }

    // Update local state - remove deleted items
    setExpenses(prev => prev.filter(exp => !ids.includes(exp.id)));
    
    // Update cache
    updateCachePartial('expenses', expenses.filter(exp => !ids.includes(exp.id)));
    
    // Invalidate next month cache (expenses affect carryover)
    const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
    const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
    invalidateCache(nextYear, nextMonth);

    if (failures.length > 0) {
      toast.warning(`${results.length - failures.length} dari ${ids.length} pengeluaran berhasil dihapus`);
    }
  } catch (error) {
    console.log(`Error bulk deleting expenses: ${error}`);
    throw error; // Re-throw to be caught by ExpenseList
  }
};
```

---

### Step 8: Pass Handler to ExpenseList

**Find the ExpenseList component usage** in App.tsx:

```typescript
<ExpenseList
  expenses={expenses}
  onDeleteExpense={handleDeleteExpense}
  onEditExpense={handleEditExpense}
/>
```

**Update to**:
```typescript
<ExpenseList
  expenses={expenses}
  onDeleteExpense={handleDeleteExpense}
  onEditExpense={handleEditExpense}
  onBulkDeleteExpenses={handleBulkDeleteExpenses}
/>
```

---

### Step 9: Add Visual Highlight for Selected Items (Optional Polish)

**In renderExpenseItem**, add conditional className:

For collapsible items:
```typescript
<div className={`border rounded-lg hover:bg-accent transition-colors ${
  isToday(expense.date) ? 'ring-2 ring-blue-500' : ''
} ${
  isBulkSelectMode && selectedExpenseIds.has(expense.id) ? 'bg-accent/20' : ''
}`}>
```

For non-collapsible items:
```typescript
<div
  key={expense.id}
  className={`flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors ${
    isToday(expense.date) ? 'ring-2 ring-blue-500' : ''
  } ${
    isBulkSelectMode && selectedExpenseIds.has(expense.id) ? 'bg-accent/20' : ''
  }`}
>
```

---

### Step 10: Handle Month Change Exit

**In ExpenseList.tsx**, add useEffect to auto-exit bulk mode on month change:

```typescript
// Auto-exit bulk mode when expenses change (month change)
useEffect(() => {
  if (isBulkSelectMode) {
    setIsBulkSelectMode(false);
    setSelectedExpenseIds(new Set());
  }
}, [expenses.length]); // Trigger on expenses array change
```

**Note**: Be careful with this dependency - consider using a month/year prop instead if available.

---

## ✅ Testing Steps

After implementation, test the following:

### Basic Functionality
1. [ ] Click "Pilih" - bulk mode activates
2. [ ] Checkboxes appear on all items
3. [ ] Click checkbox - item gets selected (visual highlight)
4. [ ] Click "Select All" - all items selected
5. [ ] Click "Select All" again - all items deselected
6. [ ] Select 3 items - counter shows "3 item dipilih"
7. [ ] Click "Hapus (3)" - confirmation dialog appears
8. [ ] Dialog shows correct 3 items with amounts and total
9. [ ] Click "Hapus Semua" - items deleted, toast shown
10. [ ] Bulk mode exits automatically

### Edge Cases
11. [ ] Search in bulk mode - checkboxes still work
12. [ ] Select item, search to hide it, unselect via "Select All" - works
13. [ ] Click "Batal" - exits bulk mode, clears selections
14. [ ] "Hapus" button disabled when nothing selected
15. [ ] Change month - bulk mode exits (if implemented)

### UI/UX
16. [ ] Mobile responsive - checkboxes have good touch targets
17. [ ] Dialog scrollable with many items
18. [ ] No layout shift when entering/exiting bulk mode
19. [ ] Smooth transitions and animations
20. [ ] Keyboard navigation works (tab through checkboxes)

---

## 🐛 Common Issues & Solutions

### Issue: Checkbox clicks toggle collapsible
**Solution**: Add `onClick={(e) => e.stopPropagation()}` to Checkbox

### Issue: Selection state not updating
**Solution**: Make sure you're using `new Set(prev)` to create new Set instance

### Issue: "Hapus" button stays disabled
**Solution**: Check that `selectedExpenseIds.size` is being updated correctly

### Issue: Dialog doesn't show items
**Solution**: Verify expenses array is accessible in dialog scope

### Issue: Bulk delete doesn't update cache
**Solution**: Ensure cache update happens AFTER successful deletes

### Issue: Layout breaks on mobile
**Solution**: Add responsive classes and adequate spacing for checkboxes

---

## 📊 Performance Considerations

### For Large Lists (100+ items)
- Use `Promise.allSettled` instead of `Promise.all` for better error handling
- Consider batching delete requests (10-20 at a time)
- Add loading state during bulk delete
- Show progress indicator for very large bulk operations

### Optimization Tips
```typescript
// Instead of multiple re-renders, batch state updates
const handleBulkOperation = async () => {
  setIsLoading(true);
  
  try {
    await performBulkDelete();
    
    // Batch state updates
    setBatch(() => {
      setExpenses(newExpenses);
      setSelectedExpenseIds(new Set());
      setIsBulkSelectMode(false);
      setShowBulkDeleteDialog(false);
    });
  } finally {
    setIsLoading(false);
  }
};
```

---

## 🎨 Styling Tips

### Checkbox Alignment
```css
/* Ensure checkboxes align with content */
.expense-item-checkbox {
  flex-shrink: 0;
  margin-right: 8px;
}
```

### Selected Item Highlight
```css
/* Subtle highlight for selected items */
.expense-item-selected {
  background-color: hsl(var(--accent) / 0.2);
  border-color: hsl(var(--accent));
}
```

### Mobile Touch Targets
```css
/* Minimum 44px touch target on mobile */
@media (max-width: 768px) {
  .expense-item-checkbox {
    min-width: 44px;
    min-height: 44px;
  }
}
```

---

## 📝 Code Review Checklist

Before submitting:
- [ ] All TypeScript types are correct
- [ ] No console errors or warnings
- [ ] Props are properly passed and typed
- [ ] Error handling is implemented
- [ ] Loading states are handled
- [ ] Toast messages are user-friendly
- [ ] Code follows existing patterns in ExpenseList.tsx
- [ ] Comments added for complex logic
- [ ] No hardcoded strings (use proper labels)
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen reader friendly
- [ ] Mobile responsive
- [ ] Dark mode compatible

---

## 🚀 Ready to Implement?

Use this checklist:
1. [ ] Read through entire implementation guide
2. [ ] Understand all steps
3. [ ] Have test data ready (create dummy expenses)
4. [ ] Git commit current state
5. [ ] Start with Step 1
6. [ ] Test after each major step
7. [ ] Complete all 10 steps
8. [ ] Run full testing checklist
9. [ ] Review code quality
10. [ ] Deploy to staging/preview

---

**Good luck with implementation! 🎉**

If you encounter issues, refer to the troubleshooting section or review the planning document.
