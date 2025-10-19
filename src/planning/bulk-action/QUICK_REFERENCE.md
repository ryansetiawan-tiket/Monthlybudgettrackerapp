# Bulk Delete Feature - Quick Reference Guide

**For Developers & Users**  
**Version**: 1.0.0  
**Last Updated**: 2025-10-18

---

## 🎯 Quick Start (Users)

### How to Use Bulk Delete

1. **Activate Bulk Mode**
   - Click the **"Pilih"** button at the top of the expense list
   - Checkboxes will appear next to each expense

2. **Select Items**
   - Click checkboxes to select individual items
   - Click **"Pilih semua"** checkbox to select all visible items
   - Selected items will be highlighted

3. **Delete Selected Items**
   - Click **"Hapus (X)"** button showing the count
   - Review the confirmation dialog
   - Click **"Hapus Semua"** to confirm
   - Toast notification confirms success

4. **Cancel**
   - Click **"Batal"** button to exit without deleting
   - Press **Escape** key on keyboard

---

## 🎨 Visual States

### Normal Mode
```
┌────────────────────────────────────────────┐
│ Daftar Pengeluaran    [Pilih] [↕] Rp 500K │
├────────────────────────────────────────────┤
│ [Search box]                               │
│                                            │
│ ○ Senin, 15 Okt  Groceries     Rp 100K 🖊️ 🗑️│
│ ○ Selasa, 16 Okt Transport     Rp 50K  🖊️ 🗑️│
└────────────────────────────────────────────┘
```

### Bulk Select Mode
```
┌────────────────────────────────────────────┐
│ [✓] 2 item dipilih    [Hapus (2)] [Batal] │
├────────────────────────────────────────────┤
│ [Search box]                               │
│                                            │
│ [✓] Senin, 15 Okt  Groceries     Rp 100K  │  <- highlighted
│ [✓] Selasa, 16 Okt Transport     Rp 50K   │  <- highlighted
│ [ ] Rabu, 17 Okt   Dining        Rp 75K   │
└────────────────────────────────────────────┘
```

### Confirmation Dialog
```
┌────────────────────────────────────────┐
│  Hapus 2 Pengeluaran                   │
├────────────────────────────────────────┤
│  Anda yakin ingin menghapus            │
│  pengeluaran berikut?                  │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Groceries        Rp 100.000      │ │
│  │ Transport        Rp 50.000       │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Total: Rp 150.000                     │
│                                        │
│            [Batal] [Hapus Semua]       │
└────────────────────────────────────────┘
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Escape` | Exit bulk select mode |
| `Tab` | Navigate between checkboxes |
| `Space` | Toggle focused checkbox |
| `Enter` | Confirm dialog (when focused) |

---

## 📱 Mobile Behavior

### Touch Targets
- All checkboxes have minimum 44px touch target
- Buttons sized appropriately for thumb interaction
- No accidental touches when scrolling

### Gestures
- Tap checkbox to select
- Tap "Pilih semua" to select all
- Tap empty space to scroll (not select)
- Swipe dialog to see all items

---

## 🎛️ Component Props (Developers)

### ExpenseList Component

```typescript
interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
  onBulkDeleteExpenses: (ids: string[]) => Promise<void>;  // NEW
}
```

### Usage in App.tsx

```typescript
<ExpenseList 
  expenses={expenses} 
  onDeleteExpense={handleDeleteExpense} 
  onEditExpense={handleEditExpense}
  onBulkDeleteExpenses={handleBulkDeleteExpenses}  // NEW
/>
```

---

## 🔄 State Flow (Developers)

### State Variables
```typescript
const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
const [selectedExpenseIds, setSelectedExpenseIds] = useState<Set<string>>(new Set());
const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
const [isBulkDeleting, setIsBulkDeleting] = useState(false);
```

### State Transitions
```
NORMAL MODE
    │
    ├─[Click "Pilih"]──→ BULK SELECT MODE
    │                         │
    │                         ├─[Select items]──→ ITEMS SELECTED
    │                         │                       │
    │                         │                       ├─[Click "Hapus"]──→ CONFIRMATION DIALOG
    │                         │                       │                        │
    │                         │                       │                        ├─[Confirm]──→ DELETING...
    │                         │                       │                        │                  │
    │                         │                       │                        │                  └──→ SUCCESS → NORMAL MODE
    │                         │                       │                        │
    │                         │                       │                        └─[Cancel]──→ BULK SELECT MODE
    │                         │                       │
    │                         │                       └─[Click "Batal"]──→ NORMAL MODE
    │                         │
    │                         └─[Press Escape]──→ NORMAL MODE
    │
    └─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Functions (Developers)

### Handler Functions

```typescript
// Activate bulk mode
const handleActivateBulkMode = useCallback(() => {
  setIsBulkSelectMode(true);
  setSelectedExpenseIds(new Set());
}, []);

// Toggle single item
const handleToggleExpense = useCallback((id: string) => {
  setSelectedExpenseIds(prev => {
    const newSet = new Set(prev);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    return newSet;
  });
}, []);

// Select/deselect all
const handleSelectAll = useCallback(() => {
  if (isAllSelected) {
    setSelectedExpenseIds(new Set());
  } else {
    const allIds = new Set(sortedAndFilteredExpenses.map(exp => exp.id));
    setSelectedExpenseIds(allIds);
  }
}, [isAllSelected, sortedAndFilteredExpenses]);

// Confirm and delete
const handleConfirmBulkDelete = useCallback(async () => {
  const idsToDelete = Array.from(selectedExpenseIds);
  setIsBulkDeleting(true);
  try {
    await onBulkDeleteExpenses(idsToDelete);
    // Success handling...
  } catch (error) {
    // Error handling...
  } finally {
    setIsBulkDeleting(false);
  }
}, [selectedExpenseIds, onBulkDeleteExpenses]);
```

---

## 🐛 Troubleshooting

### Issue: Checkboxes not appearing
**Solution**: Check that `isBulkSelectMode` is true and component re-rendered

### Issue: Selection count wrong
**Solution**: Verify Set is being updated immutably (`new Set(prev)`)

### Issue: Delete not working
**Solution**: Check network tab for API errors, verify `onBulkDeleteExpenses` is passed correctly

### Issue: Escape key not working
**Solution**: Ensure keyboard event listener is attached and cleanup function called

### Issue: Items stay selected after month change
**Solution**: Check the useEffect that cleans up invalid selections

---

## 📊 Performance Tips

### For Large Lists (100+ items)

```typescript
// Consider batching deletes
const BATCH_SIZE = 20;
const batches = [];
for (let i = 0; i < ids.length; i += BATCH_SIZE) {
  batches.push(ids.slice(i, i + BATCH_SIZE));
}

for (const batch of batches) {
  await Promise.allSettled(batch.map(id => deleteExpense(id)));
}
```

### Prevent Unnecessary Re-renders

```typescript
// ✅ Good - memoized
const handleToggleExpense = useCallback((id: string) => { ... }, []);

// ❌ Bad - creates new function every render
const handleToggleExpense = (id: string) => { ... };
```

---

## 🔒 Security Checklist

- [x] Confirmation required before delete
- [x] User can see what will be deleted
- [x] Server validates all delete requests
- [x] No client-side bypass possible
- [x] Partial failures handled gracefully
- [x] Error messages don't expose internals

---

## 📝 Common Patterns

### Adding Similar Features

To add bulk edit or other bulk operations:

1. **Add State**
   ```typescript
   const [isBulkEditMode, setIsBulkEditMode] = useState(false);
   ```

2. **Add Handler**
   ```typescript
   const handleBulkEdit = useCallback(async (ids, updates) => {
     // Similar to handleBulkDelete
   }, [dependencies]);
   ```

3. **Update UI**
   - Add button/checkbox UI conditionally
   - Show confirmation dialog
   - Handle success/error states

4. **Pass to Parent**
   ```typescript
   <ExpenseList onBulkEdit={handleBulkEdit} />
   ```

---

## 📚 Related Documentation

- **Full Planning**: `/planning/bulk-action/bulk-delete-planning.md`
- **Implementation Guide**: `/planning/bulk-action/implementation-guide.md`
- **Implementation Summary**: `/planning/bulk-action/IMPLEMENTATION_COMPLETE.md`
- **Visual Mockups**: `/planning/bulk-action/visual-mockups.md`

---

## 🎓 Learning Resources

### Understanding the Code

1. **React Hooks**
   - `useState` for component state
   - `useCallback` for memoized functions
   - `useMemo` for computed values
   - `useEffect` for side effects and cleanup

2. **Set vs Array for Selection**
   - Set: O(1) lookup, add, delete
   - Array: O(n) lookup, O(1) push
   - Winner: Set for selection state ✅

3. **Promise.allSettled vs Promise.all**
   - `Promise.all`: Fails if any fails
   - `Promise.allSettled`: Returns all results, even failures
   - Winner: allSettled for bulk operations ✅

---

## 💡 Pro Tips

### For Users
- Use search to filter, then select all filtered results
- Review the confirmation dialog carefully
- Bulk mode auto-exits after successful delete

### For Developers
- Always use `useCallback` for handler functions passed as props
- Prefer `Set` over `Array` for selection state
- Test edge cases: empty list, single item, all items
- Don't forget keyboard accessibility
- Mobile touch targets minimum 44px

---

## 📞 Need Help?

### For Users
- Check visual states above
- Try keyboard shortcuts
- Cancel and try again

### For Developers
- Review console for errors
- Check network tab for API calls
- Verify props are passed correctly
- Review implementation guide step-by-step

---

**Quick Links:**
- [📋 README](./README.md)
- [📘 Planning Doc](./bulk-delete-planning.md)
- [🛠️ Implementation Guide](./implementation-guide.md)
- [✅ Implementation Complete](./IMPLEMENTATION_COMPLETE.md)

---

**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Last Updated**: 2025-10-18
