# Bulk Delete Pengeluaran - Planning Document

## 📋 Overview
Fitur ini memungkinkan user untuk memilih multiple pengeluaran sekaligus dan menghapusnya dalam satu aksi. Fitur ini akan meningkatkan efisiensi ketika user perlu menghapus banyak entri pengeluaran.

## 🎯 Goals & Objectives

### Primary Goals
1. Memungkinkan user untuk select multiple expenses sekaligus
2. Menghapus selected expenses dalam satu bulk action
3. Memberikan feedback yang jelas tentang berapa items yang dipilih
4. Mencegah accidental bulk delete dengan konfirmasi yang proper

### Success Criteria
- [ ] User dapat toggle bulk select mode
- [ ] User dapat select/deselect individual items
- [ ] User dapat select/deselect all items
- [ ] Konfirmasi dialog menampilkan jumlah items yang akan dihapus
- [ ] Bulk delete berhasil menghapus semua selected items
- [ ] UI responsive dan intuitive

## 🎨 UX Flow

### Flow Diagram
```
[Normal View] 
    ↓ (Click "Pilih" button)
[Bulk Select Mode]
    ↓ (Select items via checkbox)
[Items Selected (n items)]
    ↓ (Click "Hapus (n)" button)
[Confirmation Dialog]
    ↓ (Confirm)
[Items Deleted + Toast]
    ↓
[Exit Bulk Mode]
```

### User Journey
1. **Activation**: User clicks "Pilih" button di header ExpenseList
2. **Selection Mode**: 
   - Checkboxes muncul di setiap expense item
   - Edit & Delete buttons individual di-hide
   - Header berubah menampilkan "Select All" checkbox dan counter
3. **Selection**:
   - User dapat click checkbox untuk select/deselect individual items
   - User dapat click "Select All" untuk select semua items
   - Counter menampilkan "n item dipilih"
4. **Bulk Action**:
   - Button "Hapus (n)" muncul (disabled jika tidak ada yang dipilih)
   - Click button memunculkan confirmation dialog
5. **Confirmation**:
   - Dialog menampilkan list nama expenses yang akan dihapus
   - User dapat review sebelum confirm
6. **Deletion**:
   - Semua selected items dihapus
   - Toast notification: "n pengeluaran berhasil dihapus"
   - Exit bulk select mode otomatis

## 🏗️ Technical Architecture

### State Management

#### New States in ExpenseList.tsx
```typescript
const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
const [selectedExpenseIds, setSelectedExpenseIds] = useState<Set<string>>(new Set());
const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
```

#### State Transitions
- `isBulkSelectMode`: `false` → `true` (activate) → `false` (cancel/complete)
- `selectedExpenseIds`: `new Set()` → `Set<string>` (add items) → `new Set()` (after delete)

### Component Changes

#### ExpenseList.tsx

##### Header Section
```typescript
// Normal Mode Header
<CardTitle>
  <span>Daftar Pengeluaran</span>
  <div className="flex items-center gap-2">
    <Button variant="outline" onClick={handleActivateBulkMode}>
      Pilih
    </Button>
    <Button variant="ghost" size="icon" onClick={toggleSortOrder}>
      <ArrowUpDown />
    </Button>
    <span>{formatCurrency(totalExpenses)}</span>
  </div>
</CardTitle>

// Bulk Select Mode Header
<CardTitle>
  <div className="flex items-center gap-2">
    <Checkbox 
      checked={isAllSelected}
      onCheckedChange={handleSelectAll}
    />
    <span>
      {selectedExpenseIds.size > 0 
        ? `${selectedExpenseIds.size} item dipilih`
        : "Pilih semua"}
    </span>
  </div>
  <div className="flex items-center gap-2">
    <Button 
      variant="destructive" 
      onClick={handleBulkDelete}
      disabled={selectedExpenseIds.size === 0}
    >
      Hapus ({selectedExpenseIds.size})
    </Button>
    <Button variant="outline" onClick={handleCancelBulkMode}>
      Batal
    </Button>
  </div>
</CardTitle>
```

##### Expense Item Rendering
```typescript
// Modify renderExpenseItem to include checkbox in bulk mode
const renderExpenseItem = (expense: Expense) => {
  // ... existing code ...
  
  return (
    <div className="flex items-center gap-2">
      {isBulkSelectMode && (
        <Checkbox
          checked={selectedExpenseIds.has(expense.id)}
          onCheckedChange={() => handleToggleExpense(expense.id)}
          onClick={(e) => e.stopPropagation()}
        />
      )}
      
      {/* Existing expense content */}
      
      {!isBulkSelectMode && (
        <div className="flex items-center gap-3">
          {/* Edit & Delete buttons */}
        </div>
      )}
    </div>
  );
};
```

### New Functions

#### Selection Handlers
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

const isAllSelected = useMemo(() => {
  return sortedAndFilteredExpenses.length > 0 && 
         selectedExpenseIds.size === sortedAndFilteredExpenses.length;
}, [selectedExpenseIds, sortedAndFilteredExpenses]);
```

#### Bulk Delete Handler
```typescript
const handleBulkDelete = () => {
  if (selectedExpenseIds.size === 0) return;
  setShowBulkDeleteDialog(true);
};

const handleConfirmBulkDelete = async () => {
  const idsToDelete = Array.from(selectedExpenseIds);
  
  // Call parent's bulk delete handler
  await onBulkDeleteExpenses(idsToDelete);
  
  // Reset state
  setSelectedExpenseIds(new Set());
  setIsBulkSelectMode(false);
  setShowBulkDeleteDialog(false);
  
  // Show success toast
  toast.success(`${idsToDelete.length} pengeluaran berhasil dihapus`);
};
```

### Props Interface Update
```typescript
interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
  onBulkDeleteExpenses: (ids: string[]) => Promise<void>; // NEW
}
```

### App.tsx Integration

#### New Handler
```typescript
const handleBulkDeleteExpenses = async (ids: string[]) => {
  try {
    // Delete all expenses in parallel
    await Promise.all(
      ids.map(id =>
        fetch(
          `${baseUrl}/expenses/${selectedYear}/${selectedMonth}/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        )
      )
    );

    // Update local state
    setExpenses(prev => prev.filter(exp => !ids.includes(exp.id)));
    
    // Update cache
    const newExpenses = expenses.filter(exp => !ids.includes(exp.id));
    updateCachePartial('expenses', newExpenses);
    
    toast.success(`${ids.length} pengeluaran berhasil dihapus`);
  } catch (error) {
    console.log(`Error bulk deleting expenses: ${error}`);
    toast.error("Gagal menghapus beberapa pengeluaran");
  }
};
```

## 🎨 UI/UX Design Specifications

### Visual States

#### Normal Mode
```
┌─────────────────────────────────────────┐
│ Daftar Pengeluaran    [Pilih] [↕] Rp X │
├─────────────────────────────────────────┤
│ [Search bar]                            │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Expense Item                        │ │
│ │                         [✏️] [🗑️]   │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### Bulk Select Mode (Nothing Selected)
```
┌─────────────────────────────────────────┐
│ □ Pilih semua    [Hapus (0)] [Batal]   │
├─────────────────────────────────────────┤
│ [Search bar]                            │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ □ Expense Item                      │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### Bulk Select Mode (Some Selected)
```
┌─────────────────────────────────────────���
│ ☑ 3 item dipilih    [Hapus (3)] [Batal]│
├─────────────────────────────────────────┤
│ [Search bar]                            │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ☑ Expense Item                      │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ □ Expense Item                      │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Confirmation Dialog
```
┌─────────────────────────────────────────┐
│ ⚠️  Hapus 3 Pengeluaran                 │
│                                         │
│ Anda yakin ingin menghapus:             │
│                                         │
│ • Belanja Bulanan - Rp 500,000         │
│ • Listrik - Rp 200,000                 │
│ • Internet - Rp 350,000                │
│                                         │
│ Total: Rp 1,050,000                    │
│                                         │
│              [Batal]  [Hapus Semua]    │
└─────────────────────────────────────────┘
```

### Color & Style Guidelines
- **Checkbox**: Default size, accent color when checked
- **"Pilih" button**: Outline variant, ghost in normal mode
- **"Hapus (n)" button**: Destructive variant, disabled when n=0
- **"Batal" button**: Outline variant
- **Selected items**: Light background highlight (`bg-accent/20`)
- **Confirmation dialog**: Warning icon, list of items, total amount

## 🔒 Safety & Validation

### Safeguards
1. **Confirmation Required**: Always show dialog before bulk delete
2. **Preview Items**: Show list of items to be deleted in dialog
3. **Disable Empty**: "Hapus" button disabled when nothing selected
4. **Easy Cancel**: "Batal" button prominently displayed
5. **Auto-exit**: Exit bulk mode after successful delete

### Edge Cases
| Case | Behavior |
|------|----------|
| User deletes while in bulk mode | Single delete still works with individual confirmation |
| User searches while in bulk mode | Selection preserved, checkboxes work on filtered results |
| User changes month while in bulk mode | Exit bulk mode, clear selections |
| User selects all, then filters | Only filtered items remain selected |
| Network error during bulk delete | Show error, don't exit bulk mode, keep selections |
| Some deletes succeed, some fail | Show partial success message, remove successful deletes from selection |

## 📊 Data Flow

### Bulk Delete Sequence
```
User Action (Click "Hapus")
    ↓
Set showBulkDeleteDialog = true
    ↓
User confirms in dialog
    ↓
handleConfirmBulkDelete()
    ↓
Promise.all([DELETE requests])
    ↓
Update local state (setExpenses)
    ↓
Update cache
    ↓
Show success toast
    ↓
Clear selections & exit bulk mode
```

### Cache Invalidation
- ✅ Update current month cache with new expenses array
- ✅ Invalidate next month cache (if expenses affect carryover)
- ✅ No need to invalidate previous month

## 🧪 Testing Checklist

### Functional Tests
- [ ] Bulk mode activates when "Pilih" clicked
- [ ] Checkboxes appear for all items
- [ ] Individual checkbox toggles selection
- [ ] "Select All" selects all visible items
- [ ] "Select All" on filtered list only selects filtered items
- [ ] Counter shows correct number of selected items
- [ ] "Hapus" button disabled when nothing selected
- [ ] "Hapus" button enabled when items selected
- [ ] Confirmation dialog shows correct items and total
- [ ] Bulk delete removes all selected items
- [ ] Success toast shows correct count
- [ ] Bulk mode exits after successful delete
- [ ] "Batal" exits bulk mode and clears selections

### UI/UX Tests
- [ ] Checkboxes align properly with items
- [ ] Selected items have visual highlight
- [ ] Header switches correctly between modes
- [ ] Buttons are properly positioned and sized
- [ ] Dialog is scrollable for many items
- [ ] Mobile responsive (checkboxes don't break layout)

### Edge Case Tests
- [ ] Search + bulk select interaction works
- [ ] Filter changes preserve relevant selections
- [ ] Month change exits bulk mode
- [ ] Network error handling
- [ ] Empty list behavior
- [ ] Single item selection works
- [ ] All items selection works

## 📱 Responsive Considerations

### Mobile (< 768px)
- Checkbox size: Larger touch target (min 44px)
- Header: Stack buttons vertically if needed
- Dialog: Full height scroll, easy-to-tap buttons
- Item spacing: Adequate spacing between checkboxes and content

### Tablet (768px - 1024px)
- Standard checkbox size
- Header: Horizontal layout with wrapping
- Dialog: Max width with scroll

### Desktop (> 1024px)
- Standard checkbox size
- Header: All inline, no wrapping
- Dialog: Fixed max width, centered

## 🚀 Implementation Phases

### Phase 1: Basic Bulk Select (Core)
- [ ] Add bulk mode state management
- [ ] Implement "Pilih" button & mode toggle
- [ ] Add checkboxes to items
- [ ] Implement selection handlers (single, all)
- [ ] Update header in bulk mode
- [ ] Add counter display

### Phase 2: Bulk Delete Action
- [ ] Add "Hapus (n)" button
- [ ] Create bulk delete confirmation dialog
- [ ] Implement handleBulkDeleteExpenses in App.tsx
- [ ] Pass handler to ExpenseList
- [ ] Implement bulk delete API calls
- [ ] Update local state & cache

### Phase 3: Polish & UX
- [ ] Add visual highlights for selected items
- [ ] Improve dialog with item list and total
- [ ] Add loading states during delete
- [ ] Add success/error toasts
- [ ] Add keyboard shortcuts (Ctrl+A for select all)
- [ ] Add smooth transitions

### Phase 4: Testing & Refinement
- [ ] Test all edge cases
- [ ] Test on mobile devices
- [ ] Test with large lists (100+ items)
- [ ] Performance optimization if needed
- [ ] Accessibility review (keyboard navigation)

## 🎯 Success Metrics

### User Experience
- Time to delete 10 items: < 5 seconds (vs ~30 seconds for individual deletes)
- User satisfaction: Reduced frustration when cleaning up old expenses
- Error rate: < 1% accidental bulk deletes (with confirmation)

### Technical
- API performance: Bulk delete of 50 items < 3 seconds
- UI responsiveness: No lag during selection
- Cache consistency: 100% accuracy after bulk operations

## 📝 Future Enhancements

### Potential Additions (v2)
1. **Bulk Edit**: Edit common fields for selected items
2. **Bulk Move**: Move selected items to different month
3. **Smart Selection**: 
   - Select all from same date
   - Select all with same name
   - Select all in date range
4. **Export Selected**: Export selected items to CSV/PDF
5. **Undo Bulk Delete**: 5-second undo window before permanent delete
6. **Keyboard Shortcuts**:
   - `Ctrl/Cmd + A`: Select all
   - `Ctrl/Cmd + D`: Deselect all
   - `Delete`: Bulk delete selected
   - `Escape`: Cancel bulk mode

### Nice-to-Have
- Drag to select multiple items
- Shift+Click for range selection
- Selection persistence across page navigation
- Bulk action history/audit log

## 📚 References

### Similar Implementations
- Gmail: Bulk select emails
- Google Drive: Bulk file operations
- Trello: Bulk card actions

### Design Patterns
- Master-detail selection pattern
- Bulk action toolbar pattern
- Confirmation dialog best practices

## 🔗 Related Documents
- `/docs/tracking-app-wiki/03-component-documentation.md` - Component structure
- `/docs/tracking-app-wiki/02-features-detail.md` - Feature specifications
- `/guidelines/Guidelines.md` - Code guidelines

---

**Document Version**: 1.0  
**Created**: 2025-10-18  
**Status**: Planning Phase  
**Next Step**: Review & Approval → Implementation Phase 1
