# 🐤 Canary Testing Guide - Test Small Before Going Big

**PURPOSE:** Test high-risk changes with small subset first to catch issues early  
**APPLIES TO:** Phase 3 (Custom Hooks) & Phase 4 (Render Components)  
**RULE:** Extract ONE item, test extensively, THEN proceed to next

---

## 🎯 What is Canary Testing?

**Analogy:** Miners used canaries to detect toxic gas. If canary died, miners evacuated before it was too late.

**In Refactoring:** Extract ONE hook/component first. If it breaks, fix before extracting more. Don't wait until all 4 extracted to discover problems!

```
❌ BAD (Big Bang):
Extract all 4 hooks at once → Something breaks → Hard to debug which one

✅ GOOD (Canary):
Extract hook #1 → Test → Works! → Extract hook #2 → Test → Works! → ...
                ↓ (if breaks)
             Stop, fix, retry before proceeding
```

---

## 🚨 Why Canary Testing is CRITICAL for Phase 3 & 4

### Phase 3 (Custom Hooks) - HIGH RISK ⚠️

**Risks:**
- State management changes (useState → custom hook)
- useEffect dependency arrays may be wrong
- Stale closures
- Infinite re-render loops
- Event handler references change

**Without Canary:** Extract all 4 hooks → App breaks → Which hook? Which line? Hours debugging!

**With Canary:** Extract hook #1 → Test 15 min → Issue found in 5 min → Fix → Proceed

---

### Phase 4 (Render Components) - HIGH RISK ⚠️

**Risks:**
- Props drilling (missing props)
- Event handlers not passed correctly
- Key props missing (list render warnings)
- Mobile layout broken
- Hover states broken
- Long-press gestures broken

**Without Canary:** Extract all 4 components → Mobile UI broken → Which component? Hours debugging!

**With Canary:** Extract component #1 → Test 20 min → Mobile works → Proceed

---

## 🐤 Phase 3: Custom Hooks Canary Strategy

### Canary Order (DO IN THIS ORDER!):

```
1. useExpenseFiltering    (Easiest - pure data transformation)
   ↓ Test 15 min
2. useBulkSelection       (Medium - state management)
   ↓ Test 15 min
3. useExpenseActions      (Medium - async operations)
   ↓ Test 15 min
4. useExpenseListModals   (Easiest - just state)
   ↓ Test 15 min

Total: 4 canaries, 60 min testing (15 min each)
```

---

### Canary #1: useExpenseFiltering (START HERE!)

**Why First?** Easiest, no side effects, pure data transformation

#### Step 1: Extract Hook Skeleton (5 min)
```typescript
// /hooks/useExpenseFiltering.ts
export function useExpenseFiltering(
  expenses: Expense[],
  incomes: AdditionalIncome[]
) {
  // TODO: Will implement next
  return {
    searchTerm: '',
    setSearchTerm: () => {},
    sortBy: 'date',
    sortOrder: 'desc',
    filteredExpenses: expenses,
    filteredIncomes: incomes
  };
}
```

**Commit:** `refactor(hooks): create useExpenseFiltering skeleton`

**Test:** TypeScript compiles

---

#### Step 2: Extract Search State (10 min)
```typescript
export function useExpenseFiltering(expenses: Expense[], ...) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // ... rest stub
  
  return { searchTerm, setSearchTerm, ... };
}
```

**Commit:** `refactor(hooks): extract search state to useExpenseFiltering`

**Test Checklist:**
- [ ] Search input displays in UI
- [ ] Can type in search input
- [ ] Search term state updates
- [ ] No console errors
- [ ] No infinite re-renders

**Time:** 5 min testing

---

#### Step 3: Extract Search Logic (10 min)
```typescript
const filteredExpenses = useMemo(() => {
  return expenses.filter(exp => 
    exp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [expenses, searchTerm]);
```

**Commit:** `refactor(hooks): extract search filtering logic`

**Test Checklist:**
- [ ] Search actually filters expenses
- [ ] Type "food" → only food expenses show
- [ ] Clear search → all expenses show
- [ ] Case-insensitive search works
- [ ] Performance is good (no lag)
- [ ] Check React DevTools: no unnecessary re-renders

**Time:** 10 min testing

**🚨 STOP GATE:** If search doesn't work → DEBUG NOW, don't proceed!

---

#### Step 4: Extract Sort State & Logic (15 min)
```typescript
const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

const sortedExpenses = useMemo(() => {
  return [...filteredExpenses].sort((a, b) => {
    // Sort logic
  });
}, [filteredExpenses, sortBy, sortOrder]);
```

**Commit:** `refactor(hooks): extract sort state and logic`

**Test Checklist:**
- [ ] Click "Date" header → sorts by date ascending
- [ ] Click "Date" again → sorts by date descending
- [ ] Click "Amount" header → sorts by amount
- [ ] Sort order correct (check values)
- [ ] Sort icon updates correctly
- [ ] No console errors

**Time:** 10 min testing

**🚨 STOP GATE:** If sorting doesn't work → DEBUG NOW!

---

#### Step 5: Extract Category Filter (10 min)
```typescript
const categoryFilteredExpenses = useMemo(() => {
  if (!categoryFilter || categoryFilter.size === 0) {
    return sortedExpenses;
  }
  return sortedExpenses.filter(exp => categoryFilter.has(exp.category));
}, [sortedExpenses, categoryFilter]);
```

**Commit:** `refactor(hooks): extract category filter logic`

**Test Checklist:**
- [ ] Click category in breakdown → filters list
- [ ] Category badge appears
- [ ] Badge shows correct category emoji + name
- [ ] Badge shows correct count
- [ ] Click "Clear Filter" → shows all
- [ ] Auto-scroll to filtered items works

**Time:** 10 min testing

**🚨 STOP GATE:** If category filter doesn't work → DEBUG NOW!

---

#### ✅ Canary #1 Complete Checklist:

Before proceeding to Canary #2:

- [ ] All search tests pass
- [ ] All sort tests pass
- [ ] All filter tests pass
- [ ] Performance is good (use React DevTools Profiler)
- [ ] No console errors
- [ ] No console warnings (about dependencies)
- [ ] Desktop tested
- [ ] Mobile tested
- [ ] Git committed with tag: `git commit -m "refactor: useExpenseFiltering complete (✓ tested)"`

**Time Total:** ~60 min (extraction + testing)

**🟢 IF ALL PASS → Proceed to Canary #2**  
**🔴 IF ANY FAIL → STOP, debug, fix, re-test**

---

### Canary #2: useBulkSelection

**Why Second?** Medium complexity, state management but no side effects

#### Step 1: Extract Bulk State (10 min)
```typescript
// /hooks/useBulkSelection.ts
export function useBulkSelection() {
  const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<Set<string>>(new Set());
  
  return {
    isBulkSelectMode,
    setIsBulkSelectMode,
    selectedExpenseIds,
    // handlers stub
  };
}
```

**Commit:** `refactor(hooks): create useBulkSelection with state`

**Test Checklist:**
- [ ] Bulk mode can be entered (button click or long-press)
- [ ] Checkboxes appear on all expense rows
- [ ] Bulk toolbar appears at bottom
- [ ] Exit bulk mode works

**Time:** 10 min testing

**🚨 STOP GATE:** If bulk mode doesn't activate → DEBUG NOW!

---

#### Step 2: Extract Toggle Handler (10 min)
```typescript
const handleToggleExpense = useCallback((id: string) => {
  setSelectedExpenseIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return next;
  });
}, []);
```

**Commit:** `refactor(hooks): extract toggle expense handler`

**Test Checklist:**
- [ ] Click checkbox → selects expense
- [ ] Click again → deselects expense
- [ ] Selected count updates correctly
- [ ] Selected expenses have visual highlight
- [ ] No console errors

**Time:** 5 min testing

---

#### Step 3: Extract Select All Handler (10 min)
```typescript
const handleSelectAll = useCallback((checked: boolean) => {
  if (checked) {
    const allIds = new Set(expenses.map(exp => exp.id));
    setSelectedExpenseIds(allIds);
  } else {
    setSelectedExpenseIds(new Set());
  }
}, [expenses]);
```

**Commit:** `refactor(hooks): extract select all handler`

**Test Checklist:**
- [ ] Click "Select All" → selects all visible expenses
- [ ] Count shows total selected
- [ ] Click "Select All" again → deselects all
- [ ] Works with filtered list (only selects visible)

**Time:** 5 min testing

---

#### ✅ Canary #2 Complete Checklist:

- [ ] Bulk mode activates correctly
- [ ] Checkbox selection works
- [ ] Select all works
- [ ] Deselect works
- [ ] Count displays correctly
- [ ] Visual feedback correct
- [ ] Works on desktop
- [ ] Works on mobile (long-press)
- [ ] No console errors
- [ ] Git committed

**Time Total:** ~45 min

**🟢 IF ALL PASS → Proceed to Canary #3**

---

### Canary #3: useExpenseActions

**Why Third?** Has async operations (API calls), medium-high complexity

#### Step 1: Extract Edit Handler (15 min)
```typescript
export function useExpenseActions({
  onEditExpense,
  onDeleteExpense,
  ...
}) {
  const handleEdit = useCallback(async (id: string, data: Expense) => {
    try {
      await onEditExpense(id, data);
      toast.success('Expense updated');
    } catch (error) {
      toast.error('Failed to update');
      console.error(error);
    }
  }, [onEditExpense]);
  
  return { handleEdit, ... };
}
```

**Commit:** `refactor(hooks): extract edit expense handler`

**Test Checklist:**
- [ ] Click Edit → modal opens with pre-filled data
- [ ] Change values → click Save
- [ ] Modal closes
- [ ] Expense updates in list
- [ ] Toast notification appears
- [ ] Test error case (disconnect internet)
- [ ] Error toast appears

**Time:** 10 min testing

**🚨 STOP GATE:** If edit doesn't work → DEBUG NOW!

---

#### Step 2: Extract Delete Handler (15 min)
```typescript
const handleDelete = useCallback(async (id: string) => {
  // Show confirmation first
  const confirmed = await showConfirmDialog();
  if (!confirmed) return;
  
  try {
    await onDeleteExpense(id);
    toast.success('Expense deleted');
  } catch (error) {
    toast.error('Failed to delete');
    console.error(error);
  }
}, [onDeleteExpense]);
```

**Commit:** `refactor(hooks): extract delete expense handler`

**Test Checklist:**
- [ ] Click Delete → confirmation dialog shows
- [ ] Click Cancel → nothing happens
- [ ] Click Confirm → expense deleted
- [ ] Toast notification appears
- [ ] List updates (expense removed)
- [ ] Test error case

**Time:** 10 min testing

---

#### ✅ Canary #3 Complete Checklist:

- [ ] Edit expense works
- [ ] Delete expense works
- [ ] Move to income works (if applicable)
- [ ] Toast notifications appear
- [ ] Error handling works
- [ ] Loading states work (if any)
- [ ] No console errors
- [ ] Git committed

**Time Total:** ~60 min

**🟢 IF ALL PASS → Proceed to Canary #4**

---

### Canary #4: useExpenseListModals

**Why Last?** Easiest, just state management for modals

#### Extract All Modal States (20 min)
```typescript
export function useExpenseListModals(onModalStateChange?: (isOpen: boolean) => void) {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  // ... all modal states
  
  // Notify parent when any modal opens/closes (for pull-to-refresh)
  useEffect(() => {
    const anyModalOpen = isBreakdownOpen || isSimulationOpen || ...;
    onModalStateChange?.(anyModalOpen);
  }, [isBreakdownOpen, isSimulationOpen, ..., onModalStateChange]);
  
  return {
    isBreakdownOpen,
    openBreakdown: () => setIsBreakdownOpen(true),
    closeBreakdown: () => setIsBreakdownOpen(false),
    // ... all modal controls
  };
}
```

**Commit:** `refactor(hooks): extract modal state management`

**Test Checklist:**
- [ ] CategoryBreakdown opens/closes
- [ ] AdvancedFilter opens/closes
- [ ] SimulationSandbox opens/closes
- [ ] All other modals open/close
- [ ] Pull-to-refresh disabled when modal open (mobile)
- [ ] Pull-to-refresh enabled when modal closed
- [ ] No console errors

**Time:** 15 min testing

---

#### ✅ Canary #4 Complete Checklist:

- [ ] All modals open/close correctly
- [ ] Pull-to-refresh integration works
- [ ] No modal state conflicts
- [ ] Git committed

**Time Total:** ~35 min

---

### 🎉 Phase 3 Complete!

**Total Time:** ~200 min (3.5 hours) including all testing  
**Result:** 4 hooks extracted safely with zero regression!

---

## 🐤 Phase 4: Render Components Canary Strategy

### Canary Order:

```
1. ExpenseListItem         (Hardest - most complex rendering)
   ↓ Test 25 min
2. IncomeListItem          (Medium - simpler rendering)
   ↓ Test 15 min
3. ExpenseListHeader       (Medium - controls)
   ↓ Test 15 min
4. BulkActionToolbar       (Easiest - simple toolbar)
   ↓ Test 10 min

Total: 4 canaries, 65 min testing
```

---

### Canary #1: ExpenseListItem (START HERE!)

**Why First?** Most complex, if this works, others will be easier

#### Step 1: Extract Desktop Layout Only (20 min)
```typescript
// /components/expense-list/ExpenseListItem.tsx
export function ExpenseListItem({
  expense,
  isMobile,
  onEdit,
  onDelete,
  ...
}: ExpenseListItemProps) {
  // Desktop layout only first
  return (
    <div className="hidden md:flex ...">
      {/* Copy desktop row JSX from ExpenseList.tsx */}
    </div>
  );
}
```

**Commit:** `refactor(components): create ExpenseListItem - desktop only`

**Test Checklist (DESKTOP ONLY):**
- [ ] Expense rows render correctly
- [ ] All columns display (name, amount, date, category, actions)
- [ ] Category emoji displays
- [ ] Template emoji displays (if template expense)
- [ ] Currency badge displays (if USD/EUR)
- [ ] Pocket badge displays
- [ ] Hover effects work
- [ ] Edit button works
- [ ] Delete button works
- [ ] Expand/collapse works (if template)

**Time:** 15 min testing

**🚨 STOP GATE:** If desktop layout broken → DEBUG NOW!

---

#### Step 2: Add Mobile Layout (20 min)
```typescript
export function ExpenseListItem({ ... }) {
  return (
    <>
      {/* Desktop layout */}
      <div className="hidden md:flex ...">
        {/* ... */}
      </div>
      
      {/* Mobile layout */}
      <div className="md:hidden ...">
        {/* Copy mobile card JSX from ExpenseList.tsx */}
      </div>
    </>
  );
}
```

**Commit:** `refactor(components): add mobile layout to ExpenseListItem`

**Test Checklist (MOBILE ONLY):**
- [ ] Expense cards render correctly
- [ ] Compact layout displays
- [ ] Category emoji displays (top-left)
- [ ] Amount prominent
- [ ] Date displays
- [ ] Long-press activates bulk mode
- [ ] Long-press vibration works (if device supports)
- [ ] Action sheet opens on tap (not in bulk mode)
- [ ] Bulk checkboxes appear in bulk mode

**Time:** 15 min testing

**🚨 STOP GATE:** If mobile layout broken → DEBUG NOW!

---

#### Step 3: Add Category Emoji Logic (15 min)
```typescript
// Extract emoji display logic into helper
function getCategoryEmojiDisplay(expense: Expense, settings: CategorySettings) {
  const templateEmoji = getDisplayEmoji(expense);
  if (templateEmoji) return templateEmoji;
  
  if (expense.category) {
    return getCategoryEmoji(expense.category, settings);
  }
  
  // ... logic for multi-category items
  
  return null;
}
```

**Commit:** `refactor(components): add category emoji logic`

**Test Checklist:**
- [ ] Category emojis display correctly
- [ ] Template emojis display (priority over category)
- [ ] Multi-category expenses show "(multiple)" badge
- [ ] Custom category emojis display
- [ ] Default emoji shows for uncategorized

**Time:** 10 min testing

---

#### Step 4: Update ExpenseList to Use Component (10 min)
```typescript
// In ExpenseList.tsx
{filteredExpenses.map(expense => (
  <ExpenseListItem
    key={expense.id}
    expense={expense}
    isMobile={isMobile}
    isBulkSelectMode={isBulkSelectMode}
    isSelected={selectedExpenseIds.has(expense.id)}
    onEdit={handleEdit}
    onDelete={handleDelete}
    onToggleSelect={handleToggleExpense}
    // ... all required props
  />
))}
```

**Commit:** `refactor(ExpenseList): use ExpenseListItem component`

**Test Checklist (FULL INTEGRATION):**
- [ ] All expense features work
- [ ] Desktop layout correct
- [ ] Mobile layout correct
- [ ] Edit works
- [ ] Delete works
- [ ] Long-press works
- [ ] Bulk select works
- [ ] All emojis display
- [ ] All badges display
- [ ] Performance good (smooth scrolling with 100+ items)

**Time:** 20 min testing

**🚨 CRITICAL STOP GATE:** This is the most important test!  
If ANYTHING broken → DEBUG AND FIX before proceeding!

---

#### ✅ Canary #1 Complete Checklist:

- [ ] Desktop rendering perfect
- [ ] Mobile rendering perfect
- [ ] All features work
- [ ] All gestures work
- [ ] Performance good
- [ ] No console errors
- [ ] No missing keys warnings
- [ ] Git committed with tag

**Time Total:** ~90 min (extraction + testing)

**🟢 IF ALL PASS → Proceed to Canary #2**  
**🔴 IF ANY FAIL → STOP! This is critical!**

---

### Canary #2: IncomeListItem

**Why Second?** Simpler than ExpenseListItem, good confidence booster

#### Extract Component (25 min)
```typescript
// /components/expense-list/IncomeListItem.tsx
export function IncomeListItem({
  income,
  isMobile,
  onEdit,
  onDelete,
}: IncomeListItemProps) {
  return (
    <>
      {/* Desktop layout */}
      <div className="hidden md:flex ...">
        {/* Income row JSX */}
      </div>
      
      {/* Mobile layout */}
      <div className="md:hidden ...">
        {/* Income card JSX */}
      </div>
    </>
  );
}
```

**Commit:** `refactor(components): create IncomeListItem`

---

#### Update ExpenseList (10 min)
```typescript
{filteredIncomes.map(income => (
  <IncomeListItem
    key={income.id}
    income={income}
    isMobile={isMobile}
    onEdit={handleEditIncome}
    onDelete={handleDeleteIncome}
  />
))}
```

**Commit:** `refactor(ExpenseList): use IncomeListItem component`

**Test Checklist:**
- [ ] Desktop income rows render
- [ ] Mobile income cards render
- [ ] Currency badges display (USD, EUR, IDR)
- [ ] Exchange rate displays
- [ ] Deduction displays
- [ ] Amount IDR calculated correctly
- [ ] Edit works
- [ ] Delete works
- [ ] Pocket badge displays

**Time:** 20 min testing

---

#### ✅ Canary #2 Complete Checklist:

- [ ] Desktop + mobile rendering perfect
- [ ] All income features work
- [ ] Git committed

**Time Total:** ~55 min

**🟢 IF ALL PASS → Proceed to Canary #3**

---

### Canary #3: ExpenseListHeader

**Why Third?** Controls are critical for UX

#### Extract Component (20 min)
```typescript
// /components/expense-list/ExpenseListHeader.tsx
export function ExpenseListHeader({
  searchTerm,
  onSearchChange,
  sortBy,
  sortOrder,
  onSortChange,
  categoryFilter,
  onClearFilter,
  onOpenCategoryBreakdown,
  ...
}: ExpenseListHeaderProps) {
  return (
    <div className="...">
      {/* Header with sort/filter/search controls */}
    </div>
  );
}
```

**Commit:** `refactor(components): create ExpenseListHeader`

---

#### Update ExpenseList (5 min)
```typescript
<ExpenseListHeader
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  sortBy={sortBy}
  sortOrder={sortOrder}
  onSortChange={handleSortChange}
  // ... props
/>
```

**Commit:** `refactor(ExpenseList): use ExpenseListHeader component`

**Test Checklist:**
- [ ] Header displays correctly
- [ ] Search input works
- [ ] Sort by date works
- [ ] Sort by amount works
- [ ] Sort order toggles (asc/desc)
- [ ] Sort icons update correctly
- [ ] Category filter badge displays
- [ ] Click badge opens CategoryBreakdown
- [ ] Clear filter works

**Time:** 20 min testing

---

#### ✅ Canary #3 Complete Checklist:

- [ ] All header controls work
- [ ] Git committed

**Time Total:** ~45 min

**🟢 IF ALL PASS → Proceed to Canary #4**

---

### Canary #4: BulkActionToolbar

**Why Last?** Simplest component

#### Extract Component (15 min)
```typescript
// /components/expense-list/BulkActionToolbar.tsx
export function BulkActionToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onBulkDelete,
  onBulkCategoryEdit,
  onCancel,
}: BulkActionToolbarProps) {
  return (
    <div className="...">
      {/* Bulk mode toolbar */}
    </div>
  );
}
```

**Commit:** `refactor(components): create BulkActionToolbar`

---

#### Update ExpenseList (5 min)
```typescript
{isBulkSelectMode && (
  <BulkActionToolbar
    selectedCount={selectedExpenseIds.size}
    totalCount={filteredExpenses.length}
    onSelectAll={handleSelectAll}
    onBulkDelete={handleBulkDelete}
    onBulkCategoryEdit={handleBulkCategoryEdit}
    onCancel={exitBulkMode}
  />
)}
```

**Commit:** `refactor(ExpenseList): use BulkActionToolbar component`

**Test Checklist:**
- [ ] Toolbar appears when bulk mode active
- [ ] Selected count displays correctly
- [ ] Select all checkbox works
- [ ] Bulk delete button works
- [ ] Bulk category edit button works
- [ ] Cancel button exits bulk mode
- [ ] Desktop layout correct
- [ ] Mobile layout correct (bottom of screen)

**Time:** 15 min testing

---

#### ✅ Canary #4 Complete Checklist:

- [ ] Bulk toolbar works perfectly
- [ ] Git committed

**Time Total:** ~35 min

---

### 🎉 Phase 4 Complete!

**Total Time:** ~225 min (3.75 hours) including all testing  
**Result:** 4 components extracted safely with zero regression!

---

## 📊 Canary Testing Summary

| Phase | Canaries | Test Time | Issues Prevented |
|-------|----------|-----------|------------------|
| Phase 3 | 4 hooks | 60 min | State bugs, infinite loops, stale closures |
| Phase 4 | 4 components | 65 min | Broken layouts, missing props, gesture issues |
| **TOTAL** | **8 canaries** | **125 min** | **Hours of debugging saved!** |

---

## 🎓 Canary Testing Best Practices

### DO ✅
- Extract ONE at a time
- Test extensively (15-20 min per canary)
- Test BOTH desktop AND mobile
- Stop immediately if canary fails
- Debug before proceeding to next
- Commit after each successful canary

### DON'T ❌
- Extract multiple items at once
- Rush through testing
- Test only desktop
- Proceed with failing tests
- Skip mobile testing
- Make large commits

---

## 🚨 What If Canary Fails?

### Debugging Workflow:

1. **STOP immediately** - Don't extract more
2. **Check console** - Read error message
3. **Check React DevTools** - Profile, Components tab
4. **Isolate issue** - Comment out parts to narrow down
5. **Fix** - Make the fix
6. **Re-test canary** - Full test again
7. **Document** - Add to INCIDENT_LOG.md
8. **Update test** - Add check to TESTING_CHECKLIST.md
9. **Proceed** - Only when canary passes

### Common Canary Failures:

**Infinite Re-renders:**
- Check useEffect dependency arrays
- Check if creating new objects in render
- Use React DevTools Profiler

**Props Not Updating:**
- Check if component memoized incorrectly
- Check object references
- Check React.memo comparison function

**Missing Visual Elements:**
- Check all props passed
- Check className applied correctly
- Check conditional rendering logic

---

**REMEMBER: Canaries exist to catch problems early!**

**Better to spend 15 min testing each canary than 4 hours debugging 4 broken items!** ⏱️

---

**Last Updated:** November 15, 2025  
**Status:** ✅ Active Protocol
